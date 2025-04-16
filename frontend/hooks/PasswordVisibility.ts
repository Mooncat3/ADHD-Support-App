import { useState } from "react";
import { StyleSheet } from "react-native";

export const useTogglePasswordVisibility = (setVisibility = true) => {
  const [passwordVisibility, setPasswordVisibility] = useState(setVisibility);
  const [rightIcon, setRightIcon] = useState<"eye-off-outline" | "eye-outline">(
    "eye-off-outline"
  );

  const handlePasswordVisibility = () => {
    setPasswordVisibility((prevVisibility) => !prevVisibility);
    setRightIcon((prevIcon) =>
      prevIcon === "eye-off-outline" ? "eye-outline" : "eye-off-outline"
    );
  };

  return {
    passwordVisibility,
    rightIcon,
    handlePasswordVisibility,
  };
};

export const passwordInputStyles = StyleSheet.create({
  iconButton: {
    position: "absolute",
    right: 10,
    top: 28,
    transform: [{ translateY: -15 }],
  },
  passwordContainer: {
    position: "relative",
  },
});
