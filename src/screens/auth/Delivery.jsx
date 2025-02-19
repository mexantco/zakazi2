import { StyleSheet, Text, View, FlatList, ImageBackground,  Modal, Alert,TouchableOpacity, ScrollView, Pressable, Dimensions } from "react-native";
import React, { useCallback, useRef } from "react";
import { Avatar, Divider, TouchableRipple } from "react-native-paper";
import { useState } from "react";
import { mainShadow } from "../../components/ui/ShadowStyles";
import "../../firebase/config";
import { collection, query, where, getDocs, addDoc, onSnapshot, or, doc, updateDoc, deleteDoc, and  } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {getUserDataById, updateUser} from '../../utils/user'
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from "expo-blur";
import { Ionicons } from '@expo/vector-icons';
import Chat from "./Chat";
import Button from "../../components/ui/Button";
import { mainTheme } from "../../config/theme";
import BackgroundTimer from 'react-native-background-timer';
import { registerFollowMasterID, registerFollowerID, postFollowingID, unfollowMasterID, updateFollowersList, getFollowMaster, deleteFollowMaster } from 'native-notify';

const db = getFirestore();
const statuses = {
    0:'Передан в магазин',
    1:'В работе',
    2:'Готов к выдаче',
    3:'Получен',
    4:'В доставке',
    5: "Отменен продавцом",
    6: "Новая доставка"

    
}
const emoji = {
    0:'hand-left',
    1:'time-sharp',
    2:'flame',
    3:'checkmark-circle-sharp',
    4:'bicycle',
    5:'close',
    6:'bicycle'
    
}
const colors = {
    0:'#dcdcdc',
    1:'#97b1ff',
    2:'#fbc889',
    3:'#bcb5cc',
    4:'#f097ff',
    5:'#0a0a0a',
    6:'red'
}


const People = ({ navigation,people, index, user }) => {
 

   const [name,setName] = useState('');
   const [modal,setModal] = useState(false);
   const uData = useSelector((state) => state.user.userData);
   const [isTaken, setIsTaken] = useState(false)
   const [timeOst, setTimeost] = useState(180)
   const [isChatActive, setActiveChat] = useState(false)
   const timerRef = useRef(null)
   const q = query(collection(db, 'chats'), where('order', '==', people.id))
   const q_order = query(collection(db, 'orders'), where('order_id', '==', people.id))
    const [unread, setUnread] = useState(0)
    const [status, setStatus] = useState('wait')
   useEffect(()=>{

    const unsibscribe = onSnapshot(q,async(querySnapshot)=>{
      let unreadCount = 0
      querySnapshot.forEach((doc)=>{

        doc.data().messages.forEach(el=>{
          if(el.unread&&el.sender_id!=uData.uid){
            unreadCount+=1
          }
        })
      })
      setUnread(unreadCount)
    })
    const unsibscribe_order = onSnapshot(q_order,async(querySnapshot)=>{
      querySnapshot.forEach((doc)=>{
        switch (true){
          case doc.data().status==4: 
          setStatus('shipping')
          break
          case doc.data().status==2: 
          setStatus('ready')
          break
          case status!='payed'&&doc.data().payed==true:
          setStatus('payed')
          break
        }
      })
    })

    return ()=>{unsibscribe(); unsibscribe_order()}
   },[])

   useEffect(()=>{
    if(timeOst<=0){
      BackgroundTimer.stopBackgroundTimer()
      
    }
   }, [timeOst])

    const startTimer = useCallback(()=>{
      timerRef.current =  BackgroundTimer.runBackgroundTimer(()=>{setTimeost(prev=>prev-1)},1000)
    },[])

    const setData = async (mode)=>{
      let modes = {
        setShipper: {
          shipper: uData.uid,
          status:0
        },
        cancelDelivery : {
          shipper:''
        }
      }
     await updateDoc(doc(db, 'orders', people.id), {
      ...modes[mode]
     })
      // Alert.alert('','когда заказ будет готов к доставке, статус изменится')
      if(mode=='setShipper'){
              setIsTaken(true)
      }else{
        setIsTaken(false);
        setModal(false)
        setTimeost(180)
      }
    }
   let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
    'Gilroy-Regular': require('../../fonts/Gilroy-Regular.ttf'),
    'Gilroy-Semibold': require('../../fonts/Gilroy-Semibold.ttf'),
   });
  return (
    <View key={index}>
      <View  style={{backgroundColor:!index % 2 === 0?'#ffffff20':'#ffffff00'}}>
        <Modal
        animationType='slide'
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
            <Text style={{fontWeight:'600', fontSize:18}}>{people.clubName}</Text>
            <Text style={{fontWeight:'600'}}>|</Text>
            <Text style={{fontSize:18, marginBottom:10}}>{people.address}</Text>
            {
            status=='shipping'
            ?<><Text>Доставьте заказ.</Text>
            <Text style={{textAlign:'center'}}>Попросите покупателя подтвердить получение заказа в приложении.</Text>
            
            </>
            :status=='ready'
            ?<><Text>Заказ готов.</Text>
            <Text style={{textAlign:'center'}}>Покажите QR код продавцу, что бы получить заказ для доставки.</Text>
            <QRCode size={200} value={people.order_id}/>
            </>
            :status=='payed'
            ?<><Text>Заказ оплачен.</Text>
            <Text style={{textAlign:'center'}}>Когда заказ будет готов к доставке, появится  QR-код. Покажите его продаву, что б получить заказ для доставки.</Text>
            </>
            :isTaken
            ?<>
              <Text>Ожидаем оплату от покупателя</Text>
              <Text style={{textAlign:'center'}}>Дайте покупателю 3 минуты на оплату и можете отменить доставку</Text>
              <Button
              style={timeOst>0?{backgroundColor:'#b0b0b0', alignItems:'flex-start', width:270}:{backgroundColor:'#bb6666', alignItems:'center'}}
              disabled={timeOst>0}
              onPress={async ()=>{await setData('cancelDelivery')}}
              >{timeOst>0?('отказаться через: '+Math.floor(timeOst / 60)+':'+((timeOst % 60)<10?'0'+(timeOst % 60):(timeOst % 60))):'отказаться'}</Button>
            </>
            :<>
              <Button onPress={async ()=>{await setData('setShipper'); startTimer()}}>
              взять
              </Button>
              <Button onPress={()=>setModal(false)}>
                закрыть
              </Button>
            </>}
          </View>
          
        </Modal>
        <TouchableRipple
          style={{backgroundColor:index % 2 === 0?'#00000010':'#ffffff00'}}
          onPress={()=>{
           setModal(true)
          }}
          rippleColor="#a6a6a652"
        >
          <View style={styles.innerChatCard}>
            <View style={{ flex: 1, flexDirection: "column", gap:10 }}>

              <View style={{overflow:'hidden', marginHorizontal:20, gap:10, marginStart: 10, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <Text style={{flexGrow:1, fontFamily: "Gilroy-Semibold"}}>{people.clubName}</Text>
              <Text style={{flexGrow:1, color:'#000', fontFamily: "Gilroy-Regular"}}>-</Text>
              <Text numberOfLines={1} ellipsizeMode='middle' style={{flexGrow:1, width:180, color:'#000', fontFamily: "Gilroy-Regular"}}>{people.address}</Text>
              </View>
              <View style={{overflow:'hidden', marginHorizontal:20, gap:10, marginStart: 10, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                <Text>{people.shippingCost+'р.'}</Text>
                <Text style={{fontFamily: "Gilroy-Semibold"}}>{statuses[people.status]}</Text>
              </View>
              {/* {unread>0&&
                <View>
                  <Ionicons name="chatbox-sharp" size={25} color={'#bbb'}/>
                  <Text style={{position:'absolute', right:5, bottom:0, fontWeight:'bold'}}>{unread}</Text>
                </View>} */}
            </View>
          </View>
        </TouchableRipple>
      </View>
      </View>
  );
};

const renderCitiesSelect = (visible, cities, handleSelectCity, onClose)=>{
  return(
    <Modal
    animationType='slide'
    visible={visible}
    >
      <View style={{flexDirection:'column', gap:10,justifyContent:'flex-start', alignItems:'center',flexGrow:1, padding:20}}>
      <Text style={{margin:10, textAlign:'center'}}>Выберите город:</Text>
        {cities.map((el, index)=>
      <Pressable 
        key={index} 
        style={{alignSelf:'center', height:50, width:100, borderWidth:1, borderRadius:10, justifyContent:'center', padding:5}} 
        onPress={()=>handleSelectCity(el.id)}>
        <Text style={{textAlign:'center'}}>{el.ruName}</Text>
      </Pressable>
      )}
      </View>
      <Pressable onPress={onClose} style={{position:'absolute', right:20, bottom:20}}><Ionicons name='close-circle-outline' size={60} color={mainTheme.colorDarkText}/></Pressable>
    </Modal>
  )
}

const Delivery = ({navigation, route}) => {

  const [modalCities, setModalCity] = useState(true)
  const [deliveries, setDeliviries] = useState([]);
  const uData = useSelector((state) => state.user.userData);
  const {cities} = useSelector((state) => state.system.system);
  useEffect(()=>{
    const asFn= async ()=>{

    const q = query(
    collection(db, "orders"), and(
    where("city", "==", uData.city),
      and(where("status","in",[6,0,1,2,4])),
          where('address', '!=', ''))
    );
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {

      let devs = [];
      querySnapshot.forEach(async (doc) => {

      let document = doc.data();
      document.id=doc.id;
      devs.push(document);


      });
      setDeliviries(devs);
      });

    }

    asFn();
  },[])
  const subcribeToCity = async (city)=>{
    registerFollowerID(
      `deliverCity${city}`,
      uData.uid,
      27570,
      'vQkmBW58lcX8VKdldh8fAU'
  );
  }
  // const [chats, setChats] = useState(dummyChats);
  // console.log(people.length);
  return (
    <View

      style={{
        
        marginBottom:15,
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
      {!uData.city&&
      <Button style={{width:'70%', alignSelf:'center'}} onPress={()=>{setModalCity(true)}}>
        <Text>Выберите город</Text>
        
      </Button>}
      {renderCitiesSelect(!uData.city&&modalCities, cities, async (city)=>{await updateUser(uData.uid,{city:city}); await subcribeToCity(city); setModalCity(false)}, ()=> {setModalCity(false)})}
      {!uData.city
      ?(<>
      <Text style={{textAlign:'center'}}>город не выбран</Text>
      </>)
      :deliveries&&deliveries.length>0?(<>
      <FlatList
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={deliveries.sort((a,b)=>b.time-a.time)}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => <People key={index} user={uData} people={item} index={index+1} navigation={navigation} />}
      /></>)
      :(<>
      <Text style={{textAlign:'center', marginTop:30}}>Пока доставок нет</Text>
      </>)}

    </View>
    );
};

export default Delivery;

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
