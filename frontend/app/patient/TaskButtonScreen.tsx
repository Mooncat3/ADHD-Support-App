import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { ActionButton } from "@/components/TaskButtonScreen/ActionButton";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/scripts/api";
import testData from "@/app/patient/testdata.json";

const Block = ({ title, value }: { title: string; value: string }) => (
  <View style={styles.block}>
    <Text style={styles.upperText}>{title}</Text>
    <Text style={styles.lowerText}>{value}</Text>
  </View>
);

export default function ButtonPage() {
  const params = useLocalSearchParams<{ patientId: string }>();
  const { patientId = "" } = params;
  const router = useRouter();
  const [status, setStatus] = useState("не начато");
  const [lastPress, setLastPress] = useState<number | null>(null);
  const [series, setSeries] = useState(1);
  const { height } = Dimensions.get("window");

  useEffect(() => {
    const sendStatistics = async () => {
      try {
        const response = await api.setStatistics(testData);
        console.log("Statistics successfully sent", response);
      } catch (error) { console.log("Error sending statistics:", error); }
    };

    sendStatistics();
  }, [patientId]);

  const handleClick = () => {
    const now = Date.now();
    setStatus("начато");
    if (lastPress && now - lastPress > 60000) setSeries((s) => 2);
    setLastPress(now);
  };

  useEffect(() => {
    if (!lastPress) return;

    const timer = setInterval(() => {
      if (Date.now() - lastPress > 60000) {
        setStatus(series >= 2 ? "закончено" : "не начато");
        setSeries((s) => 2);
        setLastPress(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastPress, series]);

  return (
    <View style={styles.container}>
      <Header title="" createBackButton />
      <View style={styles.blocksContainer}>
        <Block title="Серия" value={series.toString()} />
        <Block title="Задание" value={status} />
      </View>
      <View style={[styles.button, { bottom: height * (1 / 6) }]}>
        <ActionButton label="Нажать" onClick={handleClick} />
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
