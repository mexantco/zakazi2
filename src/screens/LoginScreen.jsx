import {
  StyleSheet,
  Text,
  Pressable,
  StatusBar,
  ImageBackground,
  Alert,
} from "react-native";
import { Card, Divider, HelperText, Snackbar } from "react-native-paper";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import { mainShadow } from "../components/ui/ShadowStyles";
import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  signInWithEmailAndPassword,
  getAuth,
  signInWithCredential,
} from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUserData } from '../reducers/user'
import { setUserDeviceToken } from "../utils/user";
const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
const initialValues = {
  email: { value: "", error: "" },
  password: { value: "", error: "" },
};
const LoginScreen = ({ navigation }) => {
  const [userInputs, setUserInputs] = useState(initialValues);
  const [buttonLoading, setButtonLoading] = useState(false);
  const auth = getAuth();
  const dispatch = useDispatch();
  // const [CardAnimation] = useState(new Animated.Value(0));
  // inputs validation
  const onSubmit = () => {
    requestAnimationFrame(() => {
      let error = false;
      if (!validateEmail(userInputs.email.value)) {
        setUserInputs((currInputs) => ({
          ...currInputs,
          email: {
            value: currInputs.email.value,
            error: "Please enter a valid email address",
          },
        }));
        error = true;
      } else {
        setUserInputs((currInputs) => ({
          ...currInputs,
          email: {
            value: currInputs.email.value,
            error: "",
          },
        }));
      }
      if (userInputs.password.value.trim().length < 8) {
        setUserInputs((currInputs) => ({
          ...currInputs,
          password: {
            value: currInputs.password.value,
            error: "please enter a password with at least 8 characters",
          },
        }));
        error = true;
      } else {
        setUserInputs((currInputs) => ({
          ...currInputs,
          password: {
            value: currInputs.password.value,
            error: "",
          },
        }));
      }
      if (error) {
        return;
      }
      setButtonLoading(true);
      signInWithEmailAndPassword(
        auth,
        userInputs.email.value,
        userInputs.password.value
      )
        .then(async(response) => {

          let uData = response.user.uid;
          await dispatch(setUserData({ userData: { uData } }));
          
          await setUserDeviceToken(uData)
          signInWithCredential(auth, response);
        })
        .catch((error) => {
          if (error.code === "auth/user-not-found") {
            setUserInputs((currInputs) => ({
              ...currInputs,
              email: {
                value: currInputs.email.value,
                error: "User not found",
              },
            }));
          } else if (error.code === "auth/wrong-password") {
            setUserInputs((currInputs) => ({
              ...currInputs,
              email: {
                value: currInputs.email.value,
                error: "username or password is incorrect.",
              },
            }));
          }
          setButtonLoading(false);
        });
    });
  };

  function showSignup() {
    requestAnimationFrame(() => {
      navigation.navigate("SignupScreen");
    });
  }
  return (
        <SafeAreaView>
        <Card style={[styles.form]}>
          <Card.Title
            title="Login"
            subtitle="Please fill out this form to login!"
          />
          <Card.Content>
            <TextInput
              mode="flat"
              label="Email"
              style={styles.textInput}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              icon={
                <MaterialCommunityIcons
                  name="email-outline"
                  size={24}
                  color="black"
                />
              }
              error={userInputs.email.error !== ""}
              onChangeText={(text) =>
                setUserInputs((currInputs) => ({
                  ...currInputs,
                  email: { value: text, error: currInputs.email.error },
                }))
              }
            />
            {userInputs.email.error !== "" && (
              <HelperText type="error" visible={userInputs.email.error !== ""}>
                {userInputs.email.error}
              </HelperText>
            )}
            <TextInput
              mode="flat"
              label="Password"
              autoComplete="password"
              secureTextEntry={true}
              textContentType="password"
              icon={
                <MaterialCommunityIcons
                  name="form-textbox-password"
                  size={24}
                  color="black"
                />
              }
              style={styles.textInput}
              error={userInputs.password.error !== ""}
              onChangeText={(text) =>
                setUserInputs((currInputs) => ({
                  ...currInputs,
                  password: {
                    value: text,
                    error: currInputs.password.error,
                  },
                }))
              }
            />
            {userInputs.password.error !== "" && (
              <HelperText
                type="error"
                visible={userInputs.password.error !== ""}
              >
                {userInputs.password.error}
              </HelperText>
            )}
            <Button
              labelStyle={{ fontSize: 16 }}
              onPress={onSubmit}
              loading={buttonLoading}
              disabled={buttonLoading}
            >
              Login
            </Button>
            <Pressable
              onPress={showSignup}
              style={({ pressed }) => pressed && { opacity: 0.5 }}
            >
              <Text
                variant="displaySmall"
                style={{ textAlign: "center", color: "#670ee4" }}
              >
                Don't have an account? sign up now!
              </Text>
            </Pressable>
          </Card.Content>
        </Card>
      </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  form: {
    ...mainShadow,
    marginHorizontal: 20,
    borderRadius: 25,
  },
});
