import React, { useState, useEffect } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/Colors";
import api from "@/scripts/api";
import { useRouter } from "expo-router";
import LoadingModal from "@/components/LoadingModal";
import Debounce from "@/components/Debounce";

interface Patient {
  patient_id: string;
  firstname: string;
  surname: string;
  lastname: string;
  login: string;
  email: string;
  activity?: string;
}

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.getPatients();

        setPatients(data);
        setLoading(false);
      } catch (error: any) {
        if (error.status === "404") {
          setError("Нет данных о пациентах");
        } else {
          setError("Ошибка загрузки данных");
        }
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientChoose = (patient: Patient) => {
    router.push({
      pathname: "/doctor/PatientInfo",
      params: {
        patientId: patient.patient_id,
        firstname: patient.firstname,
        surname: patient.surname,
        lastname: patient.lastname,
        login: patient.login,
        email: patient.email,
      },
    });
  };
  if (error) {
    return (
      <View style={styles.message}>
        <Text style={styles.messageText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LoadingModal visible={isLoading} />

      {!isLoading && (
        <FlatList
          style={styles.list}
          data={patients.sort((a, b) => a.surname.localeCompare(b.surname))}
          contentContainerStyle={{ gap: 12 }}
          keyExtractor={(item) => item.patient_id}
          renderItem={({ item }) => (
            <Debounce onPress={() => handlePatientChoose(item)}>
              {(handlePress, isPressed) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.item}
                  onPress={handlePress}
                  disabled={isPressed}
                >
                  <View style={styles.textContainer}>
                    <Text style={styles.text}>
                      {item.surname} {item.firstname} {item.lastname}
                    </Text>
                  </View>
                  <AntDesign name="right" size={24} color={Colors.secondary} />
                </TouchableOpacity>
              )}
            </Debounce>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    paddingTop: 20,
    alignItems: "center",
  },
  messageText: {
    color: Colors.headerText,
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
  },
  container: {
    flex: 1,
    paddingTop: 20,
  },
  list: {
    paddingHorizontal: 10,
  },
  item: {
    flexShrink: 1,
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.primary,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.15)",
  },
  textContainer: {
    flex: 1,
  },
  text: {
    color: Colors.headerText,
    fontSize: 20,
    fontFamily: "Montserrat-SemiBold",
  },
});

export default PatientList;
