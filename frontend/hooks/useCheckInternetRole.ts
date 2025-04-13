import { useEffect } from "react";
import api from "@/scripts/api";
import { useRouter } from "expo-router";
import { setUnauthorizedHandler } from "@/scripts/api";
import { useHandleLogout } from "./useHandleLogout";
import useCache from "./useCache";

const useCheckInternetRole = () => {
  const router = useRouter();

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await useHandleLogout(router);
    });

    const getRole = async () => {
      const role = await useCache("role", api.getUserRole);

      if (role) {
        const targetRoute =
          role.role === 0 ? "/doctor/DoctorMain" : "/patient/TaskInfoScreen";
        router.push(targetRoute);
      }
    };

    getRole();
  }, [router]);
};

export default useCheckInternetRole;
