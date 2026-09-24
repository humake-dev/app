import Config from 'react-native-config';
import {Platform} from 'react-native';
import {TestIds} from 'react-native-google-mobile-ads';

const API_PROTOCOL = Config.API_PROTOCOL ?? 'https';
const API_HOST = Config.API_HOST ?? 'api.humake.co.kr';
const API_PORT = Config.API_PORT ?? '443';

export const ADMOB_TEST =
  Config.ADMOB_TEST === 'true';

export const ADMOB_BANNER_ID = ADMOB_TEST
  ? TestIds.BANNER
  : Platform.OS === 'ios'
    ? Config.ADMOB_IOS_BANNER_ID
    : Config.ADMOB_ANDROID_BANNER_ID;

export const BASE_URL =
  `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;