import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import {Trans, useTranslation} from 'react-i18next';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import ViewShot from 'react-native-view-shot';
import DeviceBrightness from '@adrianso/react-native-device-brightness';
import { useUser } from './UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Lightbox from 'react-native-lightbox-v2';
import MessageScreen from './MessageScreen';
import NoticeScreen from './NoticeScreen';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { uploadProfileImageFlow } from './src/utils/profileImageUploader';
import { authFetch } from './src/utils/api';
import i18n from './i18n/i18n';
import { useMessageContext } from "./MessageContext";

const HomeScreen = ({navigation, route, attendanceTotal, reservationTotal, enrollInfo}) => {
    const { t } = useTranslation();
    const [index, setIndex] = useState(1);

    const [routes] = useState([
      { key: 'first', title: t('tabMenu.message') },
      { key: 'second', title: t('tabMenu.menu') },
      { key: 'third', title: t('tabMenu.barcode') },
    ]);
    const [brightness, setBrightness] = useState();
    const [changeBrightness, setChangeBrightness] = useState(false);
    const windowWidth = Dimensions.get('window').width;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const userContext = useUser();
    const user = userContext?.user;
    
    const LAST_TAB_KEY = 'lastTab';

useEffect(() => {
if (route.params?.targetTab === 'first') {
setIndex(0);
}
}, [route.params]);


      // 앱 시작 시 저장된 탭 인덱스 로딩
  useEffect(() => {
    const loadLastTab = async () => {
      const saved = await AsyncStorage.getItem(LAST_TAB_KEY);
      if (saved !== null) setIndex(Number(saved));
    };
    loadLastTab();
  }, []);

  // 탭 변경 시 저장
  const handleIndexChange = async (newIndex: number) => {
    setIndex(newIndex);
    await AsyncStorage.setItem(LAST_TAB_KEY, newIndex.toString());
  };
    
    useEffect(() => {
        if (index === 2) {
         // console.log('Second 탭 보임');
         DeviceBrightness.setBrightnessLevel(1);
         setChangeBrightness(true);
         timeoutRef.current = setTimeout(() => {DeviceBrightness.setBrightnessLevel(brightness)}, 17200);
        } else  {
          // console.log('First 탭 보임');
          if(changeBrightness) {
            DeviceBrightness.setBrightnessLevel(brightness);
          }
          
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }, [index]);

    const renderScene = SceneMap({
      first: () => <FirstRoute navigation={navigation} t={t} user={user} />,
      second: () => <SecondRoute navigation={navigation} t={t} user={user} attendanceTotal={attendanceTotal} reservationTotal={reservationTotal} enrollInfo={enrollInfo} />,
      third: () => <ThirdRoute navigation={navigation} t={t} user={user} />
      });

      useEffect(() => {
        if(Platform.OS == 'ios') {
          DeviceBrightness.getBrightnessLevel().then((luminous) =>  {
            setBrightness(luminous);
          });
        } else {
          DeviceBrightness.getSystemBrightnessLevel().then((luminous) =>  {
            setBrightness(luminous);
          });
        }
    }, [brightness]);



      // Dimensions를 state로 관리
  const [layout, setLayout] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });

  // 화면 크기 변경 감지
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setLayout({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

    
  // 나머지 코드는 기존과 동일
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
    <Image
      source={require('./assets/main.jpg')}
      style={[styles.mainImage, { width: windowWidth }]}
      resizeMode="cover"
    />
  </View>
      {/* Tab View */}
      <View style={styles.tabContainer}>
      <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={handleIndexChange}
          initialLayout={{ width: windowWidth }}
          style={styles.tabView}
          renderTabBar={props => (
            <TabBar
              {...props}
              indicatorStyle={styles.tabIndicator}
              style={styles.tabBar}
              tabStyle={styles.tab}
              labelStyle={styles.tabLabel}
              renderLabel={({ route, focused }) => (
                <Text style={[styles.tabLabel, { opacity: focused ? 1 : 0.7 }]}>
                  {route.title}
                  </Text>
              )}
            />
          )}
        />
  </View>
  </View>
  );
};


const FirstRoute = ({ navigation, t, user }) => {
const [selectedCategory, setSelectedCategory] = useState(1);
const { refreshMessages } = useMessageContext();


const prevCategoryRef = useRef(selectedCategory);


useEffect(() => {
const prev = prevCategoryRef.current;


if (prev !== 1 && selectedCategory === 1) {
refreshMessages(); // ✅ 진짜 원하는 타이밍
}


prevCategoryRef.current = selectedCategory;
}, [selectedCategory]);

  return (
    <View style={styles.tabContent}>
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 1 && styles.categoryButtonActive,
            ]}
            onPress={() => {
              setSelectedCategory(1)
            }}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 1 && styles.categoryTextActive,
              ]}
            >
            {t('menu.message')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.categoryButton,
              selectedCategory === 2 && styles.categoryButtonActive,
            ]}
            onPress={() =>{
              setSelectedCategory(2)
            }}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 2 && styles.categoryTextActive,
              ]}
            >
            {t('menu.notice')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.listContent}>
{ selectedCategory === 1 ? (
<MessageScreen navigation={navigation} ></MessageScreen>
) : (
<NoticeScreen navigation={navigation}></NoticeScreen>
)}
      </View>
    </View>
  );
};



// Tab screens
const SecondRoute = ({navigation, t, user, attendanceTotal, reservationTotal, enrollInfo}) => {
  const now = new Date();
  const monthStr = now.toLocaleString(i18n.language, { month: "long" });

const handleUploadProfileImage = async (image) => {
  // 여기서 서버 업로드
  const formData = new FormData();
  formData.append('picture', {
    uri: image.uri,
    name: image.name,
    type: image.type,
  });


  const res = await authFetch('/user_pictures', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!res.ok) {
    throw new Error('upload failed');
  }
};

const formatDate = (dateStr, locale) =>
  new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

const diffDaysFromToday = (dateStr) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const toUtcDate = (d) => {
    const [y, m, day] = d.split('-').map(Number);
    return Date.UTC(y, m - 1, day);
  };

  return (toUtcDate(dateStr) - toUtcDate(todayStr)) / 86400000;
};  

const renderEnrollInfo = (enrollInfo) => {
  if (!enrollInfo || !enrollInfo.total) {
    return (
      <View style={styles.enrollInfoContainer}>
        <Text style={styles.enrollInfoText}>{t('user.enroll_info_failed')}</Text>
      </View>
    );
  }

  const endDateStr = enrollInfo.enroll_list[0].end_date;
  const formattedDate = formatDate(endDateStr, i18n.language);
  const diffDays = diffDaysFromToday(endDateStr);

  return (
    <View style={styles.enrollInfoContainer}>
      <Text style={styles.enrollInfoText}>
        <Trans
          i18nKey="deadline.remaining"
          values={{ date: formattedDate, days: Math.max(0, diffDays) }}
          components={[
            <Text key="date" />,
            <Text key="days" style={styles.enrollInfoHighlight} />
          ]}
        />
      </Text>
    </View>
  );
};
    

  return (
    <View style={styles.tabContent}>
      <ScrollView 
        contentContainerStyle={styles.menuScrollContainer}
        showsVerticalScrollIndicator={false}
      >
<View style={styles.memberCard}>
  <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%'}}>
    <View style={styles.memberImageContainer}>
        {/* <TouchableOpacity
        onPress={() => uploadProfileImageFlow(handleUploadProfileImage, user.id)}
        activeOpacity={0.8}
      >
        {user?.picture?.picture_url ? (
          <Lightbox activeProps={{ style: styles.fullScreenImage }}>
            <Image
              source={{
                uri: `https://humake.blob.core.windows.net/humake/user/${user?.branch_id}/${user.picture.picture_url}`,
              }}
              style={styles.memberImage}
              resizeMode="cover"
            />
          </Lightbox>
        ) : (  */}
          <Image
            source={user?.picture?.picture_url ? {uri: `https://humake.blob.core.windows.net/humake/user/${user?.branch_id}/${user.picture.picture_url}`} : (require('./assets/photo_none.gif'))}
            style={styles.memberImage}
            resizeMode="cover"
          />
       {/*  )}  
      </TouchableOpacity>*/}
    </View>
    {/* userInfo와 enrollInfo를 세로로 묶어서 이미지 오른쪽에 배치 */}
    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', flex: 1, marginLeft: 20 }}>
      <TouchableOpacity onPress={() => navigation.navigate('User')}>
        <Text style={styles.memberText}>[{user?.name || ''}]{t('common.user_card')}</Text>

      {renderEnrollInfo(enrollInfo)}
            </TouchableOpacity>
    </View>
  </View>
</View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Trainer')}>
          {user?.trainer?.picture?.picture_url ?  ( 
            <Image
            source={{uri: `https://humake.blob.core.windows.net/humake/employee/${user?.branch_id}/${user.trainer.picture.picture_url}`}}
            style={[styles.imageIcon, { borderRadius: 24 }]}
          />
          ) : (
            <Image
              source={require('./assets/photo_none.gif')}
              style={[styles.imageIcon, { borderRadius: 24 }]}
            />
          )}
{user?.trainer ? (
  <View style={styles.imageButtonTextWrapper}>
    <Text style={styles.imageButtonText}>
      {t('menu.my_trainer')}
    </Text>
    <Text style={[styles.imageButtonText, styles.highlightText]}>
      {user.trainer.name}
    </Text>
  </View>
) : (
  <View style={styles.imageButtonTextWrapper}>
    <Text style={styles.imageButtonText}>
      {t('menu.my_trainer')}
    </Text>
    <Text style={[styles.imageButtonText, styles.highlightText]}>
      {t('common.none')}
    </Text>
  </View>
)}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Attendance')}>
            <Image
              source={require('./assets/attendance.png')}
              style={styles.imageIcon}
            />
            <Text style={styles.imageButtonText}>{t('menu.attendance')}({monthStr})</Text>
            <Text style={[styles.imageButtonText,{textAlign: 'center', color: '#ff8d1d'}]}>{attendanceTotal} {t('common.times')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('UserWeight')}>
            <Image
              source={require('./assets/user_weight.png')}
              style={styles.imageIcon}
            />
            <Text style={styles.imageButtonText}>{t('menu.user_weight')}</Text>
            {user?.user_weight ? (
            <Text style={[styles.imageButtonText,{textAlign: 'center', color: '#ff8d1d'}]}>{user.user_weight?.weight}kg</Text>            
            ) : (
            <Text style={[styles.imageButtonText,{textAlign: 'center', color: '#ff8d1d'}]}>{t('common.none')}</Text>            
            )}
          </TouchableOpacity>

  
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Pt')}>
            <Image
              source={require('./assets/pt.png')}
              style={styles.imageIcon}
            />
            <Text style={styles.imageButtonText}>{t('menu.pt')}({monthStr})</Text>
            <Text style={[styles.imageButtonText,{textAlign: 'center', color: '#ff8d1d'}]}>{reservationTotal} {t('common.times')}</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Stop')}>
            <Image
              source={require('./assets/stop.png')}
              style={styles.imageIcon}
            />
            <Text style={styles.imageButtonText}>{t('menu.stop')}</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Counsel')}>
            <Image
              source={require('./assets/counsel.png')}
              style={styles.imageIcon}
            />
            <Text style={styles.imageButtonText}>{t('menu.counsel')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
  
  // SecondRoute.tsx
  const ThirdRoute = ({navigation, t, user}) => {
    const viewShotRef = useRef();

    const downloadBarcode = async () => {
        try {
          const uri = await viewShotRef.current.capture();
          console.log('Captured barcode URI:', uri);
    
    
          // 사진첩에 저장
          //await CameraRoll.save(uri, { type: 'photo' });
          Alert.alert('Success', 'Barcode saved to Photos!');
        } catch (error) {
          console.error('Error saving barcode:', error);
          Alert.alert('Error', 'Failed to save barcode');
        }
    };

    return (
      <View style={styles.tabContent}>
                <TouchableOpacity 
            style={styles.fullScreenButton}
            onPress={() => navigation.navigate('BarcodeScreen')}
          >
<Ionicons name="expand" size={24} color="#fff" />
          </TouchableOpacity>
        <View style={{ 
          alignItems: 'center', 
          marginTop: 30, 
          flex: 1,
          justifyContent: 'flex-start'
        }}>
        {user && user.access_card && user.access_card.card_no ? (
          <View style={{ 
            alignItems: 'center', 
            padding: 30,
            backgroundColor: '#fff',
            borderRadius: 10,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            width: '90%', 
            maxWidth: 400
          }}>
            <ViewShot ref={viewShotRef}>
            <Barcode 
              value={user.access_card.card_no} 
              format="CODE128" 
              options={{
                width: 3, 
                height: 150, 
                margin: 20,
                displayValue: true,
                fontSize: 24, 
                fontOptions: "bold",
                font: "Arial",
                textMargin: 10,
                textColor: '#000'
              }}
            />
            </ViewShot>
            <Text style={{ 
              marginTop: 15, 
              fontSize: 20, 
              color: '#333',
              fontWeight: 'bold'
            }}>
              {user.access_card.card_no}
            </Text>
            {/*<TouchableOpacity 
              style={{
                marginTop: 20,
                padding: 10,
                backgroundColor: '#007AFF',
                borderRadius: 5,
                paddingHorizontal: 20
              }}
              onPress={downloadBarcode}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold'
              }}>
                {t('common.download_barcode')}
              </Text>
            </TouchableOpacity> */}
          </View>
        ) : (
            <Text style={{ 
              color: '#666',
              fontSize: 18,
              marginTop: 20
            }}>Loading...</Text>
          )}
        </View>

      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
      },

    
menuContainer: {
  flex: 1,
  paddingTop: 10,
  paddingHorizontal: 20,

  flexDirection: 'row',
  flexWrap: 'wrap',

  justifyContent: 'center', // ⬅️ 가로 중앙
  alignItems: 'center',     // ⬅️ 세로 중앙

  gap: 12,
},
    
      menuTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        justifyContent: 'center',
        textAlign: 'center'
      },
      screenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
      },
      screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      imageContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
        overflow: 'hidden',
      },
      mainImage: {
        height: 200,
      },
    
      placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ccc',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
      },
      placeholderText: {
        fontSize: 24,
        fontWeight: 'bold',
      },
imageButton: {
  width: '30%',
  alignItems: 'center',      // ⬅️ 아이콘 & 텍스트 중앙
  justifyContent: 'center',
  textAlign: 'center',

  marginBottom: 16,
  paddingVertical: 12,

  backgroundColor: 'transparent',
},
imageButtonTextWrapper: {
  width: '100%',        // ⬅️ 핵심
  alignItems: 'center', // ⬅️ 핵심
},

highlightText: {
  color: '#ff8d1d',
},
imageIcon: {
  width: 48,
  height: 48,
  marginBottom: 8,
  resizeMode: 'contain',
  alignSelf: 'center', // ⬅️ 안전핀
},
imageButtonText: {
  color: '#000',
  fontSize: 16,
  fontWeight: 'bold',
  backgroundColor: 'transparent',
  textAlign: 'center',   // ⬅️ 텍스트 중앙
  width: '100%',         // ⬅️ 기준 폭 고정
},
      tabContainer: {
        flex: 1,
        height: '100%',
        backgroundColor: '#fff',
      },
      tabView: {
        flex: 1,
        height: '100%',
      },
      tabBar: {
        backgroundColor: '#333',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        height: 50,
        width: '100%',
      },
      tabIndicator: {
        backgroundColor: '#007AFF',
        height: 3,
      },
      tab: {
        flex: 1,
        minWidth: 0,
        paddingHorizontal: 16,
      },
      tabLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000'
      },
      tabContent: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f3f3f3',
      },
      menuScrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
      },
      tabText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      memberImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        overflow: 'hidden',
      },
      memberImage: {
        width: '100%',
        height: '100%',
      },
      fullScreenImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        resizeMode: 'contain',
      },
      categoryContainer: { 
        paddingHorizontal: 0,
         marginBottom: 15 
      },
      categoryScroll: { paddingVertical: 0 },
      categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#eee',
        borderRadius: 16,
        marginRight: 8,
        minWidth: 70,
        maxWidth: 100,
        height: 36,
        justifyContent: 'flex-start',
        alignItems: 'center',
      },
      categoryButtonActive: {
        backgroundColor: '#007AFF',
      },
      categoryText: {
        color: '#333',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 18,
      },
      categoryTextActive: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 18,
      },
      listContent: {
        flex: 1,
        padding: 0,
        marginTop: 0,
      },
      itemBox: {
        padding: 2,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      },
      scene: {
        flex: 1,
      },
      fullScreenButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#333',
        zIndex: 100,
      },
memberCard: {
  flexDirection: 'column', // ← column으로 변경
  backgroundColor: '#fff',
  borderRadius: 10,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  width: '90%',
  padding: 15,
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
},
memberInfoContainer: {
  justifyContent: 'center',
  alignItems: 'flex-start',
},
memberText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
},
enrollInfoContainer: {
  alignSelf: 'flex-start',
  marginTop: 2,
  marginLeft: 0,
},
enrollInfoText: {
  fontSize: 16,
  color: '#333',
  textAlign: 'left',
  fontWeight: '400',
},
enrollInfoHighlight: {
  fontSize: 20,
  fontWeight: '700',
  color: '#ff8d1d',
}
});


  export default HomeScreen;