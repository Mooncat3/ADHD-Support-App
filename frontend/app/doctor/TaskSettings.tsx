import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Header from "@/components/Header";
import TimeSelector from "@/components/TaskSettings/TimeSelector";
import CounterSection from "@/components/TaskSettings/CounterSection";
import FooterButton from "@/components/FooterButton";
import Footer from "@/components/Footer";
import { Colors } from "@/constants/Colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import Selector from "@/components/Selector";
import api from "@/scripts/api";

const TaskSettings = () => {
  const router = useRouter();
  const {
    firstname = "",
    surname = "",
    lastname = "",
    id = "",
  } = useLocalSearchParams<{
    firstname: string;
    surname: string;
    lastname: string;
    id: string;
  }>();

  const formattedFirstName = `${surname} ${firstname[0]}. ${lastname[0]}.`;

  useEffect(() => {
    api.getPatientActivity(id).then((response) => {
      if (response?.activity) loadData(response.activity);
      else
        loadData({
          level: 2,
          tap_count: [10, 18],
          selected_time: ["9", "10", "12", "18"],
        });
    });
  }, []);

  const loadData = (activity: Record<string, any>) => {
    setLevel(activity.level.toString());
    setSelectedTimes(activity.selected_time.map(Number));
    setFirstSeriesCount(
      Array.isArray(activity.tap_count)
        ? activity.tap_count[0]
        : activity.tap_count
    );
    if (Array.isArray(activity.tap_count))
      setSecondSeriesCount(activity.tap_count[1]);
  };

  const [level, setLevel] = useState<string>();
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
  const [firstSeriesCount, setFirstSeriesCount] = useState<number>();
  const [secondSeriesCount, setSecondSeriesCount] = useState<number>(1);
  const [headerUserName, setHeaderUserName] =
    useState<string>(formattedFirstName);

  const handleSave = () => {
    if (level) {
      api.putPatientActivity(id, {
        level: parseInt(level),
        tap_count:
          level === "1"
            ? firstSeriesCount
            : [firstSeriesCount, secondSeriesCount],
        selected_time: selectedTimes.sort((a, b) => a - b).map(String),
      });
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Header title={headerUserName} />

      <View style={styles.content}>
        {level && (
          <Selector
            selected={level}
            onSelect={setLevel}
            mainLabel="Уровень сложности"
            keys={{ "1": "Простой", "2": "Сложный" }}
          />
        )}

        <TimeSelector
          selectedTimes={selectedTimes}
          onSelectTime={(time) => {
            if (selectedTimes.includes(time)) {
              setSelectedTimes(selectedTimes.filter((t) => t !== time));
            } else {
              setSelectedTimes([...selectedTimes, time]);
            }
          }}
        />

        {level && firstSeriesCount !== undefined && (
          <CounterSection
            firstSeriesCount={firstSeriesCount}
            secondSeriesCount={secondSeriesCount}
            onFirstSeriesChange={setFirstSeriesCount}
            onSecondSeriesChange={setSecondSeriesCount}
            level={level}
          />
        )}
      </View>

      <Footer
        components={[
          <FooterButton onPress={handleSave} label="Сохранить" key="1" />,
        ]}
      ></Footer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: Colors.backgroundScreen,
    flex: 1,
    fontFamily: "Montserrat-Regular",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    padding: 16,
    gap: 24,
  },
});

export default TaskSettings;
