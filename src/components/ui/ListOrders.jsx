import { Text, View } from "react-native"
import ListSection from "./ListSection"
import Accordion from "react-native-custom-animated-accordion";

const ListOrders = ({ordersArr})=>{
    console.log(ordersArr)
    console.log('list')

return(
    <View style={{flex:1}}>
        <Accordion containerStyle={{}}  title='сегодня'>
            <ListSection ordersArr={ordersArr} age={'today'}/>
        </Accordion >
        <Accordion title='вчера'>
            <ListSection ordersArr={ordersArr} age={'yestoday'}/>
        </Accordion>
        <Accordion  title='еще раньше'>
            <ListSection ordersArr={ordersArr} age={'other'}/>
        </Accordion>
    </View>
)
}
export default ListOrders