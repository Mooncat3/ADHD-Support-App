import api from "@/scripts/api";
import * as SAF from 'expo-file-system';
import * as FileSystem from 'expo-file-system';

export const handleGetStatistics = async (patientId: any, dates: { start: string, end: string }, setModalMessage: (message: string) => void, setModalVisible: (visible: boolean) => void) => { 
    console.log("Начало операции");

    try {
        const statistics = await api.getPatientStatistics(patientId, dates.start, dates.end);
        console.log(statistics);

        if (statistics) {
            const permissions = await SAF.StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (!permissions.granted) {
                alert("Разрешение не получено");
                return;
            }

            const fileUri = FileSystem.documentDirectory + 'statistics.pdf';
            console.log(fileUri);

            await FileSystem.writeAsStringAsync(fileUri, statistics, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const newFileUri = await SAF.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                'statistics.pdf',
                'application/pdf'
            );

            await FileSystem.writeAsStringAsync(newFileUri, statistics, {
                encoding: FileSystem.EncodingType.Base64,
            });

            alert("PDF успешно сохранён в выбранную папку 📁");
        } else {
            alert("Не удалось получить статистику, проверьте данные.");
        }
    } catch (error) {
        console.log("Ошибка при скачивании или сохранении файла:", error);
        setModalMessage("Ошибка при скачивании статистики");
        setModalVisible(true);
    }
};