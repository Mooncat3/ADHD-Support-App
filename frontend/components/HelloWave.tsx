<<<<<<< HEAD
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
=======
import { useEffect } from "react";
>>>>>>> c130cb14850ea61c08ae603689972377fdb45d3d
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
<<<<<<< HEAD
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
=======
} from "react-native-reanimated";
import { Text } from "react-native";
>>>>>>> c130cb14850ea61c08ae603689972377fdb45d3d

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    rotationAnimation.value = withRepeat(
<<<<<<< HEAD
      withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
=======
      withSequence(
        withTiming(25, { duration: 150 }),
        withTiming(0, { duration: 150 })
      ),
>>>>>>> c130cb14850ea61c08ae603689972377fdb45d3d
      4 // Run the animation 4 times
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
<<<<<<< HEAD
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
=======
      <Text>👋</Text>
    </Animated.View>
  );
}
>>>>>>> c130cb14850ea61c08ae603689972377fdb45d3d
