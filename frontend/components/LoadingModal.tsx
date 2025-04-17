import React from "react";
import {
  View,
  Modal,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";

interface LoadingModalProps {
  visible: boolean;
  message?: string;
  showError?: boolean;
  errorMessage?: string;
  onClose?: () => void;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  visible,
  message = "Загрузка...",
  showError = false,
  errorMessage = "Произошла ошибка",
  onClose,
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.modalContainer, showError && styles.errorContainer]}
        >
          {showError ? (
            <>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </>
          ) : (
            <>
              <ActivityIndicator
                size={Platform.OS === "ios" ? "large" : 48}
                color={Colors.main}
              />
              <Text style={styles.loadingText}>{message}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    maxWidth: 300,
  },
  errorContainer: {
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.headerText,
    fontFamily: "Montserrat-Medium",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.headerText,
    fontFamily: "Montserrat-Medium",
    textAlign: "center",
    lineHeight: 22,
  },
  errorIcon: {
    fontSize: 42,
    color: Colors.main,
    fontWeight: "bold",
    fontFamily: "Montserrat-Bold",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: Colors.main,
    color: Colors.primary,
    borderRadius: 6,
    overflow: "hidden",
    fontFamily: "Montserrat-SemiBold",
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginHorizontal: 10,
  },
  closeButton: {
    backgroundColor: Colors.secondary,
  },
  buttonText: {
    color: Colors.primary,
    fontFamily: "Montserrat-SemiBold",
    fontSize: 15,
  },
});

export default LoadingModal;
