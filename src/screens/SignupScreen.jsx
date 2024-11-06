import {
  View,
  StyleSheet,
  Text,
  Pressable,
  StatusBar,
  ImageBackground,
  Alert,
  Image
} from "react-native";
import { Card, Divider, HelperText, Snackbar } from "react-native-paper";
import TextInput from "../components/ui/TextInput";
import Button from "../components/ui/Button";
import { mainShadow } from "../components/ui/ShadowStyles";
import React, { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification,signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  doc,
  setDoc,
} from "firebase/firestore";

import { useDispatch } from "react-redux";
import { setUserDeviceToken } from "../utils/user";
const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
const initialValues = {
  name: { value: "", error: "" },
  email: { value: "", error: "" },
  password: { value: "", error: "" },
  confirm_password: { value: "", error: "" },
};
const SignupScreen = ({ navigation }) => {
  const [userInputs, setUserInputs] = useState(initialValues);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const dispatch = useDispatch();
  const auth = getAuth();
  const firestore = getFirestore();
  // const [CardAnimation] = useState(new Animated.Value(0));
  // inputs validation
  const onSubmit = () => {

    // signInAnonymously(auth);
    requestAnimationFrame(async () => {
      let error = false;
      if (userInputs.name.value === "") {
        setUserInputs((currInputs) => ({
          ...currInputs,
          name: {
            value: currInputs.name.value,
            error: "Please enter a valid name E.g: John Doe",
          },
        }));
        error = true;
      } else {
        setUserInputs((currInputs) => ({
          ...currInputs,
          name: {
            value: currInputs.name.value,
            error: "",
          },
        }));
      }
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

      if (
        userInputs.confirm_password.value !== userInputs.confirm_password.value
      ) {
        setUserInputs((currInputs) => ({
          ...currInputs,
          confirm_password: {
            value: currInputs.confirm_password.value,
            error: "Password and confirm password does not match",
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


     const userCred = createUserWithEmailAndPassword(
        auth,
        userInputs.email.value,
        userInputs.password.value
      )
        .then(async (response) => {
          console.log('++++++++++++++++')
          console.log(response)
          
          await sendEmailVerification(response.user.auth.currentUser);
          await setDoc(doc(firestore, "users", response.user.uid), {
            name: userInputs.name.value,
            uid: response.user.uid,
            ballance:0,
            club:'',
            photos:[],
            favourite:[],
            myClubs:[]
          });
            setUserDeviceToken(response.user.uid)
          // signInWithCredential(auth, response);

        })
        .catch((error) => {
          if (error.code == "auth/email-already-in-use") {
            setUserInputs((currInputs) => ({
              ...currInputs,
              email: {
                value: currInputs.email.value,
                error: "The email address is already in use",
              },
            }));
          } else if (error.code == "auth/invalid-email") {
            setUserInputs((currInputs) => ({
              ...currInputs,
              email: {
                value: currInputs.email.value,
                error: "The email address is not valid.",
              },
            }));
          } else if (error.code == "auth/operation-not-allowed") {
            setUserInputs((currInputs) => ({
              ...currInputs,
              email: {
                value: currInputs.email.value,
                error: "Operation not allowed.",
              },
            }));
          } else if (error.code == "auth/weak-password") {
            Alert.alert("The password is too weak.");
            setUserInputs((currInputs) => ({
              ...currInputs,
              password: {
                value: currInputs.password.value,
                error: "The password is too weak.",
              },
            }));
          }
          setButtonLoading(false);
        });
    });
  };
  function showLogin() {
    requestAnimationFrame(() => {
      navigation.navigate("LoginScreen");
    });
  }
  
  return (
    <View>
    <SafeAreaView>
        <Card style={[styles.form]}>
          <Card.Title
            title="Sign up"
            subtitle="Please fill out this form to create an account!"
          />
          <Divider />
          <Card.Content>
            <TextInput
              mode="flat"
              label="Username"
              autoComplete="name"
              style={styles.textInput}
              icon={<AntDesign name="user" size={24} color="black" />}
              error={userInputs.name.error !== ""}
              onChangeText={(text) =>
                setUserInputs((currInputs) => ({
                  ...currInputs,
                  name: { value: text, error: currInputs.name.error },
                }))
              }
            />
            {userInputs.name.error !== "" && (
              <HelperText type="error" visible={userInputs.name.error !== ""}>
                {userInputs.name.error}
              </HelperText>
            )}
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
            <TextInput
              mode="flat"
              label="Confirm Password"
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
              error={userInputs.confirm_password.error !== ""}
              onChangeText={(text) =>
                setUserInputs((currInputs) => ({
                  ...currInputs,
                  confirm_password: {
                    value: text,
                    error: currInputs.confirm_password.error,
                  },
                }))
              }
            />
            {userInputs.confirm_password.error !== "" && (
              <HelperText
                type="error"
                visible={userInputs.confirm_password.error !== ""}
              >
                {userInputs.confirm_password.error}
              </HelperText>
            )}
            <Button
              labelStyle={{ fontSize: 16 }}
              onPress={onSubmit}
              loading={buttonLoading}
              disabled={buttonLoading}
            >
              Sign up
            </Button>
            <Pressable
              onPress={showLogin}
              style={({ pressed }) => pressed && { opacity: 0.5 }}
            >
              <Text
                variant="displaySmall"
                style={{ textAlign: "center", color: "#670ee4" }}
              >
                Already have an account? Login now.
              </Text>
            </Pressable>
          </Card.Content>
        </Card>
      </SafeAreaView>
      <Snackbar
        visible={successMessageVisible}
        onDismiss={setSuccessMessageVisible.bind(false)}
        action={{
          label: "Okay",
          onPress: () => {
            setSuccessMessageVisible.bind(false);
          },
        }}
      >
        Successfully created an account.
      </Snackbar>
      </View>
  );
};

export default SignupScreen;

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
