import { Dimensions, FlatList, Modal, Text, TouchableOpacity, View } from "react-native"
import ListSection from "./ListSection"
import Accordion from "react-native-custom-animated-accordion";
import Calendar from "react-native-calendar-range-picker";
import { useState } from "react";
import { Ionicons, AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { mainTheme } from "../../config/theme";
import { mainShadow } from "./ShadowStyles";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Button from "./Button";

const ListOrders = ({ordersArr})=>{
  
 const animatedTop = useSharedValue(-1000);
 const animatedTranslate = useAnimatedStyle(()=>{
    return{
      transform: [{ translateY: animatedTop.value }],
    }
  })
  const animationShow = ()=>{
    
        animatedTop.value = withTiming(0,{
          duration: 1000,
          easing: Easing.out(Easing.exp),
        })
      
  }
  const animationHide = ()=>{
    
    animatedTop.value = withTiming(-1000,{
      duration: 1000,
      easing: Easing.out(Easing.exp),
    })
  
}
    const format_date = (value=0) => {
        let date = new Date()
        date.setMonth(date.getMonth()-value)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
    const [datePick, setDatePick] = useState(false)
    const [dateFrom, setDateFrom]  =useState(null)
    const [dateTo, setDateTo]  =useState(null)
    const renderAccordion = ()=>{
        return(<>
        <Accordion containerStyle={{}}  title='сегодня'>
            <ListSection ordersArr={ordersArr} age={'today'}/>
        </Accordion >
        <Accordion  title='вчера'>
            <ListSection ordersArr={ordersArr} age={'yestoday'}/>
        </Accordion>
        <Accordion maxHeight={300} title='еще раньше'>
            <ListSection ordersArr={ordersArr} age={'other'}/>
        </Accordion>
        </>
        )
    }
    const renderList = ()=>{
        const dateToDate = Math.floor(new Date(dateTo).getTime() / 1000);
        const dateFromDate =  Math.floor(new Date(dateFrom).getTime() / 1000);
        console.log('dateFromDate')
        console.log(dateFromDate)
        console.log(dateToDate)
        // const ordersAtPeriod = ordersArr.filter(el=>el.time)
        return(<>
        <ListSection
        ordersArr={ordersArr}
        period={{start:dateFromDate, end:dateToDate}}
        age='period'
        />
        </>)}
        const renderTopButton = ()=>{
           return(<>{dateFrom&&dateTo?(<>
             <TouchableOpacity 
                onPress={()=>{setDateFrom(null);setDateTo(null);animationHide()}}
                style={{flexDirection:'row', gap:10, width:170, alignSelf:'center', borderRadius:20, justifyContent:'center', alignItems:'center', marginVertical:15, ...mainShadow, backgroundColor:'#fff', padding:5}}>
            <Text>Сбросить период</Text>
            <MaterialCommunityIcons
                name='close'
                size={30}
                color={mainTheme.colorGreen}
            />
        </TouchableOpacity>
           </>):(<>
            <TouchableOpacity 
                onPress={()=>{setDatePick(true);animationShow()}}
                style={{flexDirection:'row', gap:10, width:170, alignSelf:'center', borderRadius:20, justifyContent:'center', alignItems:'center', marginVertical:15, ...mainShadow, backgroundColor:'#fff', padding:5}}>
            <Text>Выбрать период</Text>
            <MaterialCommunityIcons
                name='calendar'
                size={30}
                color={mainTheme.colorGreen}
            />
        </TouchableOpacity>
           </>)}</>)
    }
return(
    <View style={{flex:1}}>
        <Animated.View
        style={[{flex:1, position:'absolute', top:0, left:0, width:Dimensions.get('window').width, height:Dimensions.get('window').height, zIndex:2}, animatedTranslate]}
        
        >
            <Calendar
            
            // startDate={format_date(2)}
            // endDate= {format_date()}
            //title={dateTo?'Выберите дату окончания':'Выберите дату начала'}
            
            isMonthFirst
            pastYearRange={0}
            futureYearRange={1}
            disabledAfterToday
            // endDate={new Date()}
            onChange={({ startDate, endDate })=>{
                    setDateFrom(startDate);
                    setDateTo(endDate);
                    
                }}
        />
        </Animated.View>
        {datePick&&<Button 
        //disabled={dateFrom==null||dateTo==null}  
        onPress={()=>{setDatePick(false);animationHide()}} 
        style={[{position:'absolute', zIndex:3,bottom:0, right:10}, (dateFrom==null||dateTo==null)&&{backgroundColor:'#bbb'}]}>{(dateFrom==null||dateTo==null)?'Закрыть':'Подтвердить'}</Button>}
        
        {renderTopButton()}
        {dateFrom!=null&&dateTo!=null?renderList():renderAccordion()}
        
    </View>
)
}
export default ListOrders