import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import TaskScheduleItem from "@/components/TaskInfoScreen/TaskScheduleItem";
import Footer from "@/components/Footer";
import FooterButton from "@/components/FooterButton";
import Header from "@/components/Header";
import ModalWindow from "@/components/ModalWindow";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import api from "@/scripts/api";
import useHandleLogout from "@/hooks/useHandleLogout";
import useCache from "@/hooks/useCache";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

type ActivityData = {
  level: number;
  selected_time: string[];
  tap_count: number | number[];
};

interface User {
  id: string;
  activity: ActivityData;
  firstname: string;
  lastname: string;
  surname: string;
}

const CACHE_EXPIRE = 0;
const TASK_CACHE_KEY = "daily_tasks";

const TaskInfoScreen: React.FC = () => {
  const router = useRouter();

  const [taskData, setTaskData] = useState<
    {
      id: string;
      time: string;
      level: number;
      tap_count: number | number[];
    }[]
  >([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [headerUserName, setHeaderUserName] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const [taskInstructionText, setTaskInstructionText] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const [user, setUser] = useState<User>();

  const processUserData = (userData: User) => {
    const formattedFirstName = `${userData.surname} ${userData.firstname[0]}. ${userData.lastname[0]}.`;
    setHeaderUserName(formattedFirstName);

    if (!userData.activity || !userData.activity?.selected_time)
      return setTaskInstructionText("Не удалось загрузить задания");

    const instruction =
      userData.activity.selected_time.length === 0
        ? "Упс, заданий на сегодня нет."
        : userData.activity.level === 1
        ? "Задание: выполните одну серию нажатий"
        : "Задание: выполните две серии нажатий с перерывом в минуту";
    setTaskInstructionText(instruction);

    generateTaskData(userData.activity);
  };

  const fetchData = async () => {
    setRefreshing(true);
    const userCached = await useCache("user", api.patientData, CACHE_EXPIRE);
    setUser(userCached);
    processUserData(userCached);
    sendSeries();
    setRefreshing(false);
  };

  const sendSeries = async () => {
    try {
      const seriesStr = await AsyncStorage.getItem(TASK_CACHE_KEY);
      if (!seriesStr) return;
      const state = await NetInfo.fetch();
      if (!state.isConnected || !state.isInternetReachable) return;

      let parsed;
      try {
        parsed = JSON.parse(seriesStr);
        if (!Array.isArray(parsed)) return;
      } catch (e) {
        console.error("Failed to parse stored data", e);
        return;
      }
      const currentTimestamp = Math.floor(Date.now() / 1000);
      console.log(currentTimestamp);
      const oneDayInSeconds = 24 * 60 * 60;

      const oldRecords = parsed.filter(
        (item) =>
          item?.date &&
          typeof item.date === "number" &&
          currentTimestamp - item.date >= oneDayInSeconds
      );

      if (oldRecords.length === 0) return;

      const groupedByDate = oldRecords.reduce((groups, item) => {
        const date = new Date(item.date * 1000);
        const statObject = Object.values(item.time_stat)[0] as {
          patient_timezone: number;
        };
        const localDate = new Date(
          date.getTime() + statObject.patient_timezone * 60 * 1000
        );
        console.log(localDate);
        const dateKey =
          new Date(localDate.setHours(0, 0, 0, 0)).getTime() / 1000;
        console.log(dateKey);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(item);
        return groups;
      }, {});

      const dateKeys = Object.keys(groupedByDate).map(Number);
      let remainingData = [...parsed];

      for (const dateKey of dateKeys) {
        const itemsForDate = groupedByDate[dateKey];

        try {
          const response = await api.setStatistics(itemsForDate);

          if (response) {
            console.log(seriesStr, groupedByDate);
            remainingData = remainingData.filter(
              (item) => !itemsForDate.includes(item)
            );

            if (remainingData.length > 0) {
              await AsyncStorage.setItem(
                TASK_CACHE_KEY,
                JSON.stringify(remainingData)
              );
            } else {
              await AsyncStorage.removeItem(TASK_CACHE_KEY);
            }
          }
        } catch (error) {
          console.error(
            `Failed to send data for date ${new Date(dateKey * 1000)}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Error in sendSeries:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) processUserData(user);
  }, [user]);

  const generateTaskData = (activity: ActivityData) => {
    if (activity.selected_time) {
      const tasks = activity.selected_time.map((time, index) => ({
        id: `${index + 1}`,
        time: `${time.padStart(2, "0")}:00`,
        level: activity.level,
        tap_count: Array.isArray(activity.tap_count)
          ? index % 2 === 0
            ? activity.tap_count
            : [activity.tap_count[1], activity.tap_count[0]]
          : activity.tap_count,
      }));

      setTaskData(tasks);
      if (tasks.length > 0) {
        setExpandedItems({ [tasks[0].id]: true });
      }
    }
  };

  const handleStartTask = () => {
    if (user)
      router.push({
        pathname: "/patient/TaskButtonScreen",
        params: {
          level: user.activity.level,
        },
      });
  };

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowConfirm(false);
    await useHandleLogout(router);
  };

  const handleToggle = (id: string) => {
    setExpandedItems((prev) => ({
      [id]: !prev[id],
    }));
  };

  return (
    <View style={styles.container}>
      <Header
        title={headerUserName}
        createBackButton={false}
        logoutFunc={handleLogout}
      />

      <View style={styles.taskInstruction}>
        <Text style={styles.taskInstructionText}>{taskInstructionText}</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
        }
        style={styles.schedule}
      >
        {taskData.map((task) => (
          <TaskScheduleItem
            key={task.id}
            id={task.id}
            time={task.time}
            tap_count={task.tap_count}
            level={task.level}
            isExpanded={expandedItems[task.id]}
            onToggle={() => handleToggle(task.id)}
          />
        ))}
      </ScrollView>

      {user?.activity && (
        <Footer
          components={[
            <FooterButton
              key="1"
              onPress={handleStartTask}
              label="К заданию"
              secondary={true}
            />,
          ]}
        />
      )}
      <ModalWindow
        visible={showConfirm}
        type="confirmation"
        message="Вы действительно хотите выйти?"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowConfirm(false)}
        confirmText="Выйти"
        cancelText="Отмена"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: Colors.main,
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
  container: {
    display: "flex",
    backgroundColor: Colors.backgroundScreen,
    flex: 1,
    fontFamily: "Montserrat-Regular",
  },
  taskInstruction: {
    marginTop: 24,
  },
  taskInstructionText: {
    color: Colors.headerText,
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    lineHeight: 23,
    textAlign: "center",
    marginHorizontal: 16,
  },
  schedule: {
    marginTop: 24,
  },
});

export default TaskInfoScreen;
