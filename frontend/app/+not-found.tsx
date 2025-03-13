<<<<<<< HEAD
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
=======
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native";
>>>>>>> c130cb14850ea61c08ae603689972377fdb45d3d

export default function NotFoundScreen() {
  return (
    <>
<<<<<<< HEAD
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
=======
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text>Страницы не существует.</Text>
        <Link href="/" style={styles.link}>
          <Text>Перейти на главную</Text>
        </Link>
      </View>
>>>>>>> c130cb14850ea61c08ae603689972377fdb45d3d
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    alignItems: 'center',
    justifyContent: 'center',
=======
    alignItems: "center",
    justifyContent: "center",
>>>>>>> c130cb14850ea61c08ae603689972377fdb45d3d
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
<<<<<<< HEAD
=======
    color: "blue",
>>>>>>> c130cb14850ea61c08ae603689972377fdb45d3d
  },
});
