import { StyleSheet, Text, View, ImageBackground, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Button from "../components/ui/Button";
import { mainShadow } from "../components/ui/ShadowStyles";
const WelcomeScreen = () => {
  const navigation = useNavigation();
  const showSignupScreen = () => {
    requestAnimationFrame(() => {
      navigation.navigate("SignupScreen");
    });
  };
  return (
    <SafeAreaView style={styles.rootContainer}>
        <View style={styles.topSection}>
          <View style={styles.imageContainers}>
            <Image
              style={styles.image}
              source={require("../../assets/john.png")}
            />
            <Image
              style={styles.image}
              source={require("../../assets/john.png")}
            />
            <Image
              style={styles.image}
              source={require("../../assets/john.png")}
            />
            <Image
              style={styles.image}
              source={require("../../assets/john.png")}
            />
          </View>
        </View>
        <View style={styles.bottomSection}>
          <View style={styles.bottomSectionContent}>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 20,
                textAlign: "center",
              }}
            >
              Enjoy the new experience of chating with global friends
            </Text>
            <Text
              style={{
                marginVertical: 10,
                fontFamily: "Inter_600SemiBold",
                textAlign: "center",
                color: "#a9a9a9",
              }}
            >
              Connect people around the world for free
            </Text>
            <Button
              uppercase={false}
              style={styles.button}
              mode="contained"
              onPress={showSignupScreen}
            >
              Get Started
            </Button>
            <Text
              style={{
                fontSize: 12,
                marginVertical: 10,
                fontFamily: "Inter_600SemiBold",
                textAlign: "center",
                color: "#a9a9a9",
              }}
            >
              Powerd By Codby
            </Text>
          </View>
        </View>
      </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  topSection: {
    flex: 3,
    width: "100%",
  },
  imageContainers: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  image: {
    margin: 20,
    width: "40%",
    height: "40%",
  },
  bottomSection: {
    ...mainShadow,
    paddingHorizontal: 20,
    borderTopStartRadius: 40,
    borderTopEndRadius: 40,
    backgroundColor: "#fff",
    width: "100%",
    flex: 2,
    alignItems: "center",
  },
  bottomSectionContent: {
    padding: 30,
  },
});
