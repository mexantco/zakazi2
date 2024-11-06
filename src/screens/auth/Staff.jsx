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

const roles = {
  'bar':'Продавец'
}
const People = ({ navigation,people, index }) => {
  const db = getFirestore();
    const uData = useSelector((state) => state.user.userData);
    const gotouser = async(id)=>{
        const uData = await getUserDataById(id);
        navigation.navigate('User', {people: uData});
    }
    const delSatff = async (id, uid)=>{
      await deleteDoc(doc(db, "staff", id));
      await updateDoc(doc(db, "users", uid), {
        role:'',
        roleClub:''
      })
    }
   if(people.uid==uData.uid){return false}

   let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
    'Gilroy-Regular': require('../../fonts/Gilroy-Regular.ttf'),
    'Gilroy-Semibold': require('../../fonts/Gilroy-Semibold.ttf'),
   });
  // console.log(uData.name);
  return (
    <>
      <View style={{backgroundColor:!index % 2 === 0?'#ffffff20':'#ffffff00'}}>
        <TouchableRipple
          // onPress={()=>{gotouser(people.uid);}}
          rippleColor="#a6a6a652"
        >
          <View style={styles.innerChatCard}>
            <View style={{ flex: 1, flexDirection: "row" }}>

              <View style={{ width:'90%', marginStart: 10, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                <Text style={{ fontSize: 16, fontFamily: "Gilroy-Regular", alignSelf:'center', color:'#000' }}>
                   {people.name}
                </Text>
                <Text style={{ color:'#000', fontFamily: "Gilroy-Regular"}}>{roles[people.role]}</Text>
                <TouchableOpacity onPress={()=>{Alert.alert('Вы уверенны?', '', [{text:'Удалить', onPress:()=>{delSatff(people.id, people.uid)}},{ text:'Нет', onPress:()=>{}}]) }}>
                  <Text style={{ color:'#000', fontFamily: "Gilroy-Regular"}}>удалить</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* <Text style={{ color: "#aeaeae", fontFamily: "Inter_500Medium" }}>
            {people.role}
            </Text> */}
          </View>
        </TouchableRipple>
      </View>
      </>
  );
};

const Staff = ({navigation, route}) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const cid = route.params.cid;
  const [staff, setStaff] = useState();
  const addBarmen = async()=>{
    const db = getFirestore();
    await addDoc(collection(db, "staff"), {
      code: otp,
      role: 'bar',
      club:cid,

    });
          Alert.alert('Продавец добавлен', 'Отправьте ему этот код. Сотрудник должен активировать код в настройках профиля. Код: '+otp, [{text:'Скопировать код', onPress:()=>{Clipboard.setString(''+otp);}}]);


  }

  const uData = useSelector((state) => state.user.userData);
  useEffect(()=>{

    const db = getFirestore();
    const asFn= async ()=>{
      const q = query(
        collection(db, "staff")
        ,where('club', '==', cid)
        );
        const querySnapshot = await getDocs(q);
        const unsubscribe = onSnapshot(q, (querySnapshot)=>{
          let staffArr = [];
          querySnapshot.forEach((d)=>{
          if(d.data().name){
            let doc = d.data();
            doc.id = d.id;
          staffArr.push(doc);}
        })
        setStaff(staffArr);
        })


    }

    asFn();
  },[])

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
    <TouchableOpacity
            onPress={()=>{addBarmen()}}
            style={{
              height:50,
              justifyContent:'center',
              alignItems:'center',
              backgroundColor:'#ffffff30',
              borderWidth:2, borderColor:'#d5cefb70',
              paddingHorizontal:15, marginVertical:15}}>
                <Text style={{color:'#000'}}>Добавить продавца</Text></TouchableOpacity>
      {staff&&staff.length>0?(<><FlatList
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={staff}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => <People people={item} index={index+1} navigation={navigation} />}
      /></>):(<><Text>Вы еще не добавили продавцов.</Text></>)}

    </View>
  );
};

export default Staff;

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
