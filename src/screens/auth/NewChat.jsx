import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import { mainShadow } from "../../components/ui/ShadowStyles";
import { Card, HelperText } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { getUserDataByName } from "../../utils/user";
import { useSelector } from "react-redux";
const NewChat = () => {
  const user = useSelector((state) => state.user.userData);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const onSubmit = async () => {
    if (username === "") {
      setUsernameError("Please fill username field");
      return;
    }
    if (user.name === username) {
      setUsernameError("You can't send message to yourself");
      return;
    }
    setLoading(true);
    const userData = await getUserDataByName(username);
    setLoading(false);
    if (userData) {
      setUsernameError("");
      setUsername("");
      navigation.navigate("Chat", { userData: userData });
    } else {
      setUsernameError("Can't find this user");
    }
  };
  return (
    <View style={{ padding: 20 }}>
      <Card
        style={{ ...mainShadow, borderRadius: 30, backgroundColor: "#ebebeb" }}
      >
        <Card.Content>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, margin: 20 }}>
              <TextInput
                style={{ borderRadius: 14 }}
                label="Write Username here"
                onChangeText={setUsername}
                value={username}
              />
              <HelperText type="error" visible={usernameError !== ""}>
                {usernameError}
              </HelperText>
            </View>
            <View>
              <Button
                labelStyle={{ fontSize: 12 }}
                onPress={onSubmit}
                loading={loading}
              >
                Chat
              </Button>
            </View>
          </View>
          <View>
            <Text
              style={{ fontFamily: "Inter_400Regular", textAlign: "center" }}
            >
              E.g: John_a232
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

export default NewChat;

const styles = StyleSheet.create({});
