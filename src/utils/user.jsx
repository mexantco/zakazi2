import "../firebase/config";
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import  Constants  from "expo-constants";
import { Platform } from "react-native";
const firestore = getFirestore();

export const getUserDataById = async (userId) => {
  
  const docRef = doc(firestore, "users", userId);
  const userData = await getDoc(docRef);
  if (userData) {
    return userData.data();
  } else {
    return false;
  }
};

export const updateUser = async (userId, params)=>{
  const docRef = doc(firestore, "users", userId);
  await updateDoc(docRef,{...params})
}
export const getUserDataByName = async (username) => {
  const firestore = getFirestore();
  const q = query(
    collection(firestore, "users"),
    where("name", "==", username)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.docs.length > 0) {
    return querySnapshot.docs[0].data();
  } else {
    return false;
  }
};
const  handleRegistrationError = (errorMessage)=> {
  alert(errorMessage);
  throw new Error(errorMessage);
}
export const setUserDeviceToken = async (userId)=>{
 
  const docRef = doc(firestore, "users", userId);
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Project ID not found');
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        await updateDoc(docRef,{
          pushToken:pushTokenString
        })
        return pushTokenString;
      } catch (e) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  }
