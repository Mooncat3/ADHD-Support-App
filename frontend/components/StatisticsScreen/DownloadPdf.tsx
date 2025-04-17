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

export const handleGetStatistics = async (
  patientId: any,
  dates: { start: string; end: string },
  fullName: string
) => {
  try {
    const statistics = await api.getStatisticsPdf(
      patientId,
      dates.start,
      dates.end
    );

    if (statistics) {
      const permissions =
        await SAF.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        showError("Разрешение на доступ к файлам не получено");
        return;
      }
      const filename = `Отчёт ${fullName} за ${dates.start} - ${dates.end}.pdf`;

      const newFileUri = await SAF.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename.replace(" ", "_"),
        "application/pdf"
      );

      await FileSystem.writeAsStringAsync(newFileUri, statistics, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const decodedUri = decodeURIComponent(permissions.directoryUri);
      const directoryName = decodedUri.replace(/.*[:\/]/, "");

      showError(`PDF успешно сохранён в папку: ${directoryName}`);
    } else {
      showError("Не удалось получить статистику");
    }
  } catch (error: any) {
    if (error.message && error.message.includes("ENOSPC")) {
      showError("Недостаточно места на устройстве");
    } else if (error.status == "404") {
      showError("У данного пациента нет статистики");
    } else {
      console.log(error);
      showError("Ошибка при скачивании статистики");
    }
  }
};
