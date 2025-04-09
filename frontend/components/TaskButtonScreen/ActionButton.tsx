import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Colors } from "@/constants/Colors";

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
}) => {
  const [positionAnimation] = useState(new Animated.Value(0));

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(positionAnimation, {
        toValue: 4,
        duration: 120,
        easing: Easing.out(Easing.linear),
        useNativeDriver: true,
      }),
      Animated.timing(positionAnimation, {
        toValue: 0,
        duration: 120,
        easing: Easing.out(Easing.linear),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.animatedButton,
        {
          transform: [{ translateY: positionAnimation }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onClick}
        onPressIn={handlePress} // Запускаем анимацию сразу
        activeOpacity={1}
      >
        <View style={styles.container}>
          <View style={styles.beforeElement}></View>
          <Text style={styles.text}>{label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedButton: {
    width: 195,
    height: 195,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  button: {
    width: 195,
    height: 195,
    backgroundColor: Colors.primary,
    borderRadius: 97.5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
    elevation: 5,
    borderStyle: "solid",
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  beforeElement: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 97.5,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  text: {
    fontSize: 24,
    color: Colors.secondary,
    fontFamily: "Montserrat-Bold",
  },
});
