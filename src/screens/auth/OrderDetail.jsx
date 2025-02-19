import { ScrollView, Text, View } from "react-native"
import Button from "../../components/ui/Button"
import Chat from "./Chat"
import QRCode from "react-native-qrcode-svg"
import { TouchableRipple } from "react-native-paper"
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react"

const OrderDetail = ({route, navigation})=>{
    const [isChatActive, setActiveChat] = useState(false)
    const {order} = route.params
    
    return(
    <View
          tint="dark"
          intensity={30}
          blurReductionFactor={4}
          experimentalBlurMethod='dimezisBlurView'
          style={{flex:1, backgroundColor:'#ccc', justifyContent:'center', paddingHorizontal:30, alignItems:'center', flexDirection:'column', paddingTop:15}}
          >
          {isChatActive?
          <Chat mode='view' uid={order.id} unr={0}/>:
          <ScrollView style={{ width:'100%'}}>
          {order.order&&JSON.parse(order.order).map((item, index)=>{
                      return(<>
                    <View key={index} style={{flexDirection:'row', justifyContent:'space-between', width:'100%', borderBottomWidth:1}}>
                      <Text style={{color:'#000'}}>{item.name}</Text>
                      <Text style={{color:'#000'}}>{`${item.num}шт.`}</Text>
                      
                    </View>
                    {item.orderAdditions.map((item)=>{
                        return(
                          <Text style={{marginLeft:20}}>+{item.name}</Text>
                        )
                      })
                      }
                      </>)
                    })}
         </ScrollView>}
          
          
          <Button style={{marginVertical:10}} onPress={()=>{setActiveChat(!isChatActive)}}>{isChatActive?'Детали заказа':'чат с продавцом'}</Button>
          
          
          <Button style={{marginVertical:10}} onPress={()=>{navigation.goBack()}}>Закрыть</Button>
          
          

          </View>)
}
export default OrderDetail