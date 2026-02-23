import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
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

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  useEffect(() => {
    autoLogin();
  }, []);
  
  const autoLogin = async () => {
    try {
      const result = await AsyncStorage.getItem("@Common:login_token");
      console.log(result);

      if (!result) return;

      const ls = result.split("||");

      const uid = ls[0] + "#" + ls[1];
      const phone = ls[2];

      setUsername(uid);
      setPassword(phone);
    }   catch (e) {
      console.log("autoLogin error", e);
    }
  };
  
  
const handleLogin = async () => {
  try {
  const usernameRegex = /^\d+#\d+$/;
  const passwordRegex = /^\d+$/;

  let valid = true;

  if (!usernameRegex.test(username)) {
    setUsernameError(t('login.id_not_valid'));
    valid = false;
  } else {
    setUsernameError('');
  }

  if (!passwordRegex.test(password)) {
    setPasswordError(t('login.password_not_valid'));
    valid = false;
  } else {
    setPasswordError('');
  }

  if (!valid) return;

    const body =`username=${encodeURIComponent(username)}` +`&password=${encodeURIComponent(password)}`;

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(t('login.not_exists'));
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
      throw new Error(t('login.not_exists'));
    }

    const userData = await resUserData.json();

    AsyncStorage.setItem('@Common:login_token', userData.branch_id.toString()+'||'+userData.id.toString()+'||'+userData.phone.toString());

    setUser(userData);
    if (userContext) {
      if (userContext.setIsLoggedIn) userContext.setIsLoggedIn(true);
      if (userContext.setUser) userContext.setUser(userData);
    }

  } catch (error) {
    Alert.alert("Error", t('login.fail'));
    console.error(error);
  }
};


  return (
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <Text style={styles.title}>{t('menu.login')}</Text>
      
<TextInput
  ref={usernameRef}
  style={[
    styles.input,
    usernameError ? styles.inputError : null
  ]}
  placeholder={t('login.username')}
  placeholderTextColor="gray"
  value={username}
  onChangeText={(text) => {
    const filtered = text.replace(/[^0-9#]/g, '');
    setUsername(filtered);
    setUsernameError('');
  }}
  autoCapitalize="none"
  returnKeyType="next"
  onSubmitEditing={() => passwordRef.current?.focus()}
/>

{usernameError ? (
  <Text style={styles.errorText}>{usernameError}</Text>
) : null}

<TextInput
  ref={passwordRef}
  style={[
    styles.input,
    passwordError ? styles.inputError : null
  ]}
  placeholder={t('login.password')}
  placeholderTextColor="gray"
  value={password}
  onChangeText={(text) => {
    const onlyNumbers = text.replace(/[^0-9]/g, '');
    setPassword(onlyNumbers);
    setPasswordError('');
  }}
  secureTextEntry
  keyboardType="number-pad"
  returnKeyType="done"
  onSubmitEditing={handleLogin}
/>

{passwordError ? (
  <Text style={styles.errorText}>{passwordError}</Text>
) : null}
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t('menu.login')}</Text>
      </TouchableOpacity>
    </View>
  </TouchableWithoutFeedback>
</KeyboardAvoidingView>
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
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: -10,
    marginBottom: 10,
    fontSize: 12,
  }
});

export default LoginScreen;