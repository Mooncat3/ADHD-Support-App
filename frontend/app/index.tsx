import { View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { useCheckInternetRole } from "@/hooks/useCheckInternetRole";

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useCheckInternetRole();

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
    ></View>
  );
}
