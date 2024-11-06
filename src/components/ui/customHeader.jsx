import { BlurView } from "expo-blur"
import { Text } from "react-native"

const customHeader = (text)=>{
    return(
        <BlurView  tint='dark' intensity={70} style={{justifyContent:'center', alignItems:'center', backgroundColor:'#bbbbff40', borderBottomWidth:1, borderColor:'#ffffff80', height:100}}>
<Text style={{fontSize:24, textShadowColor: '#bbbbff', textShadowRadius:20, width:'100%', textAlign:'center', fontFamily:'Gilroy-Semibold',color:'#fff'}}>{text}</Text></BlurView>

    )
}
        
export default customHeader