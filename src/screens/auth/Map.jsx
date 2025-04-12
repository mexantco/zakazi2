import { View, Text, Image, Alert, PermissionsAndroid, Linking, Dimensions, FlatList, Pressable, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React, {useState, useEffect, useMemo, useRef} from 'react'
import * as Location from 'expo-location';
import {enterClub, exitClub, getClubDataById, getClubs} from '../../utils/club'
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from '../../reducers/user';
import { getUserDataById } from '../../utils/user';
import { Shadow } from 'react-native-shadow-2';
// import { BaiduMapManager, MapView, MapTypes, Geolocation, Overlay, MapApp } from 'react-native-gizwits-baidu-map';
import { Icon, shadow } from 'react-native-paper';
import { getFirestore, query, collection, getDocs} from 'firebase/firestore';
import { Ionicons, AntDesign, Entypo, MaterialCommunityIcons, Foundation, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { LatLng, LeafletView } from 'react-native-leaflet-view';
import { MapView, RasterSource, VectorSource, StyleURL, RasterLayer, Camera, MarkerView } from "@maplibre/maplibre-react-native";
import { OSM_RASTER_STYLE } from '../../../constants/OSM_RASTER_STYLE';
import Supercluster from 'supercluster';
import RBSheet from 'react-native-raw-bottom-sheet';
import { mainTheme } from '../../config/theme';
import { ScrollView } from 'react-native-gesture-handler';
import Button from '../../components/ui/Button';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// BaiduMapManager.initSDK("sIMQlfmOXhQmPLF1QMh4aBp8zZO9Lb2A");
const width = Dimensions.get('window').width;

const renderClubList = (club, index, handleClick)=>{
  return(
    <TouchableOpacity
    onPress={()=>{handleClick(club.clubId||club.cid)}}
    key={index} 
    style={{backgroundColor:index%2==0?'#ffffff99':'#eeeeee50', borderRadius:20,  marginVertical:10, flexDirection:'row', alignItems:'center', height:100, width:'100%'}}>
            <Image height={70} width={70} style={styles.clubImage} source={{uri: club.ava}}/>
            <Text>{club.ruName}</Text>
    </TouchableOpacity>
  )
}

const Maps = ({navigation, route}) => {
    const [location, setLocation] = useState(null);
    const RBRef  =useRef(null)
    const user1 = route.params.user;
    const [curUser, setCurUser] = useState(user1);
    const [zoom, setZoom] = useState(0)
    const dispatch = useDispatch();
    const clubs = useSelector(state=>state.clubs.clubs);
    const YaRef = useRef(null);
    const cameraRef = useRef(null);
    const [clusters, setClusters] = useState([])
    const [showFav, setShowfav] = useState(false);
    const mapRef = useRef(null)
    const hideAnimation= route.params.hide;
    const colors = {freeShipping:'#5fb96b', shipping:'#be6b61'}
    const user = useSelector((state) => state.user.userData);
    const [listShow, setListShow] = useState(false)
    const superclusterRef = useRef(null);
    const [RBList, setRBList] = useState([])
    const mapHeigth = useSharedValue(70)
    const listHeigth = useSharedValue(15)
    const borderMap = useSharedValue(3)
    const animStyle = useAnimatedStyle(()=>({
      height: mapHeigth.value+'%',
      borderTopWidth: borderMap.value
    }))
    const animStyleList = useAnimatedStyle(()=>({
      height: listHeigth.value+'%'
    }))
    const animationToggle = ()=>{
      setListShow(!listShow)
      mapHeigth.value = withTiming(!listShow?0:70,{
        duration:300
      })
      listHeigth.value = withTiming(!listShow?90:15,{
        duration:300
      })
      borderMap.value = withTiming(!listShow?0:3,{
        duration:500
      })
    }

    const handleListMode = ()=>{
      animationToggle()
    }

    let currentZoom 
    const updateClusters = async (event) => {
      if (!mapRef.current || !superclusterRef.current) return;
      // console.log(event)
      const bounds = event.properties.visibleBounds;
      const zoom = event.properties.zoomLevel;
      currentZoom = event.properties.zoomLevel;
      // console.log('bounds')
      // console.log(bounds.flat())
      // console.log(zoom)
      const bbox = [bounds.flat()[2], bounds.flat()[3], bounds.flat()[0],bounds.flat()[1]]
      // const bbox = [
      //   bounds[0].toArray()[0], // minX
      //   bounds[0].toArray()[1], // minY
      //   bounds[1].toArray()[0], // maxX
      //   bounds[1].toArray()[1], // maxY
      // ];
      setZoom(zoom)
      const newClusters = superclusterRef.current.getClusters(bbox, Math.floor(zoom));
      // console.log('newClusters')
      // console.log(newClusters)
      setClusters(newClusters);
    };
    const handleClickonClub = async(id)=>{
      RBRef.current.close()
      hideAnimation();
      setTimeout(async()=>{
        let clubData = await getClubDataById(id); navigation.navigate('Club',{club: clubData, location:location})
      },1000)
      }
      useEffect(()=>{
        
        superclusterRef.current = new Supercluster({
          radius: 35, // Расстояние в пикселях для кластеризации
          maxZoom: 16, // Максимальный уровень масштабирования для кластеризации
         
        });
    
        // Преобразуем данные клубов в формат, понятный Supercluster
        const points = clubs.map((club) => {
          if(user&&showFav&&!user.favourite.includes(club.cid)){return false}
          return({
          type: 'Feature',
          properties: { cluster: false, clubId: club.id, name: club.name, ava:club.ava, ruName:club.ruName },
          geometry: {
            type: 'Point',
            coordinates: [club.lon, club.lat],
          },
        })});
        // Загружаем данные в Supercluster
        superclusterRef.current.load(points);
        updateClusters();
    
     
    }, [showFav])
    const renderClusters = () => {
      return clusters.map((cluster, idx) => {
        const { geometry, properties } = cluster;
        const [longitude, latitude] = geometry.coordinates;
        
        // console.log(latitude)
        const isCluster = properties.cluster;
        // if(user&&showFav&&!user.favourite.includes(properties.clubId)){
        //   return 
        // }
        return(
          <MarkerView
        key={idx}
         coordinate={[longitude, latitude]}
         visible={true}
         children={isCluster?
          <View 
          style={{borderWidth:5, borderColor:'#a9d9a9', height:48, width:48, borderRadius:24, backgroundColor:'#fff', zIndex:2, justifyContent:'center', alignItems:'center'}}>
            <Pressable
            style={{height:48, width:48,justifyContent:'center', alignItems:'center'}}
            onPress={()=>{
              if (zoom>=15.5){
                setRBList(superclusterRef.current.getLeaves(properties.cluster_id))
                RBRef.current.open()
                return false
              }
              let expansionZoom = superclusterRef.current.getClusterExpansionZoom(cluster.properties.cluster_id)
              let coordinates = cluster.geometry.coordinates
              cameraRef.current.setCamera({
                centerCoordinate: coordinates,
                zoomLevel: expansionZoom+0.5,
                animationDuration: 1000,
              })
            }}
            >
            <Text>{properties.point_count}</Text>
            {zoom>=15.5&&
            <Text 
            // style={{transform:[{rotate:'90deg'}], marginLeft:3}}
            >
              &#x2026;
              </Text>}
            </Pressable>
          </View>
          :
          <View 
          style={{borderWidth:5, borderColor:'#a9d9a9', height:48, width:48, borderRadius:24, backgroundColor:'#fff', zIndex:2, justifyContent:'center', alignItems:'center'}}>
            <Pressable
            
            style={{height:48, width:48,justifyContent:'center', alignItems:'center'}}
            onPress={()=>{handleClickonClub(properties.clubId)}}
            >
              <View 
            style={{height:52, width:52, borderWidth:1, borderColor:'transparent', overflow:'visible',  justifyContent:'center', alignItems:'center', borderRadius:26}}>
            <Image 
            width={48} height={48} style={{borderRadius:24}} source={{uri: properties.ava}}/>
            {/* {club.shipping&&<MaterialCommunityIcons style={{padding:1, position:'absolute', bottom:0, right:0, zIndex:5,backgroundColor:club.shippingCost=='0'?'#5fb96b':'#6f6fb9', borderRadius:10}} name='car-hatchback' size={18} color={'#fff'}/>
            } */}
            </View>
            </Pressable>
          </View>
          }
          />
        )
      });
    };

    useEffect(()=>{
       cameraRef.current?.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 15,
        animationDuration: 2000,
       })
    },[location])
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
          setLocation({latitude:club.lat, longitude:club.lon})
          YaRef.current?.setCenter({lon:club.lon, lat:club.lat}, 14, 0, 100, 1 )
      }
  return (
    <View style={{paddingHorizontal:15,  paddingBottom:15, flex:1, height:'100%'}}>
      <RBSheet
      height={400}
      closeOnPressBack
      
      // dragOnContent={true}
      // draggable={true}
      openDuration={500}
      ref={RBRef}
      >
        <ScrollView style={{flex:1, backgroundColor:mainTheme.colorbackGround, paddingHorizontal:10}}>
        {RBList.map((item,index)=>renderClubList(item.properties, index, handleClickonClub)
          )
        }
        </ScrollView>
      </RBSheet>
      <View style={{flexDirection:'row', borderTopRightRadius:25, borderTopLeftRadius:25, width:'100%', overflow:'visible', backgroundColor:'#c6c3c3'}}>
        <TouchableOpacity activeOpacity={1} onPress={async()=>{cameraRef.current?.zoomTo(await mapRef.current.getZoom()-0.001,500);setShowfav(false)}} style={[styles.favBtn, showFav?null:styles.favBtnActive]}>
          <View style={[styles.favBtnBack, !showFav?styles.favBtnBackActive:null]}></View>
          <Text>Все</Text>
          </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={async ()=>{cameraRef.current?.zoomTo(await mapRef.current.getZoom()-0.001,500); setShowfav(true)}} style={[styles.favBtn, showFav?styles.favBtnActive:null]}>
        <View style={[styles.favBtnBack, showFav?styles.favBtnBackActive:null]}></View>
          <Text>Избранное</Text>
          </TouchableOpacity>
      </View>
        
       <Animated.View

            style={[{
              borderTopWidth:3,
              borderStartWidth:1,
              borderRightWidth:1,
              borderColor:'#faf9ff',
              borderRadius: 25,
              overflow: "hidden",
              width:'100%',
              margin:0,
            }, animStyle]}
            >
      <MapView 
      ref={mapRef}
      onRegionIsChanging={(event)=>updateClusters(event)}
      
      surfaceView
      // contentInset={20}
      rotateEnabled={false}
      logoEnabled={false}
      style={{ flex: 1 }} >
         <Camera
            ref={cameraRef}
            maxZoomLevel={16}
            // zoomLevel={15}
            // centerCoordinate={[location?.longitude||94.6, location?.latitude||56.4]}
          />
          {renderClusters()}
       
          
          <RasterSource
              id="osm-raster-source"
              tileUrlTemplates={OSM_RASTER_STYLE.sources.osm.tilesVector}
              {...OSM_RASTER_STYLE.sources.osm}
          >
              <RasterLayer id="osm-raster-layer" style={{ rasterOpacity: 1 }} />
            </RasterSource>
            {/* <VectorSource
              id="osm-raster-source"
              url="https://demotiles.maplibre.org/tiles/tiles.json"
              tileUrlTemplates={ OSM_RASTER_STYLE.sources.osm.tilesVector}
              {...OSM_RASTER_STYLE.sources.osm}
            >
              <FillLayer id="osm-raster-layer" style={{ rasterOpacity: 1 }} />
            </VectorSource> */}
        
      </MapView>
       </Animated.View>
       <Animated.View style={[{flexDirection:'row', justifyContent:'center', alignItems:'center', height:'15%',  width:'100%', marginTop:listShow?0:20, borderRadius:25, backgroundColor:'#fff', borderTopWidth:2, borderStartWidth:1, borderRightWidth:1, borderColor:'#bbb', margin:0}, animStyleList]}>
       <TouchableOpacity 
          onPress={handleListMode}
          style={{borderTopWidth:2, borderStartWidth:1, borderRightWidth:1, borderColor:'#bbb',width:50, height:50, position:'absolute',  top:-35, zIndex:10, backgroundColor:'#f5f5f5', justifyContent:'center', alignItems:'center', borderRadius:25}}>
          
          <FontAwesome name='exchange' size={30} color={"#bbb"} style={[styles.tabIcon, {transform:[{rotate:'90 deg'}]} ]}/>
        
       </TouchableOpacity>
       
       <FlatList
       style={{flex:1}}
       data={
        clubs.map(el=>el).sort((a,b)=>(getAngularDistance(a.lat, a.lon, location?.latitude, location?.longitude)-getAngularDistance(b.lat, b.lon, location?.latitude, location?.longitude)))
        }
        contentContainerStyle={{flex:1}}
       keyExtractor={(item, index) => index}
       horizontal={listShow?false:true}
       renderItem={({item, index})=>{
        if(showFav&&!user.favourite.includes(item.cid)){
          return 
        }
        if(listShow){
          
          return renderClubList(item, index, handleClickonClub)
        }else{
                  return(
                <Pressable
                style={{flexDirection:'column', alignItems:'center'}}
                onPress={()=>{handleSelectClub(item)}}
                >
                  <Image width={58} height={58} style={styles.clubImage} source={{uri: item.ava}}/>
                  <Text ellipsizeMode='tail' numberOfLines={1} style={{textAlign:'center', color:'#000', fontSize:10, width:58, overflow:'hidden'}}>{item.ruName}</Text>  
                </Pressable>)
        }
        }
       }
       />

        </Animated.View>
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
  clubImage:{
    borderRadius:29, 
    marginHorizontal:10
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