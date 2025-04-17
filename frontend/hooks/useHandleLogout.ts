import { deleteTokenFromSecureStore } from "@/scripts/jwt";
import { Router } from "expo-router";
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
    await deleteTokenFromSecureStore("daily_tasks");
  }
};

export default useHandleLogout;
