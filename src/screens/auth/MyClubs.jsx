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

const db = getFirestore();

const Club = ({ navigation,club, index, copy }) => {
 
  if(club==copy){return false}
  // const db = getFirestore();
  //   const uData = useSelector((state) => state.user.userData);
  
  const [clubData,setClubdata] = useState(null)
  const handleSelect = async()=>{
    
    if(copy){
      
      await handleCopy()
    }else{
      let res = await getClubDataById(club); 
      
      navigation.navigate('Club', {club:res})
    }
  }
  const handleCopy = async ()=>{
    const data = await getClubDataById(club )
    
    const docRef = doc(db, 'club', copy)
    await updateDoc(docRef,{
      bar:[...data.bar]
    })
    navigation.pop()
  }
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
  if(clubData==null){return false}
  return (
    <>
      <View style={{backgroundColor:!index % 2 === 0?'#ffffff20':'#ffffff00'}}>
        <TouchableRipple
          onPress={async ()=>{handleSelect()}}
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
  const {copy, choose}=route.params
  
  const clubs = useSelector((state) => state.user.userData.myClubs);
console.log(clubs)
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
      <Text style={{textAlign:'center', marginVertical:15}}>{choose?'Выберите магазин':'Ваши магазины'}</Text>
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
        <Club  club={item} index={index+1} navigation={navigation} copy={copy} />}
      /></>):(<><Text>У вас нет магазинов</Text></>)}

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
