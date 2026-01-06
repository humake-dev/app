import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity,
  ActivityIndicator, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { authFetch } from "./utils/api";

const AttendanceScreen = ({ navigation }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1)

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [ptCount, setPtCount] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const { t, i18n } = useTranslation();
  const [Attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!i18n.isInitialized) return;
  
    LocaleConfig.locales['ko'] = {
      monthNames: t('calendar.monthNames', { returnObjects: true }),
      monthNamesShort: t('calendar.monthNamesShort', { returnObjects: true }),
      dayNames: t('calendar.dayNames', { returnObjects: true }),
      dayNamesShort: t('calendar.dayNamesShort', { returnObjects: true }),
      today: t('calendar.today'),
    };
  
    LocaleConfig.defaultLocale = 'ko';
  }, [i18n.isInitialized])
  
useEffect(() => {
  if (!i18n.isInitialized) return;

  fetchAttendanceMarks();
  fetchPTMarks();
}, [i18n.isInitialized, selectedMonth, selectedYear]);

   const fetchAttendanceMarks = async () => {
    try {
      const response = await authFetch(`/entrances?month=${selectedMonth}&year=${selectedYear}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });



      const data = await response.json();
      setAttendanceCount(data.total);
  
      if (data.total > 0) {
        const newMarks = {};
        data.entrance_list.forEach(dateStr => {
          if (dateStr.in_time) {
            const dateKey = dateStr.in_time.split('T')[0];
            newMarks[dateKey] = {
              ...markedDates[dateKey],
              marked: true,
              dotColor: '#FF69B4',
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
          if (dateStr.in_time) {
            const dateKey = dateStr.in_time.split('T')[0];
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


  const fetchAttendances = async (date) => {
    try {
      console.log('Fetching attendance for date:', date);
      setLoading(true);

      const response = await authFetch(`/attendances?day=${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      console.log('API Response:', data);
      if (data.attendance_list) {
        const formattedSchedules = data.attendance_list.map((item, index) => ({
          id: item.id.toString(),
          start_time: convertTime(item.start_time),
        }));
        setAttendances(formattedSchedules);
      } else {
        console.log('No attendance_list in response');
        setAttendances([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      Alert.alert(t('errors.error'), t('errors.fetchAttendancesFailed'));
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };
    
  const onDayPress = (day) => {
    const selected = new Date(day.dateString);
    if (selected > today) return; // 미래 날짜 선택 방지
  
    setSelectedDate(day.dateString);
    fetchAttendances(day.dateString);
  };


  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{selectedMonth}{t('common.month')} {t('attendance.count')}  <View style={styles.attendanceCircle} /></Text>         
          <Text style={styles.statsValue}>{attendanceCount} {t('common.times')}</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{selectedMonth}{t('common.month')} {t('attendance.PTcount')} <View style={[styles.attendanceCircle, { backgroundColor: 'blue' }]} /></Text>
          <Text style={styles.statsValue}>{ptCount} {t('common.times')}</Text>
        </View>
      </View>
      <Calendar 
        onDayPress={onDayPress}
        markedDates={markedDates} 
        onVisibleMonthsChange={(months) => {

    setSelectedMonth(months[0].month);
    setSelectedYear(months[0].year);
  }}
        monthFormat={t('calendar.monthFormat')}
        enableSwipeMonths={true}
        firstDay={0}
        hideExtraDays={true}
        theme={{
            monthTextColor: '#000', // 여기!
            selectedDayTextColor: 'white',
            selectedDayBackgroundColor: '#007AFF',
            arrowColor: '#007AFF',
            // 기본 요일 색상 (평일용)
            textSectionTitleColor: '#000',
            textDisabledColor: '#C7C7CD', // 흐리게 보여질 색상
          }}
          dayComponent={({ date, state }) => {
            const today = new Date();
            const dayOfWeek = new Date(date.dateString).getDay();
            const isTodayOrPast = new Date(date.dateString) <= today;
          
            let textColor = '#000'; // 평일
            if (dayOfWeek === 0) textColor = '#FF3B30'; // 일
            else if (dayOfWeek === 6) textColor = '#007AFF'; // 토
            if (!isTodayOrPast) textColor = '#C7C7CD';
          
            const isSelected = date.dateString === selectedDate;
            const isMarked = markedDates[date.dateString]?.marked;
          
            return (
              <View
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
                      borderRadius:  3.5,
                      backgroundColor: markedDates[date.dateString].dotColor ||  '#FF69B4',
                      marginTop: 2,
                    }}
                  />
                )}
              </View>
            );
          }}
        />

              
              <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleHeaderText}>출석 현황 ({selectedDate})</Text>
              </View>
              
              {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
              ) : (
                <FlatList
                  data={Attendances}
                  renderItem={renderAttendanceItem}
                  keyExtractor={item => item.id}
                  style={styles.scheduleList}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>출석한 시간이 없습니다.</Text>
                    </View>
                  )}
                  ListHeaderComponent={() => (
                    <View style={styles.scheduleListHeader}>
                      <Text style={styles.scheduleListHeaderText}>시간</Text>
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

export default AttendanceScreen;