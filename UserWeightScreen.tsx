import React, { useState, useEffect } from 'react';
import {
  View,
  Dimensions,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { BASE_URL } from './Config';

const UserWeightScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [userWeights, setUserWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedType, setSelectedType] = useState('day');
  const userContext = useUser();
  const user = userContext?.user;
  const [userBMI, setUserBMI] = useState(0);

  const chartLabels = [...userWeights].reverse().map(item => formatKoreanDate(item.group_date,selectedType));
  const chartData = [...userWeights].reverse().map(item => item.avg_weight);


  // Handle refresh parameter from navigation
  const route = useRoute();
  useEffect(() => {
    if (route.params?.refresh) {
        fetchUserWeights();
    }
  }, [route.params]);


  const calculateBMI = (weight: number, height: number) => {
    let m_h=height *0.01;
    let bmi=(weight / (m_h * m_h)).toFixed(2);
    console.log(bmi);
    setUserBMI(Number(bmi));
  }

  const calculateBMIColor = (bmi: number) => {
    let bmi_text='정상';
    let bmi_color='blue';

    if(bmi>=23) {
      bmi_text='과체중';
      bmi_color='indianred';
      if(bmi>=25) {
        bmi_text='비만';
        bmi_color='red';
      }
    } else {
      if(bmi<18.5) {
        bmi_text='저체중';
        bmi_color='darkviolet';
      }
    }

    return {bmi_text,bmi_color};
  };


  const fetchUserWeights = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      let response;
      if(selectedType=='day') {
      response = await fetch(`${BASE_URL}/user_weights`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      } else if(selectedType=='week') {
      response = await fetch(`${BASE_URL}/user_weights?week=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      } else if(selectedType=='month') {
      response = await fetch(`${BASE_URL}/user_weights?month=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      }

      if(response.ok){
        const data = await response.json();

        calculateBMI(data.user_weight_list[0].avg_weight,user.user_height.height);
        setUserWeights(data.user_weight_list);
        setLoading(false);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchUserWeights();
  }, [selectedType]);

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <Text>Loading Messages...</Text>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.noMessagesText}>{t('user_weight.no_items')}</Text>
        <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('UserWeightForm')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
      </View>
    );
  }

  function formatKoreanDate(input: string, type: string = 'default') {
    if (type === 'week') {
      const [year, week] = input.split('-');
      return `${year}년 ${parseInt(week)}주`;
    }
  
    if (type === 'month') {
      const [year, month] = input.split('-');
      return `${year}년 ${parseInt(month)}월`;
    }
  
    // 기본 타입 (날짜인 경우)
    const date = new Date(input);
    if (isNaN(date)) return input; // 유효하지 않은 날짜면 그대로 반환
  
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  }


  const renderUserWeightItem = ({ item }) => {
    const handlePress = () => {
      navigation.navigate('UserWeightDetail', { id: item.id });
    };

    return (
      <View style={styles.messageItem}>
        <View style={styles.messageInfo}>
          <Text>{formatKoreanDate(item.group_date,selectedType)}</Text>
          <Text style={styles.noticeTitle}>{item.avg_weight}Kg</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    selectedType === 'day' && styles.categoryButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedType('day')
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedType === 'day' && styles.categoryTextActive,
                    ]}
                  >
                  {t('user_weight.period_day')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.categoryButton,
                    selectedType === 'week' && styles.categoryButtonActive,
                  ]}
                  onPress={() =>{
                    setSelectedType('week')
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedType === 'week' && styles.categoryTextActive,
                    ]}
                  >
                  {t('user_weight.period_week')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.categoryButton,
                    selectedType === 'month' && styles.categoryButtonActive,
                  ]}
                  onPress={() =>{
                    setSelectedType('month')
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedType === 'month' && styles.categoryTextActive,
                    ]}
                  >
                  {t('user_weight.period_month')}
                  </Text>
                </TouchableOpacity>                
              </ScrollView>
              </View>
              <ScrollView>              
        <View style={{ padding: 10}}>
            <Text style={{ fontSize: 16,textAlign: 'center',fontWeight: 'bold' }}>최근측정 :  {formatKoreanDate(userWeights[0].group_date,selectedType)}</Text>
          </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
          <Text>{t('user_weight.weight')}</Text>
            <Image source={require('./assets/ico_weight1.png')} style={styles.infoImage}/>
            <Text>최근 기간평균 : {userWeights[0].avg_weight} Kg</Text>
          </View>
          <View style={styles.infoItem}>
            <Text>{t('user_weight.bmi')}</Text>
            <Image source={require('./assets/ico_weight2.png')} style={styles.infoImage}/>
            <Text style={{color:calculateBMIColor(userBMI).bmi_color}}>{userBMI} / {calculateBMIColor(userBMI).bmi_text}</Text>
          </View>
        </View>

        <View >
      <LineChart
  data={{
    labels: chartLabels,
    datasets: [
      {
        data: chartData,
      },
    ],
  }}
        width={Dimensions.get('window').width - 16} // 그래프 너비
        height={220} // 그래프 높이
        yAxisLabel="" // y축 앞에 붙는 단위 (예: "₩")
        chartConfig={{
          backgroundColor: '#f4f4f4',
          backgroundGradientFrom: '#f4f4f4',   // 여기가 중요
          backgroundGradientTo: '#f4f4f4',     // 여기도
          decimalPlaces: 2, // 소수점 자리수
          color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`, // #333 color
          labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`, // #333 color
        }}
        bezier // 곡선 형태
        style={{
          marginVertical: 8,
          backgroundColor: '#f4f4f4',
        }}
      />
       </View>
        <View>
                <FlatList
                  data={userWeights}
                  renderItem={renderUserWeightItem}
                  keyExtractor={(item) => item.group_date.toString()}
                  contentContainerStyle={styles.userWeightList}
                  scrollEnabled={false}
                />
                </View>

            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('UserWeightForm')}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex : 1,
    backgroundColor: '#f4f4f4 ',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  infoContainer: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  infoItem: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flex: 1,
  },
  infoImage: {
    width: 130,
    height: 70,
    margin: 5,
  },
  categoryScroll: { padding: 20 },
  noMessagesText: {
    fontSize: 16,
    color: '#666',
  },
  messageList: {
    padding: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
    alignItems: 'center',
  },
  messageInfo: {
    padding:10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageCreatedAt: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 45,  
    fontWeight: 'bold',
    bottom: 3
  },
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
  userWeightList: {
    paddingHorizontal: 20
  },
});

export default UserWeightScreen;