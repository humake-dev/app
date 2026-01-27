import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList,  Alert, ScrollView, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { useUser } from './UserContext';
import { authFetch } from './src/utils/api';
import { formatDate } from './src/utils/helper';

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
    { key: 'first', title: t('menu.enroll') },
    { key: 'second', title: t('menu.locker') },
    { key: 'third', title: t('menu.user') },
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

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolls = async () => {
      try {
        const response = await authFetch('/enrolls?primary_only=false', {
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const json = await response.json();
          setData(json.enroll_list || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolls();
  }, []);

const renderEnrollItem = ({ item }) => {
const isQuantityType = item.lesson_type === 4;
const remainCount = item.quantity - item.use_quantity;


return (
<View style={styles.itemBox}>
<Text style={styles.itemText}>{item.product_title}</Text>


{isQuantityType ? (
<Text style={styles.itemText}>{remainCount}회 남음</Text>
) : (
<Text style={styles.itemText}>
{formatDate(item.start_date)} ~ {formatDate(item.end_date)}
</Text>
)}


<Text style={styles.itemText}>{item.trainer_name}</Text>
</View>
);
};

  return (
    <View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderEnrollItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>예약된 PT가 없습니다.</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>상품</Text>
              <Text style={styles.listHeaderText}>기간,횟수</Text>
              <Text style={styles.listHeaderText}>강사</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

  const SecondRoute = ({navigation, t, user}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRents = async () => {
      try {
        const response = await authFetch('/rents', {
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const json = await response.json();
          setData(json.rent_list || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRents();
  }, []);

  const renderRentItem = ({ item }) => {
      return (
            <View style={styles.itemBox}>
          <Text style={styles.itemText}>{item.product_title}</Text>
          <Text style={styles.itemText}>
            {formatDate(item.start_date)} ~ {formatDate(item.end_date)}
          </Text>
           <Text style={styles.itemText}>{item.no}</Text>
        </View>
      );
  }

  return (
    <View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderRentItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>예약된 PT가 없습니다.</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>상품</Text>
              <Text style={styles.listHeaderText}>기간</Text>
              <Text style={styles.listHeaderText}>번호</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

  const ThirdRoute = ({navigation, t, user}) => {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
        </View>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
<View style={styles.contentContainer}>
  <Text style={styles.userName}>
    {user?.name}
  </Text>

  <Text>
    사용자번호 : {user?.branch_id}#{user?.id}
  </Text>  

  <View style={styles.heightRow}>
    <Text style={styles.userHeight}>
      키: {user?.user_height?.height
        ? `${user.user_height.height} cm`
        : '미입력'}
    </Text>

    <TouchableOpacity
      style={[
        styles.editButton,
        !user?.user_height?.height && styles.addButton,
      ]}
      onPress={() => navigation.navigate('UserHeightForm')}
    >
      <Text style={styles.editButtonText}>
        {user?.user_height?.height ? '수정하기' : '입력'}
      </Text>
    </TouchableOpacity>
  </View>
</View>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{t('common.go_to_home')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
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
  },
userName: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 12,
},

heightRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

userHeight: {
  fontSize: 16,
  color: '#333',
},

editButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: '#007AFF',
  borderRadius: 6,
},

editButtonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
},

addButton: {
  backgroundColor: '#34C759', // 미입력일 때 강조
},
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
    fontSize: 16,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  itemBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemText: {
    flex: 1,
    textAlign: 'center',
  },  
});

export default UserScreen;