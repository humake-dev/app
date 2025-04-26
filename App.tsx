/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {I18nextProvider} from 'react-i18next';
import LoginScreen from './LoginScreen';
import TrainerScreen from './TrainerScreen';
import TrainerDetailScreen from './TrainerDetailScreen';
import AttendanceScreen from './AttendanceScreen';
import PtScreen from './PtScreen';
import ExerciseScreen from './ExerciseScreen';
import MessageScreen from './MessageScreen';
import MessageDetailScreen from './MessageDetailScreen';
import CounselScreen from './CounselScreen';
import CounselDetailScreen from './CounselDetailScreen';
import CounselFormScreen from './CounselFormScreen';
import StopScreen from './StopScreen';
import StopDetailScreen from './StopDetailScreen';
import StopFormScreen from './StopFormScreen';
import i18n from './i18n/i18n';
import { useTranslation } from 'react-i18next'; 
import {Icon} from 'react-native-elements';
import DeviceBrightness from '@adrianso/react-native-device-brightness';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import ViewShot from 'react-native-view-shot';
import CameraRoll from '@react-native-camera-roll/camera-roll'; // 사진 저장용
import { BASE_URL } from './Config';


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

const SecondRoute = ({user, t}) => {
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

// Screen components
const HomeScreen = ({navigation, route}) => {
  const { t } = useTranslation();
  const windowWidth = Dimensions.get('window').width;
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: '메뉴' },
    { key: 'second', title: '입장바코드' },
  ]);

  const renderScene = SceneMap({
    first: () => <FirstRoute navigation={navigation} t={t} />,
    second: () => <SecondRoute user={route.params?.user} t={t} />,
  });

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



const Stack = createStackNavigator();

const App = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [brightness, setBrightness] = useState();
  const [fcmToken, setFcmToken] = useState(false);
  const navigation = useRef(null);
  const messaging = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user) {
      console.log('User data received:', user);
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user`);

      if (response.status === 401) {
        navigation.current?.navigate('Login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('User data fetched:', data);
        setUser(data);
        // Pass user data to HomeScreen
        navigation.current?.navigate('Home', { user: data });
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const requestIOSPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      fetchFcmToken(getFcmToken());

      messaging().onMessage(async remoteMessage => {
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
      });
    }
  }

  const requestAndroidPermission = async () => {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      fetchFcmToken(getFcmToken());

      messaging().onMessage(async remoteMessage => {
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
      });
    }
  }

  const getFcmToken = async () => {
    const fcmFToken = await messaging().getToken();
    setFcmToken(fcmFToken);
    return fcmFToken;
  };

  useEffect(() => {
    
    if(Platform.OS==='android') {
      requestAndroidPermission();
    } else {
      requestIOSPermission();
    }

  }, []);

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

  useEffect(() => {
    const login = async () => {
      try {
        const response = await fetch(`${BASE_URL}/login?user_id=11632`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          console.error('Login failed');
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
    };

    login();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (!isMenuOpen) {
        slideAnim.setValue(Dimensions.get('window').width);
      }
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription.remove();
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsMenuVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen]);

  if (!isLoggedIn) {
    return (
      <View style={styles.screenContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const toggleMenu = (shouldOpen?: boolean) => {

    const toValue = shouldOpen !== undefined ? (shouldOpen ? 0 : Dimensions.get('window').width) : (isMenuOpen ? Dimensions.get('window').width : 0);
    const duration = 300;
    
    setIsAnimating(true);
    
    if (toValue === 0) {
      setIsMenuOpen(true);
    }

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue,
        useNativeDriver: true,
        damping: 22,
        mass: 0.8,
        stiffness: 150,
        velocity: toValue === 0 ? 3 : -1,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
      }),
      Animated.timing(fadeAnim, {
        toValue: toValue === 0 ? 1 : 0,
        duration,
        useNativeDriver: true,
        easing: Easing.ease
      }),
    ]).start(({finished}) => {
      setIsAnimating(false);
      if (finished && toValue === Dimensions.get('window').width) {
        setIsMenuOpen(false);
      }
    });
  };

  const closeMenu = () => {
    if (!isAnimating) {
      toggleMenu(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_URL}0/logout`, {
        method: 'POST',
      });

      if (response.ok) {
        // Reset menu animation
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').width,
          duration: 250,
          useNativeDriver: true,
        }).start();

        // Reset fade animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();

        // Reset menu state
        setIsMenuVisible(false);
        
        // Navigate to login
        navigation.current.navigate('Login');
      } else {
        Alert.alert('Error', 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An error occurred during logout');
    }
  };

  return (
<I18nextProvider i18n={i18n}>
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer ref={navigation}>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#333',
            },
            headerTintColor: '#fff',
          }}
          screenProps={{ navigation, user }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              headerTitle: '',
              headerLeft: () => (
                <Image
                  source={require('./assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ),
              headerRight: () => (
                <TouchableOpacity 
                  onPress={() => !isAnimating && toggleMenu()} 
                  style={styles.menuButton}
                  activeOpacity={0.7}>
                  <Animated.View 
                    style={[
                      styles.hamburgerLine,
                      {
                        transform: [
                          {
                            rotate: slideAnim.interpolate({
                              inputRange: [0, Dimensions.get('window').width],
                              outputRange: ['45deg', '0deg'],
                            }),
                          },
                        ],
                      },
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.hamburgerLine,
                      {
                        opacity: slideAnim.interpolate({
                          inputRange: [0, Dimensions.get('window').width / 2, Dimensions.get('window').width],
                          outputRange: [0, 0.5, 1],
                        }),
                      },
                    ]} 
                  />
                  <Animated.View 
                    style={[
                      styles.hamburgerLine,
                      {
                        transform: [
                          {
                            rotate: slideAnim.interpolate({
                              inputRange: [0, Dimensions.get('window').width],
                              outputRange: ['-45deg', '0deg'],
                            }),
                          },
                        ],
                      },
                    ]} 
                  />
                </TouchableOpacity>
              ),
            }} 
          />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('menu.login') }} />      
          <Stack.Screen name="Trainer" component={TrainerScreen} options={{ title: t('menu.trainer') }} />
          <Stack.Screen name="TrainerDetail" component={TrainerDetailScreen} options={{ title: t('menu.trainer') }}/>
          <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: t('menu.attendance') }}/>
          <Stack.Screen name="Exercise" component={ExerciseScreen} options={{ title: t('menu.exercise') }}/>
          <Stack.Screen name="Pt" component={PtScreen} options={{ title: t('menu.pt') }}/>
          <Stack.Screen name="Message" component={MessageScreen}  options={{ title: t('menu.message') }}/>
          <Stack.Screen name="MessageDetail" component={MessageDetailScreen} options={{ title: t('menu.message') }}/>
          <Stack.Screen name="Counsel" component={CounselScreen} options={{ title: t('menu.counsel') }}/>
          <Stack.Screen name="CounselForm" component={CounselFormScreen} options={{ title: t('counsel.form') }}/>
          <Stack.Screen name="CounselDetail" component={CounselDetailScreen} options={{ title: t('menu.counsel') }}/>
          <Stack.Screen name="Stop" component={StopScreen} options={{ title: t('menu.stop') }}/>
          <Stack.Screen name="StopForm" component={StopFormScreen} options={{ title: t('stop.form') }}/>
          <Stack.Screen name="StopDetail" component={StopDetailScreen} options={{ title: t('menu.stop') }}/>      
        </Stack.Navigator>

        {/* Overlay and Menu */}
        {isMenuVisible && (
          <View style={StyleSheet.absoluteFill}>
            <TouchableWithoutFeedback onPress={closeMenu}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    opacity: fadeAnim,
                  },
                ]}
              />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[
                styles.slideMenu,
                {
                  transform: [
                    {
                      translateX: slideAnim,
                    },
                  ],
                },
              ]}>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>메뉴</Text>
                
                <View style={styles.sideMenuItems}>
                  <TouchableOpacity 
                    style={styles.sideMenuItem}
                    onPress={() => {
                      closeMenu();
                      navigation.current.navigate('Trainer');
                    }}>
                    <Text style={styles.sideMenuItemText}>트레이너</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.sideMenuItem}
                    onPress={() => {
                      closeMenu();
                      navigation.current.navigate('Message');
                    }}>
                    <Text style={styles.menuItemText}>메시지</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.sideMenuItem}
                    onPress={() => {
                      closeMenu();
                      navigation.current.navigate('Counsel');
                    }}>
                    <Text style={styles.menuItemText}>상담</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.sideMenuItem, styles.logoutItem]}
                    onPress={handleLogout}
                  >
                    <View style={styles.logoutContent}>
                      <Icon 
                        name="sign-out-alt" 
                        type="font-awesome-5" 
                        color="#fff" 
                        size={16}
                        style={styles.logoutIcon}
                      />
                      <Text style={styles.logoutText}>로그아웃</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
    </I18nextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#333',
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    height: 28,
    width: 230,
    marginLeft: 15,
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

export default App;