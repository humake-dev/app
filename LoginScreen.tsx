import React, { useState, useContext, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from './Config';
import UserContext from './UserContext';

const LoginScreen = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const userContext = useContext(UserContext);

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  
  
const handleLogin = async () => {
  try {
const body =
  `username=${encodeURIComponent(username)}` +
  `&password=${encodeURIComponent(password)}`;

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(text);
      throw new Error("로그인 실패");
    }

    const data = await res.json();

    await AsyncStorage.setItem("accessToken", data.access_token);
    await AsyncStorage.setItem("refreshToken", data.refresh_token);

    const resUserData = await fetch(`${BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    if (!resUserData.ok) {
      throw new Error("유저 정보 조회 실패");
    }

    const userData = await resUserData.json();
    setUser(userData);
    if (userContext) {
      if (userContext.setIsLoggedIn) userContext.setIsLoggedIn(true);
      if (userContext.setUser) userContext.setUser(userData);
    }

  } catch (error) {
    Alert.alert("Error", "로그인 실패");
    console.error(error);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('menu.login')}</Text>
      
<TextInput
  ref={usernameRef}
  style={styles.input}
  placeholder={t('login.username')}
  value={username}
  onChangeText={setUsername}
  autoCapitalize="none"
  returnKeyType="next"
  onSubmitEditing={() => passwordRef.current?.focus()} // Enter 누르면 다음 필드로
/>

<TextInput
  ref={passwordRef}
  style={styles.input}
  placeholder={t('login.password')}
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  returnKeyType="done"
  onSubmitEditing={handleLogin} // Enter 누르면 로그인
/>
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t('menu.login')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;