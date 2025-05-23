import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { BASE_URL } from './Config';

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
  
    fetchAttendanceMarks();
    fetchPTMarks();
  }, [i18n.isInitialized])
  
  useEffect(() => {
     fetchAttendanceMarks();
     fetchPTMarks();
   }, [selectedMonth, selectedYear]);

   const fetchAttendanceMarks = async () => {
    try {
      const response = await fetch(`${BASE_URL}/entrances?month=${selectedMonth}&year=${selectedYear}`);
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
      const response = await fetch(`${BASE_URL}/reservations?month=${selectedMonth}&year=${selectedYear}`);
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



    
  const onDayPress = (day) => {
    const today = new Date();
    const selected = new Date(day.dateString);
    if (selected > today) return; // 미래 날짜 선택 방지
  
    setSelectedDate(day.dateString);
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
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: 'white',
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