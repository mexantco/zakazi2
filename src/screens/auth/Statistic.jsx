import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { View } from "react-native"
import ListOrders from "../../components/ui/ListOrders"
import OrdersChart from "../../components/ui/OrdersChart"

const Statistic = ({route})=>{
    const Top = createMaterialTopTabNavigator();
    const db = getFirestore()
    const {cid} = route.params
    const [ordersArr,setOrders] = useState([])
    console.log('orders')
    console.log(ordersArr)
    useEffect(()=>{
        const asyncFn = async ()=>{
        let arr = []
        const q = query(
            collection(db, "orders")
            ,where('club', '==', cid)
            );
        const orders = await  getDocs(q)
        
        orders.forEach(element => {
            console.log('ddd')
            arr.push(element.data())

        });
        console.log('arr')
        console.log(arr)
        setOrders(arr)
        }
        asyncFn()
        
    },[])
    return(
        <View style={{flex:1}}>
            <Top.Navigator>
                <Top.Screen 
                    name="список"
                    component={()=><ListOrders ordersArr={ordersArr}/>}
                    
                />
                <Top.Screen
                    name="график"
                    component={()=><OrdersChart ordersArr={ordersArr}/>}
                />
                {/* <Top.Screen
                    name="график"
                    component={()=>(<></>)}
                /> */}
            </Top.Navigator>
        </View>
    )
}
export default Statistic