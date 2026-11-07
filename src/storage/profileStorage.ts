import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'userProfile';
const HAS_COMPLETED_START_KEY = 'hasCompletedStart';

export type UserProfile = {
  ageGroup:
    | '10s'
    | '20s'
    | '30s'
    | '40s'
    | '50s'
    | '60s'
    | 'unknown';

  gender:
    | 'male'
    | 'female'
    | 'unknown';

  height: number | null;
  weight: number | null;
};

export const saveUserProfile = async (
  profile: UserProfile,
) => {
  await AsyncStorage.setItem(
    PROFILE_KEY,
    JSON.stringify(profile),
  );

  await AsyncStorage.setItem(
    HAS_COMPLETED_START_KEY,
    'true',
  );
};

export const getUserProfile =
  async (): Promise<UserProfile | null> => {
    const value =
      await AsyncStorage.getItem(PROFILE_KEY);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  };

export const removeUserProfile =
  async () => {
    await AsyncStorage.removeItem(
      PROFILE_KEY,
    );

    await AsyncStorage.removeItem(
      HAS_COMPLETED_START_KEY,
    );
  };
  