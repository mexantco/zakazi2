import { useState } from "react";
import { Dimensions, TouchableOpacity, View, Text } from "react-native";
import { BarChart, LineChart, PieChart, PopulationPyramid, CurveType } from "react-native-gifted-charts";
import Button from "./Button";
import DatePicker from "react-native-date-picker";

const monthNames = {
    1:'Январь',
    2:'Февраль',
    3:'Март',
    4:'Апрель',
    5:'Май',
    6:'Июнь',
    7:'Июль',
    8:'Август',
    9:'Сентябрь',
    10:'Октябрь',
    11:'Ноябрь',
    12:'Декабрь'
}

const OrdersChart = ({ordersArr})=>{
    const data=[ {value:50}, {value:80}, {value:90}, {value:70} ]
    const monthArr = ordersArr.map(el=>({time:el.time, sum:el.sum}))
    const [yearMode, setYearMode]  =useState(false)
    
    // console.log(ordersArr[0].time)
    // console.log(monthArr)
    const [curDate, setDate] = useState(new Date())
    const isLastMonth = curDate.getMonth()==new Date().getMonth()
    function groupOrdersByMonth(orders) {
        // Сгруппируем заказы по месяцам
        const groupedOrders = orders.reduce((acc, order) => {
            const orderDate = new Date(order.time*1000);
            const year = orderDate.getFullYear();
            const month = orderDate.getMonth(); // Месяцы начинаются с 0, поэтому используем их как есть
    
            const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    
            if (!acc[key]) {
                acc[key] = { time: key, sum: 0 };
            }
    
            acc[key].sum += order.sum;
    
            return acc;
        }, {});
    
        // Преобразуем объект в массив
        return Object.values(groupedOrders);
    }

    function groupOrdersByDate(orders) {
        const result = {};
    
        orders.forEach(order => {
            const date = new Date(order.time*1000);
            const key = date.toISOString().split('T')[0]; // Получаем дату в формате YYYY-MM-DD
    
            if (!result[key]) {
                result[key] = 0; // Инициализируем сумму для этой даты
            }
            result[key] += order.sum; // Суммируем значения
        });
    
        return result;
    }

    function createMonthlyArray(groupedOrders) {
        // Создаем массив для всех месяцев года
        const monthlySums = Array(12).fill(0);
        for(i=0; i<12; i++){
            monthlySums[i] = {value:0, label:i+1, showXAxisIndex: true}
        }

        // Заполняем массив суммами по месяцам
        groupedOrders.forEach(order => {
            const [year, month] = order.time.split('-');
            const monthIndex = parseInt(month, 10) - 1; // Преобразуем в индекс (0-11)
            console.log(monthIndex)

            monthlySums[monthIndex] = {value:order.sum, label:monthIndex+1, showXAxisIndex: true};
        });
    
        return monthlySums;
    }

    function createDailySummary(orders) {
        let day
        const groupedOrders = groupOrdersByDate(orders);
        
       if(curDate.getMonth()!=new Date().getMonth()){
            date2 = new Date(curDate)
            date2.setMonth(date2.getMonth()+1)
            date2.setDate(0)
            day = date2.getDate()
       }else{
            day = curDate.getDate()

        }
        // const daysInMonth = getDaysInCurrentMonth(); // Получаем количество дней в месяце (февраль 2023)
        
        const summaryArray = new Array(day).fill(0); // Инициализируем массив нулями
    
        // Заполняем массив суммами заказов по датам
        for (let i = 0; i <= day; i++) {
            const dateKey = `${curDate.getFullYear()}-${curDate.getMonth()+1}-${i.toString().padStart(2, '0')}`; // Форматируем дату
            summaryArray[i - 1] = {value:(groupedOrders[dateKey]||0), label:i, showXAxisIndex: true}; // Заполняем сумму или 0, если нет заказов
        }
    
        return summaryArray;
    }
    const setMonth = (val)=>{
        // let date1 = new Date(curDate)
        // date1.setMonth(date1.getMonth()+val); 
        // const lastDayOfMonth = new Date(date1.getFullYear(), (date1.getMonth() + 1), 1)
        setDate(prev=>{
            let date1 = new Date(prev)
            date1.setMonth(prev.getMonth()+val)
            return(date1)
    })}
    const groupedOrders2 = groupOrdersByMonth(monthArr)
    const monthlyArray = createMonthlyArray(groupedOrders2);
    // Получаем итоговый массив
    const dailySummary = createDailySummary(monthArr);
    console.log(monthlyArray);
    console.log(dailySummary);
    return(
        <View style={{flex:1}}>
        
        <BarChart
         
        xAxisIndicesWidth={2}
        initialSpacing={0.3}
        yAxisLabelContainerStyle={{width:20}}
        yAxisTextStyle={{fontSize:10}}
        xAxisLabelTextStyle={{fontSize:7}}
        // yAxisOffset={3}
        // curvature={0}
            hideDataPoints1
            // curved
            isAnimated
            animationDuration={200}
            animateOnDataChange
            adjustToWidth={true}
            //width={Dimensions.get('window').width-50}
            data = {yearMode?monthlyArray:dailySummary} 
            
             />
             <Text style={{alignSelf:'center'}}>{yearMode?curDate.getFullYear()+' год':monthNames[curDate.getMonth()+1]}</Text>
             <View style={{flexDirection:'row', width:'100%', justifyContent:'space-around', gap:10, paddingHorizontal:10}}>
                <Button
                style={{flex:1}}
                labelStyle={{fontSize:15}}
                onPress={()=>{setYearMode(false); setMonth(-1)}}
                >{monthNames[curDate.getMonth()]}</Button>
                
                <Button
                style={{flex:1}}
                onPress={()=>{setYearMode(true)}}
                >За год</Button>

                <Button
                disabled={isLastMonth}
                style={{flex:1}}
                labelStyle={{fontSize:15}}
                onPress={()=>{setYearMode(false); setMonth(1)}}
                >{monthNames[curDate.getMonth()+2]}</Button>
             </View>
            
        </View>
    )
}
export default OrdersChart