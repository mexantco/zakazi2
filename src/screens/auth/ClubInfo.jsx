import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { Ionicons, MaterialIcons,SimpleLineIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system";
import * as Progress from "react-native-progress";
import * as ImagePicker from "expo-image-picker";
import { changeWorking, getClubDataById } from "../../utils/club";
import DatePicker from "react-native-date-picker";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  getFirestore,
  collection,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { useScrollToTop } from "@react-navigation/native";
import {Switch} from '@petros-g/react-native-switch';
import ProgressModal from '../../components/ui/ProgressModal';
import Button from "../../components/ui/Button";
import { mainTheme } from "../../config/theme";
import { mainShadow } from "../../components/ui/ShadowStyles";
const Clubinfo = ({ route }) => {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    // 'AA-Neon': require('../../fonts/AA-Neon.ttf'),
    "canis-minor": require("../../fonts/canisminor.ttf"),
    "Gilroy-Light": require("../../fonts/Gilroy-Light.otf"),
    "Gilroy-ExtraBold": require("../../fonts/Gilroy-ExtraBold.otf"),
    "Gilroy-Medium": require("../../fonts/Gilroy-Medium.ttf"),
    "Gilroy-Thin": require("../../fonts/Gilroy-Thin.ttf"),
  });
  const club = route.params.club;
 
  const [prog, setProg] = useState(0);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setResfresh] = useState(false);
  const [datePick, setDatepick] = useState(false);
  const [newDate, setNewdate] = useState(null);
  const dispatch = useDispatch();
  const [isMy, setIsmy] = useState(false);
  const user = useSelector((state) => state.user.userData);
  const db = getFirestore();
  const [clubData, setClubdata] = useState(club);
  const [isFav, setIsfav] = useState(false);
  const [isSHipping, setIsShipping] = useState(club.shipping)
  const [isWorking, setIsWorking] = useState(club.working)
  const [shippingCost, setShippingCost]= useState('');
  const switchRef = useRef(null)
  const [changed, setChanged] = useState(false)
  const clubb = useSelector(state=>state.clubs.clubData)
  
  //////animations
  
  /////////// delete banner
  useEffect(()=>{
    setClubdata(clubb)
  }, [clubb])
  const removeBanner = async (url) => {
    setModal(true);
    setLoading(true);
    let newArr = clubData.banners.filter((item) => item.url != url);
    const docRef = doc(db, "club", club.cid);
    const docSnap = await getDoc(docRef);
    await updateDoc(docRef, {
      banners: newArr,
    });
    setModal(false);
    setLoading(false);
    setResfresh(!refresh);
  };
  const changeShipping = async()=>{
    if(isSHipping){
      await updateDoc(doc(db, "club", club.cid),{
        shipping:false
      })
    }else{
      await updateDoc(doc(db, "club", club.cid),{
        shipping:true
      })
    }
    
    setIsShipping(!isSHipping)

  }
  
  const changeShippingCost = async()=>{
    setChanged(false)
    if(shippingCost!=''){
      await updateDoc(doc(db, "club", club.cid),{
        shippingCost: shippingCost
      })
      setChanged(true)
    }else{
      Alert.alert('Сначала', 'Укажите цену')
    }
    

  }
  ///////////////
  useEffect(() => {
   
    // console.log(user)
    if( user&&user.favourite.includes(club.cid)){
      setIsfav(true)
    }else{setIsfav(false)}
    if (club.owner == user.uid) {
      setIsmy(true);
    }
    const fn = async () => {
      
      setClubdata(clubb);
      setIsShipping(clubb.shipping)
      
      // console.log(cData.shipping)

    };
    fn();
  }, [user, refresh]);
  /////////////////////// добавить удалить из избранного
  const setFavourite = async ()=>{
    if(isFav){
      await updateDoc(doc(db, "users", user.uid), {
        favourite: [...user.favourite.filter(el=>el!=club.cid)]
      });
    }else{
      await updateDoc(doc(db, "users", user.uid), {
      favourite: [...user.favourite, club.cid]
    });
    }
    
  }
  ///////////////////////// добавляем банер
  const addBanner = async () => {
    // setDatepick(true);
    pickImageAsync("banner");
  };
  useEffect(() => {
    if (!datePick && newDate) {
      pickImageAsync("banner");
    }
  }, [newDate]);
  const uploadFile = async (fileUri, uData, urlApi, type) => {
    // console.log(uData);

    // Замените на ваш конечный пункт API

    try {
      const callback = (uploadProgressData) => {
        const progress =
          uploadProgressData.totalBytesSent /
          uploadProgressData.totalBytesExpectedToSend;
        setProg(progress);
      };

      const up = FileSystem.createUploadTask(
        urlApi,
        fileUri,
        {
          httpMethod: "POST",
          headers: {
            uid: uData,
          },
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "file",
        },
        callback
      );
      const resp = await up.uploadAsync();
      ///////////////upload to firebase

      
      const docRef = doc(db, "club", club.cid);
      const docSnap = await getDoc(docRef);
      if (type == "banner") {
        await updateDoc(docRef, {
          banners: [
            ...docSnap.data().banners,
            {
              date: Date.now()/1000,
              url: resp.body.trim(),
            },
          ],
        });
      } else {
        await updateDoc(docRef, {
          ava: resp.body.trim(),
        });
      }
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
    }
  };
  
  const pickImageAsync = async (type) => {
    setModal(true);
    setLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // console.log(result);

      let uri = result.assets[0].uri;
      // setUri(uri)
      await uploadFile(
        uri,
        club.name,
        "https://clubnight.ru/upload_photo_club.php",
        type
      );
      
      setLoading(false);
      setProg(0);
      setModal(false);
      setResfresh(!refresh);
    } else {
      setModal(false);
    }
  };

  let currentBanners=[];
 
  if (clubData.banners.length > 0) {
    clubData.banners.forEach((banner) => {
      if (
        banner.date.seconds > Date.now() / 1000 - 28800 &&
        banner.date.seconds < Date.now() / 1000
      ) {
        currentBanners.push(banner);
      }
    });
  }
  // console.log(currentBanners)
  const cutDate = new Date();
  let sorted = [...clubData.banners]
    .sort((a, b) => (a.date.seconds < b.date.seconds ? -1 : 1))
    .filter((el) => {
      if (el.date.seconds > Date.now() / 1000) {
        return el;
      }
    });
  if (isMy) {
    return (
      <View style={{ flex: 1 }}>
        <DatePicker
          modal={true}
          androidVariant="iosClone"
          open={datePick}
          date={cutDate}
          onConfirm={(date) => {
            setDatepick(false);
            setNewdate(date);
          }}
          onCancel={() => {
            setDatepick(false);
          }}
        />
        <ProgressModal modal={modal} prog={prog} loading={loading}/>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ justifyContent: "flex-start", alignItems: "center", paddingHorizontal:20 }}>
          <View style={{width:'100%', height:50,justifyContent:'space-between', alignItems:'center', flexDirection:'row'}}>
            <Text style={{color:!clubb.working?mainTheme.colorWarning:mainTheme.colorDarkText, marginHorizontal:10, width:100}}>Магазин {clubb.working?'работает':'не работает'}</Text>
            {/* <Switch
                activeText={'On'}
                inActiveText={'Off'}
                value={isWorking}
                onValueChange={()=>{changeWorking(isWorking, club.cid); setIsWorking(!isWorking);}}
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
                style={{backgroundColor:clubb.working?mainTheme.colorWarning:'#c9c9c9',...mainShadow, flex:1, padding:2, borderRadius:5}}
                onPress={()=>{changeWorking(clubb.working, club.cid); }}
              >
                <Text style={{fontSize:11,textAlign:'center'}}>{clubb.working?'остановить ':'возобновить '}</Text>
                <Text style={{fontSize:14,textAlign:'center'}}>работу</Text>
              </TouchableOpacity>
          </View>

          <View style={{width:'100%', height:50,justifyContent:'space-between', alignItems:'center', flexDirection:'row'}}>
            <Text style={{marginHorizontal:10, width:100}}>Доставка {!isSHipping?'выключена':'включена'}</Text>
            
            <TextInput 
            onChangeText={(text)=>{setShippingCost(text)}}
            placeholder={clubData.shippingCost+' р.'} 
            editable={isSHipping} 
            keyboardType='numeric'
            style={{fontSize:12, marginLeft:10, width:50, textAlign:'center', marginHorizontal:5, backgroundColor:'#fff', padding:5, borderRadius:10, borderWidth:isSHipping?1:0, borderColor:'#bbb'}} 
            maxLength={4}
            />
            <TouchableOpacity 
            onPress={()=>{changeShippingCost()}}
            disabled={!isSHipping} style={{marginLeft:10, backgroundColor:isSHipping?'#42adff':'#bbb', padding:5, borderRadius:10}}>
            <Ionicons name="checkmark" size={20} color={changed?"#0f0":"#c5c5c5"}/>
            </TouchableOpacity>
            <Switch
                activeText={'On'}
                inActiveText={'Off'}
                value={isSHipping}
                onValueChange={()=>{changeShipping()}}
                // enableDrag
                trackWidth={50}
                trackHeight={20}
                circleSize={25}
                circleOffset={3}
                circleActiveColor="white"
                trackActiveColor="#42adff"
                animationDuration={200}
              />
          </View>
             <Button  style={{backgroundColor:'#42adff'}} onPress={()=>{navigation.navigate('Statistic', {cid:clubData.cid})}}><Text style={{fontSize:14, marginRight:20}}>Cтатистика продаж {clubData?.ruName} </Text><SimpleLineIcons  name='graph' size={20} /></Button>   
            <View>
              <Image
                height={200}
                width={200}
                style={{ borderRadius: 100, margin: 20 }}
                source={{ uri: clubData.ava }}
              />
              <TouchableOpacity
                onPress={() => {
                  pickImageAsync();
                }}
                style={{ position: "absolute", top: 10, right: 10 }}
              >
                <Ionicons name="repeat-outline" size={30} />
              </TouchableOpacity>
            </View>
            <Text
              style={styles.textInfo}
            >
              Добавить запись:
            </Text>

            <TouchableOpacity
              onPress={() => {
                addBanner();
              }}
            >
              <Ionicons name="add-circle-sharp" size={30} />
            </TouchableOpacity>
            {sorted.map((item, idx) => {
              let date = new Date(item.date.seconds * 1000);
              return (
                <View key={idx}>
                  <Text>
                    Дата записи:{" "}
                    {date.toLocaleString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </Text>
                  <Image
                    height={300}
                    width={300}
                    style={{ borderRadius: 20, margin: 20 }}
                    source={{ uri: item.url }}
                  />
                  <TouchableOpacity
                    style={{ position: "absolute", bottom: 30, right: 30 }}
                    onPress={() => {
                      removeBanner(item.url);
                    }}
                  >
                    <Ionicons
                      name="trash-sharp"
                      size={30}
                      color={"#000"}
                      style={{}}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}

            {club.banners.length > 0 ? <></> : <></>}
          </View>
        </ScrollView>
      </View>
    );
  } else {
    ///////////////////////////
    /////////////////////////////
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ justifyContent: "flex-start", alignItems: "center" }}>
            <Text style={styles.textHeader}>
              Добро пожаловать в {clubData.ruName}
            </Text>

            <View style={{width:'100%', alignItems:'center', paddingHorizontal:30}}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
              <TouchableOpacity onPress={()=>(setFavourite())} style={{alignSelf:'flex-start'}}>
              <MaterialIcons color={isFav?'#7ad7be':'#000'} name={isFav?"favorite":"favorite-border"} size={30} />
              </TouchableOpacity> 
              <Text>{clubData.shipping?clubData.shippingCost==0?'Есть бесплатная доставка':`Есть доставка за ${clubData.shippingCost}р.`:'Доставка пока не работает'}</Text>
              </View>
              <Image
                height={200}
                width={200}
                style={{ borderRadius: 100, margin: 20 }}
                source={{ uri: clubData.ava }}
              />
            </View>
            {currentBanners&&currentBanners.length>0 ? (
              <>
              <Text style={styles.textInfo}>Актуальная информация:</Text>
              {currentBanners.map(banner=>
              <>
              <Image
                  height={300}
                  width={300}
                  style={{ borderRadius: 20, margin: 20 }}
                  source={{ uri: banner.url }}
                />
                <Text style={styles.textInfo}>{banner.text}</Text>
                </>
                )}
                
              </>
            ) : (
              <></>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
};
const styles = StyleSheet.create({
  textHeader: {
    fontSize: 24,
    fontFamily: "Gilroy-Medium",
    textAlign: "center",
    color: "#202020",
    padding: 10,
  },
  textInfo: {
    fontSize: 24,
    fontFamily: "Gilroy-Thin",
    color: "#202020",
    padding: 10,
  },
});
export default Clubinfo;
