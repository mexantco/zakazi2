import React from "react";
import { useState } from "react";
import {
  TextInput as PaperTextInput,
  Animated,
  StyleSheet,
  View,
} from "react-native";
import { mainShadow } from "./ShadowStyles";
const TextInput = (props) => {
  const [animation] = useState(new Animated.Value(0));
  const [border, setBorder] = useState({});
  const fadeIn = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
    setBorder({
      borderWidth: 2,
      borderColor: "#a280ff",
    });
  };
  const fadeOut = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    setBorder({});
  };
  const inputAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.01],
  });
  const textInputStyle = {
    ...mainShadow,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    flexDirection: "row",
    backgroundColor: "#fff",
    transform: [{ scale: inputAnimation }],
    ...props.style,
  };
  return (
    <Animated.View style={[textInputStyle, border]}>
      <View style={{ backgroundColor: "white", justifyContent: "center" }}>
        {props.icon}
      </View>
      <PaperTextInput
        {...props}
        style={[styles.textInput, { marginStart: props.icon ? 10 : 0 }]}
        placeholder={props.label}
        placeholderTextColor={props.error && "#ff3333"}
        onFocus={fadeIn}
        onBlur={fadeOut}
      />
    </Animated.View>
  );
};

export default TextInput;

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
  },
});
