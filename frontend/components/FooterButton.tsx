import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import Debounce from "@/components/Debounce";
import { AntDesign } from "@expo/vector-icons";

interface FooterButtonProps {
  onPress: () => void;
  label: string;
  secondary?: boolean;
  iconName?: any;
}

const FooterButton: React.FC<FooterButtonProps> = ({
  onPress,
  label,
  secondary = false,
  iconName = null,
}) => {
  return (
    <Debounce onPress={onPress}>
      {(handlePress, isPressed) => (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.button, secondary && styles.secondaryButton]}
          onPress={handlePress}
          disabled={isPressed}
        >
          <View style={{ flexDirection: "row" }}>
            {iconName && (
              <AntDesign
                style={{ marginRight: 8 }}
                size={24}
                color={Colors.primary}
                name={iconName}
              />
            )}
            <Text style={styles.buttonText} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </Debounce>
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
  buttonText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    textAlign: "center",
  },
});

export default FooterButton;
