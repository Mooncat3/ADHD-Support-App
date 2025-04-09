import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Colors } from "@/constants/Colors";

type DialogType = "confirmation" | "information";

interface ModalWindowProps {
  visible: boolean;
  type: DialogType;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ModalWindow: React.FC<ModalWindowProps> = ({
  visible,
  type,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonsContainer}>
            {type === "confirmation" && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                type === "information"
                  ? styles.infoButton
                  : styles.confirmButton,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    color: Colors.headerText,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 100,
    alignSelf: "center",
    alignItems: "center",
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.main,
  },
  cancelButton: {
    backgroundColor: Colors.primary,
  },
  infoButton: {
    backgroundColor: Colors.main,
  },
  buttonText: {
    color: Colors.primary,
    fontFamily: "Montserrat-Regular",
    fontWeight: "500",
  },
  cancelButtonText: {
    color: Colors.headerText,
    fontFamily: "Montserrat-Regular",
    fontWeight: "500",
  },
});

export default ModalWindow;
