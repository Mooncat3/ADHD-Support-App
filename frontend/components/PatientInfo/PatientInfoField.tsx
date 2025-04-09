import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Alert,
} from "react-native";
import { Colors } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import * as Clipboard from "expo-clipboard";

interface PatientInfoFieldProps {
  label: string;
  value: string;
  isPassword?: boolean;
  hasDropdown?: boolean;
}

const PatientInfoField: React.FC<PatientInfoFieldProps> = ({
  label,
  value,
}) => {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(value);

    if (Platform.OS === "android") {
      ToastAndroid.show("Скопировано в буфер обмена", ToastAndroid.SHORT);
    } else {
      Alert.alert("Скопировано", "Текст скопирован в буфер обмена");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.fieldContent}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={copyToClipboard}
            accessibilityRole="button"
            accessibilityLabel={`Copy ${label} to clipboard`}
          >
            <Feather name="copy" size={24} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    paddingVertical: 15,
    paddingLeft: 16,
    paddingRight: 16,
    width: "100%",
    marginTop: 32,
  },
  fieldContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  valueContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  value: {
    fontSize: 14,
    color: "black",
    fontWeight: "600",
    fontFamily: "Montserrat-SemiBold",
  },
  icon: {
    width: 16,
    height: 16,
  },
  label: {
    position: "absolute",
    top: -18,
    left: 8,
    fontSize: 15,
    color: Colors.inputInactiveText,
    fontWeight: "400",
    fontFamily: "Montserrat-Regular",
    paddingHorizontal: 8,
  },
  dropdown: {
    width: 40,
    height: 18,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionButtonText: {
    color: Colors.main,
    fontSize: 12,
    fontFamily: "Montserrat-SemiBold",
  },
});

export default PatientInfoField;
