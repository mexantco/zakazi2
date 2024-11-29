import { Dimensions, View } from "react-native";
import { BarChart, LineChart, PieChart, PopulationPyramid } from "react-native-gifted-charts";

const OrdersChart = ({ordersArr})=>{
    const data=[ {value:50}, {value:80}, {value:90}, {value:70} ]
    console.log(ordersArr)
    return(
<View style={{flex:1}}>
<LineChart 
    
    animateOnDataChange
    adjustToWidth={true}
    width={Dimensions.get('window').width-50}
    data = {data} 
    areaChart />

</View>
    )
}
export default OrdersChart