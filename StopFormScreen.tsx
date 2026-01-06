import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  I18nManager,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { authFetch } from './utils/api';

const StopFormScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [content, setContent] = useState('');
  const [selectedOption, setSelectedOption] = useState('option1');

  const handleStartDateConfirm = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
    setShowStartDatePicker(false);
  };

  const handleEndDateConfirm = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setEndDate(currentDate);
    setShowEndDatePicker(false);
  };

  const showDatePicker = (type) => {
    if (Platform.OS === 'android') {
      if (type === 'start') {
        setShowStartDatePicker(true);
      } else {
        setShowEndDatePicker(true);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await authFetch(`/stops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stop_start_date: startDate.toISOString().slice(0, 10),
          stop_end_date: endDate.toISOString().slice(0, 10),
          description: content,
        }),
      });

      if (response.ok) {
        setStartDate(new Date());
        setEndDate(new Date());
        setContent('');
        navigation.goBack();
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert(
        t('error.submitError'),
        t('error.pleaseTryAgain'),
        [{ text: t('common.ok') }]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>{t('stop.stopPeriod')}</Text>
        <View style={styles.dateContainer}>
          <TouchableOpacity 
            style={[styles.dateButton, styles.dateInput]}
            onPress={() => showDatePicker('start')}
          >
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString('ko-KR')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.dateSeparator}>~</Text>
          <TouchableOpacity 
            style={[styles.dateButton, styles.dateInput]}
            onPress={() => showDatePicker('end')}
          >
            <Text style={styles.dateText}>
              {endDate.toLocaleDateString('ko-KR')}
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' && (
          <>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                is24Hour={true}
                display="default"
                locale="ko-KR"
                onChange={handleStartDateConfirm}
              />
            )}
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                is24Hour={true}
                display="default"
                locale="ko-KR"
                onChange={handleEndDateConfirm}
              />
            )}
          </>
        )}

        {Platform.OS === 'android' && (
          <>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                is24Hour={true}
                display="default"
                locale="ko-KR"
                onChange={handleStartDateConfirm}
              />
            )}
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                is24Hour={true}
                display="default"
                locale="ko-KR"
                onChange={handleEndDateConfirm}
              />
            )}
          </>
        )}

        <Text style={styles.label}>{t('stop.content')}</Text>
        <TextInput
          style={styles.input}
          multiline={false}
          numberOfLines={1}
          value={content}
          onChangeText={setContent}
          placeholder={t('stop.contentPlaceholder')}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t('common.submit')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4 ',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  dateSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StopFormScreen;