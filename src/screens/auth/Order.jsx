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
  Dimensions,
} from "react-native";
import React from "react";
import { ActivityIndicator, Avatar, Divider, TouchableRipple } from "react-native-paper";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Loader from "../../components/ui/Loader";
import AsyncStorage from "@react-native-async-storage/async-storage";


const Napitok = ({ nap, idx, orderLength }) => {
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
    <View key={idx}>
      <View  style={[styles.innerChatCard]}>
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
          <View style={{flexDirection:'row', flex:1, justifyContent:'space-around'}}>
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
    </View>
  );
};

const Order = ({ navigation, route }) => {
  const [modal, setModal] = useState(false)
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
  console.log(suggest)
  const [textValue, setTextValue] = useState('');
  const [typeAddr, setTypeAddr] = useState(false);
  const [address,setAddress] = useState('');
  const [addressUri,setAddressUri] = useState('');
  const [modalText, setModalText] = useState('')
  const [signAddress, setSignAddress] = useState('')
  const [shippingCostMoment, setShippingCost] = useState(null)
  const clubData = useSelector(state=>state.clubs.clubData)
  const system = useSelector(state=>state.system.system)
  const cityElement = system.cities.find(el=>el.id==clubData.city)
  const preQuery = cityElement.region?cityElement.region+' '+cityElement.ruName:cityElement.ruName
  console.log(cityElement)
  console.log(preQuery)
  ///////////////
  const queryData = async(text)=>{
    setTextValue(text);
    const response = await axios.get(`http://ahunter.ru/site/suggest/address?output=json;query=${encodeURIComponent(preQuery+' '+text)}`)
    console.log('response')
    console.log(response.data.suggestions)
    setSuggest(response.data.suggestions)
  }
  ////////создание заказа
  const addOrder = async () => {
    let arrToPush = []
    refRBSheet.current.close()
    setLoading(true);
    const q = query(collection(db, "staff"), where('club', '==', cid)); 
    const docs = await getDocs(q)
    docs.forEach(async (doc)=>{
      if(doc.data().code==''||doc.data().uid!=''){
      arrToPush.push(doc.data().token)}
    })
    if (arrToPush.length==0){
      Alert.alert('Извините','Магазин пока не принимает заказы. Зайдите позже.');
      return false
    }
    try {
      
      
      const cityId = clubData.city
      
     let res = await axios.post('https://clubnight.ru/new_order', {
        from: uData.uid,
        // to: route.params.gift?route.params.gift:'',
        club: cid,
        order: order,
        time: Date.now() / 1000,
        status: address!=''?6:0,
        clubRuName:clubData.ruName,
        city:cityId,
        arrayToPush:arrToPush,
        address: address,
        addressUri: addressUri
      });
      
      const order_id = res.data.order_id
      await AsyncStorage.setItem('order_id', order_id)
      if(address!=''){
        const q = query(collection(db, 'orders'), where('order_id', '==', order_id))
        const unsibscribe =onSnapshot(q, async(querySnapshot)=>{
          querySnapshot.forEach(document=>{
            
            if(document.data().status==0){
              ////////
              setModalText('Доставка подтверждена. Переходим к оплате.')
              setTimeout(()=>{
                dispatch(setOrder({ order: [] }));
                Linking.openURL('https://clubnight.ru/payment_page?label='+order_id)
                

                setModal(false)
              },3000)
              
            }
          })
        })
      }else{
        dispatch(setOrder({ order: [] }));
        Linking.openURL('https://clubnight.ru/payment_page?label='+order_id)
        setModal(false)
      }
      // Alert.alert(
      //   "Заказ передан продавцу.",
      //   'Проверьте статус заказа во вкладе  "Заказы"',
      //   [
      //     { text: "Проверить", onPress: () => navigation.navigate("Orders") },
      //     { text: "Позже", onPress: () => {navigation.goBack()} },
      //   ]
      // );
      setLoading(false);
    } catch {
      setLoading(false);
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
  const handleCancelDeliver = async ()=>{

    let order_id = await AsyncStorage.getItem('order_id')
    console.log(order_id)
    const orderRef = doc(db, 'orders', order_id)
    await updateDoc(orderRef, {
      status: 0,
      address:''
    })
    Linking.openURL('https://clubnight.ru/payment_page?label='+order_id)
    dispatch(setOrder({ order: [] }));

    setModal(false)

  }
  const calculateShipping = async ()=>{
    const res = await axios.get(`https://clubnight.ru/calculate_shipping?sign=${signAddress}&lat=${clubData.lat}&lon=${clubData.lon}`)
    console.log('sum')
    console.log(res.data)
    return
    setShippingCost(sum)
    refRBSheet.current.close()
  }
  useEffect(() => {
    // (async ()=>{
    //   const res = await getClubDataById(cid)
    //   setC
    // })()
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
      <Modal
      visible={modal}
      >
        <Loader 
        infoText={modalText} 
        onPress={async()=>{handleCancelDeliver(); }} 
        btnText='Не надо. Заберу сам' 
        visible={modal}/>
      </Modal>
      <RBSheet
      height={Dimensions.get('window').height}
      onClose={()=>{setTypeAddr(false), setAddress('')}}
      closeOnPressBack
      // dragOnContent={true}
      //  draggable={true}
       openDuration={500}
        ref={refRBSheet}
        // useNativeDriver={true}
        customStyles={{
          wrapper: {
            paddingTop:useSafeAreaInsets().top,
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
          <ScrollView >
            {suggest&&suggest.map(((item, index)=>{if(false){return false}else{return(
            <TouchableOpacity  
            key={index}
            onPress={()=>{
              // console.log(item.subtitle&&item.subtitle.text+' '+item.title.text)
              setAddress(item.value);
              setSignAddress(item.sign);
              setTextValue(item.value)
              }}>
              <Text style={{marginVertical:10, borderBottomWidth:1, borderBottomColor:'#00000010'}} 
             >
              {item.value}
              </Text>
            </TouchableOpacity>
            )}
            }
          ))}
          </ScrollView>
          <Button
          onPress={async()=>{await calculateShipping()}}
          disabled={address==''?true:false}
          style={[{ selfAlign:'center', marginHorizontal:30, marginVertical:0}, address==''?{backgroundColor:'#bbb'}:null]}
          labelStyle={{fontSize:14, padding:5, margin:0}}
          >
            Сохранить адресс
          </Button>
        </View>
        </>)
        :(<>
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
      // contentContainerStyle={{flex:1, borderWidth:1}}
      // columnWrapperStyle={{justifyContent:'flex-start', width:'100%'}}
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
        renderItem={({ item, index }) => <Napitok key={index} orderLength={order.length} idx={index} nap={item} />}
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
        {loading?<ActivityIndicator color="#fff"/>:'Оплатить заказ'}
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
    width:(Dimensions.get('window').width-30)/2,
    flexDirection: "column",
    // width: 150,
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
