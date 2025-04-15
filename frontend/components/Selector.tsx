import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { Colors } from "@/constants/Colors";

interface SelectorProps {
  selected: string;
  onSelect: (type: string) => void;
  mainLabel?: string;
  keys?: Record<string, string>;
  buttonHeight?: number;
}

const Selector: React.FC<SelectorProps> = ({
  selected,
  onSelect,
  mainLabel = "",
  keys = { "1": "1", "2": "2" },
  buttonHeight = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [ready, setReady] = useState<boolean>(false);

  const handleLayout = (event: LayoutChangeEvent, key: string) => {
    const { width, x } = event.nativeEvent.layout;
    setWidths((prev) => ({ ...prev, [key]: width }));
    setOffsets((prev) => ({ ...prev, [key]: x }));
  };

  useEffect(() => {
    if (
      selected in offsets &&
      Object.keys(offsets).length === Object.keys(keys).length
    ) {
      Animated.timing(animatedValue, {
        toValue: offsets[selected] || 0,
        useNativeDriver: false,
        duration: 0,
      }).start(() => setReady(true));
    }
  }, [offsets]);

  const handleClick = (k: string) => {
    if (k in offsets) {
      Animated.spring(animatedValue, {
        toValue: offsets[k] || 0,
        useNativeDriver: false,
      }).start();
    }
    onSelect(k);
  };

  return (
    <View style={styles.container}>
      <>{mainLabel && <Text style={styles.label}>{mainLabel}</Text>}</>
      <View style={[styles.options, !mainLabel && styles.compactOptions]}>
        {ready && (
          <Animated.View
            style={[
              styles.cursor,
              {
                width: widths[selected] || 0,
                transform: [{ translateX: animatedValue }],
              },
            ]}
          />
        )}
        {Object.entries(keys).map(([k, v]) => (
          <TouchableOpacity
            key={k}
            activeOpacity={0.8}
            style={[styles.option, { minHeight: buttonHeight }]}
            onPress={() => handleClick(k)}
            onLayout={(event) => handleLayout(event, k)}
          >
            <Text
              numberOfLines={1}
              style={[
                selected === k ? styles.selectedText : styles.unselectedText,
                styles.selectorText,
              ]}
            >
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectorText: {
    textAlign: "center",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 16,
    color: "#636262",
    fontFamily: "Montserrat-SemiBold",
    marginRight: "auto",
  },
  options: {
    flexDirection: "row",
    backgroundColor: "#EFF1F5",
    borderRadius: 20,
    position: "relative",
    flexShrink: 1,
  },
  compactOptions: {
    alignSelf: "flex-start",
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    flexShrink: 0,
  },
  cursor: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.1)",
  },
  selectedText: {
    color: "#636262",
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
  },
  unselectedText: {
    color: Colors.main,
    fontFamily: "Montserrat-SemiBold",
    fontSize: 13,
  },
});

export default Selector;
