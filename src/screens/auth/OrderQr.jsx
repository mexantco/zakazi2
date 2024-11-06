import { View } from "react-native"
import QRCode from "react-native-qrcode-svg"

const OrderQr = ({route})=>{
    const {order_id} = route.params
    console.log(route)
    return(
        <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
            <QRCode
            size={200}
            value={order_id+''}
            />
        </View>
    )
}
export default OrderQr