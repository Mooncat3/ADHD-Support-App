import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ToastAndroid,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import ModalWindow from "@/components/ModalWindow";
import { validateEmail } from "@/components/ValidateInputs";
import { filterEmailText } from "@/components/ValidateInputs";
import TaskScheduleItem from "@/components/TaskInfoScreen/TaskScheduleItem";
import { useLocalSearchParams, useRouter } from "expo-router";
import { handleGetStatistics } from "@/components/StatisticsScreen/DownloadPdf";
import { handleSendStatistics } from "@/components/StatisticsScreen/SendEmailPdf";
import "@/components/StatisticsScreen/SetLocaleDate";
import api from "@/scripts/api";

interface TimeStatistics {
  timestamp_start: number;
  success: boolean;
  in_time: boolean;
  tap_count: number[];
}

interface DateStatistics {
  date: string;
  data: Record<string, TimeStatistics>;
}

type StatisticData = DateStatistics[];

const StatisticsScreen: React.FC = () => {
  const params = useLocalSearchParams<{
    firstname: string;
    surname: string;
    lastname: string;
    login: string;
    patientId: string;
  }>();

  function formatDate(date: string): string {
    return date.slice(0, 10).split("-").reverse().join(".");
  }

  const dateNow = new Date();
  const startDate = new Date(dateNow);
  startDate.setFullYear(dateNow.getFullYear() - 1);

  const [dates, setDates] = useState({
    start: startDate.toISOString(),
    end: dateNow.toISOString(),
  });

  const {
    firstname = "",
    surname = "",
    lastname = "",
    patientId = "",
  } = params;

  const [showCalendar, setShowCalendar] = useState<"start" | "end" | null>(
    null
  );
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {}
  );
  const [_email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"confirmation" | "information">(
    "confirmation"
  );
  const [modalMessage, setModalMessage] = useState("");
  const [statisticsData, setStatisticsData] = useState<StatisticData>([]);

  useEffect(() => {
    api
      .doctorData()
      .then((user) => {
        setEmail(user.email);
        console.log(patientId, dates.start, dates.end);
        return api.getStatistics(patientId, dates.start, dates.end);
      })
      .then((statisticsResponse) => {
        setStatisticsData(statisticsResponse);
        console.log(statisticsData);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [dates]);

  const handleDateSelect = (selectedDate: string, type: "start" | "end") => {
    const selectedDateObj = new Date(selectedDate);
    const startDateObj = new Date(dates.start);
    const endDateObj = new Date(dates.end);

    if (type === "start") {
      if (selectedDateObj > endDateObj) {
        ToastAndroid.show(
          "Дата начала не может быть позже даты окончания",
          ToastAndroid.SHORT
        );
        return;
      }
    } else if (type === "end") {
      if (selectedDateObj < startDateObj) {
        ToastAndroid.show(
          "Дата окончания не может быть раньше даты начала",
          ToastAndroid.SHORT
        );
        return;
      }
    }

    setDates((prevDates) => ({
      ...prevDates,
      [type]: selectedDate,
    }));
  };

  const handleChange = (email: string) => {
    if (filterEmailText(email)) {
      setEmail(email);
    }
  };

  const formatTime = (timestamp: number) => {
    const hours = Math.floor(timestamp / 3600).toString();
    const minutes = Math.floor((timestamp % 3600) / 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleSendPress = () => {
    if (!validateEmail(_email)) {
      setEmailError("Некорректно введен email");
      return;
    }

    setEmailError(null);
    setModalMessage(`Вы действительно хотите отправить на ${_email}?`);
    setModalType("confirmation");
    setModalVisible(true);
  };

  const handleConfirmSend = () => {
    setModalMessage(`Отправлено на почту ${_email}`);
    setModalType("information");
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const formattedFirstName = `${surname} ${firstname[0]}. ${lastname[0]}.`;

  const getMarkedDates = () => {
    const markedDates: Record<
      string,
      { selected: boolean; selectedColor: string }
    > = {};
    if (showCalendar === "start") {
      markedDates[dates.start] = {
        selected: true,
        selectedColor: Colors.main,
      };
    } else if (showCalendar === "end") {
      markedDates[dates.end] = {
        selected: true,
        selectedColor: Colors.main,
      };
    }
    return markedDates;
  };

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
              <Text style={styles.dateValue}>{formatDate(dates.start)}</Text>
              <AntDesign name="calendar" size={20} color={Colors.headerText} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateWrapper}>
            <Text style={styles.dateLabel}>Дата окончания</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowCalendar("end")}
            >
              <Text style={styles.dateValue}>{formatDate(dates.end)}</Text>
              <AntDesign name="calendar" size={20} color={Colors.headerText} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.statistics}>
          {statisticsData.length === 0 ? (
            <Text style={styles.noDataText}>
              Нет данных за выбранный период
            </Text>
          ) : (
            statisticsData.map(({ date, data }) => {
              console.log("time_stat:", date);
              const timeStat = data ? data.time_stat : {};
              date = formatDate(date);
              return (
                <TaskScheduleItem
                  key={date}
                  id={date}
                  time={date}
                  isExpanded={expandedDates[date]}
                  onToggle={() =>
                    setExpandedDates((prev) => ({
                      ...prev,
                      [date]: !prev[date],
                    }))
                  }
                  date={date}
                  time_stat={timeStat}
                  formatTime={formatTime}
                />
              );
            })
          )}
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <View style={styles.emailContainer}>
          <Text style={styles.label}>Отправить на почту</Text>
          <TextInput
            style={styles.emailInput}
            placeholder=""
            placeholderTextColor={Colors.headerText}
            value={_email}
            onChangeText={(email) => handleChange(email)}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() =>
              handleSendStatistics(patientId, dates, _email, formattedFirstName)
            }
          >
            <Feather name="send" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}

        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() =>
            handleGetStatistics(patientId, dates, formattedFirstName)
          }
        >
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
                current={showCalendar === "start" ? dates.start : dates.end}
                onDayPress={(day: { dateString: string }) =>
                  handleDateSelect(day.dateString, showCalendar)
                }
                markedDates={getMarkedDates()}
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
    textAlign: "center",
    color: Colors.headerText,
    fontFamily: "Montserrat-SemiBold",
  },
  errorText: { marginTop: 4, marginLeft: 5, color: "red" },
});

export default StatisticsScreen;
