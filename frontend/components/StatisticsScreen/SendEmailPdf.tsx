import api from "@/scripts/api";
import * as SAF from "expo-file-system";
import * as FileSystem from "expo-file-system";
import { ToastAndroid, Platform, Alert } from "react-native";

const showError = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Ошибка", message);
  }
};

export const handleSendStatistics = async (
  patientId: any,
  dates: { start: string; end: string },
  email: any,
  formattedFirstName: string
) => {
  try {
    await api.sendStatisticsPdf(
      patientId,
      dates.start,
      dates.end,
      email,
      formattedFirstName
    );

  } catch (error: any) {
    if (
      error.message &&
      error.message.includes("ExponentFileSystem.createSAFFileAsync")
    ) {
      showError("Папка переполнена, не удалось создать файл.");
    } else if (error.message && error.message.includes("ENOSPC")) {
      showError("Недостаточно места на устройстве");
    } else if (error.status === "404") {
      showError("У данного пациента нет статистики");
    } else {
      console.log(error);
      showError("Ошибка при скачивании статистики");
    }
  }
};
