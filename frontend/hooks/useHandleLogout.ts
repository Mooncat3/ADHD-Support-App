import { deleteTokenFromSecureStore } from "@/scripts/jwt";

export const useHandleLogout = async (router: any) => {
  if (router.canDismiss()) router.dismissAll();
  router.replace("/authorize");

  await deleteTokenFromSecureStore("accessToken");
  await deleteTokenFromSecureStore("refreshToken");
};
