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
  Platform,
  PermissionsAndroid,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {I18nextProvider} from 'react-i18next';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import TrainerScreen from './TrainerScreen';
import TrainerDetailScreen from './TrainerDetailScreen';
import AttendanceScreen from './AttendanceScreen';
import PtScreen from './PtScreen';
import ExerciseScreen from './ExerciseScreen';
import CounselScreen from './CounselScreen';
import CounselDetailScreen from './CounselDetailScreen';
import CounselFormScreen from './CounselFormScreen';
import StopScreen from './StopScreen';
import StopDetailScreen from './StopDetailScreen';
import StopFormScreen from './StopFormScreen';
import NoticeDetailScreen from './NoticeDetailScreen';
import MessageDetailScreen from './MessageDetailScreen';
import UserWeightScreen from './UserWeightScreen';
import UserWeightFormScreen from './UserWeightFormScreen';
import UserScreen from './UserScreen';
import i18n from './i18n/i18n';
import { useTranslation } from 'react-i18next'; 
import {Icon} from 'react-native-elements';
import { BASE_URL } from './Config';
import UserContext, { UserProvider } from './UserContext';


const Stack = createStackNavigator();

const App = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [fcmToken, setFcmToken] = useState(false);
  const navigation = useRef();
  const messaging = useRef(null);
  const [user, setUser] = useState(null);

  const fetchFcmToken = async () => {
    if(!fcmToken) {
      return false;
    }

    if(!isLoggedIn) {
      return false;
    }

    const formData = new FormData();
    formData.append('token', Buffer.from(fcmToken).toString('base64'));
    formData.append('os',Platform.OS);
    formData.append('format','json');

    return fetch(`${BASE_URL}/user-devices/add`,{
      method : 'POST',
      body : formData
    }).then((response) => response.json())
    .then((responseJson) => {
      console.log('fetcFcmTokenComplete');
      console.log(JSON.stringify(responseJson));
    })
    .catch((error) => {
      console.log(JSON.stringify(error));
      //console.error(error);
    });
  }  

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
      toggleMenu(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/logout`, {
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

  const loginCheck = async () => {
    try {
      const response = await fetch(`${BASE_URL}/login?user_id=11632`, {
        method: 'POST'
      });

      console.log('User data fetched:', response);

      if (response.ok) {
        const data = await response.json();
        console.log('User data fetched:', data);
        setIsLoggedIn(true);
        setUser(data);
        // 데이터가 잘 저장되었는지 확인
        console.log('User data after set:', user);
        navigation.current.navigate('Home');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
<I18nextProvider i18n={i18n}>
<UserProvider value={{ user, setUser }}>
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer ref={navigation} onReady={loginCheck}>  
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#333',
            },
            headerTintColor: '#fff',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('menu.login') }} />    
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
                  onPress={() => toggleMenu()} 
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
          <Stack.Screen name="Trainer" component={TrainerScreen} options={{ title: t('menu.trainer') }} />
          <Stack.Screen name="TrainerDetail" component={TrainerDetailScreen} options={{ title: t('menu.trainer') }}/>
          <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: t('menu.attendance') }}/>
          <Stack.Screen name="Exercise" component={ExerciseScreen} options={{ title: t('menu.exercise') }}/>
          <Stack.Screen name="Pt" component={PtScreen} options={{ title: t('menu.pt') }}/>
          <Stack.Screen name="UserWeight" component={UserWeightScreen} options={{ title: t('menu.body') }}/>
          <Stack.Screen name="UserWeightForm" component={UserWeightFormScreen} options={{ title: t('menu.body') }}/>
          <Stack.Screen name="Counsel" component={CounselScreen} options={{ title: t('menu.counsel') }}/>
          <Stack.Screen name="CounselForm" component={CounselFormScreen} options={{ title: t('counsel.form') }}/>
          <Stack.Screen name="CounselDetail" component={CounselDetailScreen} options={{ title: t('menu.counsel') }}/>
          <Stack.Screen name="Stop" component={StopScreen} options={{ title: t('menu.stop') }}/>
          <Stack.Screen name="StopForm" component={StopFormScreen} options={{ title: t('stop.form') }}/>
          <Stack.Screen name="StopDetail" component={StopDetailScreen} options={{ title: t('menu.stop') }}/>      
          <Stack.Screen name="NoticeDetail" component={NoticeDetailScreen} options={{ title: t('menu.notice') }}/>
          <Stack.Screen name="MessageDetail" component={MessageDetailScreen} options={{ title: t('menu.message') }}/>     
          <Stack.Screen name="User" component={UserScreen} options={{ title: t('menu.user') }}/>
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
                    <Text style={styles.sideMenuItemText}>{t('menu.trainer')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.sideMenuItem}
                    onPress={() => {
                      closeMenu();
                      navigation.current.navigate('Message');
                    }}>
                    <Text style={styles.sideMenuItemText}>{t('menu.message')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.sideMenuItem}
                    onPress={() => {
                      closeMenu();
                      navigation.current.navigate('Exercise');
                    }}>
                    <Text style={styles.sideMenuItemText}>{t('menu.exercise')}</Text>
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
    </UserProvider>
    </I18nextProvider>
  );
};

const styles = StyleSheet.create({

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
});

export default App;