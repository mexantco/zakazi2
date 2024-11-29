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
import { useNavigation } from "@react-navigation/native";
import Button from "./Button";
import { mainTheme } from "../../config/theme";

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
    color:'#000',
    marginVertical:10,
     width:150,
     height:50,
     backgroundColor:mainTheme.colorbackGround,
      borderRadius:50,
      justifyContent:'center',
      alignItems:'center'
  },
  textinfo:{
    marginVertical:5,
    fontFamily:'Gilroy-Regular',
    fontSize:18,
    color:mainTheme.colorDarkText
  },
  btntextstyle: {
    color:mainTheme.colorDarkText,
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
  },
  textinfoInput:{
    padding:5,
    marginVertical:5,
    width:300,
    backgroundColor:'#fff'
  }
});
  
  const Addition = ({ navigation, nap, press }) => {

    const [fontsLoaded] = useFonts({
      // 'AA-Neon': require('../../fonts/AA-Neon.ttf'),
      'canis-minor': require('../../fonts/canisminor.ttf'),
      'Gilroy-Regular': require('../../fonts/Gilroy-Regular.ttf'),
      'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
      'AA-Neon': require('../../fonts/AA-Neon.ttf'),
      'Neoneon': require('../../fonts/Neoneon1.otf'),
      'ZamenhovInverse': require('../../fonts/zamenhof_inverse.otf'),
    });
    if(nap.addition==false){return}
    // console.log(uData.name);
    return (
      <>
  
            <View style={styles.innerChatCard}>
              <TouchableOpacity
              onPress={press}
              style={{ flex: 1, flexDirection: "column", justifyContent:'space-evenly', alignItems:'center',opacity:!nap.availible?0.5:1 }}>
  
                  <Text style={styles.napText}>
                     {nap.name}
                  </Text>
                  <Text style={styles.napText}>
                     {nap.cost+'р.'}
                  </Text>
  
  
              </TouchableOpacity>
  
            </View>
        </>
    );
  };

const Additions = ({route})=>{
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {owner, cid} = route.params
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
  const [availible, setModalAvailible] = useState(true)

  const addition = true
  useEffect(()=>{if(uData.uid==owner){setIsmy(true)}},[uData]);

  useEffect(()=>{
    const asFn = async()=>{
        const club = await getClubDataById(cid)
        console.log(club)
        setBar(club.bar);
        setClub(club);
       
    }
    asFn();
 },[refresh])

  const loader = ()=>{
    return(
      <BlurView intensity={50} tint='dark' style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Progress.Bar height={2} width={250} borderRadius={2} useNativeDriver={true} color={'white'} animationType="spring" progress={prog} />
      </BlurView>
    )
  }
  
    const addDrink= async(addition)=>{
  
      if(name!=''&&cost!=''){
        setLoading(true);
        console.log(clubb.name);
       
        const docRef = doc(db, "club", clubb.cid);
          const docSnap = await getDoc(docRef);
  
            await updateDoc(docRef, {
              bar: [...docSnap.data().bar,
                {
                  addition:true,
                  availible:true,
                  name: name,
                  cost: cost,
                  id: Date.now()
                },]
                  });
  
                  setModal(false);
        setName('');
        setCost('');
        setLoading(false);
        setProg(0);
        setRefresh(!refresh);
  
      }else{
        Alert.alert('Заполните все поля')
      }
    }
    const switchItem = async(avail, id) =>{
      setLoading(true);
      
      const docRef = doc(db, "club", clubb.cid);
      const docSnap = await getDoc(docRef);
      let newarr = [...docSnap.data().bar].map(el=>{
        if( el.id==id){
          return {...el, availible:!avail}
          
        }else{return el}
       })
       console.log([...docSnap.data().bar])
      try{
        await updateDoc(docRef, {
        bar: newarr
        
            });
      }catch(error){console.log(error)}
      // 
            setLoading(false);
            setModal2(false);
            setProg(0);
            setRefresh(!refresh);
        } 
    ////////////////////
  const deleteItem = async (id)=>{
    setLoading(true);
    const db = getFirestore();
        const docRef = doc(db, "club", clubb.cid);
        const docSnap = await getDoc(docRef);

    await updateDoc(docRef, {
      bar: [...docSnap.data().bar.filter(el=>el.id!=id)
       ]
          });
          setLoading(false);
          setModal2(false);
          setProg(0);
          setRefresh(!refresh);
  }
  /////////////////////
  const pickImageAsync = async (type) => {

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect:[1,1],
      quality: 1,
    });

    if (!result.canceled) {
        // console.log(result);

      let url = result.assets[0].uri;
      setUri(url)
      // console.log(uri);s


    } else {

      // setModal(false)
    }
  };


  const addToOrder = async (id, num, name, img, cost)=>{
    // setOrderArr([...orderArr,{id, num, name, img, cost}])
    dispatch(setOrder({order: [...order, {id, num, name, img, cost}]}))

  }

    return(
      <View
      style={{
        ...mainShadow,
        flex: 1,
        marginHorizontal:15,
        backgroundColor: "#ffffff10",

        elevation:0,
        marginTop: 30,
        borderTopStartRadius: 25,
        borderTopEndRadius: 25,
        overflow: "hidden",
      }}
    >
      <Modal
      animationType='fade'
      visible={modal2}
      >{loading?(<>
      {loader()}
  </>):(<>
        <BlurView intensity={30} tint='dark' style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
            <ScrollView >
              <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
            
            <Text style={styles.textinfo}>{modalName}</Text>
            <Text style={[styles.textinfo, { paddingHorizontal:10}]}>{modalOpis}</Text>
            <Text style={styles.textinfo}>{modalCost+'р.'}</Text>
            
            <TouchableOpacity
            style={styles.btnstyle}
            onPress={()=>{deleteItem(modalId)}}
            ><Text style={styles.btntextstyle}>Удалить</Text ></TouchableOpacity>
             <TouchableOpacity
            style={styles.btnstyle}
            onPress={()=>{switchItem(availible, modalId)}}
            ><Text style={styles.btntextstyle}>{availible?'Нет в наличии':'В наличии'}</Text >
            </TouchableOpacity>
            
            </View>
            </ScrollView>
            <TouchableOpacity
            style={styles.btnstyle}
            onPress={()=>setModal2(false)}><Text style={styles.btntextstyle}>Закрыть</Text></TouchableOpacity>

        </BlurView></>)}
      </Modal>
      <Modal
      visible={modal}

      >{loading?(<>
     {loader()}
      </>):(<>
      <View
        style={{justifyContent:'center', gap:20, alignItems:'center', flex:1, height:'100%', flexDirection:'column',  backgroundColor:'#b1b1b1'}}

        >
         
          <TextInput onChangeText={setName} style={styles.textinfoInput}placeholder="Название"></TextInput>
         
          <TextInput keyboardType='number-pad' onChangeText={setCost} style={[styles.textinfoInput, {width:100}]} placeholder="Цена"></TextInput>
          <Button
          onPress={()=>addDrink(addition)}
          
          >Добавить</Button>
          <TouchableOpacity
            onPress={()=>setModal(false)}
            style={[styles.btnstyle, {position:'absolute', bottom:0, width:200, marginBottom:0, borderBottomLeftRadius:0,borderBottomRightRadius:0, backgroundColor:'#bbb'}]}
          ><Text style={styles.btntextstyle}>Закрыть</Text></TouchableOpacity>
          </View></>)}

      </Modal>
        {isMy?(<>
        <TouchableOpacity
          style={{alignSelf:'center', marginTop:15}}
          onPress={()=>{
            setModal(true)
            }}>
          <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
          <Ionicons name="add-circle-sharp" color='#ffffff' size={30} style={{marginHorizontal:5}}/>
          <Text>Добавить позицию</Text>
          </View>
      </TouchableOpacity></>):(<></>)}


      <FlatList
       // contentContainerStyle={{flexDirection:'row',  justifyContent:'space-around',paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        numColumns={2}

        showsHorizontalScrollIndicator={false}
        data={bar}
        keyExtractor={(item, index) => index}
        renderItem={({ item }) => <Addition press={()=>{
          setModalId(item.id); 
          setModalUri(item.img); 
          setModalName(item.name);
          setModalOpis(item.opis); 
          setModalCost(item.cost); 
          setModalAvailible(item.availible); 
          setModal2(true);}} nap={item} navigation={navigation} />}
      />


    </View>
    )
  }
export default Additions