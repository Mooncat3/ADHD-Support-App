import React, { useState } from "react";
import Header from "@/components/Header";
import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  useTogglePasswordVisibility,
  passwordInputStyles,
} from "@/hooks/PasswordVisibility";
import FooterButton from "@/components/FooterButton";
import Footer from "@/components/Footer";
import TextField from "@/components/TextInputCustom";
import {
  filterUsernameText,
  filterPasswordText,
  validateForm,
} from "@/components/ValidateInputs";
import { checkCode } from "@/components/CheckErrorCode";
import api from "@/scripts/api";
import { useRouter } from "expo-router";
import LoadingModal from "@/components/LoadingModal";
import { getRole } from "@/hooks/useCheckInternetRole";

type AuthorizationData = {
  username: string;
  password: string;
};

interface RegistrationFieldsProps {
  errors: { [key: string]: string };
}

const AuthorizationForm: React.FC<RegistrationFieldsProps> = ({
  errors = {},
}) => {
  const router = useRouter();
  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authorizationData, setAuthorizationData] = useState<AuthorizationData>(
    {
      username: "",
      password: "",
    }
  );

  const validationMap = {
    username: filterUsernameText,
    password: filterPasswordText,
  };

  const handleChange = (field: keyof AuthorizationData) => (text: string) => {
    const validate = validationMap[field];
    if (validate(text)) {
      setAuthorizationData((prev) => ({ ...prev, [field]: text }));
    }
  };

  const handleAuthorize = async () => {
    setIsLoading(true);
    setError("");
    const errors = validateForm(authorizationData, false);

    const filteredErrors = Object.fromEntries(
      Object.entries(errors).map(([key, value]) => [key, value || ""])
    );

    setFormErrors(filteredErrors);

    if (Object.keys(filteredErrors).length === 0) {
      api
        .auth(authorizationData)
        .then(async () => {
          await getRole(router);
          setIsLoading(false);
        })
        .catch((error) => {
          setError(checkCode(error.status));
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      console.log("Validation errors:", filteredErrors);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={"Авторизация"} createBackButton={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.formContainer}
      >
        <ScrollView contentContainerStyle={styles.formContent}>
          <View style={styles.inputContainer}>
            <TextField
              label="Логин"
              value={authorizationData.username}
              onChangeText={handleChange("username")}
              errorText={formErrors.username || errors.username || null}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextField
              label="Пароль"
              value={authorizationData.password}
              onChangeText={handleChange("password")}
              errorText={formErrors.password || errors.password || null}
              secureTextEntry={passwordVisibility}
            />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              onPress={handlePasswordVisibility}
              style={passwordInputStyles.iconButton}
              hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
            >
              <Ionicons name={rightIcon} size={24} color={Colors.secondary} />
            </Pressable>
          </View>
        </ScrollView>
        <LoadingModal visible={isLoading} />
      </KeyboardAvoidingView>
      <Footer
        components={[
          <FooterButton onPress={handleAuthorize} label="Войти" key="1" />,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundScreen,
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    position: "relative", // для корректного позиционирования модального окна
  },
  formContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  inputContainer: {
    marginTop: 15,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 5,
    color: "red",
  },
});

export default AuthorizationForm;
