import * as SecureStore from "expo-secure-store";
import api from "@/scripts/api";

const storeTokenInSecureStore = async (key, token) => {
  try {
    await SecureStore.setItemAsync(key, token);
    try {
      const response = await api.getUserRole();
      if (response) {
        await SecureStore.setItemAsync('role', `${response}`);
      }
    } catch (error) {
      console.error("Error getting user role:", error);
    }
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

const getRoleFromSecureStore = async () => {
  try {
    const role = await SecureStore.getItemAsync('role');
    if (role) return role;
  } catch (error) {
    console.log("Ошибка при получении роли из SecureStore:", error);
  }
};

export {
  storeTokenInSecureStore,
  getTokenFromSecureStore,
  deleteTokenFromSecureStore,
  getRoleFromSecureStore
};
