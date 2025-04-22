import { deleteTokenFromSecureStore } from "@/scripts/jwt";
import { Router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useHandleLogout = async (
  router: Router,
  deleteTokens: boolean = true
) => {
  if (router.canDismiss()) router.dismissAll();
  router.replace("/authorize");

  if (deleteTokens) {
    await deleteTokenFromSecureStore("accessToken");
    await deleteTokenFromSecureStore("refreshToken");

    await deleteTokenFromSecureStore("role");
    await deleteTokenFromSecureStore("user");

    try {
      await AsyncStorage.removeItem("daily_tasks");
    } catch (_) {}
  }
};

export default useHandleLogout;
