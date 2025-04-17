import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

interface FooterButtonProps {
  onPress: () => void;
  label: string;
  secondary?: boolean;
  debounceTime?: number;
}

const FooterButton: React.FC<FooterButtonProps> = ({
  onPress,
  label,
  secondary = false,
  debounceTime = 1000,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const handlePress = () => {
    if (isPressed) return;
    setIsPressed(true);
    onPress();
    setTimeout(() => setIsPressed(false), debounceTime);
  };
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.button, secondary && styles.secondaryButton]}
      onPress={handlePress}
      disabled={isPressed}
    >
      <Text style={styles.buttonText} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.main,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  pressedButton: {
    opacity: 0.1,
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    width: "100%",
    textAlign: "center",
  },
});

export default FooterButton;
