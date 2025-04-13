import * as SecureStore from "expo-secure-store";

const storeTokenInSecureStore = async (key, token) => {
  try {
    await SecureStore.setItemAsync(key, token);
  } catch (error) {
    console.log("Ошибка сохранения токенов в SecureStore:", error);
  }
};

const getTokenFromSecureStore = async (key) => {
  try {
    const token = await SecureStore.getItemAsync(key);
    if (token) return token;
  } catch (error) {
    console.log("Ошибка при получении токена из SecureStore:", error);
  }
};

const deleteTokenFromSecureStore = async (key) => {
  try {
    const token = await SecureStore.getItemAsync(key);
    if (token) await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.log("Ошибка при удалении токена из SecureStore:", error);
  }
};

export {
  storeTokenInSecureStore,
  getTokenFromSecureStore,
  deleteTokenFromSecureStore,
};
