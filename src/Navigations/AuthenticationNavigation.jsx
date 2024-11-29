import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Chat from "../screens/auth/Chat";
import Club from "../screens/auth/Club";
import Staff from "../screens/auth/Staff";
import User from "../screens/auth/User";
import Orders from "../screens/auth/Orders";
import OrdersBar from "../screens/auth/OrdersBar";
import Settings from "../screens/auth/Settings";
import Users from "../screens/auth/Users";
import Profile from "../screens/auth/Profile";
import Statistic from "../screens/auth/Statistic";
import Balance from "../screens/auth/Balance";
import OrderQr from "../screens/auth/OrderQr";
import MainScreen from "../screens/auth/MainScreen";
import { Avatar } from "react-native-paper";
import TextInput from "../components/ui/TextInput";
import { AntDesign } from "@expo/vector-icons";
import { IconButton } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { mainShadow } from "../components/ui/ShadowStyles";
import ProfileSvg from "../../assets/ProfileSvg"
import { getAuth, onAuthStateChanged, signOut, onIdTokenChanged } from "firebase/auth";
import {
  onSnapshot,
  getFirestore,
  collection,
  query,
  where,
} from "firebase/firestore";
import { setChats } from "../reducers/chats";
import { useNavigation } from '@react-navigation/native';
import { ImageBackground, StatusBar } from "react-native";
import  Animated, { Easing, Value, timing, Keyframe,useShared , useAnimatedStyle } from 'react-native-reanimated';
import { BlurView } from "expo-blur";
import { useFonts } from "expo-font";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import MyClubs from "../screens/auth/MyClubs";
import customHeader from "../components/ui/customHeader";
import OrderDetail from "../screens/auth/OrderDetail";
import HeaderCustom from "../components/ui/Header";

const Stack = createStackNavigator();
const AuthenticationNavigation = () => {
  const [timerOut, setTimerout] = useState(true);
  const [timerOut2, setTimerout2] = useState(false);
  const [verify, setVerify] = useState(false)
  const userData = useSelector((state) => state.user.userData);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const firestore = getFirestore();

  const auth = getAuth();
  useEffect(() => {
    if (auth?.currentUser) {
      const q = query(
        collection(firestore, "chats"),
        where("users", "array-contains", userData.uid)
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push(doc.data());
        });
        dispatch(
          setChats({
            chats: messages,
          })
        );
      });
      
      onAuthStateChanged(auth, async (user) => {
        console.log(user.emailVerified)
        if (!user) {
          unsubscribe();
          signOut(getAuth())
        }
        if(user){
        let timer = setInterval(async ()=>{
          await user.reload()
          if(user.emailVerified==true){
            setVerify(true);
            clearInterval(timer)
          }
          }, 2000)}
          
      });
    }
      // setTimeout(setTimerout2(true), 2100)
  }, [auth]);
  let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../fonts/Gilroy-ExtraBold.otf'),
    'Nazca': require('../fonts/Nazca.ttf'),
    'Gilroy-Semibold': require('../fonts/Gilroy-Semibold.ttf'),
   });
  if (verify==false){
    return(
      <Text>Please Verify</Text>
    )
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#e0e0e0",
        paddingTop: 0,
        ...mainShadow,
      }}
    >
      {/* <View>
        <Text>{`Балланс: ${userData.ballance}`}</Text>
      </View> */}
    <Stack.Navigator>
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
       
        options={{
        
          header: (props) => (
            <View
              style={{
                backgroundColor:'transparent',
                marginHorizontal: 20,
                paddingTop: 20,
                height: 100,
              }}
            >
              
            </View>
            
          ),
          headerShown:false
        }}
      />
      <Stack.Screen name="OrdersBar" component={OrdersBar}
      options={{
        animationEnabled:false,
        title:'Заказы Бара',
        header:()=>(<HeaderCustom name='Заказы Бара'/>)
      }}
      />
      {/* <Stack.Screen name="Chat" component={Chat} /> */}
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetail}
        options={{
          header:()=>(<HeaderCustom name='Детали заказа'/>)
          
        }}
        />
      {/* <Stack.Screen name="User" component={User} /> */}
      <Stack.Screen 
        options={{
          header:()=>(<HeaderCustom name='Статистика продаж'/>)
        }}
        name="Statistic" 
        component={Statistic} />
      <Stack.Screen 
      name="MyClubs" 
      component={MyClubs} 
      options={{
        animationEnabled:false,
        title:'Заказы',
        header:()=>(<HeaderCustom name='Мои Магазины'/>)
      }}
      />
      <Stack.Screen name="Orders" component={Orders}
      options={{
        animationEnabled:false,
        title:'Заказы',
        header:()=>(<HeaderCustom name='Заказы'/>)
      }}
      />
      <Stack.Screen 
      name="OrderQr" 
      component={OrderQr}
      options={{
        animationEnabled:false,
        title:'Покажите это продавцу',
        header:()=>(<HeaderCustom name='Покажите это продавцу'/>)
      }}
      />
      <Stack.Screen name="Staff" component={Staff}
      options={{
        animationEnabled:false,
        header:()=>(<HeaderCustom name='Персонал клуба'/>)
      }}
      />
      <Stack.Screen name="Settings" component={Settings}
      options={{
        animationEnabled:false,
        header:()=>(<HeaderCustom name='Настройки профиля'/>)
      }}
      />
      {/* <Stack.Screen name="Users" component={Users} />
      <Stack.Screen name="Balance" component={Balance} 
      options={{
        animationEnabled:false,
        header:(props)=>(
          customHeader('Пополните баланс')
          )
      }}
      /> */}
      <Stack.Screen name="Profile" component={Profile} options={{headerShown:false}}/>
      <Stack.Screen
      options={{
        headerShown:false,
        title:'',
        headerLeft: null,
        headerStyle:{
          backgroundColor:'transparent',
          elevation:0
        }
      }}
      name="Club" component={Club}/>


    </Stack.Navigator>
    </SafeAreaView>
  );
};

export default AuthenticationNavigation;

const styles = StyleSheet.create({
  textHead:{
    transform:[{rotate:'-5deg'}],
    flexGrow:1,
    position:'absolute',
    left:0,
    top:60,
    paddingLeft:30,
    fontFamily:'Nazca',
    // color:'#fff',
    height:70,
    fontSize:40,
    overflow:'visible',
    textShadowColor:'#acbfff',
    textShadowRadius:10
  },
  img:{

    height:250,
    width:550,
    position:'absolute',
    top:-10,
    left:-45
  }
});
