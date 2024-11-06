import { StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity, Alert, Modal } from "react-native";
import React, {useEffect, useRef, useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Button from "../../components/ui/Button";
import { mainShadow } from "../../components/ui/ShadowStyles";
import { useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useKeenSliderNative } from 'keen-slider/react-native';
import { useDispatch } from "react-redux";
import { setUserData } from '../../reducers/user';
import { getUserDataById } from "../../utils/user";
import { getClubDataByName } from "../../utils/club";
import AppSlider from '../../components/ui/appSlider'
import axios from 'react-native-axios';
import { BlurView } from 'expo-blur';
import * as Progress from 'react-native-progress';
import { Shadow } from "react-native-shadow-2";

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  getFirestore,
  collection,
  query,
  where,
  updateDoc
} from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from "expo-font";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { icon, Anticon, Entypoicon } from "./Profile";
import { AntDesign } from '@expo/vector-icons';

const User = ({route}) => {
  const navigation = useNavigation();
//   const showSignupScreen = () => {
//     requestAnimationFrame(() => {
//       navigation.navigate("SignupScreen");
//     });
//   };
const userData = route.params.people;
const [user, setUser]= useState(userData);
const [prog, setProg]= useState(0);
const [modal,setModal] = useState(false);
const [loading,setLoading] = useState(false);
const [refresh, setResfresh] = useState(false);
const dispatch = useDispatch();
const [sliderInstance, setSliderInstance] = useState(null);

useEffect(()=>{
  const asfn = async()=>{
  let user1 = await getUserDataById(userData.uid);
  setUser(user1);
  }
  asfn();
},[])

//////////////////////////////
const gift = async ()=>{
  if(userData.club==''){
    Alert.alert('Извините','Этот пользователь не находится в клубе');
    return false
  }else{

    let club = await getClubDataByName(user.club);
    // console.log(club);
    navigation.navigate('Club',{club:club, screen:'Bar', params:{ gift:user.uid}})
  }
}
let [fontsLoaded] = useFonts({
  'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
  'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),

  'Gilroy-Semibold': require('../../fonts/Gilroy-Semibold.ttf'),
 });


// console.log(userData.photos.length)


const [uri, setUri] = useState();




return (

    <SafeAreaView style={styles.rootContainer}>
      <View style={styles.topSection}>
      <Modal
      visible={modal}
      transparent={true}
      animationType='fade'

      >
          <BlurView intensity={50} tint='dark' style={{flex:1, justifyContent:'center', alignItems:'center'}}>

          </BlurView>
      </Modal>{user.photos&&user.photos.length!=0?(<>
      <AppSlider
        itsMy={false}
        setInstance={setSliderInstance}
        userData={user}
        /></>):(<>
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <Text style={{fontSize:30, color:'#ffffff', height:300}}>Подождите</Text>
        </View>
          </>)}

       <View style={{justifyContent:'center', alignItems:'center'}}>
        <Text style={{textAlign:'center', fontFamily:'Gilroy-Semibold', color:'#f0f0f0', fontSize:20}}>{user.name}</Text>
        <View style={{flexDirection:'row', flexWrap:'wrap',  width:'80%', justifyContent:'space-around'}}>
        <View>
        {icon({name:'chatbox', press:()=>{navigation.navigate('Chat', {userData:user})}})}
        </View>
        <View>
        {Anticon({name:'gift', press:()=>{gift()}})}
        {/* {icon({name:'log-out-outline', press:()=>{signOut(getAuth())}})} */}
        </View>
        </View>
        </View>
      </View>

    </SafeAreaView>

);
};

export default User;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  chatBtn:{

    marginTop:10,
    backgroundColor:'#ffffff00',
    borderWidth:1,
    borderColor:'#d5cefb70',
    borderRadius:50,
    height:100,
    overflow:'hidden',
    width:100,
    alignItems:'center',
    justifyContent:'center'
  },
  topSection: {
      paddingTop:0,
     flexGrow: 1,
    // flexDirection:'column',
    // width: "100%",
    // height:'30%',
    // textAlign:'center'
    //  alignContent:'center',
    // justifyContent:'center'
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

