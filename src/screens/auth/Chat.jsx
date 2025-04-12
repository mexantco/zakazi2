import { StyleSheet, FlatList, Text, View, TouchableOpacity, ImageBackground } from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "../../constants/Colors";
import TextInput from "../../components/ui/TextInput";
import { IconButton, Avatar, ActivityIndicator } from "react-native-paper";
import { useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addDoc, and, doc, getDocs, or, setDoc, updateDoc } from "firebase/firestore";
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
const Chat = ({ navigation, uid, unr, order, modal, active, mode, route }) => {
  const user_id = uid||route.params.uid
  const allMessages = useSelector((state) => state.chats.chats);
  // console.log(allMessages)
  const userData = useSelector((state) => state.user.userData);
  //  console.log(userData);
  const [loaded, setLoaded] = useState(false)
  const [messages, setMessages] = useState([]);
  // console.log('messages')
  // console.log(messages)
  const [messageText, setMessageText] = useState("");
  const[docref, setDoc] = useState(null)
  let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
   });
   useEffect(()=>{
    let messageInChat = [];
    allMessages.forEach((value, index) => {
      
    if (value.users.includes(order||user_id)) {

      messageInChat.push(value.messages);

      setMessages(messageInChat[0]);
    }})},[allMessages])

console.log(allMessages)
console.log(userData.uid)
const dispatch = useDispatch();
  const firestore = getFirestore();
  const [usData, setUsData] = useState();

  useEffect(() => {
    
    const getData = async()=>{
      
      setLoaded(false)
      const q = query(
        collection(firestore, "chats"),
        or
        (where("users", "==", [user_id,order||userData.uid]),where("users", "==", [order||userData.uid,user_id]))
        
      );
      try{
        const docs = await getDocs(q)
        console.log('docs')
        console.log(docs)
      }catch(e){
        console.log(e)
      }
      const doc = await getChatBetweenTwo(user_id, order?order:userData.uid);
      // console.log('doc')
      // console.log(doc)
      setDoc(doc)
      const unsubscribe =  onSnapshot(q,  async (querySnapshot) => {
        console.log('querySnapshot.size')
        console.log(querySnapshot.size)
        const messages = [];
        querySnapshot.forEach((document) => {
          setDoc(document)
          messages.push(document.data());
        });
        
         dispatch(
          setChats({
            chats: messages,
          })
          
        );
        if(messages[0].messages.some(el=>el.unread==true)){
          // await markAllReaded(doc.id, uid);
        }
      });
        
      if(doc==null){ setLoaded(true); return}
      await markAllReaded(doc.id, user_id);
      setLoaded(true);
      
      
    }
    
    getData()
    
  }, []);


  const sendMessage = async () => {
    
    requestAnimationFrame(async () => {
      if (messageText === "") {
        return;
      }

      console.log('===================')
      console.log(user_id)
      console.log(order)
      console.log(userData.uid)
      console.log(docref)
      // return
      if(!docref){
            await addDoc(collection(firestore, "chats"), {
              messages: [{ text: messageText, sender_id: order?order:userData.uid, unread:true }],
              users: [user_id, order?order:userData.uid],
              order: order||user_id
            });
            
            return
          }


     await updateDoc(doc(firestore, 'chats', docref.id), {
        messages: [
          ...messages,
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
        {loaded?(<>
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={()=>
            <View style={{flexGrow:1, paddingBottom:50, transform: [{scaleX: -1}, {scaleY: -1}], justifyContent:'center', alignItems:'center'}}>
              <Text style={{color:'#bbb'}}>Чат {user_id=='support'?'с поддержкой':'заказа' } пуст</Text>
            </View>}
          data={messages}
          inverted
          contentContainerStyle={{ flexDirection: "column-reverse"}}
          keyExtractor={(item, index) => index}
          renderItem={({ item }) => <Message order={order} message={item} />}
        /></>):(<>
        <ActivityIndicator style={{flex:1, alignSelf:'center', verticalAlign:'middle'}}/>
        {/* <Text style={{alignSelf:'center', flex:1, verticalAlign:'middle'}}>Подождите</Text> */}
        </>)}

      </View>
      {mode!='view'&&
      (<View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <TextInput
            mode="flat"
            label={user_id=='support'?'Задайте вопрос поддержке.':"Напишите что то "+(order?'покупателю':'продавцу')} 
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
