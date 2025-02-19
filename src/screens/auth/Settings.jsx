import { StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import React, {useRef, useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { mainShadow } from "../../components/ui/ShadowStyles";
import { useSelector } from "react-redux";


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
  updateDoc,
  deleteDoc,
  deleteField
} from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from "expo-font";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { mainTheme } from "../../config/theme";


const db = getFirestore();
const icon = ({name, press}) =>{
  return(
    <TouchableOpacity style={styles.chatBtn} onPress={press}>
           <Ionicons name={name}  style={{shadowColor:'white', shadowRadius:5, textShadowRadius:25, backgroundColor:'#d5cefb10', textShadowColor:'#d5cefb', width:'100%', height:'100%', verticalAlign:'middle', textAlign:'center'}} size={50} color={'#d5cefb'}/>
    </TouchableOpacity>
  )
}
const Settings = ({route}) => {
  
  const userData = useSelector((state) => state.user.userData);

  //////////////////////////////
  
  let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),

    'Gilroy-Semibold': require('../../fonts/Gilroy-Semibold.ttf'),
   });

const checkCode = async (code)=>{
  
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
  const fireMe = async()=>{
    console.log('t')
    ////////////// удаляем должнасть
    const q = query(
      collection(db, "staff")
      ,where('uid', '==', userData.uid)
      )
      
    const docsSnapshot =await getDocs(q)
    console.log(docsSnapshot)
    docsSnapshot.forEach(async snapshot=>{
      // const doc = doc(db, 'staff', snapshot.id)
      console.log(snapshot.id)
      await deleteDoc(doc(db, 'staff', snapshot.id))
    })
   
    ///////    удаляем мою роль
    const docRef = doc(db, "users", userData.uid);
          await updateDoc(docRef, {
            role: deleteField()
          })
  }
  return (

      <SafeAreaView style={styles.rootContainer}>
        <View style={styles.topSection}>
          <View style={{justifyContent:'center', alignItems:'center'}}>
          <Text style={{fontSize:18}}>Работа</Text>
          {!userData.role?
          <>
            <Text>
              введите код от работодателя что бы начать принимать заказы
            </Text>
            <TextInput
              onChangeText={(text)=>{if(text.length==6){checkCode(text)}}} 
              keyboardType='number-pad' 
              placeholder="код магазина" 
              style={styles.codeInput} 
              maxLength={6}
            />
            <TouchableOpacity style={styles.Button} onPress={()=>{Alert.alert('Вы уверены?', '', [{text:'Да', onPress:()=>{fireMe()}}, {text:'Нет, еще поработаю', onPress:()=>{}}])}}>
              <Text>Хочу доставлять заказы</Text>
            </TouchableOpacity>
          </>
          :
          userData.role=='bar'?
            <>
            <Text>Что бы перестать принимать заказы в этом магазине нажмите:</Text>
            <TouchableOpacity style={styles.codeInput} onPress={()=>{Alert.alert('Вы уверены?', '', [{text:'Да', onPress:()=>{fireMe()}}, {text:'Нет, еще поработаю', onPress:()=>{}}])}}>
              <Text>Уволится</Text>
            </TouchableOpacity>
            </> 
            :userData.role=='delivery'
            ?<>
            
            <TouchableOpacity style={styles.Button} onPress={()=>{Alert.alert('Вы уверены?', '', [{text:'Да', onPress:()=>{fireMe()}}, {text:'Нет, еще поработаю', onPress:()=>{}}])}}>
            <Text>Больше не хочу доставлять заказы</Text>
            </TouchableOpacity>
            </>
            
          :null
          }
          
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
  codeInput: { 
    borderWidth:1,
    fontSize: 26, 
    marginVertical: 30, 
    borderRadius:15,
    alignContent:'center',
    paddingVertical:15,
    paddingHorizontal:10
   
  },
  Button: { 
    borderWidth:1,
    fontSize: 26, 
    marginVertical: 30, 
    borderRadius:15,
    alignContent:'center',
    paddingVertical:15,
    paddingHorizontal:10,
    backgroundColor:'#bbb'
   
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
      paddingTop:30,
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
