import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const AttendanceScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    LocaleConfig.locales['ko'] = {
      monthNames: t('calendar.monthNames', { returnObjects: true }),
      monthNamesShort: t('calendar.monthNamesShort', { returnObjects: true }),
      dayNames: t('calendar.dayNames', { returnObjects: true }),
      dayNamesShort: t('calendar.dayNamesShort', { returnObjects: true }),
      today: t('calendar.today')
    };

    LocaleConfig.defaultLocale = 'ko';
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
    if (selected > today) return; // 🚫 미래 날짜 선택 방지
  
    setSelectedDate(day.dateString);
  };
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
            monthTextColor: '#000', // 여기!
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: 'white',
            arrowColor: '#007AFF',
            // 기본 요일 색상 (평일용)
            textSectionTitleColor: '#000',
            textDisabledColor: '#C7C7CD', // 🔸 흐리게 보여질 색상
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
  },

});

export default AttendanceScreen;