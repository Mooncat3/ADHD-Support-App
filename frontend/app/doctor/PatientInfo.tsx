import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FooterButton from "@/components/FooterButton";
import { Colors } from "@/constants/Colors";
import PatientInfoField from "@/components/PatientInfo/PatientInfoField";

const PatientInfo = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    firstname = "",
    surname = "",
    lastname = "",
    login = "",
    email = "",
    id = "",
  } = params;

  const handlePatientStatistics = () => {
    router.push({
      pathname: "/doctor/StatisticsScreen",
      params: {
        patientId: id,
        firstname: firstname,
        surname: surname,
        lastname: lastname,
        login: login,
      },
    });
  };

  const handlePatientAssignments = () => {
    router.push("/doctor/TaskSettings");
  };
  const formattedFirstName = `${surname} ${firstname[0]}. ${lastname[0]}.`;

  return (
    <View style={styles.container}>
      <Header title={formattedFirstName} createBackButton={true} />

      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <PatientInfoField label="Логин" value={login} />
          <PatientInfoField label="Почта" value={email} />
        </View>
      </View>

      <Footer
        components={[
          <FooterButton
            key="statistics"
            onPress={handlePatientStatistics}
            label="Статистика пациента"
          />,
          <FooterButton
            key="assignments"
            onPress={handlePatientAssignments}
            label="Задания пациента"
          />,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundScreen,
    borderRadius: 12,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
    fontWeight: "400",
  },
  infoContainer: {
    backgroundColor: Colors.primary,
    width: "100%",
    padding: 7,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PatientInfo;
