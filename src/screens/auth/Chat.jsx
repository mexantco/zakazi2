import { StyleSheet, FlatList, Text, View, TouchableOpacity, ImageBackground } from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "../../constants/Colors";
import TextInput from "../../components/ui/TextInput";
import { IconButton, Avatar } from "react-native-paper";
import { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setDoc, updateDoc } from "firebase/firestore";
import { getChatBetweenTwo, markAllReaded } from "../../utils/chat";
import { getUserDataById} from "../../utils/user";
import { useFonts } from "expo-font";
import {
  onSnapshot,
  getFirestore,
  collection,
  query,
  where,
} from "firebase/firestore";
import { setChats } from "../../reducers/chats";
import { useFocusEffect } from "@react-navigation/native";


const Message = ({ message, order }) => {
  // console.log(message)
  let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
   });
  const userData = useSelector((state) => state.user.userData);
  return (
    <View
      style={[
        styles.defaultMessage,
        (message.sender_id === userData.uid||message.sender_id === order)&&message.unread==true
          ? styles.userMessageUnr:message.sender_id === userData.uid||message.sender_id === order ?styles.userMessage
          : styles.anotherMessage,
      ]}
    >
      <Text
        style={[
          { fontSize: 16, fontFamily: "Gilroy-Light" },
          (message.sender_id === userData.uid||message.sender_id === order)&&message.unread==true
          ? {color:"black"}:message.sender_id === userData.uid||message.sender_id==order?{color:"white"}
          : {color:"black"},
        ]}
      >
        {message.text}
      </Text>
    </View>
  );
};
const Chat = ({ navigation, uid, unr, order, modal, active, mode }) => {
  let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
   });

const dispatch = useDispatch();
  const firestore = getFirestore();
  const [usData, setUsData] = useState();
   
  // const uid = route.params.userData.uid;
  // const unr = route.params.unr;
  
  // requestAnimationFrame(async()=>{


  // })
  useLayoutEffect(() => {

    const getData = async()=>{
      setLoaded(false)
      const doc = await getChatBetweenTwo(uid, order?order:userData.uid);
      await markAllReaded(doc.id, uid);
      const userD = await getUserDataById(uid);

      let photo = userD.photos[0];


      if(order){
        const q = query(
          collection(firestore, "chats"),
          where("users", "array-contains", order)
        );
        const unsubscribe = await onSnapshot(q,  (querySnapshot) => {
          const messages = [];
          querySnapshot.forEach((doc) => {
            messages.push(doc.data());
          });
          

           dispatch(
            setChats({
              chats: messages,
            })
            
          );
          setLoaded(true);

        });

        // onAuthStateChanged(auth, async (user) => {
        //   if (!user) {
        //     unsubscribe();
        //   }
        // });
      }
      
    }
    
    getData()

  }, []);

  const allMessages = useSelector((state) => state.chats.chats);

  const userData = useSelector((state) => state.user.userData);
  //  console.log(userData);
  const [loaded, setLoaded] = useState(false)
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  
  useEffect(() => {
   
    const messageInChat = [];
    allMessages.forEach((value, index) => {
      
      if (value.users.includes(uid)) {

        messageInChat.push(value.messages);

        setMessages(messageInChat[0]);
      }



    });
    const asfn = async()=>{
    const doc = await getChatBetweenTwo(uid, order?order:userData.uid);
    setLoaded(true)
    await markAllReaded(doc.id, uid);

    }
   
    asfn();
  }, [allMessages]);  

  const sendMessage = () => {
    requestAnimationFrame(async () => {
      if (messageText === "") {
        return;
      }

      const doc = await getChatBetweenTwo(uid, order?order:userData.uid);

      await updateDoc(doc.ref, {
        messages: [
          ...doc.data().messages,
          { text: messageText, sender_id: order?order:userData.uid, unread:true },
        ],

      });
    });
    setMessageText("");
  };
  
  return (

    <View
    
     style={[styles.rootContainer,
      // {bottom:active?'30%':'-100%'}
      ]}>
      <View
        style={{
          position: "absolute",

          height: "100%",
        }}
      ></View>
      <View style={styles.chatbox}>
        {loaded?(<><FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={messages}
          inverted
          contentContainerStyle={{ flexDirection: "column-reverse" }}
          keyExtractor={(item, index) => index}
          renderItem={({ item }) => <Message order={order} message={item} />}
        /></>):(<><Text style={{alignSelf:'center', flex:1, verticalAlign:'middle'}}>Подождите</Text></>)}

      </View>
      {mode!='view'&&
      (<View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <TextInput
            mode="flat"
            label="Напишите что то"
            value={messageText}
            onChangeText={setMessageText}
          />
        </View>
        <View>
          <IconButton
            size={24}
            icon="send"
            iconColor={Colors.primary600}

            onPress={sendMessage}
          />
        </View>
      
      </View>)}
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  rootContainer: {
    justifyContent: "space-between",
    // height:'50%',
    flexGrow:1,
    width:'100%',
    borderWidth:0,
    borderColor:'#bbb',
    backgroundColor:'#f4f4f4',
    paddingHorizontal: 15,
    
    borderRadius:20,
    // position:'absolute',
  },
  chatbox: {
    flex: 5,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultMessage: {
    margin: 10,
    padding: 20,
  },
  userMessage: {
    borderTopStartRadius: 25,
    borderTopEndRadius: 25,
    borderBottomStartRadius: 25,
    alignSelf: "flex-end",
    backgroundColor: Colors.primary600,
  },
  userMessageUnr: {
    borderTopStartRadius: 25,
    borderTopEndRadius: 25,
    borderBottomStartRadius: 25,
    alignSelf: "flex-end",
    borderWidth:2,
    borderColor: Colors.primary600,
  },
  anotherMessage: {
    borderTopStartRadius: 25,
    borderTopEndRadius: 25,
    borderBottomEndRadius: 25,
    alignSelf: "flex-start",
    backgroundColor: "#d1d1d1",
  },
});
