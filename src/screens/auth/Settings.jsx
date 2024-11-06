import { StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity, Alert, Modal } from "react-native";
import React, {useRef, useState} from "react";
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
import AppSlider from '../../components/ui/appSlider'
import axios from 'react-native-axios';
import { BlurView } from 'expo-blur';
import * as Progress from 'react-native-progress';
import { Shadow } from "react-native-shadow-2";

import {
  doc,
  getDoc,
  getDocs,
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
import { TextInput } from "react-native-paper";


const icon = ({name, press}) =>{
  return(
    <TouchableOpacity style={styles.chatBtn} onPress={press}>
           <Ionicons name={name}  style={{shadowColor:'white', shadowRadius:5, textShadowRadius:25, backgroundColor:'#d5cefb10', textShadowColor:'#d5cefb', width:'100%', height:'100%', verticalAlign:'middle', textAlign:'center'}} size={50} color={'#d5cefb'}/>
    </TouchableOpacity>
  )
}
const Settings = ({route}) => {
  const [code, setCode] = useState();
  const [prog, setProg]= useState(0);
  const [modal,setModal] = useState(false);
  const [loading,setLoading] = useState(false);
  const [refresh, setResfresh] = useState(false);
  const dispatch = useDispatch();
  const [sliderInstance, setSliderInstance] = useState(null);
  const userData = useSelector((state) => state.user.userData);

  //////////////////////////////
  
  let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),

    'Gilroy-Semibold': require('../../fonts/Gilroy-Semibold.ttf'),
   });

const checkCode = async (code)=>{
  const db = getFirestore();
    const q = query(
    collection(db, "staff")
    ,where('code', '==', code*1)
    );

    const querySnapshot = await getDocs(q);
if(querySnapshot.size==0){alert('Не верный код') }else{
       querySnapshot.forEach(async (d) => {
          console.log(d.id)
          const docRef = doc(db, "staff", d.id);
          await updateDoc(docRef, {
            uid: userData.uid,
            name: userData.name,
            token: userData.pushToken,
            code:''
          });
          const docRef2 = doc(db, "users", userData.uid);
          await updateDoc(docRef2, {
            role: 'bar',
            roleClub: d.data().club
          })

        });

        Alert.alert('Отлично', 'теперь вы можете принимать заказы');
}


}

  // console.log(userData.photos.length)





  console.log(userData)
  return (

      <SafeAreaView style={styles.rootContainer}>
        <View style={styles.topSection}>
        <Modal
        visible={modal}
        transparent={true}
        animationType='fade'

        >
            <BlurView intensity={50} tint='dark' style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            {loading?(<>
              <Progress.Bar height={2} width={250} borderRadius={2} useNativeDriver={true} color={'white'} animationType="spring" progress={prog} />

            </>):(<></>)}
            </BlurView>
        </Modal>

         <View style={{justifyContent:'center', alignItems:'center'}}>
          <View style={{flexDirection:'row', flexWrap:'wrap',  width:'80%', justifyContent:'space-around'}}>

         

          </View>
          {userData.role&&userData.role!=''?(<></>):(<>
          <TextInput onChangeText={(text)=>{console.log(text); if(text.length==6){checkCode(text)}}} keyboardType='number-pad' placeholder="код магазина" style={{fontSize:26, marginVertical:30, borderTopLeftRadius:15, borderTopRightRadius:15, borderBottomLeftRadius:15, borderBottomRightRadius:15}} maxLength={6}/>
</>)}
          </View>
        </View>

      </SafeAreaView>

  );
};

export default Settings;

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
      paddingTop:100,
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
