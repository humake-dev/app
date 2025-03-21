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

// Screen components
const HomeScreen = ({navigation}) => {
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
        style={styles.navButton}
        onPress={() => navigation.navigate('SubMenu')}>
        <Text style={styles.navButtonText}>서브메뉴로 이동</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('SubMenu')}>
        <Text style={styles.navButtonText}>서브메뉴로 이동</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('SubMenu')}>
        <Text style={styles.navButtonText}>서브메뉴로 이동</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('SubMenu')}>
        <Text style={styles.navButtonText}>서브메뉴로 이동</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('SubMenu')}>
        <Text style={styles.navButtonText}>서브메뉴로 이동</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('SubMenu')}>
        <Text style={styles.navButtonText}>서브메뉴로 이동</Text>
      </TouchableOpacity>
      </View>

    </View>
  );
};

const SubMenuScreen = ({navigation}) => {
  return (
    <View style={styles.screenContainer}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.navButtonText}>홈으로 돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

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

  const [isMenuVisible, setIsMenuVisible] = useState(false);

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

  useEffect(() => {
    const updateDimensions = () => {
      if (!isMenuOpen) {
        slideAnim.setValue(Dimensions.get('window').width);
      }
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription.remove();
  }, [isMenuOpen]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#333',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fff',
          }}>
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
          <Stack.Screen 
            name="SubMenu" 
            component={SubMenuScreen}
            options={{
              headerTitle: '서브메뉴',
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: 'bold',
              },
              headerTitleAlign: 'center',
            }}
          />
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
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    alignContent: 'flex-start'
  },

  menuTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'top',
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
    margin: 20,
    borderRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignSelf: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default App;
