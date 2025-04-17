import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import {
  filterNameText,
  filterUsernameText,
  filterPasswordText,
  filterEmailText,
  getFieldTooltip,
} from "@/components/ValidateInputs";
import { Ionicons } from "@expo/vector-icons";
import {
  useTogglePasswordVisibility,
  passwordInputStyles,
} from "@/hooks/PasswordVisibility";
import TextField from "@/components/TextInputCustom";

interface RegistrationData {
  firstName: string;
  secondName: string;
  patronymic: string;
  username: string;
  password: string;
  passwordRepeat: string;
  email: string;
}

interface RegistrationFieldsProps {
  onFormChange: (data: RegistrationData) => void;
  errors: { [key: string]: string };
}

const RegistrationForm: React.FC<RegistrationFieldsProps> = ({
  onFormChange,
  errors,
}) => {
  const [focusedInput, setFocusedInput] = useState<
    keyof RegistrationData | null
  >(null);
  const [fields, setFields] = useState<RegistrationData>({
    firstName: "",
    secondName: "",
    patronymic: "",
    username: "",
    password: "",
    passwordRepeat: "",
    email: "",
  });

  const {
    passwordVisibility: passwordVisibility1,
    rightIcon: rightIcon1,
    handlePasswordVisibility: handlePasswordVisibility1,
  } = useTogglePasswordVisibility(false);
  const {
    passwordVisibility: passwordVisibility2,
    rightIcon: rightIcon2,
    handlePasswordVisibility: handlePasswordVisibility2,
  } = useTogglePasswordVisibility(false);

  useEffect(() => {
    onFormChange(fields);
  }, [fields]);

  const validationMap = {
    firstName: filterNameText,
    secondName: filterNameText,
    patronymic: filterNameText,
    username: filterUsernameText,
    password: filterPasswordText,
    passwordRepeat: filterPasswordText,
    email: filterEmailText,
  };

  const handleChange = (field: keyof RegistrationData) => (text: string) => {
    const updatedFields = { ...fields, [field]: text };

    if (
      (field === "password" || field === "passwordRepeat") &&
      updatedFields.password &&
      updatedFields.passwordRepeat
    ) {
      if (updatedFields.password !== updatedFields.passwordRepeat) {
        errors.passwordRepeat = "Пароли не совпадают";
      } else {
        delete errors.passwordRepeat;
      }
    }

    const validate = validationMap[field];
    if (validate(text)) {
      setFields((prev) => ({ ...prev, [field]: text }));
    }
  };

  const renderInput = (
    field: keyof RegistrationData,
    placeholder: string,
    validate: (text: string) => boolean
  ) => {
    const isPasswordField = field === "password";
    const isPasswordRepField = field === "passwordRepeat";
    const showTooltip = focusedInput === field;
    const tooltipText = getFieldTooltip(field);

    const visibility = isPasswordField
      ? passwordVisibility1
      : isPasswordRepField
      ? passwordVisibility2
      : true;
    return (
      <View style={styles.inputContainer}>
        <TextField
          label={placeholder}
          value={fields[field]}
          onChangeText={handleChange(field)}
          onFocus={() => setFocusedInput(field)}
          secureTextEntry={!visibility}
          errorText={errors[field] || null}
        />
        {isPasswordField && (
          <Pressable
            onPress={handlePasswordVisibility1}
            style={passwordInputStyles.iconButton}
            hitSlop={{ top: 10, bottom: 10, right: 20 }}
          >
            <Ionicons name={rightIcon1} size={24} color={Colors.secondary} />
          </Pressable>
        )}
        {isPasswordRepField && (
          <Pressable
            onPress={handlePasswordVisibility2}
            style={passwordInputStyles.iconButton}
            hitSlop={{ top: 10, bottom: 10, right: 20 }}
          >
            <Ionicons name={rightIcon2} size={24} color={Colors.secondary} />
          </Pressable>
        )}
        {showTooltip && tooltipText && (
          <Text style={styles.tooltip}>{tooltipText}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView>
        {renderInput("firstName", "Имя", filterNameText)}
        {renderInput("secondName", "Фамилия", filterNameText)}
        {renderInput("patronymic", "Отчество", filterNameText)}
        {renderInput("username", "Логин", filterUsernameText)}
        {renderInput("password", "Пароль", filterPasswordText)}
        {renderInput("passwordRepeat", "Повторите пароль", filterPasswordText)}
        {renderInput("email", "Email", filterEmailText)}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    fontFamily: "Montserrat-Regular",
  },
  inputContainer: {
    marginTop: 15,
  },
  tooltip: {
    fontFamily: "Montserrat-Regular",
    color: "#2A2A2A",
    fontSize: 12,
    alignContent: "center",
    paddingLeft: 12,
    paddingTop: 10,
  },
});

export default RegistrationForm;
