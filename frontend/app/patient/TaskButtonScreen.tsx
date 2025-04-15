import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { ActionButton } from "@/components/TaskButtonScreen/ActionButton";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import api from "@/scripts/api";
import * as SecureStore from "expo-secure-store";

const TASK_CACHE_KEY = "daily_tasks";
const PENDING_SUBMISSIONS_KEY = "pending_submissions";

// Утилиты для работы с временем
function getStartOfDayUnix() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(startOfDay.getTime() / 1000);
}

function getCurrentHour() {
  return new Date().getHours().toString();
}

function getSecondsSinceMidnight() {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

const Block = ({ title, value }: { title: string; value: string }) => (
  <View style={styles.block}>
    <Text style={styles.upperText}>{title}</Text>
    <Text style={styles.lowerText}>{value}</Text>
  </View>
);

export default function ButtonPage() {
  const params = useLocalSearchParams<{
    level: string;
    patientId: string;
    selected_time: string;
  }>();
  const { level = "", patientId = "", selected_time = "" } = params;
  const [status, setStatus] = useState("Не начато");
  const { height } = Dimensions.get("window");
  [
    {
      date: 1744664400,
      level: "2",
      time_stat: {
        "16": {
          timestamp_start: 60675,
          tap_count: [8],
        },
      },
    },
  ];

  const [tapState, setTapState] = useState<{
    firstSeries: { count: number; lastTap: number | null };
    secondSeries: { count: number; lastTap: number | null };
    currentMode: "idle" | "first" | "second";
  }>({
    firstSeries: { count: 0, lastTap: null },
    secondSeries: { count: 0, lastTap: null },
    currentMode: "idle",
  });

  const handleTap = async () => {
    const now = Date.now();

    setTapState((prev) => {
      // Первое нажатие - начинаем первую серию
      if (prev.currentMode === "idle" && prev.firstSeries.count === 0) {
        setStatus("Начато");
        return {
          ...prev,
          currentMode: "first",
          firstSeries: { count: 1, lastTap: now },
        };
      }
      // Второе нажатие после окончания первой - начинаем вторую серию
      if (
        level === "2" &&
        prev.currentMode === "idle" &&
        prev.secondSeries.count === 0
      ) {
        return {
          ...prev,
          currentMode: "second",
          secondSeries: { count: 1, lastTap: now },
        };
      }

      // Продолжение первой серии
      if (prev.currentMode === "first") {
        return {
          ...prev,
          firstSeries: {
            count: prev.firstSeries.count + 1,
            lastTap: now,
          },
        };
      }

      // Продолжение второй серии
      if (prev.currentMode === "second") {
        return {
          ...prev,
          secondSeries: {
            count: prev.secondSeries.count + 1,
            lastTap: now,
          },
        };
      }

      return prev;
    });
  };
  useEffect(() => {
    const checkSeries = () => {
      const now = Date.now();

      // Завершение первой серии
      if (
        tapState.currentMode === "first" &&
        tapState.firstSeries.lastTap &&
        now - tapState.firstSeries.lastTap > 10000
      ) {
        console.log(tapState);
        setTapState((prev) => ({
          ...prev,
          currentMode: "idle",
          firstSeries: {
            count: tapState.firstSeries.count,
            lastTap: tapState.firstSeries.lastTap,
          },
        }));
      }
      // Завершение задания без второй серии
      if (
        level === "2" &&
        tapState.currentMode === "idle" &&
        tapState.firstSeries.lastTap &&
        now - tapState.firstSeries.lastTap > 20000
      ) {
        console.log(tapState);
        setStatus("Завершено");
        setTapState((prev) => ({
          ...prev,
          currentMode: "idle",
          firstSeries: {
            count: 0,
            lastTap: null,
          },
        }));
      }
      // Завершение задания с второй серией
      if (
        tapState.currentMode === "second" &&
        tapState.secondSeries.lastTap &&
        now - tapState.secondSeries.lastTap > 10000
      ) {
        console.log(tapState);
        setStatus("Завершено");
        setTapState({
          firstSeries: { count: 0, lastTap: null },
          secondSeries: { count: 0, lastTap: null },
          currentMode: "idle",
        });
      }
    };

    const interval = setInterval(checkSeries, 5000);
    return () => clearInterval(interval);
  }, [tapState]);

  return (
    <View style={styles.container}>
      <Header title="" createBackButton />
      <View style={styles.blocksContainer}>
        <Block title="Серия" value={tapState.currentMode} />
        <Block title="Задание" value={status} />
      </View>
      <View style={[styles.button, { bottom: height * (1 / 6) }]}>
        <ActionButton label="Нажать" onClick={handleTap} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundScreen },
  blocksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  block: {
    backgroundColor: "#FFFFFF",
    borderColor: Colors.secondary,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.25)",
    elevation: 5,
  },
  upperText: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    color: Colors.headerText,
  },
  lowerText: {
    fontSize: 22,
    fontFamily: "Montserrat-ExtraBold",
    textAlign: "center",
    marginTop: 4,
    color: Colors.main,
  },
  button: {
    position: "absolute",
    alignSelf: "center",
  },
});
