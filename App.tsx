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
  TouchableWithoutFeedback,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {I18nextProvider} from 'react-i18next';
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


// Screen components
const HomeScreen = ({navigation}) => {
  const { t } = useTranslation();
  const windowWidth = Dimensions.get('window').width;

  return (
    <View style={styles.screenContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={require('./assets/main.jpg')}
          style={[styles.mainImage, { width: windowWidth }]}
          resizeMode="cover"
        />
      </View>
      <View style={styles.menuContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.menuItem]}
            onPress={() => navigation.navigate('Trainer')}>
            <Text style={styles.navButtonText}>{t('menu.trainer')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.menuItem]}
            onPress={() => navigation.navigate('Attendance')}>
            <Text style={styles.navButtonText}>{t('menu.attendance')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.menuItem]}
            onPress={() => navigation.navigate('Exercise')}>
            <Text style={styles.navButtonText}>{t('menu.exercise')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.menuItem]}
            onPress={() => navigation.navigate('Pt')}>
            <Text style={styles.navButtonText}>{t('menu.pt')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.menuItem]}
            onPress={() => navigation.navigate('Message')}>
            <Text style={styles.navButtonText}>{t('menu.message')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.menuItem]}
            onPress={() => navigation.navigate('Stop')}>
            <Text style={styles.navButtonText}>{t('menu.stop')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.menuItem]}
            onPress={() => navigation.navigate('Counsel')}>
            <Text style={styles.navButtonText}>{t('menu.counsel')}</Text>
          </TouchableOpacity>
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

  useEffect(() => {
    const login = async () => {
      try {
        const response = await fetch('http://10.0.2.2:8000/login?user_id=11632', {
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
    if (isAnimating) return;

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



  return (
<I18nextProvider i18n={i18n}>
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} 
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

  menuItem: {
    width: '30%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign : 'center',
    marginBottom: 10,
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
    color: '#fff',
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
    height: '100%',
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
});

export default App;
