import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import GuestNavigation from "./GuestNavigation";
import AuthenticationNavigation from "./AuthenticationNavigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getFirestore, onSnapshot, where, query } from "firebase/firestore";
import {auth} from '../../src/firebase/config'


const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../reducers/user";
import { View,Text, Image, ImageBackground } from "react-native";
import { setSystem } from "../reducers/system";


const RootNavigation = () => {
  
  const user= useSelector(state=>state.user.userData);
  // const auth = getAuth();
  const firestore = getFirestore();
  const dispatch = useDispatch();
  useEffect(() => {
    const q1 = query(doc(firestore, "system", 'jWES5jreFn6HSmwaqYd5'));
    const unsubscribe = onSnapshot(q1, async(querySnapshot) => {
         
          dispatch(setSystem({...querySnapshot.data()}))
    })
  //   const auth = getAuth()
  //   const userAuth = auth.currentUser;
  //   if(!user.uid){

  //     if (userAuth) {
        
  //         const q = query(collection(firestore, "users"), where('uid', '==', userAuth.uid));
        
  //         const unsubscribe = onSnapshot(q, async(querySnapshot) => {
          
  //           querySnapshot.forEach((doc) => {
  //             console.log('//--//--//--//');
  //             console.log(doc.data());
  //             dispatch(
  //             setUserData({
  //             userData: { ...doc.data(), uid: userAuth.uid },
  //             })
  //         );
  //           });
          
  //         });

  //       } else {
  //         dispatch(
  //           setUserData({
  //             userData: {},
  //           })
  //         );
        
  //       }
  //   }
    
  }, []);

  return (
    <SafeAreaProvider>
      
        <NavigationContainer theme={MyTheme}>
          {user?.uid ? <AuthenticationNavigation /> : <GuestNavigation />}

        </NavigationContainer>
      
      
    </SafeAreaProvider>
  );
};

export default RootNavigation;
