import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { getRoleFromSecureStore } from "@/scripts/jwt";
import api from "@/scripts/api";
import { useRouter } from "expo-router";
import { setUnauthorizedHandler } from "@/scripts/api";
import { useHandleLogout } from "./useHandleLogout";

const useCheckInternetRole = () => {
  const router = useRouter();

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await useHandleLogout(router);
    });

    const checkNetworkStatus = async () => {
      const state = await NetInfo.fetch();

      if (state.isConnected && state.isInternetReachable) {
        const response = await api.getUserRole();
        if (response) {
          const targetRoute =
            response.role === 0
              ? "/doctor/DoctorMain"
              : "/patient/TaskInfoScreen";
          router.push(targetRoute);
        }
      } else router.push("/patient/TaskInfoScreen");
    };

    checkNetworkStatus();
  }, [router]);
};

export default useCheckInternetRole;
