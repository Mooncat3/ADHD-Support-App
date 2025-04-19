import { Colors } from "@/constants/Colors";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

interface HeaderProps {
  title: string;
  createBackButton?: boolean;
  logoutFunc?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  createBackButton = true,
  logoutFunc = undefined,
}) => {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.icon}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={router.back}
            style={[
              styles.iconButton,
              { display: createBackButton ? "flex" : "none" },
            ]}
          >
            <FontAwesome6 name="chevron-left" size={28} color={Colors.main} />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <View style={styles.icon}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (logoutFunc) logoutFunc();
            }}
            style={[
              styles.iconButton,
              { display: logoutFunc ? "flex" : "none" },
            ]}
          >
            <FontAwesome6
              name="arrow-right-from-bracket"
              size={28}
              color={Colors.main}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
    zIndex: 10000,
    position: "relative",
  },
  headerContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    textAlign: "center",
  },
  icon: {
    width: 28,
    height: 28,
    alignItems: "center",
  },
  iconButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  title: {
    justifyContent: "center",
    fontSize: 24,
    color: Colors.headerText,
    fontFamily: "Montserrat-SemiBold",
    margin: "auto",
    textAlign: "center",
    flex: 1,
  },
});

export default Header;
