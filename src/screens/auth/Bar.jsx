import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import React from "react";
import { Avatar, Divider, TouchableRipple } from "react-native-paper";
import { chats as dummyChats } from "../../seeds/DummyData";
import { useState } from "react";
import { mainShadow } from "../../components/ui/ShadowStyles";
import "../../firebase/config";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {getUserDataById} from '../../utils/user'
import { getClubDataById } from "../../utils/club";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Progress from 'react-native-progress';
import * as ImagePicker from 'expo-image-picker';

import {
  addDoc,
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
import { BlurView } from "expo-blur";
import { useFonts } from "expo-font";
import { ScrollView } from "react-native-gesture-handler";
import NumericInput from 'react-native-numeric-input'
import { setOrder } from '../../reducers/user';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Products from "../../components/ui/Products";
import Additions from "../../components/ui/Additions";



const Bar = ({navigation, route}) => {
  const dispatch = useDispatch();
  const cid = route.params.clubId;
  const owner = route.params.clubOwner;
  console.log(cid)
  const [isMy, setIsmy] = useState(false);
  const [modalUri, setModalUri]= useState();
  const [modalName, setModalName]= useState();
  const [modalOpis, setModalOpis]= useState();
  const [modalId, setModalId]= useState();
  const [modalCost, setModalCost]= useState();
  const [modal, setModal] = useState(false);
  const [num, setNum] = useState(1);
  const [uri, setUri] = useState();
  const [bar,setBar] = useState();
  const [people, setUsers] = useState();
  const [prog, setProg]= useState(0);
  const [modal2, setModal2] = useState(false);
  const [name,setName] = useState('');
  const [opis,setOpis] = useState('');
  const [cost,setCost] = useState(0);
  const [clubb, setClub] = useState();
  const [loading, setLoading] = useState(false);
  const [refresh,setRefresh] = useState(false);
  const db = getFirestore();
  const uData = useSelector((state) => state.user.userData);
  const order = useSelector((state) => state.user.order);
  const [orderArr, setOrderArr] = useState([]);
  
  const TopBar = createMaterialTopTabNavigator();
  useEffect(()=>{if(uData.uid==owner){setIsmy(true)}},[uData]);

  /////////////////
 

  // const [chats, setChats] = useState(dummyChats);
  
  return (
    <TopBar.Navigator>
      <TopBar.Screen name='Меню' component={Products} initialParams={{owner:owner, cid:cid}} />
      {isMy?<TopBar.Screen name='Добавки' component={Additions} initialParams={{owner:owner, cid:cid}} />:<></>}
    </TopBar.Navigator>
    
  );
};

export default Bar;

const styles = StyleSheet.create({
  outerChatCard: {
    backgroundColor: "white",
    borderRadius: 24,
  },
  input:{
    backgroundColor:'#fff',
    borderWidth:1,
    width:100
  },
  btnstyle:{
    marginVertical:10,
     width:150,
     height:50,
     backgroundColor:'#bbbbbb',
      borderRadius:15,
      justifyContent:'center',
      alignItems:'center'
  },
  textinfo:{
    marginVertical:5,
    fontFamily:'Gilroy-Regular',
    fontSize:18,
    color:'#ffffff'
  },
  btntextstyle: {
    color:'#ffffff',
    fontFamily:'Gilroy-ExtraBold',
    fontSize:18
  },
  innerChatCard: {
    flexDirection: "column",
    flex:1,
    width:150,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 24,
    padding: 20,
  },
  napText:{
    fontSize: 16,
    color: "#000",
    fontFamily: "Gilroy-Regular",
    flex: 1,            
  }
});
