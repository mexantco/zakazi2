import { BlurView } from "expo-blur"
import { Text, View } from "react-native"

const HeaderCustom= ({name})=>{
return(
<View tint='dark' intensity={70} style={{justifyContent:'center', alignItems:'center', backgroundColor:'#9999aa', borderBottomWidth:1, borderColor:'#ffffff80', height:50}}>
    <Text style={{fontSize:24, textShadowColor: '#bbbbff', textShadowRadius:20, width:'100%', textAlign:'center', fontFamily:'Gilroy-Semibold',color:'#fff'}}>{name}</Text>

</View>)}
export default HeaderCustom