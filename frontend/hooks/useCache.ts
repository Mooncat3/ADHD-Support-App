import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from "expo-secure-store";

const useCache = async (
  key: string,
  apiFunc: () => {},
  CACHE_EXPIRE: number = 1 * 30 * 1000
) => {
  try {
    const state = await NetInfo.fetch();
    const cached = await SecureStore.getItemAsync(key);

    let parsed;
    if (cached) parsed = JSON.parse(cached);

    if (
      state.isConnected &&
      state.isInternetReachable &&
      (!parsed || Date.now() - parsed.timestamp > CACHE_EXPIRE)
    ) {
      const data = await apiFunc();

      console.log("кеширование ", key);

      await SecureStore.setItemAsync(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );

      return data;
    }

    if (parsed) return parsed;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export default useCache;
