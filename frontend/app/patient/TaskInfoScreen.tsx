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

const CACHE_EXPIRE = 12 * 60 * 60 * 1000;

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
    setRefreshing(false);
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
          patientId: user.id,
          level: user.activity.level,
          selectedTime: user.activity.selected_time,
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
