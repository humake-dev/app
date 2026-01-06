import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { authFetch } from './utils/api';

const PtScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState('');
  const [ptSchedules, setPtSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];

  const convertTime = (dateStr) => {
    const date = new Date(dateStr);

    const hourStr = date.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      hour12: false  // 24시간제, 원하면 true로 바꿔도 됨
    });

    return hourStr;
  }

  const fetchReservations = async (date) => {
    try {
      console.log('Fetching reservations for date:', date);
      setLoading(true);

      const response = await authFetch(`/reservations?day=${date}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      console.log('API Response:', data);
      if (data.reservation_list) {
        const formattedSchedules = data.reservation_list.map((item, index) => ({
          id: item.id.toString(),
          start_time: convertTime(item.start_time),
          trainer_name: item.trainer_name,
          complete: item.complete
        }));
        setPtSchedules(formattedSchedules);
      } else {
        console.log('No reservation_list in response');
        setPtSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert(t('errors.error'), t('errors.fetchReservationsFailed'));
      setPtSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch reservations for today when screen loads
    const todayStr = formatDate(today);
    setSelectedDate(todayStr);
    fetchReservations(todayStr);
  }, []);

  const getDisabledFutureDates = (fromDate, days) => {
    const disabled = {};
    for (let i = 1; i <= days; i++) {
      const future = new Date(fromDate);
      future.setDate(future.getDate() + i);
      disabled[formatDate(future)] = {
        disabled: true,
        disableTouchEvent: true,
      };
    }
    return disabled;
  };

  const todayStr = formatDate(today);
  const disabledFutureDates = getDisabledFutureDates(today, 90);

  const onDayPress = (day) => {
    const selected = new Date(day.dateString);
    if (selected > today) return; // 미래 날짜 선택 방지
  
    setSelectedDate(day.dateString);
    fetchReservations(day.dateString);
  };

  const renderPtScheduleItem = ({ item }) => (
    <TouchableOpacity style={styles.scheduleItem}>
      <Text style={styles.scheduleItemText}>{item.start_time}</Text>
      <Text style={styles.scheduleItemText}>{item.trainer_name}</Text>
      <Text style={[
        styles.scheduleItemText, 
        item.complete === '1' && styles.statusConfirmed,
        item.complete === '2' && styles.statusPending,
        item.complete === '3' && styles.statusCompleted
      ]}>
        {item.complete}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Calendar 
        onDayPress={onDayPress}
        markedDates={{
          ...disabledFutureDates,
          [selectedDate]: { selected: true, marked: true }
        }}
        monthFormat={t('calendar.monthFormat')}
        enableSwipeMonths={true}
        firstDay={0}
        hideExtraDays={true}
        maxDate={today} 
        theme={{
          monthTextColor: '#000',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: 'white',
          arrowColor: '#007AFF',
          textSectionTitleColor: '#000',
          textDisabledColor: '#C7C7CD',
          todayTextColor: '#007AFF',
          selectedDayTextColor: 'white',
          selectedDayBackgroundColor: '#007AFF',
          dotColor: '#007AFF',
          selectedDotColor: '#007AFF',
          disabledDotColor: '#C7C7CD',
          disabledDayTextColor: '#C7C7CD',
          monthTextColor: '#000',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
        }}
      />
      
      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleHeaderText}>PT 일정 ({selectedDate})</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={ptSchedules}
          renderItem={renderPtScheduleItem}
          keyExtractor={item => item.id}
          style={styles.scheduleList}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>예약된 PT가 없습니다.</Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={styles.scheduleListHeader}>
              <Text style={styles.scheduleListHeaderText}>시간</Text>
              <Text style={styles.scheduleListHeaderText}>강사</Text>
              <Text style={styles.scheduleListHeaderText}>상태</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scheduleHeader: {
    padding: 15,
    backgroundColor: '#f4f4f4',
  },
  scheduleHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scheduleList: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  scheduleListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scheduleListHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scheduleItemText: {
    flex: 1,
    textAlign: 'center',
  },
  statusConfirmed: {
    color: 'green',
  },
  statusPending: {
    color: 'orange',
  },
  statusCompleted: {
    color: 'gray',
  },
});

export default PtScreen;