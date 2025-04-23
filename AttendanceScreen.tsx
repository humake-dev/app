import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const AttendanceScreen = ({ navigation }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1)

  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [ptCount, setPtCount] = useState(0);
  const [markedDates, setMarkedDates] = useState({});

  const fetchCounts = async () => {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Replace with actual API calls
      // Example: await fetchAttendanceCounts(firstDayOfMonth, lastDayOfMonth)
      setAttendanceCount(0); // Replace with actual count
      setPtCount(0); // Replace with actual count
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  useEffect(() => {
    LocaleConfig.locales['ko'] = {
      monthNames: t('calendar.monthNames', { returnObjects: true }),
      monthNamesShort: t('calendar.monthNamesShort', { returnObjects: true }),
      dayNames: t('calendar.dayNames', { returnObjects: true }),
      dayNamesShort: t('calendar.dayNamesShort', { returnObjects: true }),
      today: t('calendar.today')
    };

    LocaleConfig.defaultLocale = 'ko';

    // Fetch attendance and PT counts for the current month


    fetchCounts();
  }, []);

  useEffect(() => {
    fetch('http://10.0.2.2:8000/entrances?month=' + selectedMonth + '&year=' + selectedYear)
    .then(response => response.json())
    .then(data => {
      setAttendanceCount(data.total);
      
      if(data.total > 0) {
      // Create marked dates object for calendar
      const markedDates = {};
      data.entrance_list.forEach(dateStr => {
        markedDates[dateStr.in_time.split('T')[0]]= {
          marked: true,
           dotColor: '#FF69B4'// Blue dot for marked dates
        };
      });
      
      // Update calendar with marked dates
      setMarkedDates(markedDates);
      }
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
    });

    fetch('http://10.0.2.2:8000/reservations?month=' + selectedMonth + '&year=' + selectedYear)
    .then(response => response.json())
    .then(data => {
      setPtCount(data.total);
      
      if(data.total > 0) {
      // Create marked dates object for calendar
      const markedDates = {};
      data.reservation_list.forEach(dateStr => {
        markedDates[dateStr.in_time.split('T')[0]]= {
          marked: true,
           dotColor: 'red'// Blue dot for marked dates
        };
      });
      
      // Update calendar with marked dates
      setMarkedDates(markedDates);
      }
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
    });

  }, [selectedMonth, selectedYear]);

  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];

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
  };


const year = today.getFullYear();
const month = today.getMonth() + 1;

// 이번 달 마지막 날 구하기
const lastDayOfMonth = new Date(year, month, 0).getDate();
const maxDate = `${year}-${String(month).padStart(2, '0')}-${lastDayOfMonth}`;

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{selectedMonth}{t('common.month')} {t('attendance.count')}  <View style={styles.attendanceCircle} /></Text>         
          <Text style={styles.statsValue}>{attendanceCount}</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{selectedMonth}{t('common.month')} {t('attendance.PTcount')} <View style={[styles.attendanceCircle, { backgroundColor: 'blue' }]} /></Text>
          <Text style={styles.statsValue}>{ptCount}</Text>
        </View>
      </View>
      <Calendar 
              maxDate={maxDate}
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
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: 'white',
            arrowColor: '#007AFF',
            // 기본 요일 색상 (평일용)
            textSectionTitleColor: '#000',
            textDisabledColor: '#C7C7CD', // 흐리게 보여질 색상
          }}
          dayComponent={({ date, state }) => {
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
});

export default AttendanceScreen;