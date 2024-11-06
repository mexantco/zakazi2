import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useEffect } from "react"
import { View } from "react-native"

const Statistic = ({route})=>{
    const Top = createMaterialTopTabNavigator();
    const db = getFirestore()
    const {cid} = route.params
    useEffect(()=>{
        const asyncFn = async ()=>{
            const q = query(
            collection(db, "orders")
            ,where('club', '==', cid)
            );
        const orders = await  getDocs(q)
        console.log('4444')
        orders.forEach(element => {
            console.log(element.data())

        });
        }
        asyncFn()
        
    },[])
    return(
        <View style={{flex:1}}>
            <Top.Navigator>
                <Top.Screen 
                    name="список"
                    component={()=>(<></>)}
                />
                <Top.Screen
                    name="календарь"
                    component={()=>(<></>)}
                />
                <Top.Screen
                    name="график"
                    component={()=>(<></>)}
                />
            </Top.Navigator>
        </View>
    )
}
export default Statistic