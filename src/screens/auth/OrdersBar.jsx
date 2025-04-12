import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ImageBackground,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import React, { useRef } from "react";
import { Avatar, Divider, TouchableRipple } from "react-native-paper";
import { chats as dummyChats } from "../../seeds/DummyData";
import { useState } from "react";
import { mainShadow } from "../../components/ui/ShadowStyles";
import "../../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  queryEqual,
  Query,
  
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getUserDataById } from "../../utils/user";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import QRCodeScanner from "expo-qrcode-scanner";
import { BarCodeScanner } from "expo-barcode-scanner";
import { BlurView } from "expo-blur";
import { icon } from "./Profile";
import { Ionicons } from "@expo/vector-icons";
import Chat from "./Chat";
import axios from "axios";
import RBSheet from "react-native-raw-bottom-sheet";
import { TextInput } from "react-native-gesture-handler";
import Button from "../../components/ui/Button";
import sendPushNotification from "../../utils/push";
import {Switch} from '@petros-g/react-native-switch';
import { changeWorking, getClubDataById } from "../../utils/club";
import { mainTheme } from "../../config/theme";

const db = getFirestore();
const statuses = {
  0: "Новый",
  1: "В работе",
  2: "Готов к выдаче",
  3: "Завершен",
  4: "В доставке",
  5: "Отменен продавцом"
};
const inProcess = async (id, status, cid, reason, from) => {
  
  let count;
  const snapshot = await getDoc(doc(db, "orders", id));
  if (!snapshot.exists()) {
    Alert.alert("Этот заказ был отменен покупателем");
  }
  if(status==1){
    const incr = await updateDoc(doc(db, "club", cid), {
      ordersCount: increment(1)
    })
    let docRef = await getDoc(doc(db, 'club', cid))
    count = docRef.data().ordersCount
    await updateDoc(doc(db, 'orders', id),{
      number:count
    })
  }

  if (status == 3) {
    const docref = await getDoc(doc(db, "orders", id));
    if (docref.data().status == 3) {
      Alert.alert("Заказ", "уже выдан");
      return false;
    } else {
      Alert.alert(
        'Номер '+docref.data().number,
        "время заказа: " +
          new Date(Math.floor(docref.data().time * 1000)).toLocaleTimeString(),
          [{text:'заказ выдан', onPress:()=>{}}]
      );
    }
  }
  if(status==5){
    await updateDoc(doc(db, "orders", id), {
      status: status,
      cancelReason: reason
    });
  }
  if(status!=1){
    await updateDoc(doc(db, "orders", id), {
        status: status,
      });
  }else{
   
    await axios.get('https://clubnight.ru/order_confirm?order_id='+id);

  }
  if(status==2){
    let docRef = await getDoc(doc(db, 'users', from))
    let token = docRef.data().pushToken
    sendPushNotification(token, 'Ваш заказ готов.', 'Покажите промокод продавцу', {type:'order_ready',order_id:id})
  }
};
const People = ({ navigation, people, index, cid }) => {
  // if (people.status == 4) {
  //   return false;
  // }
  const RBref = useRef(null)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading]  = useState(false)
  const [order, setOrder] = useState({ name: "", time: 0 });
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [unread, setUnread] = useState(0)
  const[orderNum, setOrderNum] = useState(null)
  const uData = useSelector((state) => state.user.userData);
  let [fontsLoaded] = useFonts({
    "Gilroy-Light": require("../../fonts/Gilroy-Light.otf"),
    "Gilroy-ExtraBold": require("../../fonts/Gilroy-ExtraBold.otf"),
    "Gilroy-Regular": require("../../fonts/Gilroy-Regular.ttf"),
    "Gilroy-Semibold": require("../../fonts/Gilroy-Semibold.ttf"),
  });
  useEffect(() => {
    const q = query(collection(db, 'chats'), where('order', '==', people.id))
    const unsibscribe = onSnapshot(q,async(querySnapshot)=>{
      let unreadCount = 0
      querySnapshot.forEach((doc)=>{

        doc.data().messages.forEach(el=>{
          if(el.unread&&el.sender_id!=people.id){
            unreadCount+=1
          }
        })
      })
      setUnread(unreadCount)
    })
    setOrder(people);
  }, [people]);
  let date = new Date(Math.floor(order.time * 1000)).toLocaleTimeString();
  return (
    <View style={{borderBottomWidth:0.5, borderBlockColor:'#00000020', backgroundColor:people.status==0?'#66000020':'#00000000'}}>
      <Modal style={{borderWidth:3, backgroundColor:'red', flex:1, height:500}} visible={modal}>
        <RBSheet
        openDuration={100}
        // dragOnContent={true}
        draggable={true}
        ref={RBref}
        >
          <View style={{padding:10, flex:1}}>
          <TextInput 
          onChangeText={setReason}
          multiline = {true}
          numberOfLines = {10} 
          style={{flex:1}} 
          placeholder="Укажите причину отмены"/>
          <Button
          onPress={()=>{
            if(reason==''){
              Alert.alert('Укажите причину');return false
            }else{
              inProcess(order.id, 5, cid, reason); RBref.current.close()
            }}}
          style={{backgroundColor:'#da4752'}}
          >
            <Text>Отменить заказ</Text>
          </Button>
          </View>
        </RBSheet>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 50,
          }}
        >
          <ScrollView style={{width:'80%' }}>
            {order.order&&JSON.parse(order.order).map((item, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      borderBottomWidth: 1,
                    }}
                  >
                    <Text style={{ color: "#000" }}>{item.name}</Text>
                    <Text style={{ color: "#000" }}>{`${item.num}шт.`}</Text>
                  </View>
                );
              })}
          </ScrollView>
          {order.address!=''?(<>
          <Text>Доставить по адрессу: {order.address}</Text>
          </>):(<></>)}
          <Text style={styles.modalText}>заказ создан: {date}</Text>
          <Text style={styles.modalText}>номер заказа: {order.number}</Text>
          <View
            style={{
              paddingHorizontal:10,
              height: 50,
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-around",
              marginBottom:10
            }}
          >
            <TouchableOpacity

              disabled={isLoading}
              onPress={async () => {
                setIsLoading(true)
                 order.status == 0
                  ? order.number?false:await inProcess(order.id, 1, cid)
                  : order.status == 1
                  ? order.address!=""?await inProcess(order.id, 4): await inProcess(order.id, 2, null, null, order.from)
                  : order.status == 2
                  ? setModal(false)
                  : setModal(false);
                  
                  setIsLoading(false)
              }}
              style={{
                // marginHorizontal:5,
                opacity: isLoading?0.5:1,
                paddingHorizontal: 7,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#aadd99",
                borderRadius: 20,
              }}
            >
              <Text style={{ fontSize: 20, color: "#ffffff" }}>
                {order.status == 0
                  ? "В работу"
                  : order.status == 1
                  ? order.address?"Передать в доставку?":"Заказ готов?"
                  : order.status == 2
                  ? "скоро заберут заказ"
                  :order.status == 4
                  ? "В доставке"
                  :order.status == 5
                  ? 'Отменен продавцом'
                  : "Завершен"}
              </Text>
            </TouchableOpacity>
            {order.status==0?
            <TouchableOpacity
            onPress={ ()=>{RBref.current.open()}}
            style={{
             
              paddingHorizontal: 7,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#ff7373",
              borderRadius: 20,
            }}
            >
              <Text style={{ fontSize: 20, color: "#ffffff" }}>Отменить</Text>
            </TouchableOpacity>:null}
            <TouchableOpacity
              onPress={() => {
                setModal2(false)
                setModal(false);
              }}
              style={{
                paddingHorizontal: 7,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#bbb",
                borderRadius: 20,
              }}
            >
              <Text style={{ fontSize: 20, color: "#ffffff" }}>Закрыть</Text>
            </TouchableOpacity>
          </View>
          {order.status!=3&&<Chat order={order.id} uid={order.from} modal={modal2}/>}
          
        </View>
      </Modal>
      <View
        style={{
          backgroundColor: !index % 2 === 0 ? "#ffffff00" : "#ffffff00",
        }}
      >
        <TouchableRipple
          onPress={() => {
            setModal2(true)
            setModal(true);
            
            setOrder(people);
          }}
          rippleColor="#a6a6a652"
        >
          <View style={styles.innerChatCard}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View
                style={{
                  width: "90%",
                  marginStart: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight:'bold',
                    fontFamily: "Gilroy-Regular",
                    alignSelf: "center",
                    color: "#000",
                  }}
                >
                  № {people.number}
                </Text>
                {unread>0&&
                <View>
                  <Ionicons name="chatbox-sharp" size={25} color={'#bbb'}/>
                  <Text style={{position:'absolute', right:5, bottom:0, fontWeight:'bold'}}>{unread}</Text>
                </View>}
                
                <Text style={styles.textStatus}>{statuses[people.status]}</Text>
              </View>
            </View>
            {/* <Text style={{ color: "#aeaeae", fontFamily: "Inter_500Medium" }}>
              {index}
            </Text> */}
          </View>
        </TouchableRipple>
      </View>
    </View>
  );
};

const OrdersBar = ({ navigation, route }) => {
  const [modal, setModal] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [people, setUsers] = useState();
  const uData = useSelector((state) => state.user.userData);
  const [isWorking, setIsWorking] = useState(false)
  useEffect(() => {
    const asFn = async () => {
      
      //const clubData = await getClubDataById(uData.roleClub)
      const q2 = query(doc(db, 'club', uData.roleClub))
      const unsubscribeClub = onSnapshot(q2, async (querySnapshot)=>{
          // console.log(await querySnapshot.data().working)
          setIsWorking(await querySnapshot.data().working)
      })
      
      
      const q = query(
        collection(db, "orders"),
        where("club", "==", uData.roleClub)
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        let users = [];
        await querySnapshot.forEach(async (doc) => {
          let document = doc.data();
          document.id = doc.id;
          users.push(document);
        }); 
        
        setUsers(users.sort((a,b)=>b.time-a.time));
      });
    };

    asFn();
  }, []);
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);
  // const [chats, setChats] = useState(dummyChats);
  return (
    <View >
      <Modal transparent={true} visible={modal}>
        <View
        experimentalBlurMethod='dimezisBlurView'
          tint="dark"
          intensity={40}
          style={{ flex: 1, paddingVertical: 30, backgroundColor:'#555' }}
        >
          <View
            style={{
              flex: 2,
              width: "90%",
              alignSelf: "center",
              borderRadius: 15,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#d5cefb",
            }}
          >
            <BarCodeScanner
              style={{
                width: "120%",
                height: "100%",
                position: "absolute",
                left: "-10%",
              }}
              onBarCodeScanned={(data) => {
                inProcess(data.data, 3);
                setModal(false);
              }}
            />
          </View>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              setModal(false);
            }}
          >
            <Ionicons
              name={"close"}
              style={{
                shadowColor: "white",
                shadowRadius: 5,
                textShadowRadius: 25,
                textShadowColor: "#d5cefb",
                width: "100%",
                height: "100%",
                verticalAlign: "middle",
                textAlign: "center",
              }}
              size={40}
              color={"#d5cefb"}
            />
          </TouchableOpacity>
        </View>
      </Modal>
      <View style={{flexDirection:'row', width:'100%', gap:5, backgroundColor:'#bbb'}}>
        <View style={{backgroundColor:'#ffffff70', paddingHorizontal:10,flex:1,width:'100%', height:70,justifyContent:'space-between', alignItems:'center', flexDirection:'row'}}>
              <Text style={{color:!isWorking?mainTheme.colorWarning:mainTheme.colorDarkText, marginHorizontal:10, width:100, flex:1}}>Магазин {isWorking?'работает':'не работает'}</Text>
              {/* <Switch
                  activeText={'On'}
                  inActiveText={'Off'}
                  value={isWorking}
                  onValueChange={()=>{changeWorking(isWorking, uData.roleClub); setIsWorking(!isWorking)}}
                  // enableDrag
                  trackWidth={50}
                  trackHeight={20}
                  circleSize={25}
                  circleOffset={3}
                  circleActiveColor="white"
                  trackActiveColor="#42adff"
                  animationDuration={200}
                /> */}
              <TouchableOpacity 
                style={{backgroundColor:isWorking?mainTheme.colorWarning:'#c9c9c9',...mainShadow, flex:1, padding:2, borderRadius:5}}
                onPress={async ()=>{changeWorking(isWorking, uData.roleClub); setIsWorking(!isWorking)}}
              >
                <Text style={{fontSize:11,textAlign:'center'}}>{isWorking?'остановить ':'возобновить '}</Text>
                <Text style={{fontSize:14,textAlign:'center'}}>работу</Text>
              </TouchableOpacity>
          </View>
        <TouchableOpacity
        style={{ backgroundColor:'#ffffff70',flex:1, height: 70, alignItems: "center" }}
        onPress={() => {
          setModal(true);
        }}
      >
        <Ionicons
          name={"barcode-sharp"}
          style={{
            shadowColor: "#d5cef0",
            shadowRadius: 15,
            textShadowRadius: 25,
            textShadowColor: "#d5cefb",
            width: "100%",
            height: "100%",
            verticalAlign: "middle",
            textAlign: "center",
          }}
          size={40}
          color={"#000"}
        />
      </TouchableOpacity>
      </View>
      
      <View
        style={{
          marginHorizontal: 15,
          ...mainShadow,
          flexGrow: 1,
          backgroundColor: "#ffffff10",
          elevation: 0,
          height: "100%",
          // marginTop: 30,
          borderTopStartRadius: 25,
          borderTopEndRadius: 25,
          overflow: "hidden",
        }}
      >
        {people && people.length > 0 ? (
          <>
            <FlatList
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={people.filter(el=>el.status!=6&&el.payed)}
              keyExtractor={(item, index) => index}
              renderItem={({ item, index }) => (
                <People
                  people={item}
                  index={index + 1}
                  navigation={navigation}
                  cid={uData.roleClub}
                />
              )}
            />
          </>
        ) : (
          <>
            <Text>Заказов пока нет.</Text>
          </>
        )}
      </View>
    </View>
  );
};

export default OrdersBar;

const styles = StyleSheet.create({
  textStatus: { 
  color: "#000", 
  fontFamily: "Gilroy-Regular" 
},
  outerChatCard: {
    backgroundColor: "white",
    borderRadius: 24,
  },
  modalText: {
    fontSize: 28,
    color: "#0f0f0f",
    marginVertical: 20,
  },
  innerChatCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 24,
    padding: 20,
  },
});
