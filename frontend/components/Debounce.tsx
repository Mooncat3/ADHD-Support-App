import React, { useState } from "react";

interface DebounceProps {
  children: (handlePress: () => void, isPressed: boolean) => React.ReactNode;
  onPress: () => void;
  debounceTime?: number;
}

const Debounce: React.FC<DebounceProps> = ({
  children,
  onPress,
  debounceTime = 500,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (isPressed) return;
    setIsPressed(true);
    onPress();
    setTimeout(() => setIsPressed(false), debounceTime);
  };

  return <>{children(handlePress, isPressed)}</>;
};

export default Debounce;
