import { StyleSheet, Text, View, FlatList, TouchableOpacity, BackHandler } from "react-native";
import React from "react";
import { Avatar, Divider, TouchableRipple } from "react-native-paper";
import { chats as dummyChats } from "../../seeds/DummyData";
import { useState } from "react";
import { mainShadow } from "../../components/ui/ShadowStyles";
import "../../firebase/config";
import { collection, query, where, getDocs, addDoc, onSnapshot,getFirestore } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {getUserDataById} from '../../utils/user'
import { setChats } from "../../reducers/chats";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import  Animated, {  Easing, Value, timing, Keyframe,useShared , useAnimatedStyle } from 'react-native-reanimated';

import { Ionicons, AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { deleteChat } from "../../utils/chat";
const key3 = new Keyframe({
    0:{transform:[{translateX:60}]},
    80:{transform:[{translateX:30}]},
    100:{transform:[{translateX:0}],  easing: Easing.bezier(0, 0.55, 0.45, 1),}
  }).duration(100);
const key2 = new Keyframe({
    0:{transform:[{translateX:0}]},
    80:{transform:[{translateX:30}]},
    100:{transform:[{translateX:60}],  easing: Easing.bezier(0, 0.55, 0.45, 1),}
  }).duration(100);
const key4 = new Keyframe({
    0:{transform:[{translateX:0}]},
    80:{transform:[{translateX:200}]},
    100:{transform:[{translateX:400}],  easing: Easing.bezier(0, 0.55, 0.45, 1),}
  }).duration(200);

const Chat = ({ userData,navigation,chat, index, showDel, setShowDel }) => {
  const dispatch = useDispatch();
  const firestore = getFirestore();
  const [showDelThis, setShowDelThis] = useState(false)
  // const AnimIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);


  let [fontsLoaded] = useFonts({
   'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
   'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
  });
  console.log(chat)
  // console.log(uData.name);
  return (
    <>
      <Animated.View
      exiting={key4}
      style={{backgroundColor:index % 2 === 0?'#dedaff20':'#ffffff00', marginVertical:5}}
      >
        <TouchableRipple
          onLongPress={()=>{setShowDel(index);}}
          onPress={()=>{navigation.navigate('Chat', {userData, unr:chat.unr}); }}
          rippleColor="#a6a6a652"
        >
          <View style={styles.innerChatCard}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              {showDel==index?(<>
              <Animated.View
              entering={key3}
              exiting={key2}
              style={{position:'absolute', top:'10%', right:0, zIndex: 5, width:'100%', alignItems:'flex-end', height:'100%'}}
              >
                <TouchableOpacity
                  onPress={()=>{deleteChat(chat.doc_id)}}
                  style={{}} >
                   <MaterialCommunityIcons

                   name='close'
                   style={{shadowColor:'white', shadowRadius:2, textShadowRadius:15, backgroundColor:'#d5cefb00', textShadowColor:'#d5cefb50' }} size={40} color={'#d5cefb'}/>
                </TouchableOpacity>
                </Animated.View>
                </>):(<></>)}
              <Avatar.Image size={60} source={{ uri: userData.photo }} />
              <View style={{ marginStart: 10, flexGrow:1 }}>
                <Text style={{ color:'#f0f0f0' ,fontSize: 16, fontFamily: "Gilroy-ExtraBold" }}>
                   {chat.name}
                </Text>
                <Text
                  style={{
                    color: "#f0f0f0",
                    fontFamily: "Gilroy-Light",
                    marginTop: 10,
                  }}
                >
                  {chat.messages[(chat.messages.length-1)].text.substring(0, 20) + '...'}
                </Text>
              </View>
              <Text style={{alignSelf:'center'}}>{chat.unr>0?chat.unr:''}</Text>
            </View>
            {/* <Text style={{ color: "#aeaeae", fontFamily: "Inter_500Medium" }}>
              1 Day ago
            </Text> */}
          </View>
        </TouchableRipple>
      </Animated.View>
      </>
  );
};

const Chats = ({navigation}) => {

  const [chats2, setChats] = useState();
  const uData = useSelector((state) => state.user.userData);
  const chatssss = useSelector((state) => state.chats.chats);
  const [showDel, setShowDel] = useState(-1);
  useEffect(()=>{
    const backAction = ()=>{setShowDel(-1); return true}
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction );
    const asFn= async ()=>{
    const db = getFirestore();
    const q = query(
    collection(db, "chats"),
     where("users", "array-contains", uData.uid),
     where("messages", "!=", [])
    );
    //
const  unsubscribe = onSnapshot(q, (querySnapshot)=>{
  let chats3 = [];
  querySnapshot.forEach(async(doc)=>{

    let user;
    if(uData.uid!=doc.data().users[1]){
   user = await getUserDataById(doc.data().users[1])}
   else{
    user = await getUserDataById(doc.data().users[0])
   }
  //  console.log(user);
  let document = doc.data();
  let unRead = 0;
  document.messages.forEach(element => {
    if(element.unread==true&&element.sender_id==user.uid){unRead+=1}
  });
  document.unr = unRead;
  document.name = user.name;
  document.id = user.uid;
  document.photo = user.photos[0];
  document.doc_id = doc.id;
  // console.log(document);
  chats3.push(document);



  setChats(chats3);
  })
})



    }

    asFn();
    return () => backHandler.remove();
  },[chatssss])

  // const [chats, setChats] = useState(dummyChats);
  //  console.log(chats2);
  return (

    <View

      style={{
        overflow:'hidden',
        // borderWidth:2,
        flex: 1,
        marginHorizontal:20,
        backgroundColor: "#ffffff10",
        marginTop: 30,
        borderRadius: 25,
        // borderTopEndRadius: 25,
        overflow: "hidden",
      }}
    >
      <LinearGradient
      colors={['#f9f9f9', '#bbbbff60','#bbbbff20','#bbbbff10','#bbbbff00','#ffffff00','#ffffff00','#ffffff00']}
      style={{
        opacity:0.8,
        // ...mainShadow,
        position:'absolute',
        top:0,
        left:0,
        // marginHorizontal:20,
        width:'100%',
        height:100,
        backgroundColor: "#ffffff00",
        // borderWidth:1,
        borderTopStartRadius: 25,
        borderTopEndRadius: 25,
        overflow: "hidden",
      }}
    ></LinearGradient>
      <FlatList
        contentContainerStyle={{ paddingBottom: 30}}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={chats2}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => <Chat showDel={showDel} setShowDel={setShowDel} chat={item} index={index} navigation={navigation} userData={{photo: item.photo, name: item.name, uid:item.id}}/>}
      />
    </View>

  );
};

export default Chats;

const styles = StyleSheet.create({
  outerChatCard: {
    backgroundColor: "white",
    borderRadius: 24,
  },
  innerChatCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 24,
    padding: 20,

  },
});
