import { deleteTokenFromSecureStore } from "@/scripts/jwt";

export const useHandleLogout = async (router: any) => {
  console.log("111");
  await deleteTokenFromSecureStore("accessToken");
  await deleteTokenFromSecureStore("refreshToken");
  router.push("/authorize");
};
