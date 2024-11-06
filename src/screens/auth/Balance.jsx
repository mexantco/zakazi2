import { StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity, Alert, Modal, Linking } from "react-native";
import React, {useRef, useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { mainShadow } from "../../components/ui/ShadowStyles";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";

import { useFonts } from "expo-font";
import NumericInput from "react-native-numeric-input";
import Button from "../../components/ui/Button";
import axios from "axios";




const Balance = ({route}) => {
 
  const [loading,setLoading] = useState(false);
  const [sum, setSum] = useState(0)
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.userData);
  console.log(userData)
  //////////////////////////////
 
  let [fontsLoaded] = useFonts({
    'Gilroy-Light': require('../../fonts/Gilroy-Light.otf'),
    'Gilroy-ExtraBold': require('../../fonts/Gilroy-ExtraBold.otf'),

    'Gilroy-Semibold': require('../../fonts/Gilroy-Semibold.ttf'),
   });


   const balance = async()=>{
    console.log(sum)
    if(sum<100){Alert.alert('Минимальная сумма платежа', '100р.'); return false}
    Linking.openURL(`https://yoomoney.ru/quickpay/confirm.xml?receiver=4100118763215471&quickpay-form=button&paymentType=АС&sum=${sum}&label=${userData.uid}`)
    
   }
  return (
      <SafeAreaView style={styles.rootContainer}>
        <View style={styles.topSection}>
        <NumericInput rounded step={100} minValue={100} maxValue={10000} totalWidth={200} totalHeight={50} containerStyle={{alignSelf:'center'}}  onChange={value => {setSum(value) }} />
        <Button onPress={()=>{balance()}} style={{width:250, alignSelf:'center'}}>пополнить</Button>
        </View>

      </SafeAreaView>

  );
};

export default Balance;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    // borderWidth:1,
  },
  chatBtn:{

    marginTop:10,
    backgroundColor:'#ffffff00',
    // borderWidth:1,
    borderColor:'#d5cefb70',
    borderRadius:50,
    height:100,
    overflow:'hidden',
    width:100,
    alignItems:'center',
    justifyContent:'center'
  },
  topSection: {
    flexGrow: 1,
    flexDirection:'column',
  
    textAlign:'center',
     alignContent:'center',
    justifyContent:'flex-start'
  },
  imageContainers: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  image: {
    margin: 20,
    width: "40%",
    height: "40%",
  },
  bottomSection: {
    ...mainShadow,
    paddingHorizontal: 20,
    borderTopStartRadius: 40,
    borderTopEndRadius: 40,
    backgroundColor: "#fff",
    width: "100%",
    flex: 2,
    alignItems: "center",
  },
  bottomSectionContent: {
    padding: 30,
  },
});
