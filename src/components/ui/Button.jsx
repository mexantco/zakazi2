import { StyleSheet } from "react-native";
import React from "react";
import { Button as PaperButton } from "react-native-paper";
const Button = (props) => {
  return (
    <PaperButton
      {...props}
      style={[styles.button, props.style]}
      labelStyle={[styles.label, props.labelStyle]}
    >
      {props.children}
    </PaperButton>
  );
};

export default Button;

const styles = StyleSheet.create({
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
    fontFamily: "Inter_600SemiBold",
    padding: 8,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
});
