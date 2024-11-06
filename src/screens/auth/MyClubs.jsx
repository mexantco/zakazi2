import { StyleSheet, Text, View, FlatList, ImageBackground, TouchableOpacity, Alert, Clipboard } from "react-native";
import React from "react";
import { Avatar, Divider, TouchableRipple } from "react-native-paper";
import { chats as dummyChats } from "../../seeds/DummyData";
import { useState } from "react";
import { mainShadow } from "../../components/ui/ShadowStyles";
import "../../firebase/config";
import { collection, query, where, getDoc, addDoc, onSnapshot, updateDoc, doc, getDocs, deleteDoc  } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {getUserDataById} from '../../utils/user'
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { getClubDataById } from "../../utils/club";


const Club = ({ navigation,club, index }) => {
  // const db = getFirestore();
  //   const uData = useSelector((state) => state.user.userData);
  const [clubData,setClubdata] = useState(null)
  
  useEffect(()=>{
   const  asFn = async ()=>{
    let res = await getClubDataById(club);
    setClubdata(res)
  }
    asFn()
  },[])
   let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
    'Gilroy-Regular': require('../../fonts/Gilroy-Regular.ttf'),
    'Gilroy-Semibold': require('../../fonts/Gilroy-Semibold.ttf'),
   });
  console.log(clubData);
  if(clubData==null){return false}
  return (
    <>
      <View style={{backgroundColor:!index % 2 === 0?'#ffffff20':'#ffffff00'}}>
        <TouchableRipple
          onPress={async ()=>{let res = await getClubDataById(club); console.log(res); navigation.navigate('Club', {club:res})}}
          rippleColor="#a6a6a652"
        >
          <View style={styles.innerChatCard}>
            <View style={{ flex: 1, flexDirection: "row" }}>

              <View style={{ width:'90%', marginStart: 10, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                <Text style={{ fontSize: 16, fontFamily: "Gilroy-Regular", alignSelf:'center', color:'#000' }}>
                   {clubData.ruName}
                </Text>
              </View>
            </View>
           
          </View>
        </TouchableRipple>
      </View>
      </>
  );
};

const MyClubs = ({navigation, route}) => {
  const clubs=route.params.clubs
  
  
//   const uData = useSelector((state) => state.user.userData);
//   useEffect(()=>{

//     const db = getFirestore();
//     const asFn= async ()=>{
//       const q = query(
//         collection(db, "staff")
//         ,where('club', '==', cid)
//         );
//         const querySnapshot = await getDocs(q);
//         const unsubscribe = onSnapshot(q, (querySnapshot)=>{
//           let staffArr = [];
//           querySnapshot.forEach((d)=>{
//           if(d.data().name){
//             let doc = d.data();
//             doc.id = d.id;
//           staffArr.push(doc);}
//         })
//         setStaff(staffArr);
//         })


//     }

//     asFn();
//   },[])

  // const [chats, setChats] = useState(dummyChats);
  // console.log(chats2);
  return (
    <View

      style={{
        marginHorizontal:15,
        ...mainShadow,
        flex: 1,
        backgroundColor: "#ffffff10",
        elevation:0,
        marginTop: 30,
        borderTopStartRadius: 25,
        borderTopEndRadius: 25,
        overflow: "hidden",
      }}
    >
    {/* <TouchableOpacity
            onPress={()=>{addBarmen()}}
            style={{
              height:50,
              justifyContent:'center',
              alignItems:'center',
              backgroundColor:'#ffffff30',
              borderWidth:2, borderColor:'#d5cefb70',
              paddingHorizontal:15, marginVertical:15}}>
                <Text style={{color:'#000'}}>Добавить продавца</Text>
    </TouchableOpacity> */}
      {clubs&&clubs.length>0?(<>
      <FlatList
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={clubs}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => 
        <Club club={item} index={index+1} navigation={navigation} />}
      /></>):(<><Text>Вы еще не добавили продавцов.</Text></>)}

    </View>
  );
};

export default MyClubs;

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
