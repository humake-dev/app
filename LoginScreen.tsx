
import React, {
  useState,
  useContext,
  useRef,
  useEffect,
} from 'react';

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
  Keyboard,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './Config';
import UserContext from './src/contexts/UserContext';

import * as Keychain from 'react-native-keychain';

// ============================================================
// 생체인증 설정
// ============================================================

const BIOMETRIC_SERVICE = 'bluescan.biometric';
const BIOMETRIC_ENABLED_KEY = '@Common:biometric_enabled';
const SKIP_AUTO_BIOMETRIC_KEY = '@Common:skip_auto_biometric';
// ============================================================
// LoginScreen
// ============================================================

const LoginScreen = () => {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [loading, setLoading] = useState(false);

  const userContext = useContext(UserContext);

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const biometricAttempted = useRef(false);

  // ============================================================
  // 비회원으로 사용하기
  // ============================================================

  const handleGuestStart = () => {
    userContext?.setUseGuest(true);
  };

  // ============================================================
  // 생체인증 지원 여부 확인
  // ============================================================

  const checkBiometric = async () => {
    try {
      const type = await Keychain.getSupportedBiometryType();

      setBiometricType(type || '');

      return !!type;

    } catch (error) {
      console.log('Biometric check error:', error);
      return false;
    }
  };

  // ============================================================
  // 생체인증 정보 저장
  // ============================================================

  const saveBiometricToken = async (refreshToken: string) => {
    try {
      const supported = await checkBiometric();

      if (!supported) {
        Alert.alert(
          '생체인증 불가',
          '이 기기에서는 생체인증을 사용할 수 없습니다.'
        );
        return;
      }

      const result = await Keychain.setGenericPassword(
        'refresh-token',
        refreshToken,
        {
          service: BIOMETRIC_SERVICE,

          accessControl:
            Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,

          accessible:
            Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );

      if (!result) {
        throw new Error('Keychain 저장 실패');
      }

      await AsyncStorage.setItem(
        BIOMETRIC_ENABLED_KEY,
        'true'
      );

      setBiometricEnabled(true);

      Alert.alert(
        '생체인증 설정 완료',
        '다음 로그인부터 생체인증을 사용할 수 있습니다.'
      );

    } catch (error) {
      console.log('Save biometric error:', error);

      Alert.alert(
        '생체인증 설정 실패',
        '생체인증 설정에 실패했습니다. 다시 시도해 주세요.'
      );
    }
  };

  // ============================================================
  // 생체인증 로그인
  // ============================================================

  const loginWithBiometric = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const credentials = await Keychain.getGenericPassword({
        service: BIOMETRIC_SERVICE,

        authenticationPrompt: {
          title: '생체인증 로그인',
          subtitle: '본인 확인이 필요합니다.',
          cancel: '취소',
        },
      });

      if (!credentials) {
        return;
      }

      const refreshToken = credentials.password;

      // ========================================================
      // Refresh Token으로 Access Token 재발급
      // ========================================================

      // 아래 API 경로와 요청 형식은
      // 실제 Spring Boot 서버 규격에 맞게 수정해야 합니다.

      const response = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Refresh Token 만료 또는 인증 실패');
      }

      const tokenData = await response.json();

      await AsyncStorage.setItem(
        'accessToken',
        tokenData.access_token
      );

      // 서버에서 Refresh Token을 회전 발급한다면
      // 기존 Keychain 토큰도 새 토큰으로 교체
      if (tokenData.refresh_token) {
        await Keychain.setGenericPassword(
          'refresh-token',
          tokenData.refresh_token,
          {
            service: BIOMETRIC_SERVICE,

            accessControl:
              Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,

            accessible:
              Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          }
        );
      }

      // ========================================================
      // 사용자 정보 조회
      // ========================================================

      const userResponse = await fetch(`${BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('사용자 정보 조회 실패');
      }

      const userData = await userResponse.json();

      // 기존 로그인 정보 유지
      await AsyncStorage.setItem(
        '@Common:login_token',
        userData.branch_id.toString() +
          '||' +
          userData.id.toString() +
          '||' +
          userData.phone.toString()
      );

      if (userContext) {
        userContext.setUser(userData);
      }

    } catch (error) {
      console.log('Biometric login error:', error);

      // 토큰 만료 등으로 인증할 수 없는 경우
      // 기존 생체인증 설정을 초기화하고 일반 로그인 유도
      const message =
        error instanceof Error ? error.message : '';

      if (
        message.includes('Refresh Token') ||
        message.includes('사용자 정보 조회')
      ) {
        await disableBiometric(false);

        Alert.alert(
          '로그인 필요',
          '인증정보가 만료되었습니다. 아이디와 비밀번호로 로그인해 주세요.'
        );
      }

      // 사용자가 생체인증을 취소한 경우
      // 일반 로그인 화면을 그대로 유지

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 생체인증 자동 로그인 초기화
  // ============================================================

  const initializeLogin = async () => {
    try {
      // 기존 아이디 / 비밀번호 입력 정보 불러오기
      const result = await AsyncStorage.getItem(
        '@Common:login_token'
      );

      if (result) {
        const ls = result.split('||');

        const uid = ls[0] + '#' + ls[1];
        const phone = ls[2];

        setUsername(uid);
        setPassword(phone);
      }

      // 생체인증 활성화 여부 확인
const enabled = await AsyncStorage.getItem(
  BIOMETRIC_ENABLED_KEY
);

const skipAutoBiometric = await AsyncStorage.getItem(
  SKIP_AUTO_BIOMETRIC_KEY
);

if (enabled === 'true') {
  setBiometricEnabled(true);

  const supported = await checkBiometric();

  if (
    supported &&
    !biometricAttempted.current &&
    skipAutoBiometric !== 'true'
  ) {
    biometricAttempted.current = true;

    await loginWithBiometric();
  }
}

// 화면 진입 시 skip 플래그는 소비하고 삭제
await AsyncStorage.removeItem(SKIP_AUTO_BIOMETRIC_KEY);

    } catch (error) {
      console.log('Initialize login error:', error);
    }
  };

  useEffect(() => {
    initializeLogin();
  }, []);

  // ============================================================
  // 생체인증 사용 해제
  // ============================================================

  const disableBiometric = async (showAlert = true) => {
    try {
      await Keychain.resetGenericPassword({
        service: BIOMETRIC_SERVICE,
      });

      await AsyncStorage.removeItem(
        BIOMETRIC_ENABLED_KEY
      );

      setBiometricEnabled(false);

      if (showAlert) {
        Alert.alert(
          '완료',
          '생체인증 로그인이 해제되었습니다.'
        );
      }

    } catch (error) {
      console.log('Disable biometric error:', error);
    }
  };

  // ============================================================
  // 생체인증 사용 안내
  // ============================================================

  const offerBiometricSetup = (refreshToken: string) => {
    Alert.alert(
      '생체인증 로그인 설정',
      '다음 로그인부터 Face ID 또는 지문인증을 사용하시겠습니까?',
      [
        {
          text: '나중에',
          style: 'cancel',
        },
        {
          text: '사용하기',
          onPress: () => {
            saveBiometricToken(refreshToken);
          },
        },
      ]
    );
  };

  // ============================================================
  // 일반 로그인
  // ============================================================

  const handleLogin = async () => {
    if (loading) return;

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

      setLoading(true);

      // ========================================================
      // 로그인 API
      // ========================================================

      const body =
        `username=${encodeURIComponent(username)}` +
        `&password=${encodeURIComponent(password)}`;

      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (!res.ok) {
        throw new Error(t('login.not_exists'));
      }

      const data = await res.json();

      // Access Token 저장
      await AsyncStorage.setItem(
        'accessToken',
        data.access_token
      );

      await AsyncStorage.removeItem(
        SKIP_AUTO_BIOMETRIC_KEY
      );

      // Refresh Token은 생체인증 활성화 시에만 Keychain에 저장
      // 일반 로그인 상태에서는 AsyncStorage에 저장하지 않음

      // ========================================================
      // 사용자 정보 조회
      // ========================================================

      const resUserData = await fetch(`${BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (!resUserData.ok) {
        throw new Error(t('login.not_exists'));
      }

      const userData = await resUserData.json();

      // ========================================================
      // 기존 로그인 정보 저장
      // ========================================================

      await AsyncStorage.setItem(
        '@Common:login_token',
        userData.branch_id.toString() +
          '||' +
          userData.id.toString() +
          '||' +
          userData.phone.toString()
      );

      // ========================================================
      // Context 사용자 정보 설정
      // ========================================================

      if (userContext) {
        userContext.setUser(userData);
      }

      // ========================================================
      // 생체인증 활성화 여부 확인
      // ========================================================

      const enabled = await AsyncStorage.getItem(
        BIOMETRIC_ENABLED_KEY
      );

      if (enabled !== 'true' && data.refresh_token) {
        const supported = await checkBiometric();

        if (supported) {
          offerBiometricSetup(data.refresh_token);
        }
      } else if (enabled === 'true' && data.refresh_token) {
        // 이미 활성화된 경우 새 Refresh Token으로 갱신
        await Keychain.setGenericPassword(
          'refresh-token',
          data.refresh_token,
          {
            service: BIOMETRIC_SERVICE,

            accessControl:
              Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,

            accessible:
              Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          }
        );
      }

    } catch (error) {
      Alert.alert('Error', t('login.fail'));
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 화면
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>

          <Text style={styles.title}>
            {t('menu.login')}
          </Text>

          {/* 아이디 */}
          <TextInput
            ref={usernameRef}
            style={[
              styles.input,
              usernameError ? styles.inputError : null,
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
            onSubmitEditing={() =>
              passwordRef.current?.focus()
            }
          />

          {usernameError ? (
            <Text style={styles.errorText}>
              {usernameError}
            </Text>
          ) : null}

          {/* 비밀번호 */}
          <TextInput
            ref={passwordRef}
            style={[
              styles.input,
              passwordError ? styles.inputError : null,
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
            <Text style={styles.errorText}>
              {passwordError}
            </Text>
          ) : null}

          {/* 일반 로그인 */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '로그인 중...' : t('menu.login')}
            </Text>
          </TouchableOpacity>

          {/* 생체인증 로그인 */}
          {biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={loginWithBiometric}
              disabled={loading}
            >
              <Text style={styles.biometricText}>
                {biometricType === 'FaceID'
                  ? 'Face ID로 로그인'
                  : '생체인증으로 로그인'}
              </Text>
            </TouchableOpacity>
          )}

          {/* 생체인증 해제 */}
          {biometricEnabled && (
            <TouchableOpacity
              style={styles.disableButton}
              onPress={() => disableBiometric(true)}
            >
              <Text style={styles.disableText}>
                생체인증 해제
              </Text>
            </TouchableOpacity>
          )}

          {/* 비회원으로 사용해보기 */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestStart}
            activeOpacity={0.6}
          >
            <Text style={styles.guestText}>
              비회원으로 사용해보기
            </Text>
          </TouchableOpacity>

        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// ============================================================
// Styles
// ============================================================

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

  biometricButton: {
    marginTop: 15,
    padding: 15,
    alignItems: 'center',
  },

  biometricText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },

  disableButton: {
    marginTop: 5,
    padding: 10,
    alignItems: 'center',
  },

  disableText: {
    color: '#999',
    fontSize: 12,
  },

  inputError: {
    borderColor: 'red',
  },

  errorText: {
    color: 'red',
    marginTop: -10,
    marginBottom: 10,
    fontSize: 12,
  },

  guestButton: {
    marginTop: 15,
    padding: 15,
    alignItems: 'center',
  },

  guestText: {
    color: '#666',
    fontSize: 14,
  },
});

export default LoginScreen;
