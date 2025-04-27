import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll'; // 사진 저장용
import DeviceBrightness from '@adrianso/react-native-device-brightness';
import { useUser } from './UserContext';


const HomeScreen = ({navigation, route}) => {
    const { t } = useTranslation();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
      { key: 'first', title: '메뉴' },
      { key: 'second', title: '입장바코드' },
    ]);
    const [brightness, setBrightness] = useState();
    const [changeBrightness, setChangeBrightness] = useState(false);
    const windowWidth = Dimensions.get('window').width;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    useEffect(() => {
        if (index === 0) {
          console.log('First 탭 보임');
          if(changeBrightness) {
            DeviceBrightness.setBrightnessLevel(brightness);
          }
          if(changeBrightness) {
            DeviceBrightness.setBrightnessLevel(brightness);
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        } else if (index === 1) {
          console.log('Second 탭 보임');
          DeviceBrightness.setBrightnessLevel(1);
          setChangeBrightness(true);
          timeoutRef.current = setTimeout(() => {DeviceBrightness.setBrightnessLevel(brightness)}, 17200);
        }
      }, [index]);

    const renderScene = SceneMap({
        first: () => <FirstRoute navigation={navigation} t={t} />,
        second: () => <SecondRoute t={t} />,
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
          onIndexChange={setIndex}
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



// Tab screens
const FirstRoute = ({navigation, t}) => (
    <View style={styles.tabContent}>
      <ScrollView 
        contentContainerStyle={styles.menuScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Trainer')}>
            <Image
              source={require('./assets/photo_none.gif')}
              style={[styles.imageIcon, { borderRadius: 24 }]}
            />
            <Text style={styles.imageButtonText}>{t('menu.trainer')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Attendance')}>
            <Image
              source={require('./assets/attendance.png')}
              style={styles.imageIcon}
            />
            <Text style={styles.imageButtonText}>{t('menu.attendance')}</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Pt')}>
            <Image
              source={require('./assets/pt.png')}
              style={styles.imageIcon}
            />
            <Text style={styles.imageButtonText}>{t('menu.pt')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Message')}>
            <Image
              source={require('./assets/message.png')}
              style={styles.imageIcon}
            />
            <Text style={styles.imageButtonText}>{t('menu.message')}</Text>
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
  
  // SecondRoute.tsx
  const SecondRoute = ({t}) => {
    const userContext = useUser();
    const user = userContext?.user;
  
    useEffect(() => {
      console.log('SecondRoute user:', user);
      console.log('SecondRoute user access_card:', user?.access_card);
    }, [user]);
    
    const viewShotRef = useRef();

    const downloadBarcode = async () => {
        try {
          const uri = await viewShotRef.current.capture();
          console.log('Captured barcode URI:', uri);
    
          console.log(CameraRoll);
    
          // 사진첩에 저장
          await CameraRoll.save(uri, { type: 'photo' });
          Alert.alert('Success', 'Barcode saved to Photos!');
        } catch (error) {
          console.error('Error saving barcode:', error);
          Alert.alert('Error', 'Failed to save barcode');
        }
    };

    return (
      <View style={styles.tabContent}>
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
            <TouchableOpacity 
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
            </TouchableOpacity>
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
    menuButton: {
        padding: 15,
        marginRight: 5,
      },
      hamburgerLine: {
        width: 25,
        height: 3,
        backgroundColor: '#fff',
        marginVertical: 3,
        borderRadius: 1,
      },
      slideMenu: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '70%',
        height: '100%',
        backgroundColor: '#808080',
        zIndex: 2,
      },
      menuContent: {
        padding: 20,
      },
    
      menuContainer: {
        flex: 1,
        paddingTop: 10,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexWrap: 'wrap',
        flexDirection: 'row',
        gap : '3.3%'
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
      navButton: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
      },
      navButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
      },
      subMenuHeader: {
        height: 60,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
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
      sideMenuItems: {
        marginTop: 20,
      },
      sideMenuItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
      },
      sideMenuItemText: {
        color: '#fff',
        fontSize: 16,
      },
      logoutItem: {
        marginTop: 20,
        backgroundColor: '#ccc',
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
      },
      logoutContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      logoutIcon: {
        marginRight: 8,
      },
      logoutText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
      },
      imageButton: {
        width: '30%',
        alignItems: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign : 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'transparent',
      },
      imageIcon: {
        width: 48,
        height: 48,
        marginBottom: 8,
        resizeMode: 'contain',
      },
      imageButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: 'transparent',
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

  });


  export default HomeScreen;