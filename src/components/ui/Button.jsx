import { StyleSheet } from "react-native";
import React from "react";
import { Button as PaperButton } from "react-native-paper";
import Animated from "react-native-reanimated";
const Button = (props) => {
  const AnimButton = Animated.createAnimatedComponent(PaperButton)
  return (
    <AnimButton
      {...props}
      style={[styles.button, styles[props.type], props.style]}
      labelStyle={[styles.label, props.labelStyle]}
    >
      {props.children}
    </AnimButton>
  );
};

export default Button;

const styles = StyleSheet.create({
  secondary:{
    backgroundColor:'#b0b0b0'
  },
  button: {
    shadowColor: "#a17eff",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
    marginVertical: 30,
    borderRadius: 50,
    backgroundColor: "#703efe",
  },
  label: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Gilroy-ExtraBold",
    padding: 8,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
});
