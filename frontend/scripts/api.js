import axios from "axios";
import {
  storeTokenInSecureStore,
  getTokenFromSecureStore,
} from "@/scripts/jwt";
import * as Crypto from "expo-crypto";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

async function refreshToken() {
  const refreshToken = await getTokenFromSecureStore("refreshToken");
  if (refreshToken) {
    const response = await api.post("/auth/refresh", { refreshToken });
    if (response.status === 200) {
      await storeTokenInSecureStore("accessToken", response.data.accessToken);
      await storeTokenInSecureStore("refreshToken", response.data.refreshToken);
      return response.data.accessToken;
    }
  }
}

api.interceptors.request.use(async (config) => {
  const token = await getTokenFromSecureStore("accessToken");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.response?.config?.url;
    if (error.response?.status === 401 && url !== "/auth/refresh") {
      const newAccessToken = await refreshToken();
      if (newAccessToken) {
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api.request(error.config);
      }
    } else {
      if (axios.isAxiosError(error)) throw new Error(error.response?.status);
      throw new Error("Неизвестная ошибка");
    }
    return Promise.reject(error);
  }
);

export default {
  auth: async (authData) => {
    const response = await api.post("/auth/login", authData);
    await storeTokenInSecureStore("accessToken", response.data.accessToken);
    await storeTokenInSecureStore("refreshToken", response.data.refreshToken);
    return response.data;
  },

  getUserRole: async () => {
    const response = await api.get("/auth/role");
    return response.data;
  },

  doctorData: async () => {
    const response = await api.get("/doctor/get");
    return response.data;
  },

  getPatients: async () => {
    const response = await api.get("/doctor/patients");
    return response.data;
  },

  registerPatient: async (registrationData) => {
    const passwordHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      registrationData.password
    );
    const response = await api.post("/doctor/register", {
      ...registrationData,
      password: passwordHash,
    });
    return response.data;
  },

  patientData: async () => {
    const response = await api.get("/patient/get");
    return response.data;
  },

  getPatientActivity: async (patientId) => {
    const response = await api.get(`/doctor/activity/${patientId}`);
    return response.data;
  },

  putPatientActivity: async (patientId, activity) => {
    const response = await api.put(`/doctor/activity/${patientId}`, {
      activity,
    });
    return response.data;
  },
};
