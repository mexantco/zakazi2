import { useNavigation } from "@react-navigation/native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
const orderSum = (orderString)=>{
    let order = JSON.parse(orderString)
    let sum = 0
    order.forEach(element => {
            sum +=(element.cost*element.num)
        })
    return sum
}
const ListSection = ({age, ordersArr, period})=>{
    const navigation = useNavigation()
    let currentTime =  new Date()
    let curTimestamp = Math.floor(currentTime.getTime()/1000)
    const startOfDay = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()).getTime();
    let orderArr=[]
    let title=''
    // console.log('currentTime')
    // console.log(curTimestamp)
    // console.log(startOfDay/1000)
    switch (age){
        case 'today':
            title='сегодня'
            orderArr = ordersArr.filter(el=>el.time<curTimestamp&&el.time>(startOfDay/1000))
            break
        case 'yestoday':
            title='вчера'
            orderArr = ordersArr.filter(el=>el.time<(startOfDay/1000)&&el.time>(startOfDay/1000-86400))
            break
        case 'other':
            title='еще раньше'
            orderArr = ordersArr.filter(el=>el.time<(startOfDay/1000-86400))
            break
        case 'period':
            title='период'
            orderArr = ordersArr.filter(el=>el.time<(period.end)&&el.time>(period.start))

    }
    orderArr.sort((a,b)=>b.time-a.time)
    return(
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ScrollView persistentScrollbar style={{width:'100%'}}>
        {orderArr.length>0?orderArr.map((el,idx)=>(
            <TouchableOpacity 
                onPress={()=>{navigation.navigate('OrderDetail', {order:el})}}
                key={idx} 
                style={{
                    flexDirection:'row', 
                    flex:1, 
                    width:'100%', 
                    justifyContent:'space-around', 
                    paddingVertical:15, 
                    backgroundColor:!idx % 2 === 0?'#cccccc20':'#cccccc00'}}
                >
                {age=='period'&&<Text>{new Date(el.time*1000).toLocaleDateString('ru-RU',  {year: 'numeric', month: 'short', day: 'numeric' })}</Text>}
                <Text>{`№ ${el.number}`}</Text>
                <Text>{`${orderSum(el.order)} р.`}</Text>
            </TouchableOpacity>
        )):(<><Text>Тут заказов нет</Text></>)}
        </ScrollView>
    </View>
    )
}
export default ListSection