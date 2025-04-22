import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { ActionButton } from "@/components/TaskButtonScreen/ActionButton";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TASK_CACHE_KEY = "daily_tasks";
const SERIES_COOLDOWN = 60; // in seconds

function getStartOfDayUnix(now: number) {
  const nowUnix = new Date(now);
  nowUnix.setUTCHours(0, 0, 0, 0);
  return Math.floor(nowUnix.getTime() / 1000);
}

function getCurrentHour(now: number) {
  const nowUnix = new Date(now);
  return nowUnix.getHours().toString();
}

function getSecondsSinceMidnight(now: number) {
  const nowUnix = new Date(now);
  return (
    nowUnix.getUTCHours() * 3600 +
    nowUnix.getUTCMinutes() * 60 +
    nowUnix.getUTCSeconds()
  );
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
    selectedTime: string;
  }>();
  const { level = "" } = params;
  const [status, setStatus] = useState("Не начато");
  const { height } = Dimensions.get("window");
  interface tapStateData {
    timestamp_start: number | null;
    firstSeries: { count: number; lastTap: number | null };
    secondSeries: { count: number; lastTap: number | null };
    currentMode: "idle" | "first" | "second";
  }

  const [tapState, setTapState] = useState<tapStateData>({
    timestamp_start: null,
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
          timestamp_start: Date.now(),
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
    const saveSeries = async (tapState: tapStateData, level: string) => {
      const now = tapState.timestamp_start;
      if (now) {
        const startOfDayUnix = getStartOfDayUnix(now);
        const currentHour = getCurrentHour(now);
        const timestampStart = getSecondsSinceMidnight(now);
        // Получаем текущие данные
        const existingDataStr = await AsyncStorage.getItem(TASK_CACHE_KEY);
        let existingData = existingDataStr ? JSON.parse(existingDataStr) : [];

        // Ищем или создаем запись за сегодня
        let todayData = existingData.find(
          (item: any) => item.date === startOfDayUnix
        );
        todayData = {
          date: startOfDayUnix,
          level: parseInt(level),
          time_stat: {},
        };
        existingData.push(todayData);

        // Для level 2 формируем массив нажатий
        const tapData =
          level === "1"
            ? [tapState.firstSeries.count]
            : [tapState.firstSeries.count, tapState.secondSeries.count];

        // Добавляем данные
        todayData.time_stat[currentHour] = {
          timestamp_start: timestampStart,
          tap_count: tapData,
          patient_timezone: new Date().getTimezoneOffset(),
          local_series_end: Date.now(),
        };

        await AsyncStorage.setItem(
          TASK_CACHE_KEY,
          JSON.stringify(existingData)
        );

        console.log(JSON.stringify(existingData));
      }
    };
    const checkSeries = () => {
      const now = Date.now();
      // Завершение первой серии
      if (
        tapState.currentMode === "first" &&
        tapState.firstSeries.lastTap &&
        now - tapState.firstSeries.lastTap > SERIES_COOLDOWN * 1000
      ) {
        if (level === "1") {
          setStatus("Завершено");
          saveSeries(tapState, level);
        }
        console.log(tapState);
        setTapState((prev) => ({
          ...prev,
          currentMode: "idle",
          firstSeries: {
            count: level === "1" ? 0 : tapState.firstSeries.count,
            lastTap: level === "1" ? null : tapState.firstSeries.lastTap,
          },
        }));
      }
      // Завершение задания без второй серии
      if (
        level === "2" &&
        tapState.currentMode === "idle" &&
        tapState.firstSeries.lastTap &&
        now - tapState.firstSeries.lastTap > SERIES_COOLDOWN * 2000
      ) {
        console.log(tapState);
        setStatus("Завершено");
        saveSeries(tapState, level);
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
        now - tapState.secondSeries.lastTap > SERIES_COOLDOWN * 1000
      ) {
        console.log(tapState);
        setStatus("Завершено");
        saveSeries(tapState, level);
        setTapState({
          timestamp_start: null,
          firstSeries: { count: 0, lastTap: null },
          secondSeries: { count: 0, lastTap: null },
          currentMode: "idle",
        });
      }
    };

    const interval = setInterval(checkSeries, 500);
    return () => clearInterval(interval);
  }, [tapState]);

  return (
    <View style={styles.container}>
      <Header title="" createBackButton />
      <View style={styles.blocksContainer}>
        <Block
          title="Серия"
          value={
            tapState.currentMode === "idle"
              ? "..."
              : tapState.currentMode === "first"
              ? "1"
              : "2"
          }
        />
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
    fontSize: 18,
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
