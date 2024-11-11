import { ScrollView, Text, View } from "react-native"
import Button from "../../components/ui/Button"
import Chat from "./Chat"
import QRCode from "react-native-qrcode-svg"
import { TouchableRipple } from "react-native-paper"
import { Ionicons } from '@expo/vector-icons';

const OrderDetail = ({route})=>{
    const {order} = route.params
    
    return(
    <View
          tint="dark"
          intensity={30}
          blurReductionFactor={4}
          experimentalBlurMethod='dimezisBlurView'
          style={{flex:1, backgroundColor:'#ccc', justifyContent:'center', paddingHorizontal:30, alignItems:'center', flexDirection:'column', paddingTop:15}}
          >
          {order.status==5?(<>
          <Text style={styles.text}>Заказ отменен продавцом.</Text>
          <Text style={styles.text}>Причина отмены:</Text>
          <Text style={{marginVertical:20, fontFamily:'Gilroy-Semibold'}}>{order.cancelReason}</Text>
          <Button style={{marginVertical:10}} onPress={()=>{setModal(false)}}>Закрыть</Button>

          </>):order.status==0?
          (<>
          {isChatActive?
          <Chat uid={order.id} unr={0}/>:
          <ScrollView style={{ width:'100%'}}>
          {order.order&&JSON.parse(order.order).map((item, index)=>{
            console.log(item)
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
          <Button style={{marginVertical:10}} onPress={()=>{cancle(order.id)}}>Отменить</Button>
          
          <Button style={{marginVertical:10}} onPress={()=>{setModal(false)}}>Закрыть</Button>
          </>):order.status==1?(<>
          <Text style={{marginVertical:30, fontSize:26, color:'#000', fontFamily:'Gilroy-Regular'}}>Заказ в работе</Text>
          
          <TouchableRipple style={{height:80, marginTop:40}} onPress={()=>{setModal(false)}}>
           <Ionicons name={'close'}  style={{shadowColor:'white', shadowRadius:5, textShadowRadius:25,textShadowColor:'#d5cefb', width:'100%', height:'100%', verticalAlign:'middle', textAlign:'center'}} size={40} color={'#000'}/>
          </TouchableRipple>
          </>):order.status==2?(<>
          <Text style={{marginVertical:30, fontSize:26, color:'#000', fontFamily:'Gilroy-Regular'}}>Покажите этот QR код продавцу</Text>
          <QRCode

          size={200}
          value={order.id+''}
          />
          <TouchableRipple style={{height:80, marginTop:40}} onPress={()=>{setModal(false)}}>
           <Ionicons name={'close'}  style={{shadowColor:'white', shadowRadius:5, textShadowRadius:25,textShadowColor:'#d5cefb', width:'100%', height:'100%', verticalAlign:'middle', textAlign:'center'}} size={40} color={'#000'}/>
          </TouchableRipple>
          </>):order.status==3?(<>
          <Text style={{marginVertical:30, fontSize:26, color:'#000', fontFamily:'Gilroy-Regular'}}>Заказ получен</Text>
        
          <TouchableRipple style={{height:80, marginTop:40}} onPress={()=>{setModal(false)}}>
           <Ionicons name={'close'}  style={{shadowColor:'white', shadowRadius:5, textShadowRadius:25,textShadowColor:'#d5cefb', width:'100%', height:'100%', verticalAlign:'middle', textAlign:'center'}} size={40} color={'#000'}/>
          </TouchableRipple>
          </>):order.status==4?(<>
          <Button onPress={()=>{closeOrder()}}>Заказ получен</Button>
          <Button onPress={()=>{setModal(false)}}>Закрыть</Button>
          </>):(<></>)}

          </View>)
}
export default OrderDetail