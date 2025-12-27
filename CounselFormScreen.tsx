import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './Config';

const CounselFormScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('default');

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");       
      const response = await fetch(`${BASE_URL}/counsels`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_course: selectedCourse,
          content: content,
        }),
      });

      if (response.ok) {
        // Reset form after successful submission
        setContent('');
        setSelectedCourse('default');
        navigation.goBack();
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.label}>{t('counsel.selectCourse')}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCourse}
            onValueChange={(itemValue) => setSelectedCourse(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label={t('counsel.course1')} value="default" />
            <Picker.Item label={t('counsel.course2')} value="pt" />
          </Picker>
        </View>

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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',

  },
  picker: {
    height: 55,
    width: '100%',
    fontSize: 16,
    color: '#333',
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

export default CounselFormScreen;