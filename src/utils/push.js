
const sendPushNotification = async (expoPushToken, title, body, data)=> {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      channelId:'1'
    };
  
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }
  export default sendPushNotification

  export const  pushReciever = (data)=>{
    if(data.type=='order_ready'){
      navigation.navigate('OrderQr', {order_id:data.order_id})
    }
  }