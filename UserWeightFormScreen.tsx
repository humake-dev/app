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
import { useUser } from './UserContext';
import { authFetch, fetchUser } from './src/utils/api';

const UserWeightFormScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  
  const defaultWeight =
    user?.user_weight?.weight != null
      ? user.user_weight.weight
      : 60;

  const [error, setError] = useState('');
  const [value, setValue] = useState(() => String(defaultWeight));

const increase = () =>
  setValue(prev => {
    const num = parseFloat(prev || '0');
    return String(num + 1);
  });

const decrease = () =>
  setValue(prev => {
    const num = parseFloat(prev || '0');
    return String(Math.max(0, num - 1));
  });



const handleChange = (text: string) => {
  let formatted = text.replace(/[^0-9.]/g, '');

  const parts = formatted.split('.');
  if (parts.length > 2) {
    setError('잘못된 숫자 형식');
    setValue(formatted);
    return;
  }

  if (parts[1]?.length > 1) {
    setError('소수점은 한 자리까지만 입력하세요');
    setValue(formatted);
    return;
  }

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
  const weight = parseFloat(value);

  if (isNaN(weight)) {
    setError('몸무게를 입력하세요');
    return;
  }

  if (weight < 30 || weight > 150) {
    setError('30 이상 150 이하의 숫자를 입력하세요');
    return;
  }

   console.log('SUBMIT CLICKED'); 
  try {
    const response = await authFetch(`/user_weights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weight }),
    });

    if (response.ok) {
      const userData = await fetchUser();
      setUser(userData);
      navigation.goBack();
    } else {
      throw new Error('Failed to submit form');
    }
  } catch (e) {
    console.error(e);
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
    style={[
      styles.input,
      error ? styles.inputError : null,
    ]}
    keyboardType="numeric"
    value={value}
    onChangeText={handleChange}
  />

  <TouchableOpacity style={styles.button} onPress={increase}>
    <Text style={styles.buttonText}>＋</Text>
  </TouchableOpacity>
</View>

{error ? <Text style={styles.errorText}>{error}</Text> : null}

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