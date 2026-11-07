import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

type AppMode =
  | 'authenticated'
  | 'guest'
  | 'profile'
  | 'login';

interface UserContextType {
  // 사용자
  user: any | null;
  setUser: (user: any | null) => void;

  // Guest 상태
  useGuest: boolean;
  setUseGuest: (value: boolean) => void;

  // Start/Profile 완료 여부
  hasCompletedStart: boolean;
  setHasCompletedStart: (value: boolean) => void;

  // 로그인 여부
  isLoggedIn: boolean;

  // 현재 앱 모드
  appMode: AppMode;

  // AsyncStorage 초기화 완료 여부
  isLoading: boolean;
}

const UserContext =
  createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {

  const [user, setUser] = useState<any | null>(null);

  const [useGuest, setUseGuest] =
    useState(false);

  const [hasCompletedStart, setHasCompletedStart] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  /*
   * 로그인 여부
   *
   * 기존 앱에서 isLoggedIn을 별도로 관리하고 있었다면
   * 여기서는 user 존재 여부를 기준으로 판단.
   */
  const isLoggedIn = !!user;

  /*
   * 앱 모드
   *
   * authenticated
   * guest
   * profile
   * login
   */
  const getAppMode = (): AppMode => {

    if (isLoggedIn) {
      return 'authenticated';
    }

    if (useGuest && hasCompletedStart) {
      return 'guest';
    }

    if (useGuest && !hasCompletedStart) {
      return 'profile';
    }

    return 'login';
  };

  const appMode = getAppMode();

  /*
   * 앱 시작 시 저장된 상태 불러오기
   */
  useEffect(() => {

    const loadUserState = async () => {
      try {

        const guest =
          await AsyncStorage.getItem('useGuest');

        const completed =
          await AsyncStorage.getItem(
            'hasCompletedStart'
          );

        setUseGuest(guest === 'true');

        setHasCompletedStart(
          completed === 'true'
        );

      } catch (error) {

        console.log(
          'User 상태 확인 실패:',
          error
        );

        // 문제가 생기면 안전하게 로그인부터
        setUseGuest(false);
        setHasCompletedStart(false);

      } finally {

        setIsLoading(false);

      }
    };

    loadUserState();

  }, []);

  const setGuestMode = async (value: boolean) => {
  setUseGuestState(value);

  await AsyncStorage.setItem(
    'useGuest',
    value ? 'true' : 'false'
  );
};

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,

        useGuest,
        setUseGuest,

        hasCompletedStart,
        setHasCompletedStart,

        isLoggedIn,

        appMode,

        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {

  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      'useUser must be used within a UserProvider'
    );
  }

  return context;
};

export default UserContext;