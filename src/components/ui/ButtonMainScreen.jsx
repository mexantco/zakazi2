import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { mainShadow } from "./ShadowStyles"
import { mainTheme } from "../../config/theme"
import { Ionicons, AntDesign, Entypo, MaterialCommunityIcons, Foundation, FontAwesome, MaterialIcons } from '@expo/vector-icons';

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
const ButtonMainScreen = ({props, title, icon, warning, font, size})=>{
    const Icon = {
        'MaterialIcons':<MaterialIcons name={icon} size={size} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon,{marginLeft:-15} ]} />,
        'FontAwesome':<FontAwesome name={icon} size={size} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>,
        'MaterialCommunityIcons': <MaterialCommunityIcons name={icon} size={size} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>,
        'IonIcons':<Ionicons name={icon} size={size} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>,
        'Entypo':<Entypo name={icon} size={size} color={props.accessibilityState.selected?"#fff":"#ffffff90"} style={[styles.tabIcon ]}/>
    }
    return(
<View style={styles.tabBtnContainer}>
 <TouchableOpacity
     onPress={props.onPress}
     activeOpacity={1}
     style={[styles.tabBtn, props.accessibilityState.selected?[styles.selectedIcon, warning&&{backgroundColor:'#dd7777'}]:null]}
    >
         {Icon[font]}   
    </TouchableOpacity>
    <Text style={[styles.textBtn, props.accessibilityState.selected?[styles.selectedText, warning&&{color:'#dd7777'}]:null]}>{title}</Text>
</View>
)}
export default ButtonMainScreen