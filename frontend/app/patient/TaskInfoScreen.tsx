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
import LoadingModal from "@/components/LoadingModal";
import * as SecureStore from "expo-secure-store";
import NetInfo from "@react-native-community/netinfo";
import useHandleLogout from "@/hooks/useHandleLogout";

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

const TaskInfoScreen: React.FC = () => {
  const [taskData, setTaskData] = useState<
    {
      id: string;
      time: string;
      level: number;
      tap_count: number | number[];
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [headerUserName, setHeaderUserName] = useState<string>("");
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loadingMessage, setLoadingMessage] =
    useState<string>("Загрузка данных...");
  const CACHE_EXPIRE = 1 * 30 * 1000;
  const [user, setUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [taskInstructionText, setTaskInstructionText] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const processUserData = (userData: User) => {
    if (!userData) {
      console.warn("No user data available");
      return;
    }

    const formattedFirstName = `${userData.surname} ${userData.firstname[0]}. ${userData.lastname[0]}.`;
    setHeaderUserName(formattedFirstName);

    setActivityData(userData.activity);
    generateTaskData(userData.activity);
  };
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const state = await NetInfo.fetch();
      const cachedUser = await SecureStore.getItemAsync("user");
      let parsedUser;

      if (cachedUser) {
        parsedUser = JSON.parse(cachedUser);
      }
      if (
        state.isConnected &&
        state.isInternetReachable &&
        (!parsedUser || Date.now() - parsedUser.timestamp > CACHE_EXPIRE)
      ) {
        console.log("Fetching fresh data");
        setLoadingMessage("Загрузка активности...");
        setRefreshing(true);

        const fetchUser = await api.patientData();
        console.log("Fetched user:", fetchUser);
        setUser(fetchUser);
        processUserData(fetchUser);

        await SecureStore.setItemAsync(
          "user",
          JSON.stringify({
            userData: fetchUser,
            timestamp: Date.now(),
          })
        );
      } else {
        console.log("using CachedData");
        console.log(Date.now() - parsedUser.timestamp);
        setUser(parsedUser.userData);
        processUserData(parsedUser.userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setRefreshing(false);
    }
  };

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

  useEffect(() => {
    if (!activityData || !activityData.selected_time)
      return setTaskInstructionText("Не удалось загрузить задания");
    const instruction =
      activityData.selected_time.length === 0
        ? "Упс, заданий на сегодня нет."
        : activityData.level === 1
        ? "Задание: выполните одну серию нажатий"
        : "Задание: выполните две серии нажатий с перерывом в минуту";

    setTaskInstructionText(instruction);
  }, [activityData]);

  const router = useRouter();
  const handleStartTask = () => {
    if (user) {
      router.push({
        pathname: "/patient/TaskButtonScreen",
        params: {
          id: user.id,
          level: user.activity.level,
          selected_time: user.activity.selected_time,
        },
      });
    } else {
      return;
    }
  };
  const handleLogout = () => {
    setShowConfirm(true);
  };
  const [showConfirm, setShowConfirm] = useState(false);

  const clearUserCache = async () => {
    try {
      await SecureStore.deleteItemAsync("user");
      console.log("Кеш пользователя очищен");
    } catch (error) {
      console.error("Ошибка при очистке кеша:", error);
    }
  };
  const handleLogoutConfirm = async () => {
    await clearUserCache();
    setShowConfirm(false);
    await useHandleLogout(router);
  };
  const handleToggle = (id: string) => {
    setExpandedItems((prev) => ({
      [id]: !prev[id],
    }));
  };
  const onClose = () => {
    setLoading(false);
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
            isExpanded={!!expandedItems[task.id]}
            onToggle={() => handleToggle(task.id)}
          />
        ))}
      </ScrollView>

      <Footer
        components={[
          <FooterButton
            key="1"
            onPress={handleStartTask}
            label={"К заданию"}
            secondary={true}
          />,
        ]}
      />
      <ModalWindow
        visible={showConfirm}
        type="confirmation"
        message="Вы действительно хотите выйти?"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowConfirm(false)}
        confirmText="Выйти"
        cancelText="Отмена"
      />
      <LoadingModal
        visible={loading}
        message={loadingMessage}
        onClose={onClose}
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
