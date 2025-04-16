import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const AttendanceScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [ptCount, setPtCount] = useState(0);

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
    const fetchCounts = async () => {
      try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Replace with actual API calls
        // Example: await fetchAttendanceCounts(firstDayOfMonth, lastDayOfMonth)
        setAttendanceCount(12); // Replace with actual count
        setPtCount(5); // Replace with actual count
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

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

console.log(maxDate)
  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{t('attendance.currentMonthAttendance')}</Text>
          <Text style={styles.statsValue}>{attendanceCount}</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>{t('attendance.currentMonthPT')}</Text>
          <Text style={styles.statsValue}>{ptCount}</Text>
        </View>
      </View>
      <Calendar 
              maxDate={maxDate}
        onDayPress={onDayPress}
        markedDates={{
            ...disabledFutureDates,
          [selectedDate]: { selected: true, marked: true }
        }}
        onVisibleMonthsChange={(months) => {
    const currentMonth = months[0]; 
    console.log('현재 달:', currentMonth.month, currentMonth.year);
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
          
            // 색상 지정
            let textColor = '#000'; // 평일
            if (dayOfWeek === 0) textColor = '#FF3B30'; // 일
            else if (dayOfWeek === 6) textColor = '#007AFF'; // 토
          
            // 비활성 처리
            if (!isTodayOrPast) {
              textColor = '#C7C7CD'; // 흐리게
            }
          
            // 선택된 날짜
            const isSelected = date.dateString === selectedDate;
          
            return (
              <View
                style={{
                  backgroundColor: isSelected ? '#007AFF' : 'transparent',
                  borderRadius: 20,
                  padding: 8,
                }}>
                <Text style={{
                  color: isSelected ? '#fff' : textColor,
                  fontWeight: isSelected ? 'bold' : 'normal'
                }}>
                  {date.day}
                </Text>
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
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsItem: {
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default AttendanceScreen;