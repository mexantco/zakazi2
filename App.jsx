import React, { useEffect } from "react";
import RootNavigation from "./src/Navigations/RootNavigation";
// import AppLoading from "expo-app-loading";
import "./src/firebase/config";
import { Provider, useDispatch } from "react-redux";
import * as Notifications from 'expo-notifications';

import store from "./src/store";
import {
  useFonts,
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { StatusBar } from "expo-status-bar";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import YaMap from 'react-native-yamap2';
import { useNavigation } from "@react-navigation/native";
import { setPush } from "./src/reducers/push";
import * as Contacts from 'expo-contacts';
import { requestPermissionsAsync } from "expo-contacts";
import registerNNPushToken from 'native-notify';

YaMap.init('00559dcf-3b1e-4e95-9930-56c2b447888d');


let persistor = persistStore(store);
export default function App() {
  registerNNPushToken(27570, 'vQkmBW58lcX8VKdldh8fAU');

  useEffect(()=>{
    const getContacts = async () => {
      // Запрашиваем разрешение на доступ к контактам
      const { status } = await requestPermissionsAsync();
      if (status === 'granted') {
        // Получаем контакты
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        // Проверяем, есть ли контакты
        if (data.length > 0) {
          // Предполагаем, что первый контакт - это ваш
          const contact = data;
          console.log(contact[44])
          return
          if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            console.log(contact.phoneNumbers);
          } else {
            console.log('Номер телефона не найден');
          }
        }
      } else {
        console.log('Разрешение не предоставлено');
      }
    };

    getContacts();
  })
  let [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });
  // if (!fontsLoaded) {
  //   return <AppLoading />;
  // }
  useEffect(()=>{
    // Notifications.addNotificationReceivedListener(notification => {
    //   console.log(notification);
    // });
  //  dispatch(setPush({data:dataPush}))
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
   
  })
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <StatusBar />
          <RootNavigation />
        </PersistGate>
      </Provider>
    </>
  );
}
