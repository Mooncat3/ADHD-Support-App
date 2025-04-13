import { deleteTokenFromSecureStore } from "@/scripts/jwt";

const useHandleLogout = async (router: any) => {
  if (router.canDismiss()) router.dismissAll();
  router.replace("/authorize");

  await deleteTokenFromSecureStore("accessToken");
  await deleteTokenFromSecureStore("refreshToken");

  await deleteTokenFromSecureStore("role");
  await deleteTokenFromSecureStore("user");
};

export default useHandleLogout;
