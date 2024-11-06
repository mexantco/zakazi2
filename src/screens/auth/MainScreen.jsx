import React, {useState, useEffect} from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Chats from "./Chats";
import "../../firebase/config";
import { collection, query, where, getDocs, addDoc, onSnapshot } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { mainShadow } from "../../components/ui/ShadowStyles";
import { setClubs } from "../../reducers/clubs";
import Maps from "./Map";
import Users from "./Users";
import NewChat from "../../screens/auth/NewChat";
import { ImageBackground, StatusBar, Text, TouchableOpacity, View, Image, StyleSheet } from "react-native";
import { useFonts } from 'expo-font';
import Orders from "./Orders";
import Profile from "./Profile";
import Button from "../../components/ui/Button";
import { Ionicons, AntDesign, Entypo, MaterialCommunityIcons, Foundation, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from "@react-navigation/native";

const Tab = createBottomTabNavigator();
const MainScreen = ({ navigation, route }) => {

  const [fontsLoaded] = useFonts({
    // 'AA-Neon': require('../../fonts/AA-Neon.ttf'),
    'canis-minor': require('../../fonts/canisminor.ttf'),
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
  });
  const dispatch = useDispatch();
  const user = useSelector(state=>state.user.userData)
  const system = useSelector(state=>state.system.system)
  console.log('=====')
  console.log(system)
  const tabBarTranslateY = useSharedValue(100)

  const animBottom  = useAnimatedStyle(()=>{
    return{
      transform: [{ translateY: tabBarTranslateY.value }],
    }
  })
  const hideAnimation = ()=>{
    tabBarTranslateY.value = withTiming(100,{
      duration: 300,
      easing: Easing.out(Easing.exp),
    })
  }
  
  useFocusEffect(()=>{
    
    tabBarTranslateY.value = withTiming(0,{
      duration: 500,
      easing: Easing.out(Easing.exp),
    })
  })
  useEffect(()=>{
    
    Notifications.addNotificationResponseReceivedListener(response => {
      
      const {order_id}  = response.notification.request.content.data
      if(order_id){
        navigation.navigate('OrderQr', {order_id:order_id})
      }
    });
    
    const asFn=async()=>{
      const db = getFirestore();
     
      const q = query(
          collection(db, "club")
        );
          const unsubscribe = onSnapshot(q, (querySnapshot)=>{
           
            let clubs = [];
             querySnapshot.forEach(async (doc) => {

                    let document = doc.data();
                    document.id= doc.id;
                    clubs.push(document);

                    // setClubss(clubs);
                    });
                     dispatch(
                      setClubs({clubs: clubs})
                    )
          });
        
       

    }
    asFn()
  
  },[])
  useEffect(()=>{console.log('loaded')},[fontsLoaded])

  return (

    <Tab.Navigator
      
      screenOptions={{
        swipeEnabled: false,

        tabBarStyle: {
          paddingHorizontal:20,
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
      name="Orders"
       component={Orders}
        options={{
          tabBarButton:(props)=>
          <Animated.View style={[styles.tabBtnContainer, animBottom]}>
          <TouchableOpacity
           onPress={props.onPress}
           activeOpacity={1}
           style={[styles.tabBtn, props.accessibilityState.selected?styles.selectedIcon:null]}
          >
            <MaterialIcons name='playlist-add-check-circle' size={72} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon,{marginLeft:-15} ]} />
            
          </TouchableOpacity>
          <Text style={[styles.textBtn, props.accessibilityState.selected?styles.selectedText:null]}>Заказы</Text>
          </Animated.View>,

            headerShown:false,
            title:'Заказы'
           }} />
      {system&&system.availible==false?(<>
        <Tab.Screen
        name="Warning"
        component={()=>(
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <Text>Извините сервис сейчас не работает</Text>
          <Text>Скоро мы снова вернемся к вам</Text>
        </View>)}
        
        
        options={{
          tabBarButton:(props)=>
          <Animated.View style={[styles.tabBtnContainer, animBottom]}>
          <TouchableOpacity
           onPress={props.onPress}
           activeOpacity={1}
           style={[styles.tabBtn, props.accessibilityState.selected?[styles.selectedIcon,{backgroundColor:'#dd7777'}]:null]}
          >
            <FontAwesome name='warning' size={40} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon]}/>
          </TouchableOpacity>
          <Text style={[styles.textBtn, props.accessibilityState.selected?[styles.selectedText,{color:'#dd7777'}]:null]}>Внимание</Text>

          </Animated.View>,
          headerShown:false,
          title: "Места" }}
      />
      </>):(<>
        <Tab.Screen
          name="Map"
          initialParams={{
            user:user, 
            hide:hideAnimation}}
          component={Maps}
          options={{
            tabBarButton:(props)=>
            <Animated.View style={[styles.tabBtnContainer, animBottom]}>
            <TouchableOpacity
            onPress={props.onPress}
            activeOpacity={1}
            style={[styles.tabBtn, props.accessibilityState.selected?styles.selectedIcon:null]}
            >
              <FontAwesome name="globe" size={70} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon]}/>
            </TouchableOpacity>
            <Text style={[styles.textBtn, props.accessibilityState.selected?styles.selectedText:null]}>Места</Text>

            </Animated.View>,
            headerShown:false,
            title: "Места" }}
        />
        <Tab.Screen
          name="Profile"
          initialParams={{user:user}}
          component={Profile}
          
          options={{
            tabBarButton:(props)=>
            <Animated.View style={[styles.tabBtnContainer, animBottom]}>
            <TouchableOpacity
            onPress={props.onPress}
            activeOpacity={1}
            style={[styles.tabBtn, props.accessibilityState.selected?styles.selectedIcon:null]}
            >
              <FontAwesome name="user-circle" size={60} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>
              
            </TouchableOpacity>
            <Text style={[styles.textBtn, props.accessibilityState.selected?styles.selectedText:null]}>Профиль</Text>
            </Animated.View>,
            
            headerShown:false,
            title: "Профиль" }}
        />
      </>)}
      

    </Tab.Navigator>

  );
};
const styles= StyleSheet.create({
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
  }
})
export default MainScreen;
