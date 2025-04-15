import { useEffect } from "react";
import api from "@/scripts/api";
import { Router, useRouter } from "expo-router";
import { setUnauthorizedHandler } from "@/scripts/api";
import useHandleLogout from "./useHandleLogout";
import useCache from "./useCache";

const getRole = async (router: Router) => {
  const role = await useCache("role", api.getUserRole);

  if (role) {
    const targetRoute =
      role.role === 0 ? "/doctor/DoctorMain" : "/patient/TaskInfoScreen";
    if (router.canDismiss()) router.dismissAll();
    router.replace(targetRoute);
  } else await useHandleLogout(router, false);
};

const useCheckInternetRole = (appIsReady: boolean) => {
  const router = useRouter();

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await useHandleLogout(router);
    });

    if (appIsReady) getRole(router);
  }, [appIsReady]);
};

export { useCheckInternetRole, getRole };
