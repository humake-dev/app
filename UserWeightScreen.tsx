
import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  View,
  Dimensions,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import { useRoute } from '@react-navigation/native';
import { useUser } from './src/contexts/UserContext';
import { authFetch } from './src/utils/api';

const UserWeightScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const [userWeights, setUserWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('day');
  const [userBMI, setUserBMI] = useState(0);

  const userContext = useUser();
  const user = userContext?.user;
  const route = useRoute();

  // 현재 앱 언어
  const locale = i18n.resolvedLanguage || i18n.language || 'en';

  // 날짜 다국어 처리
  const formatLocalizedDate = useCallback((input, type = 'day') => {
    if (!input) return '';

    const value = String(input);

    // 주간 날짜
    if (type === 'week') {
      const [year, week] = value.split('-');

      return t('user_weight.date_week', {
        year,
        week: parseInt(week, 10),
      });
    }

    // 월간 날짜
    if (type === 'month') {
      const [year, month] = value.split('-');

      return t('user_weight.date_month', {
        year,
        month: parseInt(month, 10),
      });
    }

    // 날짜만 있는 문자열은 로컬 시간대 기준으로 생성
    const dateOnly = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);

    const date = dateOnly
      ? new Date(
          Number(dateOnly[1]),
          Number(dateOnly[2]) - 1,
          Number(dateOnly[3])
        )
      : new Date(value);

    if (isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);

  }, [locale, t]);

  // BMI 상태
  const getBMIStatus = (bmi) => {
    if (bmi >= 25) {
      return {
        text: t('user_weight.bmi_status.obese'),
        color: 'red',
      };
    }

    if (bmi >= 23) {
      return {
        text: t('user_weight.bmi_status.overweight'),
        color: 'indianred',
      };
    }

    if (bmi < 18.5) {
      return {
        text: t('user_weight.bmi_status.underweight'),
        color: 'darkviolet',
      };
    }

    return {
      text: t('user_weight.bmi_status.normal'),
      color: 'blue',
    };
  };

  // 체중 데이터 조회
  const fetchUserWeights = useCallback(async () => {
    const height = user?.user_height?.height;

    if (!height) {
      return;
    }

    setLoading(true);

    try {
      let url = '/user_weights';

      if (selectedType === 'week') {
        url += '?week=1';
      } else if (selectedType === 'month') {
        url += '?month=1';
      }

      const response = await authFetch(url);

      if (response.ok) {
        const data = await response.json();

        const weightList = data.user_weight_list || [];

        setUserWeights(weightList);

        // BMI 계산
        if (weightList.length > 0) {
          const weight = Number(weightList[0].avg_weight);
          const heightMeter = Number(height) / 100;

          const bmi = Number(
            (weight / (heightMeter * heightMeter)).toFixed(2)
          );

          setUserBMI(bmi);
        } else {
          setUserBMI(0);
        }
      }

    } catch (error) {
      console.error('Error fetching user weights:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedType, user?.user_height?.height]);

  // 기간 변경 시 조회
  useEffect(() => {
    fetchUserWeights();
  }, [fetchUserWeights]);

  // 다른 화면에서 돌아왔을 때 갱신
  useEffect(() => {
    if (route.params?.refresh) {
      fetchUserWeights();
    }
  }, [route.params?.refresh, fetchUserWeights]);

  // 차트 데이터
  const chartLabels = [...userWeights]
    .reverse()
    .map(item => formatLocalizedDate(item.group_date, selectedType));

  const chartData = [...userWeights]
    .reverse()
    .map(item => Number(item.avg_weight));

  // 사용자 로딩
  if (!user) {
    return (
      <View style={styles.screenContainer}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  // 키 정보가 없는 경우
  if (!user.user_height?.height) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {t('user_height.required')}
        </Text>

        <Text style={styles.emptyDescription}>
          {t('user_height.required_description')}
        </Text>

        <TouchableOpacity
          style={styles.goButton}
          onPress={() => navigation.navigate('UserHeightForm')}
        >
          <Text style={styles.goButtonText}>
            {t('user_height.go_to_form')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 데이터 로딩
  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  // 데이터 없음
  if (userWeights.length === 0) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.noMessagesText}>
          {t('user_weight.no_items')}
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('UserWeightForm')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bmiStatus = getBMIStatus(userBMI);

  // 체중 기록 목록
  const renderUserWeightItem = ({ item }) => {
    return (
      <View style={styles.messageItem}>
        <View style={styles.messageInfo}>
          <Text>
            {formatLocalizedDate(item.group_date, selectedType)}
          </Text>

          <Text style={styles.noticeTitle}>
            {item.avg_weight} {t('user_weight.unit_kg')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* 기간 선택 */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {['day', 'week', 'month'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.categoryButton,
                selectedType === type && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedType === type && styles.categoryTextActive,
                ]}
              >
                {t(`user_weight.period_${type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView>

        {/* 최근 측정일 */}
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>
            {t('user_weight.recent_measurement', {
              date: formatLocalizedDate(
                userWeights[0].group_date,
                selectedType
              ),
            })}
          </Text>
        </View>

        {/* 체중 및 BMI */}
        <View style={styles.infoContainer}>

          <View style={styles.infoItem}>
            <Text>{t('user_weight.weight')}</Text>

            <Image
              source={require('./assets/ico_weight1.png')}
              style={styles.infoImage}
            />

            <Text>
              {t('user_weight.average_period', {
                weight: userWeights[0].avg_weight,
                unit: t('user_weight.unit_kg'),
              })}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text>{t('user_weight.bmi')}</Text>

            <Image
              source={require('./assets/ico_weight2.png')}
              style={styles.infoImage}
            />

            <Text style={{ color: bmiStatus.color }}>
              {userBMI} / {bmiStatus.text}
            </Text>
          </View>

        </View>

        {/* 체중 그래프 */}
        <View>
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [
                {
                  data: chartData,
                },
              ],
            }}
            width={Dimensions.get('window').width - 16}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#f4f4f4',
              backgroundGradientFrom: '#f4f4f4',
              backgroundGradientTo: '#f4f4f4',
              decimalPlaces: 2,
              color: (opacity = 1) =>
                `rgba(51, 51, 51, ${opacity})`,
              labelColor: (opacity = 1) =>
                `rgba(51, 51, 51, ${opacity})`,
            }}
            bezier
            style={{
              marginVertical: 8,
              backgroundColor: '#f4f4f4',
            }}
          />
        </View>

        {/* 체중 기록 목록 */}
        <View>
          <FlatList
            data={userWeights}
            renderItem={renderUserWeightItem}
            keyExtractor={(item) => item.group_date.toString()}
            contentContainerStyle={styles.userWeightList}
            scrollEnabled={false}
          />
        </View>

      </ScrollView>

      {/* 체중 추가 */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('UserWeightForm')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },

  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryContainer: {},

  categoryScroll: {
    padding: 20,
  },

  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 16,
    marginRight: 8,
    minWidth: 70,
    maxWidth: 140,
    height: 36,
    justifyContent: 'center',
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

  recentContainer: {
    padding: 10,
  },

  recentTitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
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

  noMessagesText: {
    fontSize: 16,
    color: '#666',
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
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  userWeightList: {
    paddingHorizontal: 20,
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
    bottom: 3,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  goButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  goButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserWeightScreen;
