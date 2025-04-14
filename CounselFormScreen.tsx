import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Picker,
} from 'react-native';
import { useTranslation } from 'react-i18next';


const CounselFormScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date());
  const [content, setContent] = useState('');
  const [selectedOption, setSelectedOption] = useState('option1');

  const handleDateConfirm = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const handleSubmit = () => {
    // Here you would typically make an API call to submit the form
    console.log('Submitting form:', {
      date: date.toISOString(),
      content,
      option: selectedOption,
    });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>{t('counsel.selectDate')}</Text>

        <Text style={styles.label}>{t('counsel.content')}</Text>
        <TextInput
          style={styles.input}
          multiline={true}
          numberOfLines={4}
          value={content}
          onChangeText={setContent}
          placeholder={t('counsel.contentPlaceholder')}
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
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f0f0f0',
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

export default CounselFormScreen;