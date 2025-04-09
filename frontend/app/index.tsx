import { Text, View, Button } from "react-native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import checkInternetRole from '@/hooks/CheckInternetRole';

export default function App() {
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  checkInternetRole();

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          "Montserrat-Bold": require("@/assets/fonts/Montserrat-Bold.ttf"),
          "Montserrat-SemiBold": require("@/assets/fonts/Montserrat-SemiBold.ttf"),
          "Montserrat-ExtraBold": require("@/assets/fonts/Montserrat-ExtraBold.ttf"),
          "Montserrat-Regular": require("@/assets/fonts/Montserrat-Regular.ttf"),
          "OpenSans-Regular": require("@/assets/fonts/OpenSans-Regular.ttf"),
          "OpenSans-SemiBold": require("@/assets/fonts/OpenSans-SemiBold.ttf"),
          "SpaceMono-Regular": require("@/assets/fonts/SpaceMono-Regular.ttf"),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) await SplashScreen.hideAsync();
  }, [appIsReady]);
  if (!appIsReady) return null;

  return (
    <View
      onLayout={onLayoutRootView}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Stay Focused</Text>
      <Text>👋</Text>

      <View style={{ gap: 12 }}>
        <Button
          title="Страница авторизации"
          onPress={() => router.push("/authorize")}
        />
        <Button
          title="Главная страница врача / родителя"
          onPress={() => router.push("/doctor/DoctorMain")}
        />
        <Button
          title="Карточка пациента / ребёнка"
          onPress={() => router.push("/doctor/PatientInfo")}
        />
        <Button
          title="Статистика пациента / ребёнка"
          onPress={() => router.push("/doctor/StatisticsScreen")}
        />
        <Button
          title="Редактирование задания для пациента / ребёнка"
          onPress={() => router.push("/doctor/TaskSettings")}
        />
        <Button
          title="Окно с описанием заданий для пациента / ребёнка"
          onPress={() => router.push("/patient/TaskInfoScreen")}
        />
        <Button
          title="Окно с кнопкой для пациента / ребёнка"
          onPress={() => router.push("/patient/TaskButtonScreen")}
        />
      </View>
    </View>
  );
}
