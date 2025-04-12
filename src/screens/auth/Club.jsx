import {PanResponder, View, Text, Dimensions, TouchableOpacity, StyleSheet, ImageBackground, Image, StatusBar} from 'react-native'
import React,{memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import Users from "./Users";
import Bar from "./Bar";
import Order from "./Order";
import Clubinfo from "./ClubInfo"
import Staff from './Staff';
import { useFonts } from 'expo-font';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { doc, getFirestore, onSnapshot, query } from 'firebase/firestore';
import { useFocusEffect, useNavigationState } from '@react-navigation/native';
// import Carousel from 'react-native-reanimated-carousel';
import  Animated, {useSharedValue, interpolate, useAnimatedStyle, withTiming, Easing, withDelay, withDecay, interpolateColor} from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useDispatch, useSelector } from 'react-redux';
import { mainShadow } from "../../components/ui/ShadowStyles";
import { Ionicons, AntDesign, Entypo, MaterialCommunityIcons, Foundation, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { setOrder } from '../../reducers/user';
import RenderButton, { RenderButtonBack } from '../../components/ui/RenderButton';
import { setClubData } from '../../reducers/clubs';

const sbar = StatusBar.currentHeight;
const styles = StyleSheet.create({
  tabIcon:{
    position:'absolute', 
    alignSelf:'center'
  },
    
    tabBtnContainer:{
      flex:1, 
      justifyContent:'center',
    },
    tabBtn:{
      ...mainShadow,
      height:60, 
      width:60, 
      overflow:'hidden',
      borderRadius:30, 
      justifyContent:'center', 
      alignSelf:'center',
      backgroundColor:'#c9c9c9'
    },
    textBtn:{
      textAlign:'center',
      width: '100%',
      fontWeight:'400',
      fontFamily:'Gilroy-Light',
      color:'#000'
      // transform:[{translateY:50}]
    },
    selectedText:{
      color:'#20a020'
    },
    selectedIcon:{
      shadowRadius:0,
      elevation:0,
      backgroundColor:'#a9d9a9'
    },
  tabs:{
    height:40,
    flex:1,
    justifyContent:'center',
    alignItems:'center',
 },
  iconsActive:{
    verticalAlign:'middle',
    height:'100%',
    textShadowColor:'#ffffff50',
    width:'100%',
    overflow:'visible',
    textAlign:'center',
    textShadowRadius:30
  },
  iconsInactive:{
    verticalAlign:'middle',
    height:'100%',
    textShadowColor:'#ffffff00',
    width:'100%',
    overflow:'visible',
    textAlign:'center',
    textShadowRadius:0,
    opacity:0.7
  },
  textHead:{
    transform:[{rotate:'-5deg'}],
    flexGrow:1,
    paddingLeft:30,
    fontFamily:'AA-Neon',
    // color:'#fff',
    height:70,
    fontSize:45,
    overflow:'visible',
    // textShadowRadius:10
  },
  img:{

    height:250,
    width:350,
    position:'absolute',
    top:0,
  }
})
const Tab = createBottomTabNavigator();

const Animicon = Animated.createAnimatedComponent(MaterialCommunityIcons);
const AnimGradient = Animated.createAnimatedComponent(LinearGradient);
const Club = ({route, navigation}) => {
  const clubId = route.params.club.cid;
  const club = useSelector(state=>state.clubs.clubs).filter(el=>el.cid==clubId)[0]
  
  const location = route.params.location;
  console.log('location')
  console.log(location)
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const userData = useSelector(state=>state.user.userData)
  const order = useSelector((state) => state.user.order);
  const dispatch = useDispatch()
  const tabBarTranslateY = useSharedValue(100)
  const tabBarTranslateX = useSharedValue(-100)
  const db = getFirestore();

  const animBottom  = useAnimatedStyle(()=>{
    return{
      transform: [{ translateY: tabBarTranslateY.value }],
    }
  })
  const animLeft  = useAnimatedStyle(()=>{
    return{
      transform: [{ translateX: tabBarTranslateX.value }],
    }
  })
  const hideAnimation = ()=>{
    tabBarTranslateY.value = withTiming(100,{
      duration: 10,
      easing: Easing.out(Easing.exp),
    })
  }
  // navigation.addListener('beforeRemove', async (e)=>{
  //   //e.preventDefault()
  //   hideAnimation()
  //   setTimeout(()=>{navigation.dispatch(e.data.action)},0)
  // })
  useFocusEffect(()=>{
    
    tabBarTranslateY.value = withTiming(0,{
      duration: 1000,
      easing: Easing.out(Easing.exp),
    })
    tabBarTranslateX.value = withTiming(0,{
      duration: 1000,
      easing: Easing.out(Easing.exp),
    })
  })
  useEffect(()=>{
    dispatch(setOrder({order: []}))
    navigation.addListener('beforeRemove', ()=>{
      dispatch(setOrder({order: []}))
    })

    
      const q = query(doc(db, "club", clubId))
      onSnapshot(q, (querySnapshot)=>{
      
      let clubData = querySnapshot.data()
      dispatch(setClubData({clubData:clubData}))
    })
      },[])
  const renderButton  = (props, name, icon, size)=>{
 
    return(
      <Animated.View style={[styles.tabBtnContainer, animBottom]}>

            {name=='Заказ'?(<>
            <Text style={{position:'absolute', bottom:'20%', right:'5%', textAlign:'center', width:30, height:30, backgroundColor:'#703efe', color:'#f0f0f0', borderRadius:15, verticalAlign:'middle'}}>{order.length}</Text>
</>):(<></>)}
          <TouchableOpacity
           onPress={props.onPress}
           activeOpacity={1}
           style={[styles.tabBtn, props.accessibilityState.selected?styles.selectedIcon:null]}
          >
            <FontAwesome name={icon} size={size?size:60} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>
          </TouchableOpacity>
          <Text style={[styles.textBtn, props.accessibilityState.selected?styles.selectedText:null]}>{name}</Text>
          </Animated.View>
    )
  }
  const [fontsLoaded] = useFonts({
    // 'AA-Neon': require('../../fonts/AA-Neon.ttf'),
    'canis-minor': require('../../fonts/canisminor.ttf'),
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),
    'AA-Neon': require('../../fonts/AA-Neon.ttf'),
    'Neoneon': require('../../fonts/Neoneon1.otf'),
    'ZamenhovInverse': require('../../fonts/zamenhof_inverse.otf'),
  });


   const countTabs = userData.uid==club.owner||userData.myClub!=club.cid&&(order&&order.length>0)?4:3
    return (
      !club.working&&club.owner!=userData.uid
      ?<View style={{flex:1, justifyContent:'center'}}>
        <Text style={{textAlign:'center'}}>Этот магазин временно не принимает заказы</Text>
        <View style={{position:'absolute', bottom:5,zIndex:3, left:0, width:Dimensions.get('window').width/countTabs}}>
            <RenderButtonBack animBottom={animLeft} onPress={()=>{navigation.goBack()}} name='Главная' icon='arrow-left' size={40} />
        </View>
      </View>
      :<View
 style={{ flex: 1,  flexDirection:'column', justifyContent:'flex-start' }}>
  <View style={{position:'absolute', bottom:5,zIndex:3, left:0, width:Dimensions.get('window').width/countTabs}}>
      <RenderButtonBack animBottom={animLeft} onPress={()=>{navigation.goBack()}} name='Главная' icon='arrow-left' size={40} />
  </View>
        <Tab.Navigator

screenOptions={{
  swipeEnabled: false,

  tabBarStyle: {
    // marginLeft:50,
    paddingLeft:Dimensions.get('window').width/countTabs,
    zIndex:2,
    height:90,
    borderTopWidth: 0,
    backgroundColor:'#ffffff00',
    elevation:0,
    borderWidth:0
  },
}}
>
  
<Tab.Screen

  name="Bar"
  initialParams={{clubId:club.cid, clubOwner:club.owner}}
  component={Bar}

  options={{
    
    // tabBarButton:(props)=>renderButton(props, 'Меню', 'cutlery', 40),
    tabBarButton:(props)=><RenderButton animBottom={animBottom} props={useMemo(()=>props,[props.accessibilityState.selected])} name='Меню' icon='cutlery' size={40} />,
    headerShown:false,
    title: "Меню" }}
/>
<Tab.Screen
name="ClubInfo"
 component={Clubinfo}
 initialParams={{club: club}}
  options={{
      tabBarButton:(props)=><RenderButton animBottom={animBottom} props={useMemo(()=>props,[props.accessibilityState.selected])} name='Про' icon='info' size={40} />,
      headerShown:false,
      title:'Про'
     }} />
{userData.uid==club.owner?
<Tab.Screen
 name="Stuff"
 component={Staff}
 initialParams={{cid: club.cid}}
  options={{
      tabBarButton:(props)=><RenderButton animBottom={animBottom} props={useMemo(()=>props,[props.accessibilityState.selected])} name='Персонал' icon='users' size={40} />,
      headerShown:false,
      title:'Персонал'
     }} />
:null}     

{userData.myClub!=club.cid&&(order&&order.length>0)?(<>
<Tab.Screen
        name="Order"
        initialParams={{clubId:club.cid, shipping:club.shipping, shippingCost:club.shippingCost, location:location}}
        component={Order}
        
        options={{
          tabBarButton:(props)=><RenderButton props={useMemo(()=>props,[props.accessibilityState.selected])} name='Заказ' icon='list' size={40} animBottom={animBottom} order={order}/>,
          headerShown:false,
          title: "Заказы" }}
      />
</>):(<></>)}


</Tab.Navigator>
  </View>

      );
}

export default Club