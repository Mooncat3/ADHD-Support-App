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

interface Patient {
  patient_id: string;
  firstname: string;
  surname: string;
  lastname: string;
  login: string;
  email: string;
  activity?: string;
}

interface PatientListProps {
  doctorId: string;
}

const PatientList: React.FC<PatientListProps> = ({ doctorId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Doctor ID:", doctorId);
    const fetchPatients = async () => {
      try {
        const data = await api.getPatients();
        console.log(data);

        if (data && data.length > 0) {
          setPatients(data);
        } else {
          setError("Нет пациентов для отображения.");
        }

        setLoading(false);
      } catch (error) {
        console.log(error);
        setError("Ошибка загрузки данных");
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorId]);

  const handlePatientChoose = (patient: Patient) => {
    router.push({
      pathname: "/doctor/PatientInfo",
      params: {
        id: patient.patient_id,
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
        <Text>Ошибка: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.message}>
        <LoadingModal visible={isLoading} />
      </View>
      {!isLoading && (
        <FlatList
          style={styles.list}
          data={patients}
          contentContainerStyle={{ gap: 12 }}
          keyExtractor={(item) => item.patient_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handlePatientChoose(item)}
            >
              <View style={styles.textContainer}>
                <Text style={styles.text}>
                  {item.firstname} {item.surname} {item.lastname}
                </Text>
              </View>
              <AntDesign name="right" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    paddingTop: 20,
    fontFamily: "Montserrat-SemiBold",
    justifyContent: "center",
    alignItems: "center",
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
