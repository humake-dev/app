import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, ScrollView, Dimensions,Image, useEffect } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { useUser } from './UserContext';

const UserScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
    const windowWidth = Dimensions.get('window').width;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userContext = useUser();
  const user = userContext?.user;
  const LAST_TAB_KEY = 'lastTab';

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: t('수강') },
    { key: 'second', title: t('락커') },
    { key: 'third', title: t('내 정보') },
  ]);
  
  // 탭 변경 시 저장
  const handleIndexChange = async (newIndex: number) => {
    setIndex(newIndex);
  };
  
  const renderScene = SceneMap({
    first: () => <FirstRoute navigation={navigation} t={t} user={user} />,
    second: () => <SecondRoute navigation={navigation} t={t} user={user} />,
    third: () => <ThirdRoute navigation={navigation} t={t} user={user} />
  });
  
  const FirstRoute = ({navigation, t, user}) => {

    return (
      <View style={styles.container}>
        <View style={styles.header}>
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.contentContainer}>
  
            </View>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{t('common.backToList')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };


  const SecondRoute = ({navigation, t, user}) => {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.contentContainer}>
  
            </View>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{t('common.backToList')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const ThirdRoute = ({navigation, t, user}) => {

  };

    // 나머지 코드는 기존과 동일
    return (
      <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  date: {
    fontSize: 14,
    color: '#666',
    alignSelf: 'flex-end',
  },
  contentContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
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

  backButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  }
});

export default UserScreen;