import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from "expo-secure-store";

const useCache = async (
  key: string,
  apiFunc: any,
  CACHE_EXPIRE: number = 30 * 60 * 1000
) => {
  try {
    const state = await NetInfo.fetch();
    const cached = await SecureStore.getItemAsync(key);

    let parsed;
    if (cached) parsed = JSON.parse(cached);

    if (
      state.isConnected &&
      state.isInternetReachable &&
      (!parsed || new Date().getTime() - parsed.timestamp > CACHE_EXPIRE)
    ) {
      try {
        const data = await apiFunc();

        await SecureStore.setItemAsync(
          key,
          JSON.stringify({
            data,
            timestamp: new Date().getTime(),
          })
        );

        return data;
      } catch (err) {
        return parsed?.data || null;
      }
    }

    return parsed?.data || null;
  } catch (error) {
    console.log("Error fetching data:", error);
    return null;
  }
};

export default useCache;
