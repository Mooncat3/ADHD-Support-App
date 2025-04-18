import * as SecureStore from "expo-secure-store";

const storeTokenInSecureStore = async (key, token) => {
  try {
    await SecureStore.setItemAsync(key, token);
  } catch (error) {}
};

const getTokenFromSecureStore = async (key) => {
  try {
    const token = await SecureStore.getItemAsync(key);
    if (token) return token;
  } catch (error) {
    return null;
  }
  return null;
};

const deleteTokenFromSecureStore = async (key) => {
  try {
    const token = await getTokenFromSecureStore(key);
    if (token) await SecureStore.deleteItemAsync(key);
  } catch (error) {}
};

export {
  storeTokenInSecureStore,
  getTokenFromSecureStore,
  deleteTokenFromSecureStore,
};
