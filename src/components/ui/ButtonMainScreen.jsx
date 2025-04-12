import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { mainShadow } from "./ShadowStyles"
import { mainTheme } from "../../config/theme"
import { Ionicons, AntDesign, Entypo, MaterialCommunityIcons, Foundation, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Animated from "react-native-reanimated";

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
          backgroundColor:mainTheme.colorbackGround
        },
        textBtn:{
          textAlign:'center',
          width: '100%',
          fontWeight:'400',
          fontFamily:'Gilroy-Light',
          color:'#000',
          height:40
          // transform:[{translateY:50}]
        },
        selectedText:{
          color:mainTheme.colorSelectedText
        },
        selectedIcon:{
          shadowRadius:0,
          elevation:0,
          backgroundColor:mainTheme.colorGreen
        }
})
const ButtonMainScreen = ({buttonsCount, props, title, icon, warning, font, size, animBottom})=>{
  const minus = buttonsCount?10:0
    const Icon = {
        'MaterialIcons':<MaterialIcons name={icon} size={size-minus} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon,{marginLeft:-15} ]} />,
        'FontAwesome':<FontAwesome name={icon} size={size-minus} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>,
        'MaterialCommunityIcons': <MaterialCommunityIcons name={icon} size={size-minus} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>,
        'IonIcons':<Ionicons name={icon} size={size-minus} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>,
        'Entypo':<Entypo name={icon} size={size-minus} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>
    }
    return(
<Animated.View style={[styles.tabBtnContainer, animBottom]}>
 <TouchableOpacity
     onPress={props.onPress}
     activeOpacity={1}
     style={[styles.tabBtn, buttonsCount==true&&{width:50, height:50}, props.accessibilityState.selected?[styles.selectedIcon,  warning&&{backgroundColor:'#dd7777'}]:null]}
    >
         {Icon[font]}   
    </TouchableOpacity>
    <Text style={[styles.textBtn, props.accessibilityState.selected?[styles.selectedText, warning&&{color:'#dd7777'}]:null]}>{title}</Text>
</Animated.View>
)}
export default ButtonMainScreen