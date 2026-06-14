import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "illustia.refreshToken";

export async function saveRefreshToken(refreshToken: string) {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function deleteRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
