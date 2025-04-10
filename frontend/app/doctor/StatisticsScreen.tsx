import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import ModalWindow from "@/components/ModalWindow";
import { validateEmail } from "@/components/ValidateInputs";
import TaskScheduleItem from "@/components/TaskInfoScreen/TaskScheduleItem";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/scripts/api";
import * as SAF from 'expo-file-system';
import * as FileSystem from 'expo-file-system';

const StatisticsScreen: React.FC = () => {
  const params = useLocalSearchParams();

  const [dates, setDates] = useState({
    start: "2025-01-01",
    end: "2025-12-31",
  });

  const {
    firstname = "",
    surname = "",
    lastname = "",
    login = "",
    patientId = "",
  } = params;

  const [showCalendar, setShowCalendar] = useState<"start" | "end" | null>(
    null
  );
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {}
  );
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"confirmation" | "information">(
    "confirmation"
  );
  const [modalMessage, setModalMessage] = useState("");

  const handleDateSelect = (date: string, type: "start" | "end") => {
    setDates((prev) => ({ ...prev, [type]: date }));
    setShowCalendar(null);
  };

  const statisticsData = [
    {
      date: "05.01.2025",
      time_stat: {
        "10": {
          timestamp_start: 36000,
          success: true,
          in_time: true,
          tap_count: [12, 15],
        },
      },
    },
    {
      date: "08.01.2025",
      time_stat: {
        "14": {
          timestamp_start: 50400,
          success: false,
          in_time: false,
          tap_count: [8, 10],
        },
      },
    },
    {
      date: "01.04.2025",
      time_stat: {
        "9": {
          timestamp_start: 32400,
          success: true,
          in_time: false,
          tap_count: [10, 18],
        },
        "14": {
          timestamp_start: 50400,
          success: true,
          in_time: false,
          tap_count: [10, 18],
        },
        "19": {
          timestamp_start: 72000,
          success: false,
          in_time: true,
          tap_count: [10, 8],
        },
      },
    },
  ];

  const formatDateToISO = (date: string) => {
    const [day, month, year] = date.split(".");
    return `${year}-${month}-${day}`;
  };

  const filteredStatistics = statisticsData.filter(({ date }) => {
    const isoDate = formatDateToISO(date);
    return isoDate >= dates.start && isoDate <= dates.end;
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSendPress = () => {
    if (!validateEmail(email)) {
      setEmailError("Некорректно введен email");
      return;
    }

    setEmailError(null);
    setModalMessage(`Вы действительно хотите отправить на ${email}?`);
    setModalType("confirmation");
    setModalVisible(true);
  };

  const handleConfirmSend = () => {
    setModalMessage(`Отправлено на почту ${email}`);
    setModalType("information");
  };

  const handleGetStatistics = async () => { 
    console.log("Начало операции");

    try {
        const statistics = await api.getPatientStatistics(patientId, dates.start, dates.end);
        console.log(statistics);

        if (statistics) {
          try {
            const permissions = await SAF.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
            if (!permissions.granted) {
              alert("Разрешение не получено");
              return;
            }
        
            const fileUri = FileSystem.documentDirectory + 'statistics.pdf';

            const base64 = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
        
            const newFileUri = await SAF.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              'statistics.pdf',
              'application/pdf'
            );
        
            await FileSystem.writeAsStringAsync(newFileUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
        
            alert("PDF успешно сохранён в выбранную папку 📁");
          } catch (err) {
            console.error("Ошибка при сохранении PDF:", err);
            alert("Ошибка при сохранении файла");
          }
        }
        
        // 📦 Создаём PDF файл в documentDirectory (если ещё не создан)
        const fileUri = FileSystem.documentDirectory + 'statistics.pdf';
    } catch (error) {
        console.log("Ошибка при скачивании или сохранении файла:", error);
        setModalMessage("Ошибка при скачивании статистики");
        setModalType("information");
        setModalVisible(true);
    }
};



  const handleModalClose = () => {
    setModalVisible(false);
  };

  const formattedFirstName = `${surname} ${firstname[0]}. ${lastname[0]}.`;

  return (
    <View style={styles.container}>
      <Header title={formattedFirstName} createBackButton />
      <View style={styles.content}>
        <View style={styles.dateSelection}>
          <View style={styles.dateWrapper}>
            <Text style={styles.dateLabel}>Дата начала</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCalendar("start")}
            >
              <Text style={styles.dateValue}>{dates.start}</Text>
              <AntDesign name="calendar" size={20} color={Colors.headerText} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateWrapper}>
            <Text style={styles.dateLabel}>Дата окончания</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCalendar("end")}
            >
              <Text style={styles.dateValue}>{dates.end}</Text>
              <AntDesign name="calendar" size={20} color={Colors.headerText} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.statistics}>
          {filteredStatistics.length === 0 ? (
            <Text style={styles.noDataText}>
              Нет данных за выбранный период
            </Text>
          ) : (
            filteredStatistics.map(({ date, time_stat }) => (
              <TaskScheduleItem
                key={date}
                id={date}
                time={date}
                isExpanded={expandedDates[date]}
                onToggle={() =>
                  setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }))
                }
                date={date}
                time_stat={time_stat}
                formatTime={formatTime}
              />
            ))
          )}
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <View style={styles.emailContainer}>
          <Text style={styles.label}>Отправить на почту</Text>
          <TextInput
            style={styles.emailInput}
            placeholder="doctor@mail.com"
            placeholderTextColor={Colors.headerText}
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendPress}>
            <Feather name="send" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}

         <TouchableOpacity style={styles.downloadButton} onPress={handleGetStatistics}>
          <Text style={styles.downloadText}>Скачать статистику</Text>
          <AntDesign name="download" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ModalWindow
        visible={modalVisible}
        type={modalType}
        message={modalMessage}
        onConfirm={
          modalType == "confirmation" ? handleConfirmSend : handleModalClose
        }
        onCancel={handleModalClose}
        confirmText="OK"
        cancelText="Отмена"
      />

      {showCalendar && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setShowCalendar(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Calendar
                onDayPress={(day: { dateString: string }) =>
                  handleDateSelect(day.dateString, showCalendar)
                }
                markedDates={{
                  [dates[showCalendar]]: {
                    selected: true,
                    selectedColor: Colors.main,
                  },
                }}
                theme={{
                  calendarBackground: Colors.primary,
                  selectedDayBackgroundColor: Colors.main,
                  selectedDayTextColor: Colors.primary,
                  todayTextColor: Colors.main,
                  dayTextColor: Colors.headerText,
                  arrowColor: Colors.main,
                }}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCalendar(null)}
              >
                <Text style={styles.closeButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundScreen },
  content: { flex: 1 },
  dateSelection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dateWrapper: { alignItems: "center", justifyContent: "center", width: "45%" },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginTop: 5,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.headerText,
    textAlign: "center",
    fontFamily: "Montserrat-SemiBold",
  },
  dateValue: {
    fontSize: 16,
    color: Colors.headerText,
    fontFamily: "Montserrat-Regular",
  },
  statistics: { flex: 1 },
  dateContainer: { marginBottom: 16 },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  dateTitle: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: Colors.main,
  },
  timeItem: {
    padding: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  timeText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: Colors.headerText,
    marginRight: 10,
  },
  icon: { marginRight: 10 },
  seriesText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: Colors.headerText,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
  },
  closeButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: Colors.main,
    borderRadius: 8,
    alignItems: "center",
  },
  footer: {
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
    padding: 16,
    backgroundColor: Colors.primary,
    borderTopColor: Colors.secondary,
    flexDirection: "column",
    alignItems: "stretch",
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: Colors.primary,
    position: "relative",
  },
  label: {
    position: "absolute",
    top: -9,
    left: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 4,
    fontSize: 11,
    color: Colors.secondary,
  },
  emailInput: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginRight: 6,
    color: Colors.headerText,
  },
  sendButton: {
    padding: 8,
    backgroundColor: Colors.main,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: Colors.main,
    borderRadius: 8,
    marginTop: 16,
  },
  downloadText: {
    color: Colors.primary,
    fontSize: 16,
    marginRight: 8,
    fontWeight: "500",
  },
  closeButtonText: { color: Colors.primary, fontSize: 16 },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  noDataText: {
    fontSize: 16,
    color: Colors.headerText,
    fontFamily: "Montserrat-SemiBold",
  },
  errorText: { marginTop: 4, marginLeft: 5, color: "red" },
});

export default StatisticsScreen;
