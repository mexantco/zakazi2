import { StyleSheet, Text, View, FlatList, ImageBackground,  Modal, Alert,TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { Avatar, Divider, TouchableRipple } from "react-native-paper";
import { chats as dummyChats } from "../../seeds/DummyData";
import { useState } from "react";
import { mainShadow } from "../../components/ui/ShadowStyles";
import "../../firebase/config";
import { collection, query, where, getDocs, addDoc, onSnapshot, or, doc, updateDoc, deleteDoc  } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {getUserDataById} from '../../utils/user'
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from "expo-blur";
import { Ionicons } from '@expo/vector-icons';
import Chat from "./Chat";
import Button from "../../components/ui/Button";
import axios from "axios";

const db = getFirestore();
const statuses = {
    0:'Передан в магазин',
    1:'В работе',
    2:'Готов к выдаче',
    3:'Получен',
    4:'В доставке',
    5: "Отменен продавцом"

    
}
const emoji = {
    0:'hand-left',
    1:'time-sharp',
    2:'flame',
    3:'checkmark-circle-sharp',
    4:'bicycle',
    5:'close'
    
}
const colors = {
    0:'#dcdcdc',
    1:'#97b1ff',
    2:'#fbc889',
    3:'#bcb5cc',
    4:'#f097ff',
    5:'#0a0a0a'
    
}


const People = ({ navigation,people, index, user }) => {
 

  console.log(people)
    const [name,setName] = useState('');
   const [modal,setModal] = useState(false);
   const uData = useSelector((state) => state.user.userData);
   const [isChatActive, setActiveChat] = useState(false)
   const cancle=async (id)=>{
    let res = await axios.get('https://clubnight.ru/cancle_order?order_id='+id);
    console.log('==========')
    console.log(res)
    await deleteDoc(doc(db, "orders", id))
   setModal(false);
    Alert.alert('Заказ отменен', 'Деньги останутся у вас на балансе');
    
 
 }
    const closeOrder = async ()=>{
     await updateDoc(doc(db, 'orders', people.id), {
      status: 3
     })
     
      setModal(false);

    }
   let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
    'Gilroy-Regular': require('../../fonts/Gilroy-Regular.ttf'),
    'Gilroy-Semibold': require('../../fonts/Gilroy-Semibold.ttf'),
   });
  // console.log(people.time+'');
  return (
    <>
      <View style={{backgroundColor:!index % 2 === 0?'#ffffff20':'#ffffff00'}}>
        <Modal
        
        animationType='fade'
        transparent={true}
        visible={modal}
        >
          <View
          tint="dark"
          intensity={30}
          blurReductionFactor={4}
          experimentalBlurMethod='dimezisBlurView'
          style={{flex:1, backgroundColor:'#ccc', justifyContent:'center', paddingHorizontal:30, alignItems:'center', flexDirection:'column', paddingTop:15}}
          >
          {people.status==5?(<>
          <Text style={styles.text}>Заказ отменен продавцом.</Text>
          <Text style={styles.text}>Причина отмены:</Text>
          <Text style={{marginVertical:20, fontFamily:'Gilroy-Semibold'}}>{people.cancelReason}</Text>
          <Button style={{marginVertical:10}} onPress={()=>{setModal(false)}}>Закрыть</Button>

          </>):people.status==0?
          (<>
          {isChatActive?
          <Chat uid={people.id} unr={0}/>:
          <ScrollView style={{ width:'100%'}}>
          {people.order&&JSON.parse(people.order).map((item, index)=>{
            console.log(item)
                      return(<>
                    <View key={index} style={{flexDirection:'row', justifyContent:'space-between', width:'100%', borderBottomWidth:1}}>
                      <Text style={{color:'#000'}}>{item.name}</Text>
                      <Text style={{color:'#000'}}>{`${item.num}шт.`}</Text>
                      
                    </View>
                    {item.orderAdditions.map((item)=>{
                        return(
                          <Text style={{marginLeft:20}}>+{item.name}</Text>
                        )
                      })
                      }
                      </>)
                    })}
         </ScrollView>}
          
          
          <Button style={{marginVertical:10}} onPress={()=>{setActiveChat(!isChatActive)}}>{isChatActive?'Детали заказа':'чат с продавцом'}</Button>
          <Button style={{marginVertical:10}} onPress={()=>{cancle(people.id)}}>Отменить</Button>
          
          <Button style={{marginVertical:10}} onPress={()=>{setModal(false)}}>Закрыть</Button>
          </>):people.status==1?(<>
          <Text style={{marginVertical:30, fontSize:26, color:'#000', fontFamily:'Gilroy-Regular'}}>Заказ в работе</Text>
          
          <TouchableRipple style={{height:80, marginTop:40}} onPress={()=>{setModal(false)}}>
           <Ionicons name={'close'}  style={{shadowColor:'white', shadowRadius:5, textShadowRadius:25,textShadowColor:'#d5cefb', width:'100%', height:'100%', verticalAlign:'middle', textAlign:'center'}} size={40} color={'#000'}/>
          </TouchableRipple>
          </>):people.status==2?(<>
          <Text style={{marginVertical:30, fontSize:26, color:'#000', fontFamily:'Gilroy-Regular'}}>Покажите этот QR код продавцу</Text>
          <QRCode

          size={200}
          value={people.id+''}
          />
          <TouchableRipple style={{height:80, marginTop:40}} onPress={()=>{setModal(false)}}>
           <Ionicons name={'close'}  style={{shadowColor:'white', shadowRadius:5, textShadowRadius:25,textShadowColor:'#d5cefb', width:'100%', height:'100%', verticalAlign:'middle', textAlign:'center'}} size={40} color={'#000'}/>
          </TouchableRipple>
          </>):people.status==3?(<>
          <Text style={{marginVertical:30, fontSize:26, color:'#000', fontFamily:'Gilroy-Regular'}}>Заказ получен</Text>
        
          <TouchableRipple style={{height:80, marginTop:40}} onPress={()=>{setModal(false)}}>
           <Ionicons name={'close'}  style={{shadowColor:'white', shadowRadius:5, textShadowRadius:25,textShadowColor:'#d5cefb', width:'100%', height:'100%', verticalAlign:'middle', textAlign:'center'}} size={40} color={'#000'}/>
          </TouchableRipple>
          </>):people.status==4?(<>
          <Button onPress={()=>{closeOrder()}}>Заказ получен</Button>
          <Button onPress={()=>{setModal(false)}}>Закрыть</Button>
          </>):(<></>)}

          </View>
        </Modal>
        <TouchableRipple
          style={{backgroundColor:index % 2 === 0?'#00000010':'#ffffff00',}}
          onPress={()=>{
            [0,1,2,3,4,5].includes(people.status)?setModal(true): false;
            // people.status==0||people.status==2||people.status==4?setModal(true): false
          }}
          rippleColor="#a6a6a652"
        >
          <View style={styles.innerChatCard}>
            <View style={{ flex: 1, flexDirection: "row" }}>

              <View style={{ width:'90%', marginStart: 10, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                <Text style={{ fontSize: 16, fontFamily: "Gilroy-Regular", alignSelf:'center', color:'#000' }}>
                   {people.name}
                </Text>
                <Text style={{ color:'#000', fontFamily: "Gilroy-Regular"}}>{statuses[people.status]}</Text>
              </View>
            </View>
            <Ionicons name={emoji[people.status]} size={30} color={colors[people.status]} />
          </View>
        </TouchableRipple>
      </View>
      </>
  );
};

const Orders = ({navigation, route}) => {


  const [people, setUsers] = useState();
  const uData = useSelector((state) => state.user.userData);
  useEffect(()=>{
    const asFn= async ()=>{

    const q = query(
    collection(db, "orders"), or(
    where("from", "==", uData.uid),
    where("to","==",uData.uid))

    );
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {

        let users = [];
        await querySnapshot.forEach(async (doc) => {

 let document = doc.data();
document.id=doc.id;
users.push(document);


});
setUsers(users);
      });





    }

    asFn();
  },[])

  // const [chats, setChats] = useState(dummyChats);
  // console.log(people.length);
  return (
    <View

      style={{
        marginHorizontal:15,
        ...mainShadow,
        flex: 1,
        backgroundColor: "#ffffff",
        elevation:0,
        marginTop: 30,
        borderRadius: 25,
        // borderTopEndRadius: 25,
        overflow: "hidden",
      }}
    >
      {people&&people.length>0?(<><FlatList
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={people.sort((a,b)=>b.time-a.time)}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => <People user={uData} people={item} index={index+1} navigation={navigation} />}
      /></>):(<><Text style={{textAlign:'center', marginTop:30}}>У вас пока нет заказов</Text></>)}

    </View>
    );
};

export default Orders;

const styles = StyleSheet.create({
  text:{
    fontFamily:'Gilroy-Regular'
  },
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
