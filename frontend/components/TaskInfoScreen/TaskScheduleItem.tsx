import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Colors } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";

interface StatItem {
  timestamp_start: number;
  success: boolean;
  in_time: boolean;
  tap_count: number[];
}

interface TaskScheduleItemProps {
  id: string;
  time: string;
  level?: number;
  tap_count?: number | number[];
  isExpanded: boolean;
  onToggle: () => void;

  date?: string;
  time_stat?: {
    [key: string]: StatItem | undefined;
  };
  formatTime?: (timestamp: number) => string;
}

const TaskScheduleItem: React.FC<TaskScheduleItemProps> = ({
  id,
  time,
  level,
  tap_count,
  isExpanded = false,
  onToggle,
  date,
  time_stat,
  formatTime,
}) => {
  const [heightAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    heightAnim.setValue(isExpanded ? 1 : 0);
    rotateAnim.setValue(isExpanded ? 1 : 0);
  }, []);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const isStatisticsMode = !!date && !!time_stat && !!formatTime;

  const renderContent = () => {
    const isTapCountArray = Array.isArray(tap_count);
    const level = isTapCountArray ? 2 : 1;

    if (isStatisticsMode && time_stat && formatTime) {
      return Object.entries(time_stat)
        .filter(([_, stat]) => stat !== undefined)
        .map(([timeKey, stat]) => (
          <View key={`${id}-${timeKey}`} style={styles.timeItem}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeText}>
                {formatTime(stat!.timestamp_start)}
              </Text>
              <AntDesign
                name={stat!.success ? "checkcircleo" : "closecircleo"}
                size={20}
                color={stat!.success ? "#1BCD1B" : "#F47272"}
                style={styles.icon}
              />
              <AntDesign
                name="clockcircleo"
                size={20}
                color={stat!.in_time ? "#1BCD1B" : "#F47272"}
              />
            </View>
            {level === 1 ? (
              <Text style={styles.seriesText}>
                1-ая серия: {stat!.tap_count} нажатий
              </Text>
            ) : (
              <>
                <Text style={styles.seriesText}>
                  1-ая серия: {stat!.tap_count[0] || 0} нажатий
                </Text>
                {stat!.tap_count[1] !== undefined && (
                  <Text style={styles.seriesText}>
                    2-ая серия: {stat!.tap_count[1]} нажатий
                  </Text>
                )}
              </>
            )}
          </View>
        ));
    }

    const tapCounts = isTapCountArray ? tap_count : [tap_count];

    return (
      <>
        {level === 1 && (
          <Text style={styles.seriesText}>
            1-ая серия: {tapCounts[0]} нажатий
          </Text>
        )}
        {level === 2 && (
          <>
            <Text style={styles.seriesText}>
              1-ая серия: {tapCounts[0]} нажатий
            </Text>
            {tapCounts.length > 1 && (
              <Text style={styles.seriesText}>
                2-ая серия: {tapCounts[1]} нажатий
              </Text>
            )}
          </>
        )}
      </>
    );
  };

  const getContentHeight = () => {
    if (isStatisticsMode && time_stat) {
      return Object.keys(time_stat).length * 100;
    }
    return level === 1 ? 40 : 80;
  };

  return (
    <View style={[styles.container, isExpanded && styles.expandedContainer]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        style={styles.header}
      >
        <Text style={styles.headerText}>{isStatisticsMode ? date : time}</Text>
        <Animated.View
          style={[
            styles.icon,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
              transformOrigin: "50% 25%",
            },
          ]}
        >
          <AntDesign name="down" size={20} color="black" />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            height: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, getContentHeight()],
            }),
          },
        ]}
      >
        {isExpanded && renderContent()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: Colors.backgroundScreen,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  headerText: {
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    color: Colors.main,
  },
  timeItem: {
    padding: 10,
    backgroundColor: "#F9F7F7",
    borderRadius: 8,
    marginBottom: 8,
  },
  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    color: Colors.headerText,
    marginRight: 10,
  },
  icon: {
    marginRight: 10,
  },
  seriesText: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: Colors.headerText,
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  contentContainer: {
    overflow: "hidden",
  },
  expandedContainer: {
    backgroundColor: "#F9F7F7",
    elevation: 3,
  },
});

export default TaskScheduleItem;
