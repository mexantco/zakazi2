import { StyleSheet, Text, View, FlatList } from "react-native";
import React from "react";
import { Avatar, Divider, TouchableRipple } from "react-native-paper";
import { chats as dummyChats } from "../../seeds/DummyData";
import { useState } from "react";
import { mainShadow } from "../../components/ui/ShadowStyles";
import "../../firebase/config";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {getUserDataById} from '../../utils/user'
import { LinearGradient } from "expo-linear-gradient";
import  Animated, {useSharedValue, interpolate, useAnimatedStyle, withTiming, Easing, withDelay, withDecay, interpolateColor} from 'react-native-reanimated';
import { useNavigation } from "@react-navigation/native";

const People = ({ navigation,people }) => {
    const uData = useSelector((state) => state.user.userData);
   if(people.uid==uData.uid){return false}

  // console.log(uData.name);
  return (
    <>
      <View>
        <TouchableRipple
          onPress={()=>{navigation.navigate('User', {people})}}
          rippleColor="#a6a6a652"
        >
          <View style={styles.innerChatCard}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <Avatar.Image size={60} source={{ uri: people.photos[0] }} />
              <View style={{ marginStart: 10, flexDirection:'row' }}>
                <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", alignSelf:'center' }}>
                   {people.name}
                </Text>

              </View>
            </View>
            {/* <Text style={{ color: "#aeaeae", fontFamily: "Inter_500Medium" }}>
              1 Day ago
            </Text> */}
          </View>
        </TouchableRipple>
      </View>
      </>
  );
};

const Users = ({navigation, clubName, opacity}) => {
  const cid = clubName;
  // const AnimStyle = useAnimatedStyle(()=>{
  //   return{opacity: interpolate(opacity, [-500, -350, -200,0], [0, 1, 0,0])}
  // })
  // const navigation = useNavigation();
  const [people, setUsers] = useState();
  const uData = useSelector((state) => state.user.userData);
  useEffect(()=>{
    const asFn= async ()=>{
    const db = getFirestore();
    const q = query(
    collection(db, "users")
    ,where("club", "==", cid)
    );
const querySnapshot = await getDocs(q);
let users = [];
await querySnapshot.forEach(async (doc) => {

 let document = doc.data();

users.push(document);
setUsers(users);
// console.log(users)
navigation.setOptions({title:'Людей в клубе: '+users.length})
});


    }

    asFn();
  },[])

  // const [chats, setChats] = useState(dummyChats);
  // console.log(chats2);
  return (
    <Animated.View

      style={[{

        marginHorizontal:15,
        ...mainShadow,
        flex: 1,
        backgroundColor: "#ffffff10",
        elevation:0,
        marginTop: 30,
        borderTopStartRadius: 25,
        borderTopEndRadius: 25,
        overflow: "hidden",
      }]}
    >

      {uData.club!=''?(<><FlatList
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={people}
        keyExtractor={(item, index) => index}
        renderItem={({ item }) => <People people={item} navigation={navigation} />}
      /></>):(<><Text>Вы должны быть в клубе что бы посмотреть кто из пользователей тоже в клубе.</Text></>)}

    </Animated.View>
  );
};

export default Users;

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
