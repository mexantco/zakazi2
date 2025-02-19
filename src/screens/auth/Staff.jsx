import { StyleSheet, Text, View, FlatList, ImageBackground, TouchableOpacity, Alert, Clipboard } from "react-native";
import React from "react";
import { Avatar, Divider, TouchableRipple } from "react-native-paper";
import { chats as dummyChats } from "../../seeds/DummyData";
import { useState } from "react";
import { mainShadow } from "../../components/ui/ShadowStyles";
import "../../firebase/config";
import { collection, query, where, getDoc, addDoc, onSnapshot, updateDoc, doc, getDocs, deleteDoc, deleteField  } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {getUserDataById} from '../../utils/user'
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import Button from "../../components/ui/Button";
import { mainTheme } from "../../config/theme";

const roles = {
  'bar':'Продавец'
}
const db = getFirestore();
const staffColleection = collection(db, "staff")

const delSatff = async (id, uid)=>{
  
  await deleteDoc(doc(db, "staff", id));
  await updateDoc(doc(db, "users", uid), {
    role:deleteField(),
    roleClub:deleteField(),
    staff_id: deleteField()
  })
}

const People = ({ navigation,people, index }) => {
  console.log(people)
    const uData = useSelector((state) => state.user.userData);
    const gotouser = async(id)=>{
        const uData = await getUserDataById(id);
        navigation.navigate('User', {people: uData});
    }
    
  //  if(people.uid==uData.uid){return false}

   let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
    'Gilroy-Regular': require('../../fonts/Gilroy-Regular.ttf'),
    'Gilroy-Semibold': require('../../fonts/Gilroy-Semibold.ttf'),
   });
  // console.log(uData.name);
  return (
    <>
      <View style={{backgroundColor:index % 2 === 0?'#ffffff50':'#bbbbbb20'}}>
        <TouchableRipple
        
          // onPress={()=>{gotouser(people.uid);}}
          rippleColor="#a6a6a652"
        >
          <View style={styles.innerChatCard}>
            <View >
              <View style={{ width:'100%', flexDirection:'row', justifyContent:'space-around', alignItems:'center' }}>
                <Text style={{ fontSize: 16,  width:150, marginLeft:5,fontFamily: "Gilroy-Regular", alignSelf:'center', color:'#000' }}>
                   {people.name}
                </Text>
                <View style={{flexDirection:'row', gap:10, justifyContent:'center', alignItems:'center'}}>
                  <Text style={{ color:'#000', fontFamily: "Gilroy-Regular"}}>{roles[people.role]}</Text>
                  <Button style={{padding:0}} labelStyle={{fontSize:14, padding:0}} onPress={()=>{Alert.alert('Вы уверенны?', '', [{text:'Удалить', onPress:()=>{delSatff(people.id, people.uid)}},{ text:'Нет', onPress:()=>{}}]) }}>удалить</Button>
                </View>
              </View>
            </View>
           
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
  const uData = useSelector((state) => state.user.userData);
  console.log(uData)
  const addBarmen = async()=>{
  
  
    await addDoc(staffColleection, {
      code: otp,
      role: 'bar',
      club:cid,

    });
          Alert.alert('Продавец добавлен', 'Отправьте ему этот код. Сотрудник должен активировать код в настройках профиля. Код: '+otp, [{text:'Скопировать код', onPress:()=>{Clipboard.setString(''+otp);}}]);


  }
  
  const cameSeller = async (change)=>{
    console.log(uData.uid)
    const docRef = doc(db, 'users', uData.uid) 
    
    if(change){
      const q = query(staffColleection, where('uid', '==', uData.uid))
      let staffId 
      const docs = await  getDocs(q)
      docs.forEach(async(doc)=>{
        staffId = doc.id
      })
      await updateDoc(doc(db, 'staff', staffId),{
        club: cid
      })
      await updateDoc(docRef,{
        roleClub:cid
      })
      Alert.alert('','Теперь вы можете принимать заказы в этом магазине')
    }else{
      const res = await addDoc(staffColleection,{
            role: 'bar',
            club:cid,
            name: uData.name,
            token: uData.pushToken,
            uid:uData.uid
          })
          await updateDoc(docRef, {
            role:'bar',
            roleClub:cid,
            staff_id:res.id
          })
          Alert.alert('Теперь вы можете принимать заказы.')
    }
   
   
    
  }

  
  useEffect(()=>{

    
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
        elevation:0,
        marginTop: 10,
        borderTopStartRadius: 25,
        borderTopEndRadius: 25,
        overflow: "hidden",
      }}
    >
    <Button 
      onPress={()=>{uData.role=='bar'&&uData.roleClub==cid?delSatff(uData.staff_id, uData.uid):uData.role=='bar'?cameSeller(true):cameSeller(false)}} 
      style={{marginVertical:0}} 
      labelStyle={{fontSize:16}}
      >
        {uData.role=='bar'&&uData.roleClub==cid
          ?'Убрать себя из продавцов магазина'
          :uData.role=='bar'
          ?`Принимать заказы теперь здесь`
          :'Сделать себя продавцом'}
    </Button>
    <Button onPress={()=>{addBarmen()}}>Добавить продавца</Button>
    <Text style={{textAlign:'center', marginBottom:20}}>Продавцы магазина:</Text>
      {staff&&staff.length>0?(<>
      <FlatList
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={staff}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => <People people={item} index={index+1} navigation={navigation} />}
      /></>):(<><Text style={{textAlign:'center', marginVertical:20}}>Вы еще не добавили продавцов.</Text></>)}

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
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // borderRadius: 24,
    // padding: 20,
  },
});
