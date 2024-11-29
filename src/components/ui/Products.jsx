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
import BouncyCheckbox from "react-native-bouncy-checkbox";
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
import { setClubData } from "../../reducers/clubs";
import { mainTheme } from "../../config/theme";
import Colors from "../../constants/Colors";
import Button from "./Button";
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
  
  const Napitok = ({ navigation, nap, press }) => {

    const [fontsLoaded] = useFonts({
      // 'AA-Neon': require('../../fonts/AA-Neon.ttf'),
      'canis-minor': require('../../fonts/canisminor.ttf'),
      'Gilroy-Regular': require('../../fonts/Gilroy-Regular.ttf'),
      'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
      'AA-Neon': require('../../fonts/AA-Neon.ttf'),
      'Neoneon': require('../../fonts/Neoneon1.otf'),
      'ZamenhovInverse': require('../../fonts/zamenhof_inverse.otf'),
    });
    if(nap.addition==true){return}
    // console.log(uData.name);
    return (
      <>
  
            <View style={styles.innerChatCard}>
              <TouchableOpacity
              onPress={press}
              style={{ flex: 1, flexDirection: "column", justifyContent:'space-evenly', alignItems:'center', opacity:!nap.availible?0.5:1 }}>
                <Image style={{height:100, width:100, borderRadius:20, flex:1}} source={{ uri: nap.img }} />
  
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

const Products = ({route})=>{
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {owner, cid} = route.params
  const [isMy, setIsmy] = useState(false);
  const [orderAdditions, setOrderAdditions] =  useState([])
  const [modal, setModal] = useState(false);
  const [num, setNum] = useState(1);
  const [uri, setUri] = useState(null);
  const [bar,setBar] = useState();
  const [people, setUsers] = useState();
  const [prog, setProg]= useState(0);
  const [modal2, setModal2] = useState(false);
  const [name,setName] = useState('');
  const [opis,setOpis] = useState('');
  const [cost,setCost] = useState(0);
  // const [clubb, setClub] = useState();
  const [loading, setLoading] = useState(false);
  const [refresh,setRefresh] = useState(false);
  const db = getFirestore();
  const uData = useSelector((state) => state.user.userData);
  const order = useSelector((state) => state.user.order);
  const [orderArr, setOrderArr] = useState([]);
  const [additions, setAdditions] = useState([]);
  const [additionsToAdd, setAdditionsToAdd] = useState([])
  const [availible, setModalAvailible] = useState(true)
  const [modalData, setModalData] = useState({})
  const clubb = useSelector(state=>state.clubs.clubData)
  
  useEffect(()=>{if(uData.uid==owner){setIsmy(true)}},[uData]);
  console.log(additionsToAdd)
  useEffect(()=>{
    const asFn = async()=>{
          const q = query(doc(db, "club", cid))
          onSnapshot(q, (querySnapshot)=>{
          let clubData = querySnapshot.data()
          dispatch(setClubData({clubData:clubData}))
        })
      
    }
    asFn();
 },[refresh])

  useEffect(()=>{
   
    if(clubb){ 
    setBar(clubb.bar);
    // setClub(clubb);
   
    setAdditions(clubb.bar.filter(el=>el.addition==true&&el.availible==true))}
    
  },[clubb])

  const loader = ()=>{
    return(
      <BlurView intensity={50} tint='dark' style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Progress.Bar height={2} width={250} borderRadius={2} useNativeDriver={true} color={'white'} animationType="spring" progress={prog} />
      </BlurView>
    )
  }
  const uploadFile = async (fileUri, uData, urlApi, addition) => {
   
      try {
  
        const callback = uploadProgressData => {
          const progress =uploadProgressData.totalBytesSent/uploadProgressData.totalBytesExpectedToSend;
           setProg(progress);
  
        };
  
        const up =   FileSystem.createUploadTask(urlApi, fileUri,{
          httpMethod:'POST',
          headers:{
            uid:uData
          },
          uploadType:FileSystem.FileSystemUploadType.MULTIPART,
          fieldName:'file'
         },
         callback
         );
        const resp = await up.uploadAsync()
         ///////////////upload to firebase
            console.log(resp);
  
  
          const docRef = doc(db, "club", clubb.cid);
          const docSnap = await getDoc(docRef);
  
            await updateDoc(docRef, {
              bar: [...docSnap.data().bar,
                { 
                  availible:true,
                  additions:additionsToAdd,
                  addition:false,
                  name: name,
                  cost: cost,
                  opis: opis,
                  img: resp.body.trim(),
                  id: Date.now()
                },]
                  });
  
                  setModal(false);
  
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
      }
    };
    const addDrink= async(addition)=>{
  
      if(uri!=''&&name!=''&&opis!=''&&cost!=''){
        setLoading(true);
       
        await uploadFile(uri, clubb.name, 'https://clubnight.ru/upload', false);
        setAdditionsToAdd([])
        setLoading(false);
        setProg(0);
        setRefresh(!refresh);
  
      }else{
        Alert.alert('Заполните все поля')
      }
    }
  const updateProduct = async(id)=>{
    setLoading(true)
    const docRef = doc(db, "club", clubb.cid);
    const docSnap = await getDoc(docRef);
    let newarr = [...docSnap.data().bar].map(el=>{
      if( el.id==id){
        return {...el, ...modalData}
        
      }else{return el}
     })
     try{
      await updateDoc(docRef, {
      bar: newarr
      
          });
      }catch(error){console.log(error)}
    setLoading(false)
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
  const refreshPhoto = async (id)=>{
    let url = await pickImageAsync();
    if(!url){return false}
    try {
  
      const callback = uploadProgressData => {
        const progress =uploadProgressData.totalBytesSent/uploadProgressData.totalBytesExpectedToSend;
         setProg(progress);

      };

      const up =   FileSystem.createUploadTask('https://clubnight.ru/upload', url,{
        httpMethod:'POST',
        headers:{
          uid:clubb.name
        },
        uploadType:FileSystem.FileSystemUploadType.MULTIPART,
        fieldName:'file'
       },
       callback
       );
    
    setLoading(true)
    const resp = await up.uploadAsync()
    
    const docRef = doc(db, "club", clubb.cid);
    const docSnap = await getDoc(docRef);
    let newarr = [...docSnap.data().bar].map(el=>{
      if( el.id==id){
        return {...el, img:resp.body.trim()}
        
      }else{return el}
     })
     
      await updateDoc(docRef, {
      bar: newarr
      
          });
     
    setLoading(false)
    setModal2(false)
    setProg(0);
    setRefresh(!refresh);
  }
  catch(error){console.log(error)}

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
      return(url)
    } else {

      // setModal(false)
    }
  };

  
  const addToOrder = async (data)=>{
    
    const {id,name, img, cost } = data
    // setOrderArr([...orderArr,{id, num, name, img, cost}])
    dispatch(setOrder({order: order?[...order, {id, num, name, img, cost, orderAdditions}]:[{id, num, name, img, cost, orderAdditions}]}))

  }
    console.log('modalData')
    console.log(modalData)
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
              <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center',paddingBottom:50}}>
            <Image
            style={{height:300, width:300, marginVertical:20}}
            source={{uri: modalData.img}}
            heigth={300}
            width={300}
            />
            
            {isMy?(<>
            <TouchableOpacity
            onPress={ ()=>{refreshPhoto(modalData.id)}}
               style={styles.btnstyle}>
                <Text style={styles.btntextstyle}>Обновить фото</Text>
            </TouchableOpacity>
            <TextInput onChangeText={(text)=>setModalData({...modalData, name:text})} value={modalData.name} style={styles.textinfoInput}/>
            <TextInput onChangeText={(text)=>setModalData({...modalData, opis:text})} value={modalData.opis} style={[styles.textinfoInput, { paddingHorizontal:10}]}/>
            <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
              <TextInput keyboardType='number-pad' onChangeText={(text)=>setModalData({...modalData, cost:text})} value={modalData.cost} style={[styles.textinfoInput,{width:100}]}/>
              <Text>р.</Text>
            </View>
            <Text style={{marginVertical:10}}>Выберите добавки доступные для этого продукта:</Text>
            <FlatList
                style={{}}
                horizontal
                data={additions}
                renderItem={({item})=>{console.log(item);return(<>
                <View style={{flexDirection:'column', justifyContent:'center', alignItem:'center', marginHorizontal:20}}>
                  <Text style={{textAlign:'center'}}>{item.name}</Text>
                  <BouncyCheckbox  
                    disableText
                    style={{alignSelf:'center'}}
                    isChecked={additions.length>0&&modalData.additions.some(el=>el.id==item.id)} 
                    onPress={()=>{
                      console.log('modalData.additions')
                      console.log(modalData.additions)
                    setModalData((prevState=>{if(prevState.additions.some(el=>el.id==item.id)){
                      return({...prevState, additions:prevState.additions.filter(el=>el.id!=item.id)})
                    }else{
                      return({...prevState, additions:[...prevState.additions, item]})
                    }
                  }))
                    }} 
                  />
                  </View></>)}}
                />
            </>)
            :(<>
            <NumericInput rounded minValue={1} maxValue={10} value={num} onChange={value => setNum(value*1)} />
            <Text style={styles.textinfo}>{modalData.name}</Text>
            <Text style={[styles.textinfo, { paddingHorizontal:10}]}>{modalData.opis}</Text>
            <Text style={styles.textinfo}>{modalData.cost+'р.'}</Text>
            <Text style={{marginVertical:10}}>Выберите добавки:</Text>
            <FlatList
                style={{}}
                horizontal
                data={modalData.additions}
                renderItem={({item})=>{console.log(item);return(<>
                <View style={{flexDirection:'column', justifyContent:'center', alignItem:'center', marginHorizontal:20}}>
                  <Text style={{textAlign:'center'}}>{item.name}</Text>
                  <BouncyCheckbox  
                    disableText
                    style={{alignSelf:'center'}}
                    isChecked={additionsToAdd.length>0&&additionsToAdd.some(el=>el.id==item.id)} 
                    onPress={()=>{
                    setOrderAdditions((prevState=>{if([...prevState].includes(item)){
                      return([...prevState.filter(el=>el!=item)])
                    }else{
                      return([...prevState, item])
                    }
                  }))
                    }} 
                  />
                  </View></>)}}
                />
            </>)}
            
            
            
            {isMy?(<>
            <View style={{flexDirection:'row', gap:10}}>
              <TouchableOpacity
              style={styles.btnstyle}
              onPress={()=>{deleteItem(modalData.id)}}
              ><Text style={styles.btntextstyle}>Удалить</Text >
              </TouchableOpacity>
              <TouchableOpacity
              style={styles.btnstyle}
              onPress={()=>{switchItem(modalData.availible, modalData.id)}}
              ><Text style={styles.btntextstyle}>{modalData.availible?'Нет в наличии':'В наличии'}</Text >
              </TouchableOpacity>
            </View>
            <Button style={{marginTop:0}} onPress={()=>{updateProduct(modalData.id)}}>Сохранить</Button>

            </>):(<>
            <Button  onPress={()=>{addToOrder(modalData);setNum('1'); setOrderAdditions([]); setModal2(false);}}>Добавить в заказ</Button>
            </>)}
            </View>
            </ScrollView>
            
            <TouchableOpacity
            style={[styles.btnstyle, {position:'absolute', bottom:0, width:200, marginBottom:0, borderBottomLeftRadius:0,borderBottomRightRadius:0, backgroundColor:'#bbb'}]}
            onPress={()=>setModal2(false)}>
              <Text style={styles.btntextstyle}>Закрыть</Text>
            </TouchableOpacity>

        </BlurView></>)}
      </Modal>
      <Modal
      visible={modal}

      >{loading?(<>
     {loader()}
      </>):(<>
      <ScrollView
      contentContainerStyle={{justifyContent:'flex-start', gap:20, alignItems:'center', flex:1}}
        style={{flex:1, height:'100%', flexDirection:'column',  backgroundColor:'#b1b1b1'}}
        >
          <TouchableOpacity
          onPress={()=>pickImageAsync()}
          style={[styles.btnstyle, {width:100, height:100, borderRadius:5}, uri&&{backgroundColor:'#badcfc'}]}
          labelStyle={{fontSize:10}}
          ><Text style={styles.btntextstyle}>{uri?"фото выбранно. можно изменить":"выберите фото"}</Text></TouchableOpacity>
          <TextInput onChangeText={setName} style={styles.textinfoInput} placeholder="Название"></TextInput>
          
          <TextInput numberOfLines={5} onChangeText={setOpis} multiline={true} style={styles.textinfoInput} placeholder="Описание"></TextInput>
          <View style={{height:100}}>
                <Text>Добавки к продукту</Text>
                <FlatList
                style={{width:'100%'}}
                horizontal
                data={additions}
                renderItem={({item})=>{console.log(item);return(<>
                <View style={{flexDirection:'column', justifyContent:'center', alignItem:'center', marginHorizontal:20}}>
                  <Text style={{textAlign:'center'}}>{item.name}</Text>
                  <BouncyCheckbox  
                    disableText
                    style={{alignSelf:'center'}}
                    isChecked={additionsToAdd.length>0&&additionsToAdd.some(el=>el.id==item.id)} 
                    onPress={()=>{
                     
                      setAdditionsToAdd(prevState=>(additionsToAdd.length>0&&additionsToAdd.some(el=>el.id==item.id)?
                      [...prevState].filter(el=>el.id!=item.id):
                      [...prevState, item]
                      ))
                    }} 
                  />
                </View></>)}}
                />
          </View>
          <TextInput keyboardType='number-pad' onChangeText={setCost} style={[styles.textinfoInput,{width:100}]} placeholder="Цена"></TextInput>
          <Button
          onPress={()=>addDrink(false)}
          
          >Добавить</Button>
          <TouchableOpacity
            onPress={()=>{setModal(false); setAdditionsToAdd([])}}
            style={[styles.btnstyle, {position:'absolute', bottom:0, width:200, marginBottom:0, borderBottomLeftRadius:0,borderBottomRightRadius:0, backgroundColor:'#bbb'}]}
          ><Text style={styles.btntextstyle}>Закрыть</Text></TouchableOpacity>
          </ScrollView></>)}

      </Modal>
        {isMy?(<>
        <TouchableOpacity
        onPress={()=>navigation.push('MyClubs' ,{clubs: uData.myClubs, copy:clubb.cid})}
        style={{alignSelf:'center', marginTop:15}}
        >
        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

          <Ionicons name='copy-outline' color='#ffffff' size={25} style={{marginHorizontal:5}}/>
          <Text>Скопировать меню с другого магазина</Text>
        </View>  
        </TouchableOpacity>
        <TouchableOpacity
          style={{alignSelf:'center', marginTop:15}}
          onPress={()=>{
            setModal(true)
            }}>
          <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
          <Ionicons name="add-circle-sharp" color='#ffffff' size={30} style={{marginHorizontal:5}}/>
          <Text>Добавить позицию</Text>
          </View>
      </TouchableOpacity>
      
      </>):(<></>)}


      <FlatList
        //contentContainerStyle={{flexDirection:'row', justifyContent:'space-around',paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        showsHorizontalScrollIndicator={false}
        data={bar}
        keyExtractor={(item, index) => index}
        renderItem={({ item }) => uData.uid==owner||item.availible?(
        <><Napitok press={()=>{
          setModalData({
            id:item.id,
            img:item.img,
            name:item.name,
            opis:item.opis,
            cost:item.cost,
            availible:item.availible,
            additions:item.additions
          })
         
          setModal2(true);
        }} nap={item} navigation={navigation} /></>):(null)}
      />


    </View>
    )
  }
export default Products