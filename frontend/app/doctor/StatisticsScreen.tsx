import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { AntDesign, Feather } from "@expo/vector-icons";
import ModalWindow from "@/components/ModalWindow";
import { validateEmail } from "@/components/ValidateInputs";
import { filterEmailText } from "@/components/ValidateInputs";
import TaskScheduleItem from "@/components/TaskInfoScreen/TaskScheduleItem";
import { useLocalSearchParams } from "expo-router";
import { handleGetStatistics } from "@/components/StatisticsScreen/DownloadPdf";
import { handleSendStatistics } from "@/components/StatisticsScreen/SendEmailPdf";
import "@/components/StatisticsScreen/SetLocaleDate";
import api from "@/scripts/api";
import LoadingModal from "@/components/LoadingModal";
import Footer from "@/components/Footer";
import FooterButton from "@/components/FooterButton";
import TextField from "@/components/TextInputCustom";
import { Pressable } from "react-native";

interface TimeStatistics {
  timestamp_start: number;
  success: boolean;
  in_time: boolean;
  tap_count: number[];
}

interface DateStatistics {
  date: string;
  data: {
    time_stat: Record<string, TimeStatistics>;
  };
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

  function formatStatDate(date: string): string {
    const utcDate = new Date(date);
    console.log(utcDate, "utcDate");
    const timezoneOffsetMinutes = utcDate.getTimezoneOffset();
    const localDate = new Date(
      utcDate.getTime() - timezoneOffsetMinutes * 60000
    );
    console.log(timezoneOffsetMinutes);
    return localDate.toLocaleDateString();
  }

  const dateNow = new Date();
  const startDate = new Date(dateNow);
  startDate.setMonth(dateNow.getMonth() - 1);

  const [dates, setDates] = useState({
    start: startDate.toISOString().split("T")[0],
    end: dateNow.toISOString().split("T")[0],
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingStatistics, setIsLoadingStatistics] =
    useState<boolean>(false);
  const [tempDates, setTempDates] = useState(dates);

  useEffect(() => {
    setIsLoadingStatistics(true);
    setStatisticsData([]);
    api
      .doctorData()
      .then((user) => {
        setEmail(user.email);
        return api.getStatistics(patientId, dates.start, dates.end);
      })
      .then((statisticsResponse) => {
        setStatisticsData(statisticsResponse);
        setIsLoadingStatistics(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoadingStatistics(false);
      });
  }, [dates]);

  const handleDateSelect = (selectedDate: string, type: "start" | "end") => {
    setTempDates((prev) => ({
      ...prev,
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
  function formatDate(date: string): string {
    return date.split("-").reverse().join(".");
  }
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

  const handleConfirmSend = async () => {
    try {
      setIsLoading(true);
      await handleSendStatistics(patientId, dates, _email, formattedFirstName);
      setModalMessage(`Отправлено на почту ${_email}`);
      setModalType("information");
    } catch (err) {
      setModalVisible(false);
    }
    setIsLoading(false);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const formattedFirstName = `${surname} ${firstname[0]}. ${lastname[0]}.`;

  const getMarkedDates = (range: { start: string; end: string }) => {
    const markedDates: Record<string, any> = {};
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);

    const startStr = range.start.split("T")[0];
    const endStr = range.end.split("T")[0];

    let current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0];

      if (dateStr === startStr) {
        markedDates[dateStr] = {
          startingDay: true,
          color: Colors.main,
          textColor: "white",
        };
      } else if (dateStr === endStr) {
        markedDates[dateStr] = {
          endingDay: true,
          color: Colors.main,
          textColor: "white",
        };
      } else {
        markedDates[dateStr] = {
          color: "#CFF0FF",
          textColor: "black",
        };
      }

      current.setDate(current.getDate() + 1);
    }

    return markedDates;
  };

  return (
    <View style={styles.container}>
      <LoadingModal visible={isLoading} message="Отправка.." />
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
          {isLoadingStatistics ? (
            <ActivityIndicator size="large" color={Colors.main} />
          ) : !isLoadingStatistics && statisticsData.length === 0 ? (
            <Text style={styles.noDataText}>
              Нет данных за выбранный период
            </Text>
          ) : (
            statisticsData.map(({ date, data }) => {
              date = formatStatDate(date);
              const timeStat = data?.time_stat ?? {};
              const firstKey = Object.keys(timeStat)[0];
              const tapCount = firstKey
                ? timeStat[firstKey]?.tap_count
                : undefined;
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
                  level={Array.isArray(tapCount) ? 2 : undefined}
                  time_stat={timeStat}
                  formatTime={formatTime}
                />
              );
            })
          )}
        </ScrollView>
      </View>

      <Footer
        components={[
          <View
            style={{
              flexDirection: "row",
              width: "100%",
            }}
            key="1"
          >
            <TextField
              style={styles.emailInput}
              placeholderTextColor={Colors.headerText}
              value={_email}
              onChangeText={(email) => handleChange(email)}
              label="Email"
            />
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.sendButton}
              onPress={() => handleSendPress()}
            >
              <Feather name="send" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>,
          <View key="2">
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>,
          <FooterButton
            key="3"
            label="Скачать статистику"
            iconName="download"
            onPress={() =>
              handleGetStatistics(patientId, dates, formattedFirstName)
            }
          />,
        ]}
      />

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
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setTempDates(dates);
            setShowCalendar(null);
          }}
        >
          <Pressable onPress={() => {}} style={[styles.modalContent]}>
            <Calendar
              key={showCalendar}
              markingType={"period"}
              current={showCalendar === "start" ? dates.start : dates.end}
              onDayPress={(day: { dateString: string }) =>
                handleDateSelect(day.dateString, showCalendar)
              }
              markedDates={getMarkedDates(tempDates)}
              minDate={showCalendar === "end" ? dates.start : undefined}
              maxDate={showCalendar === "start" ? dates.end : undefined}
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
              activeOpacity={0.9}
              style={styles.closeButton}
              onPress={() => {
                setDates(tempDates);
                setShowCalendar(null);
              }}
            >
              <Text style={styles.closeButtonText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundScreen,
    position: "relative",
  },
  content: { flex: 1 },
  dateSelection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    paddingBottom: 20,
    paddingHorizontal: 15,
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
  seriesText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: Colors.headerText,
    marginBottom: 4,
  },
  modalOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  modalContent: {
    elevation: 10,
    borderRadius: 10,
    width: "80%",
    backgroundColor: Colors.primary,
    padding: 16,
    marginVertical: "auto",
  },
  closeButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: Colors.main,
    borderRadius: 8,
    alignItems: "center",
  },
  emailInput: {
    color: Colors.headerText,
    marginRight: 5,
    flex: 1,
  },
  sendButton: {
    padding: 8,
    backgroundColor: Colors.main,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  closeButtonText: { color: Colors.primary, fontSize: 16 },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  noDataText: {
    paddingTop: 10,
    fontSize: 16,
    textAlign: "center",
    color: Colors.headerText,
    fontFamily: "Montserrat-SemiBold",
  },
  errorText: { marginLeft: 5, color: "red" },
});

export default StatisticsScreen;
