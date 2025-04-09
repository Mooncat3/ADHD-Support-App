import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TaskScheduleItem from "@/components/TaskInfoScreen/TaskScheduleItem";
import Footer from "@/components/Footer";
import FooterButton from "@/components/FooterButton";
import Header from "@/components/Header";
import ModalWindow from "@/components/ModalWindow";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import api from "@/scripts/api";
import LoadingModal from "@/components/LoadingModal";

type ActivityData = {
  level: number;
  tap_count: number | number[];
  selected_time: string[];
};

const TaskInfoScreen: React.FC = () => {
  const [taskData, setTaskData] = useState<
    {
      id: string;
      time: string;
      level: number;
      tap_count: number | number[];
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [headerUserName, setHeaderUserName] = useState<string>("");
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loadingMessage, setLoadingMessage] =
    useState<string>("Загрузка данных...");
  const [taskInstructionText, setTaskInstructionText] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await api.patientData();
        const formattedFirstName = `${user.surname} ${user.firstname[0]}. ${user.lastname[0]}.`;
        setHeaderUserName(formattedFirstName);
        if (!user) throw new Error("Пользователь не найден");
        setLoadingMessage("Загрузка активности...");
        if (!user.activity) {
          const defaultActivity = {
            level: 1,
            tap_count: [10, 12],
            selected_time: [],
          };
          setActivityData(defaultActivity);
          generateTaskData(defaultActivity);
          return;
        }

        setActivityData(user.activity);
        generateTaskData(user.activity);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateTaskData = (activity: ActivityData) => {
    const tasks = activity.selected_time.map((time, index) => ({
      id: `${index + 1}`,
      time: `${time.padStart(2, "0")}:00`,
      level: activity.level,
      tap_count: Array.isArray(activity.tap_count)
        ? index % 2 === 1
          ? activity.tap_count
          : [activity.tap_count[1], activity.tap_count[0]]
        : activity.tap_count,
    }));

    setTaskData(tasks);
    if (tasks.length > 0) {
      setExpandedItems({ [tasks[0].id]: true });
    }
  };

  useEffect(() => {
    if (!activityData) return;
    const instruction =
      activityData.level === 1
        ? "выполните одну серию нажатий"
        : "выполните две серии нажатий с перерывом в минуту";

    const description = `Задание: ${instruction}`;

    setTaskInstructionText(description);
  }, [activityData]);

  const router = useRouter();
  const handleStartTask = () => {
    router.push("/patient/TaskButtonScreen");
  };
  const handleLogout = () => {
    setShowConfirm(true);
  };
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    setShowConfirm(false);
    router.back();
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

      <ScrollView style={styles.schedule}>
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
      <LoadingModal
        visible={loading}
        message="Загрузка данных..."
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
