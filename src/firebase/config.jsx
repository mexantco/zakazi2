// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import Constants from "expo-constants";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// import { getReactNativePersistence } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1nlzXNAr5j1nq4yXmvsr_0908Suaw_wQ",
  authDomain: "zakazi-7ed26.firebaseapp.com",
  projectId: "zakazi-7ed26",
  storageBucket: "zakazi-7ed26.appspot.com",
  messagingSenderId: "32831815315",
  appId: "1:32831815315:web:abe5f585ad4c39915c5766",
  measurementId: "G-B6M4GSG821"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
   persistence: getReactNativePersistence(AsyncStorage),
});

// const setAuthPersistence = async () => {
//   try {
//     await auth().setPersistence(auth.Auth.Persistence.LOCAL);
//     console.log('Тип хранения данных аутентификации успешно установлен.');
//   } catch (error) {
//     console.error(error);
//   }
// }

// // Вызов функции для установки хранения данных
// setAuthPersistence();
export const db = getFirestore(app);

export { auth };
