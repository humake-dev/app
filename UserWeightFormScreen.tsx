import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './Config';

const UserWeightFormScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [value, setValue] = useState(0);

  const increase = () => setValue(prev => Number(prev) + 1);
  const decrease = () => setValue(prev => Math.max(0, Number(prev) - 1)); // 음수 방지



  const handleChange = (text: string) => {
    // 숫자와 소수점만 허용
    let formatted = text.replace(/[^0-9.]/g, '');

    // 소수점은 1개만 허용
    const parts = formatted.split('.');
    if (parts.length > 2) {
      setError('잘못된 숫자 형식');
      return;
    }

    // 소수점 이하 한자리만 허용
    if (parts[1]?.length > 1) {
      setError('소수점은 한 자리까지만 입력하세요');
      return;
    }

    // 유효한 숫자로 파싱
    const num = parseFloat(formatted);
    if (!isNaN(num)) {
      if (num < 30 || num > 150) {
        setError('30 이상 150 이하의 숫자를 입력하세요');
      } else {
        setError('');
      }
    } else {
      setError('');
    }

    setValue(formatted);
  };


  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      const response = await fetch(`${BASE_URL}/user_weights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          weight: value,
        }),
      });

      if (response.ok) {
        // Reset form after successful submission
        setValue('');
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
        <Text style={styles.label}>{t('user_weight.weight')}</Text>
        <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.button} onPress={decrease}>
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(value)}
        onChangeText={handleChange}
      />

      <TouchableOpacity style={styles.button} onPress={increase}>
        <Text style={styles.buttonText}>＋</Text>
      </TouchableOpacity>
    </View>

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
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: 80,
    fontSize: 18,
    textAlign: 'center',
    borderRadius: 5,
  },
  button: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default UserWeightFormScreen;