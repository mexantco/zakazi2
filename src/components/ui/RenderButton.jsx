import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated from "react-native-reanimated"
import { Ionicons, AntDesign, Entypo, MaterialCommunityIcons, Foundation, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { mainShadow } from "./ShadowStyles";
import { memo } from "react";

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
      backgroundColor:'#c9c9c9',
      zIndex:0
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

const RenderButton  = ({props, name, icon, size, animBottom, order})=>{
    console.log('===============RenderButton=========')
    
    // console.log(order)
    return(
      <Animated.View style={[styles.tabBtnContainer, animBottom]}>

          {name=='Заказ'&&(<>
                      <Text style={{zIndex:20,position:'absolute', bottom:'20%', right:'5%', textAlign:'center', width:30, height:30, backgroundColor:'#703efe', color:'#f0f0f0', borderRadius:15, verticalAlign:'middle'}}>{order.length}</Text>
          </>)}
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
export const RenderButtonBack  = ({onPress, name, icon, size, animBottom})=>{
    console.log('===============RenderButton=========')
    
    // console.log(order)
    return(
      <Animated.View style={[styles.tabBtnContainer, animBottom]}>

          {name=='Заказ'&&(<>
                      <Text style={{position:'absolute', bottom:'20%', right:'5%', textAlign:'center', width:30, height:30, backgroundColor:'#703efe', color:'#f0f0f0', borderRadius:15, verticalAlign:'middle'}}>{order.length}</Text>
          </>)}
          <TouchableOpacity
           onPress={onPress}
           activeOpacity={1}
           style={[styles.tabBtn]}
          >
            <FontAwesome name={icon} size={size?size:60} color={"#fff"} style={[styles.tabIcon ]}/>
          </TouchableOpacity>
          <Text style={[styles.textBtn]}>{name}</Text>
          </Animated.View>
    )
  }
  export default memo(RenderButton)