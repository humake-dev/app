import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity,ActivityIndicator, Alert} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { authFetch } from './src/utils/api';

const PtScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1)

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [ptCount, setPtCount] = useState(0);
  const [markedDates, setMarkedDates] = useState({});

  const [ptSchedules, setPtSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonthName, setCurrentMonthName] = useState('');

  useEffect(() => {
    if (!i18n.isInitialized) return;

    const lang = i18n.language; // 현재 언어
    LocaleConfig.locales[lang] = {
      monthNames: t('calendar.monthNames', { returnObjects: true }),
      monthNamesShort: t('calendar.monthNamesShort', { returnObjects: true }),
      dayNames: t('calendar.dayNames', { returnObjects: true }),
      dayNamesShort: t('calendar.dayNamesShort', { returnObjects: true }),
      today: t('calendar.today'),
    };

    LocaleConfig.defaultLocale = lang; 
  }, [i18n.language, i18n.isInitialized]);
  
useEffect(() => {
  if (!i18n.isInitialized) return;
   const monthNames = t('calendar.monthNames', { returnObjects: true });
   const currentMonthName = setCurrentMonthName(monthNames[selectedMonth-1]);

  fetchPTMarks();
}, [i18n.isInitialized, selectedMonth, selectedYear]);

useEffect(() => {
  const today = new Date();
  const todayString = new Date().toLocaleDateString('en-CA'); // ✅ 로컬 YYYY-MM-DD
  const dayOnly = today.getDate(); // 1~31 숫자

  setSelectedDate(todayString);
  fetchReservations(dayOnly);
}, []);

  const today = new Date();

  const formatDate = (date: Date) =>
  date.toISOString().split('T')[0];

  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 3);

  const convertTime = (dateStr) => {
    const date = new Date(dateStr);

    const hourStr = date.toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      hour12: true  // 24시간제, 원하면 true로 바꿔도 됨
    });

    return hourStr;
  }

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


  const disabledFutureDates = getDisabledFutureDates(maxDate, 90);

  const onDayPress = (day) => {
    const dayOnly = new Date(day.dateString).getDate();

    setSelectedDate(day.dateString);
    fetchReservations(dayOnly);
  };

  const fetchPTMarks = async () => {
    try {
      const response = await authFetch(`/reservations?month=${selectedMonth}&year=${selectedYear}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setPtCount(data.total);
  
      if (data.total > 0) {
        const newMarks = {};
        data.reservation_list.forEach(dateStr => {
          if (dateStr.start_time) {
            const dateKey = dateStr.start_time.split('T')[0];
            newMarks[dateKey] = {
              ...markedDates[dateKey],
              marked: true,
              dotColor: 'red',
            };
          }
        });
  
        setMarkedDates(prev => ({
          ...prev,
          ...newMarks,
        }));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchReservations = async (date) => {
      const day = date ?? today.getDate();

    try {
      setLoading(true);
        const response = await authFetch(`/reservations?month=${selectedMonth}&year=${selectedYear}&day=${day}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const data = await response.json();

      console.log('API Response:', data);
      if (data.total > 0) {
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
            <View style={styles.statsContainer}>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>{currentMonthName} {t('attendance.PTcount')} <View style={[styles.attendanceCircle]} /></Text>
                <Text style={styles.statsValue}>{ptCount} {t('common.times')}</Text>
              </View>
              </View>
      <Calendar 
        onDayPress={onDayPress}
        markedDates={{markedDates,
          ...disabledFutureDates,
          [selectedDate]: { selected: true, marked: true }
        }}
        monthFormat={t('calendar.monthFormat')}
        enableSwipeMonths={true}
        firstDay={0}
        hideExtraDays={true}
        maxDate={formatDate(maxDate)}
                onVisibleMonthsChange={(months) => {

    setSelectedMonth(months[0].month);
    setSelectedYear(months[0].year);
  }}
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
          dotColor: 'FF69B4',
          selectedDotColor: '#007AFF',
          disabledDotColor: '#C7C7CD',
          disabledDayTextColor: '#C7C7CD',
          monthTextColor: '#000',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
        }}
        dayComponent={({ date, state }) => {
          const todayStr = new Date().toLocaleDateString('en-CA');
          const isTodayOrPast = date.dateString <= todayStr;
          const dayOfWeek = new Date(date.dateString).getDay();
        
          let textColor = '#000';
          if (dayOfWeek === 0) textColor = '#FF3B30';
          else if (dayOfWeek === 6) textColor = '#007AFF';
          if (!isTodayOrPast) textColor = '#C7C7CD';
        
          const isSelected = date.dateString === selectedDate;
          const isMarked = markedDates[date.dateString]?.marked;
        
          return (
            <TouchableOpacity
              onPress={() => onDayPress(date)}
              style={{
                backgroundColor: isSelected ? '#007AFF' : 'transparent',
                borderRadius: 20,
                padding: 8,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: isSelected ? '#fff' : textColor,
                  fontWeight: isSelected ? 'bold' : 'normal',
                }}
              >
                {date.day}
              </Text>
              {isMarked && (
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: markedDates[date.dateString].dotColor,
                    marginTop: 2,
                  }}
                />
              )}
            </TouchableOpacity>
          );
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
    padding: 16,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statsItem: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  statsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
    attendanceCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF69B4',
    alignSelf: 'center',
    marginTop: 8,
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