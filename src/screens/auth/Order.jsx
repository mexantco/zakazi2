import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  Linking,
} from "react-native";
import React from "react";
import { Avatar, Divider, TouchableRipple } from "react-native-paper";
import { chats as dummyChats } from "../../seeds/DummyData";
import { useState, useRef} from "react";
import { mainShadow } from "../../components/ui/ShadowStyles";
import "../../firebase/config";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getUserDataById } from "../../utils/user";
import { getClubDataById } from "../../utils/club";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Progress from "react-native-progress";
import * as ImagePicker from "expo-image-picker";
import RBSheet from 'react-native-raw-bottom-sheet';
import axios from "axios";
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
  updateDoc,
  increment,
  getDocs
} from "firebase/firestore";
import { BlurView } from "expo-blur";
import { ScrollView } from "react-native-gesture-handler";
import NumericInput from "react-native-numeric-input";
import { setOrder } from "../../reducers/user";
import Button from "../../components/ui/Button";
import * as Location from 'expo-location';
import { useFonts } from 'expo-font';

const Napitok = ({ nap, idx }) => {
  const order = useSelector((state) => state.user.order);
  const dispatch = useDispatch();
  const delFromOrder = () => {
    let newArr = order.filter((element, index) => {
      return index != idx;
    });
    dispatch(setOrder({ order: newArr }));
  };
  const [fontsLoaded] = useFonts({
    // 'AA-Neon': require('../../fonts/AA-Neon.ttf'),
    'canis-minor': require('../../fonts/canisminor.ttf'),
    'Gilroy-Regular': require('../../fonts/Gilroy-Regular.ttf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
    'AA-Neon': require('../../fonts/AA-Neon.ttf'),
    'Neoneon': require('../../fonts/Neoneon1.otf'),
    'ZamenhovInverse': require('../../fonts/zamenhof_inverse.otf'),
  });
  return (
    <>
      <View style={styles.innerChatCard}>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <Image
            style={{ height: 100, width: 100, borderRadius: 20, flex: 1 }}
            source={{ uri: nap.img }}
          />
          <Text
            style={{
              fontSize: 16,
              color: "#000",
              fontFamily: "Gilroy-Regular",
              flex: 1,
            }}
          >
            {nap.name}
          </Text>
          <View style={{flexDirection:'row', flex:1, justifyContent:'space-around', paddingHorizontal:'10%'}}>
          <Text
            style={{
              textAlign:'left',
              fontSize: 16,
              color: "#000",
              fontFamily: "Gilroy-Regular",
              flex: 1,
            }}
          >
            {`${nap.cost} р.`}
          </Text>
          <Text
            style={{
              marginBottom:10,
              textAlign:'right',
              fontSize: 16,
              color: "#000",
              fontFamily: "Gilroy-Regular",
              flex: 1,
            }}
          >
            &times;{nap.num} шт.
          </Text>
          </View>
          <View style={{flexDirection:'column', flex:1, justifyContent:'space-between'}}>
            {nap.orderAdditions.map(el=><Text>+ {el.name} {el.cost} р.</Text>)}
          </View>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              delFromOrder();
            }}
          >
            <Text
              style={{
                alignContent:'center',
                backgroundColor:'#703efe',
                padding:5,
                paddingHorizontal:10,
                verticalAlign:'middle',
                borderRadius:15,
                fontSize: 16,
                color: "#f0f0f0",
                fontFamily: "Gilroy-Extrabold",
              }}
            >
              убрать
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </>
  );
};

const Order = ({ navigation, route }) => {
  const cid = route.params.clubId;
  const shipping = route.params.shipping;
  const loaction = route.params.location;
  const shippingCost = route.params.shippingCost;
  const db = getFirestore();
  const uData = useSelector((state) => state.user.userData);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const order = useSelector((state) => state.user.order);
  const refRBSheet = useRef();
  const [suggest, setSuggest] = useState(null);
  const [textValue, setTextValue] = useState('');
  const [typeAddr, setTypeAddr] = useState(false);
  const [address,setAddress] = useState('');
  ///////////////
  const queryData = async(text)=>{
    setTextValue(text);
    // const response = await axios.post('http://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', 
    // {
    // query:text,
    // count:10,
    // locations_geo: [{
    //     "lat": loaction.latitude, 
    //     "lon": loaction.longitude,
    //     "radius_meters": 4000
    // }]
    // }, 
    // {headers:{'Content-Type':'application/json', 'Accept':'application/json', 'Authorization':'Token 2db7d1b63947cdd743060dec44101a8ea84753c2'}});
    const response = await axios.get(`https://suggest-maps.yandex.ru/v1/suggest?apikey=5d8abe05-07bc-4d18-97a3-497f223ca03d&text=${text}&results=15&types=geo,biz&print_address=1&strict_bounds=1&spn=0.1,0.1&lang=ru&ll=${loaction.longitude},${loaction.latitude}`)
    
    // console.log(response.data.results);
    // console.log(loaction.latitude);
    // console.log(loaction.longitude);
    setSuggest(response.data.results);
  }
  ////////создание заказа
  const addOrder = async () => {
    let arrToPush = []
    refRBSheet.current.close()
    setLoading(true);
    const q = query(collection(db, "staff"), where('club', '==', cid)); 
    const docs = await getDocs(q)
    docs.forEach(async (doc)=>{
      arrToPush.push(doc.data().token)
    })
    try {
     let res = await axios.post('https://clubnight.ru/new_order', {
        from: uData.uid,
        // to: route.params.gift?route.params.gift:'',
        club: cid,
        order: order,
        time: Date.now() / 1000,
        status: 0,
        arrayToPush:arrToPush,
        address: address
      });
      
      let order_id = res.data.order_id
      Linking.openURL('https://clubnight.ru/payment_page?label='+order_id)
      Alert.alert(
        "Заказ передан продавцу.",
        'Проверьте статус заказа во вкладе  "Заказы"',
        [
          { text: "Проверить", onPress: () => navigation.navigate("Orders") },
          { text: "Позже", onPress: () => {navigation.goBack()} },
        ]
      );
      setLoading(false);
      dispatch(setOrder({ order: [] }));
    } catch {
      console.log(error);
      Alert.alert(
        "Что то пошло не так.",
        '',
        [
          { text: "ok", onPress: () => {}}
        ]
      );
    }
    
  };

  useEffect(() => {
    
    return () => {
      console.log("back");
      dispatch(setOrder({ order: [] }));
    };
  }, []);
  return (
    <View
      style={{
        ...mainShadow,
        flex: 1,
        marginHorizontal: 15,
        backgroundColor: "#ffffff10",
        height: "100%",
        elevation: 0,
        marginTop: 30,
        borderTopStartRadius: 25,
        borderTopEndRadius: 25,
        overflow: "hidden",
      }}
    >
      <RBSheet
      height={400}
      onClose={()=>{setTypeAddr(false), setAddress('')}}
      // dragOnContent={true}
      //  draggable={true}
       openDuration={500}
        ref={refRBSheet}
        // useNativeDriver={true}
        customStyles={{
          wrapper: {
            
            backgroundColor: 'transparent',
          },
          container:{
            borderRadius:20
          },
          draggableIcon: {
            backgroundColor: '#000',
          },
        }}
        customModalProps={{
          animationType: 'slide',
          statusBarTranslucent: true,
        }}
        customAvoidingViewProps={{
          enabled: true,
        }}>{typeAddr?(<>
        <View style={{flex:1, padding:20}}>
          <TextInput placeholder="укажите место доставки" style={{paddingHorizontal:20, borderColor:'#d0d0d0', height:50, borderWidth:1,backgroundColor:'#f0f0f0', borderRadius:20}} 
          onChangeText={(text)=>{queryData(text);}} 
          value={textValue}
          />
          <ScrollView>
            {suggest&&suggest.map((item=>{if(item.distance.value>10000){return false}else{return(
            <Text style={{marginVertical:10, borderBottomWidth:1, borderBottomColor:'#00000010'}} onPress={(event)=>{setAddress(event._dispatchInstances.child.memoizedProps);setTextValue(event._dispatchInstances.child.memoizedProps)}}>
              {item.subtitle&&item.subtitle.text+' '+item.title.text}
              </Text>)}
            }
          ))}
          </ScrollView>
          <Button
          onPress={()=>{addOrder()}}
          disabled={address==''?true:false}
          style={[{ selfAlign:'center', marginHorizontal:30, marginVertical:0}, address==''?{backgroundColor:'#bbb'}:null]}
          labelStyle={{fontSize:14, padding:5, margin:0}}
          >
            Сохранить и перейти к оплате
          </Button>
        </View></>):(<>
          <View style={{flex:1, padding:20, flexDirection:'column', justifyContent:'space-between'}}>
        <Text style={{textAlign:'center'}}>Нужна доставка?</Text>
        <Text
          style={{ marginTop: 10, marginBottom: 10, textAlign:'center' }}
        >{`стоимость доставки ${shippingCost}р.`}</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            height: 50,
            flexGrow:1
          }}
        >
          <TouchableOpacity style={styles.modalBtn} onPress={()=>{setTypeAddr(true)}}>
            <Text>Да</Text>
          </TouchableOpacity>
          <TouchableOpacity 
          onPress={()=>{addOrder()}}
          style={styles.modalBtn}>
            <Text>Нет</Text>
          </TouchableOpacity>
        </View>
        </View>
        </>)}
      </RBSheet>
      <FlatList
      columnWrapperStyle={{justifyContent:'flex-start', width:'50%'}}
      numColumns={2}
        // contentContainerStyle={{
        //   flexDirection: "row",
          
        //   justifyContent: "space-around",
        //   paddingBottom: 30,
        // }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={order}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => <Napitok idx={index} nap={item} />}
      />
      <Button
        labelStyle={{ fontSize: 16 }}
        onPress={()=>{ 
          if (shipping) {
          refRBSheet.current.open()
        }else{addOrder()}}}
        //   loading={buttonLoading}
        //   disabled={buttonLoading}
      >
        Оплатить заказ
      </Button>
      
    </View>
  );
};

export default Order;

const styles = StyleSheet.create({
  outerChatCard: {
    backgroundColor: "white",
    borderRadius: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    width: 100,
  },
  btnstyle: {
    marginVertical: 10,
    width: 150,
    height: 50,
    backgroundColor: "#bbbbbb",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  textinfo: {
    marginVertical: 5,
    fontFamily: "Gilroy-Regular",
    fontSize: 18,
    color: "#ffffff",
  },
  btntextstyle: {
    color: "#ffffff",
    fontFamily: "Gilroy-ExtraBold",
    fontSize: 18,
  },
  innerChatCard: {
    flexDirection: "column",
    flex: 1,
    width: 150,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 24,
    padding: 20,
  },
  modalBtn: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});
