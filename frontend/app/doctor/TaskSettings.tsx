import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Header from "@/components/Header";
import TimeSelector from "@/components/TaskSettings/TimeSelector";
import CounterSection from "@/components/TaskSettings/CounterSection";
import FooterButton from "@/components/FooterButton";
import Footer from "@/components/Footer";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import Selector from "@/components/Selector";

const TaskSettings = () => {
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<string>("simple");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [firstSeriesCount, setFirstSeriesCount] = useState<number>(10);
  const [secondSeriesCount, setSecondSeriesCount] = useState<number>(12);
  const [headerUserName, setHeaderUserName] =
    useState<string>("Смирнова Н. В.");

  const handleSave = () => {
    console.log({
      difficulty,
      selectedTimes,
      firstSeriesCount,
      secondSeriesCount,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Header title={headerUserName} />

      <View style={styles.content}>
        <Selector
          selected={difficulty}
          onSelect={setDifficulty}
          mainLabel="Уровень сложности"
          keys={{ simple: "Простой", complex: "Сложный" }}
        />

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

        <CounterSection
          firstSeriesCount={firstSeriesCount}
          secondSeriesCount={secondSeriesCount}
          onFirstSeriesChange={setFirstSeriesCount}
          onSecondSeriesChange={setSecondSeriesCount}
          difficulty={difficulty}
        />
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
