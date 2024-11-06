import { View, Text, Image, Alert, PermissionsAndroid, Linking, Dimensions, FlatList, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import React, {useState, useEffect, useMemo, useRef} from 'react'
import * as Location from 'expo-location';
import YaMap, {Marker, Animation} from 'react-native-yamap2';
import {enterClub, exitClub, getClubDataById, getClubs} from '../../utils/club'
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from '../../reducers/user';
import { getUserDataById } from '../../utils/user';
import { Shadow } from 'react-native-shadow-2';
import { BaiduMapManager, MapView, MapTypes, Geolocation, Overlay, MapApp } from 'react-native-gizwits-baidu-map';
import { shadow } from 'react-native-paper';
import { getFirestore, query, collection, getDocs} from 'firebase/firestore';
import { Ionicons, AntDesign, Entypo, MaterialCommunityIcons, Foundation, FontAwesome, MaterialIcons } from '@expo/vector-icons';

BaiduMapManager.initSDK("sIMQlfmOXhQmPLF1QMh4aBp8zZO9Lb2A");
const width = Dimensions.get('window').width;

const Maps = ({navigation, route}) => {
    const [isUserinclub, setIsuserinclub] = useState(false);
    const [location, setLocation] = useState(null);
    const [region, setRegion] = useState(null)
    const user1 = route.params.user;
    const [curUser, setCurUser] = useState(user1);
    const [refresh,setResfresh] = useState(false);
    const [isVisible, setIsvisible] = useState(true)
    const [zoom, setZoom] = useState(16)
    const [lat, setLat] = useState(null)
    const [lon, setLon] = useState(null)
    const dispatch = useDispatch();
    const clubs = useSelector(state=>state.clubs.clubs);
    const YaRef = useRef(null);
    const [clusters, setClusters] = useState([])
    const [isCoords, setIscoords] = useState();
    const [showFav, setShowfav] = useState(false);
    console.log('sssasas')
    console.log(route.params)
    const hideAnimation= route.params.hide;
    const colors = {freeShipping:'#5fb96b', shipping:'#be6b61'}
    let trig = false;
    const user = useSelector((state) => state.user.userData);
      useEffect(()=>{
      let clustersArr=[]
      
     if(clubs){
      let arr = clubs.map(el=>el)
      for(let i=0; i<arr.length; i++){
        // console.log(Math.abs(clubs[i].lat-clubs[i+1].lat))
      if(Math.abs(!i+1>arr.length-1&&clubs[i].lat-clubs[i+1].lat)>zoom/40){
        // arr.splice[i,2, {lat: (clubs[i].lat+clubs[i+1].lat)/2, lon:(clubs[i].lon+clubs[i+1].lon)/2}]
        clustersArr.push({lat: (clubs[i].lat+clubs[i+1].lat)/2, lon:(clubs[i].lon+clubs[i+1].lon)/2, cluster:true})
        i++
      }else{
        clustersArr.push(arr[i])
      }}
     }
     if(clubs.length!=clustersArr.length){
      // setClusters(clustersArr)
     }
     
    }, [zoom])

// console.log('================!!')
// console.log(clusters)
// console.log(zoom/40)
    useEffect(()=>{
       setResfresh(!refresh);
    },[clubs])

    function getAngularDistance(lat1, lon1, lat2, lon2) {
      var R = 6371; // Радиус Земли в километрах
      var dLat = (lat2 - lat1) * Math.PI / 180;
      var dLon = (lon2 - lon1) * Math.PI / 180; 
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return (c * R)/111.12 ;
    }
    useEffect(() => {

        let isMounted = true;
        let locationSubscription
        // Запрос разрешения на использование местоположения
        (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.error('Permission to access location was denied');
            return;
          }
          let dist;
          // Начать отслеживание местоположения с интервалом в 10000 миллисекунд (10 секунд)
          let newLocation = await Location.getCurrentPositionAsync(
            {accuracy: Location.Accuracy.Highest, maximumAge: 10000})
            setLocation(newLocation.coords)
            YaRef.current?.setCenter({lon:newLocation.coords.longitude, lat:newLocation.coords.latitude}, 14, 0, 0, 1 )
            
        })();

        // Очистить подписку при размонтировании компонента
        return () => {
          isMounted = false;
          if (locationSubscription) {
            locationSubscription.remove();
          }
        };
      }, [curUser]);

       
      const handleSelectClub = (club)=>{

          YaRef.current?.setCenter({lon:club.lon, lat:club.lat}, 14, 0, 100, 1 )
      }
      
  return (
    <View style={{paddingHorizontal:15,  paddingBottom:0, flex:1, height:'100%'}}>
      <View style={{flexDirection:'row', borderTopRightRadius:25, borderTopLeftRadius:25, width:'100%', overflow:'visible', backgroundColor:'#c6c3c3'}}>
        <TouchableOpacity activeOpacity={1} onPress={()=>setShowfav(false)} style={[styles.favBtn, showFav?null:styles.favBtnActive]}>
          <View style={[styles.favBtnBack, !showFav?styles.favBtnBackActive:null]}></View>
          <Text>Все</Text>
          </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={()=>setShowfav(true)} style={[styles.favBtn, showFav?styles.favBtnActive:null]}>
        <View style={[styles.favBtnBack, showFav?styles.favBtnBackActive:null]}></View>
          <Text>Избранное</Text>
          </TouchableOpacity>
      </View>

       <View

            style={{
              borderTopWidth:3,
              borderStartWidth:1,
              borderRightWidth:1,
              borderColor:'#faf9ff',
              borderRadius: 25,
              overflow: "hidden",
              height:'70%',
              width:'100%',
              margin:0,
              flexGrow:1
            }}
            >


      <YaMap
      ref={YaRef}
      nightMode={false}
      
      tiltGesturesEnabled={false}
      rotateGesturesEnabled={false}
      onMapLoaded={()=>{setIsvisible(true);}}
      // onCameraPositionChangeEnd={({nativeEvent})=>{setZoom(nativeEvent.zoom)}}
      onCameraPositionChange={event=> {if(event.nativeEvent.zoom!=zoom){
        let zoom = event.nativeEvent.zoom
        let clustersArr=[]
      
        if(clubs){
         let arr = clubs.map(el=>el)
        //  arr.pop()
        
        const cluster = ()=>{
          // let countClusters=0
          for(let i=0; i<arr.length-1; i++){
            
            // console.log(arr)
            for(j=i+1; j<arr.length; j++){
                let dist = getAngularDistance(arr[i].lat, arr[i].lon, arr[j].lat, arr[j].lon)
              if(dist<(((dist>0.1?7:5)/(zoom))-0.44)){
            // console.log('dist'+(arr[i].distance||0+dist))    
            // console.log('count'+((arr[i].count||1)+(arr[j].count||1)))    
             
           newEl = {
             lat: (arr[i].lat+arr[j].lat)/2,
             lon:(arr[i].lon+arr[j].lon)/2,
             cluster:true,
             count:(arr[i].count||1)+(arr[j].count||1),
             distance:dist }
           arr.splice(i,1, newEl)
           arr.splice(j,1)
        
           cluster()
          
                 }

              }
          }


            // console.log(getAngularDistance(arr[i].lat, arr[i].lon, arr[i+1].lat, arr[i+1].lon))
         
        // if(countClusters!=0){cluster()}
        }
        cluster()
          if(clusters.length!=arr.length){
          // console.log('--++---')
         setClusters(arr)
        }   
        }
        
      }}}
      showUserPosition={false}
      style={{

          width:'100%',
          height:'105%'
        }}
      // showUserPosition={!isUserinclub}
      followUser={false}
      initialRegion={isCoords ?{
        lat: 56.4,
        lon: 94.6,
        // zoom:zoom,
        azimuth:0,
        tilt:0
    }:null}
      >
      {  clusters.map((club, id)=>{
        // console.log(user)
        if(user&&showFav&&!user.favourite.includes(club.cid)){
          return 
        }
        let idx = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
        return(
        <Marker
 
         visible={true}
         children={club.cluster?
          <View style={{borderWidth:5, borderColor:'#a9d9a9', height:48, width:48, borderRadius:24, backgroundColor:'#fff', zIndex:2, justifyContent:'center', alignItems:'center'}}>
            <Text>{club.count}</Text>
          </View>
          :
          <View style={{height:52, width:52, borderWidth:1, borderColor:'transparent', overflow:'visible',  justifyContent:'center', alignItems:'center', borderRadius:26}}>
          <Image 
          width={48} height={48} style={{borderRadius:24}} source={{uri: club.ava}}/>
          {club.shipping&&<MaterialCommunityIcons style={{padding:1, position:'absolute', bottom:0, right:0, zIndex:5,backgroundColor:club.shippingCost=='0'?'#5fb96b':'#6f6fb9', borderRadius:10}} name='car-hatchback' size={18} color={'#fff'}/>
}
          </View>}
          key={idx}
          // source={{uri: club.ava }}
          onPress={async ()=>{
          if(club.cluster){
            YaRef.current?.setCenter({lon:club.lon, lat:club.lat}, (club.distance>0.1?12:9)/(club.distance+0.64), 0, 100, 1 )
          }else{
            hideAnimation();
            setTimeout(async()=>{
              let clubData = await getClubDataById(club.id); navigation.navigate('Club',{club: clubData})
            },300)
            }}}
          point={{lat: club.lat,  lon: club.lon}}
          />
          
          )


        })}
       </YaMap>
       </View>
       <View style={{flexDirection:'row', justifyContent:'flex-start', alignItems:'center', height:'15%',  width:'100%', marginTop:20, borderRadius:25, backgroundColor:'#fff', borderTopWidth:2, borderStartWidth:1, borderRightWidth:1, borderColor:'#bbb', margin:0}}>
       <FlatList
       style={{flex:1}}
       data={
        clubs.map(el=>el).sort((a,b)=>(getAngularDistance(a.lat, a.lon, location?.latitude, location?.longitude)-getAngularDistance(b.lat, b.lon, location?.latitude, location?.longitude)))
      }
       keyExtractor={(item, index) => index}
        horizontal={true}
       renderItem={({item, index})=>{
        if(showFav&&!user.favourite.includes(item.cid)){
          return 
        }
        return(
       <Pressable
       style={{flexDirection:'column', alignItems:'center'}}
       onPress={()=>{handleSelectClub(item)}}
       >
        <Image width={58} height={58} style={{borderRadius:29, marginHorizontal:10}} source={{uri: item.ava}}/>
        <Text ellipsizeMode='tail' numberOfLines={1} style={{textAlign:'center', color:'#000', fontSize:10, width:58, overflow:'hidden'}}>{item.ruName}</Text>  
       </Pressable>)}
       }
       />

        </View>
    </View>
  )
}
const styles = StyleSheet.create({
  favBtn: {
    width: "30%",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    
    height: 50,
    backgroundColor: "#c6c3c3",
    borderTopLeftRadius:25,
    borderTopRightRadius:25
  },
  favBtnActive: {
    backgroundColor: "#fff",
    width: "70%",
  },
  favBtnBack: {
    borderTopLeftRadius:25,
    borderTopRightRadius:25,
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: "#c6c3c3",
    width: "100%",
    height: 100,
    
  },
  favBtnBackActive:{
    backgroundColor: "#fff",
  }
});
export default Maps