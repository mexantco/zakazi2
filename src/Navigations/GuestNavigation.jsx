import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import SignupScreen from "../screens/SignupScreen";
import LoginScreen from "../screens/LoginScreen";
const Stack = createStackNavigator();
const GuestNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} /> */}
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default GuestNavigation;
