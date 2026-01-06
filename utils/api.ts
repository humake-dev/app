import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../Config';


export const authFetch = async (url: string, options: any = {}) => {
  let accessToken = await AsyncStorage.getItem("accessToken");

  let res = await fetch(BASE_URL+url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status !== 401) return res;

  // 🔁 여기서 refresh
  accessToken = await refreshAccessToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
};


export const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  console.log(refreshToken);

  const res = await fetch(`${BASE_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    // refresh 자체가 만료 → 로그아웃
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
    throw new Error("Refresh token expired");
  }

  const { access_token } = await res.json();
  await AsyncStorage.setItem("accessToken", access_token);

  return access_token;
};