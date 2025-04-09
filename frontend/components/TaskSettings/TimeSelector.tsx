import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

interface TimeSelectorProps {
  selectedTimes: number[];
  onSelectTime: (time: number) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTimes,
  onSelectTime,
}) => {
  const times = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];

  return (
    <FlatList
      data={times}
      contentContainerStyle={{ gap: 12 }}
      keyExtractor={(time) => time}
      renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          key={item}
          style={[
            styles.timeOption,
            selectedTimes.includes(times.indexOf(item))
              ? styles.selectedTime
              : styles.unselectedTime,
          ]}
          onPress={() => onSelectTime(times.indexOf(item))}
        >
          <Text
            style={
              selectedTimes.includes(times.indexOf(item))
                ? styles.selectedTimeText
                : styles.unselectedTimeText
            }
          >
            {item}
          </Text>
        </TouchableOpacity>
      )}
    ></FlatList>
  );
};

const styles = StyleSheet.create({
  timeOption: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "solid",
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.15)",
    alignItems: "center",
  },
  selectedTime: {
    backgroundColor: "#E5F6FF",
    borderColor: "#0EA5E9",
  },
  unselectedTime: {
    backgroundColor: "#ffffff",
    borderColor: "#E5E7EB",
  },
  selectedTimeText: {
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
    color: Colors.main,
  },
  unselectedTimeText: {
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
    color: "#636262",
  },
});

export default TimeSelector;
