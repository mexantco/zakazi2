import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  runOnUI,
  Easing,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { transform } from 'typescript';
import Button from './Button';
import { BorderlessButton } from 'react-native-gesture-handler';

const colors = [
  '#FF5733', // Красный
  '#FFBD33', // Желтый
  '#75FF33', // Зеленый
  '#33FFBD', // Бирюзовый
  '#335BFF', // Синий
  '#A033FF', // Фиолетовый
  '#FF33A1', // Розовый
];

// Определяем функцию hexToRgb как worklet
const hexToRgb = (hex) => {
  'worklet'; // Указываем, что это worklet
  let r = 0, g = 0, b = 0;
  hex = hex.replace(/^#/, '');
  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  return { r, g, b };
};
const heightScreen = Dimensions.get('window').height
const PulsatingBall = ({visible, infoText, btnText, onPress}) => {
  const [isRender, setIsRender] = useState(true)
  console.log('visible')
  console.log(visible)
  const AnimatedBlur = Animated.createAnimatedComponent(BlurView)
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(180);
  const translateY = useSharedValue(50)
  const top =  useSharedValue(500);
  const left =  useSharedValue(-5);
  const scale = useSharedValue(205)
  const colorIndex = useSharedValue(0);
    const shadow = useSharedValue(0)
//   useEffect(() => {
//     setTimeout(()=>{top.value = withSpring(0, { 
      
//       damping: 8, // Уменьшение колебаний
//       stiffness: 100, // Жесткость пружины
//       mass: 0.5, // Масса пружины
//     });
// }, 500) 
//     // left.value = withRepeat(withTiming(-5, { duration: 1500 }), -1, true);
//     scale.value = withRepeat(withTiming(205, { duration: 1500 }), -1, true);
//     translateY.value = withRepeat(withTiming(50, { duration: 1500 }), -1, true);
//     opacity.value = withTiming(1,{duration:500})
//     rotate.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, false);
//     shadow.value = withRepeat(withTiming(40, { duration: 1500 }), -1, true);
//     colorIndex.value = withRepeat(withTiming(colors.length - 1, { duration: 6000 }), -1, true);
//   }, [colorIndex]);
  useEffect(()=>{
    if(visible==false){
      top.value = withSpring(500, { 
      
        damping: 8, // Уменьшение колебаний
        stiffness: 100, // Жесткость пружины
        mass: 0.5, // Масса пружины
      });

      setTimeout(()=>{
         opacity.value = withTiming(0,{duration:500})
       }, 500) 
       setTimeout(()=>{
       rotate.value = 180
      translateY.value=50
      scale.value = 205
      colorIndex.value =0
      shadow.value=40
        setIsRender(false)
       },1000)
      
    }else{
      setIsRender(true)
      // rotate.value = 0
      // translateY.value=49
      // scale.value = 204
      
      // shadow.value=39
      setTimeout(()=>{
        top.value = withSpring(0, { 
      
        damping: 8, // Уменьшение колебаний
        stiffness: 100, // Жесткость пружины
        mass: 0.5, // Масса пружины
      });
      }, 500) 
      setTimeout(()=>{
      scale.value = withRepeat(withTiming(85, { duration: 1500 }), -1, true);
      translateY.value = withRepeat(withTiming(20, { duration: 1500 }), -1, true);
     
      rotate.value = withRepeat(withSequence( 
        withTiming(360, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(540, { duration: 1500, easing: Easing.in(Easing.ease) })
      ), -1, false);
      shadow.value = withRepeat(withTiming(40, { duration: 1500 }), -1, true);
      colorIndex.value = withRepeat(withTiming(colors.length - 1, { duration: 6000 }), -1, true);
    
      }, 500) 
      opacity.value = withTiming(1,{duration:500})
      
    }
  },[visible])

  const topAnim = useAnimatedStyle(()=>{
    return{
      top: top.value,
    }
  })
  const topAnim2 = useAnimatedStyle(()=>{
    return{
      top: top.value+heightScreen/2+22,
    }
  })
  const rotateAnimate  = useAnimatedStyle(()=>{
    return{
      transform: [{rotate:`${rotate.value+45}deg`}]
      
    }
      
  })
  const containerAnimStyle = useAnimatedStyle(()=>{
    return {
      opacity:opacity.value
    }
  })
   const translateTextStyle = useAnimatedStyle(()=>{
    return{
      transform:[{rotate:'-45deg'},{translateY:translateY.value}, {translateX:5}]
    }
  })
  
  const animatedStyle = useAnimatedStyle(() => {
    const startColor = colors[Math.floor(colorIndex.value) % colors.length];
    const endColor = colors[(Math.floor(colorIndex.value) + 1) % colors.length];

    const startRGB = hexToRgb(startColor);
    const endRGB = hexToRgb(endColor);

    const r = interpolate(colorIndex.value % 1, [0, 1], [startRGB.r, endRGB.r]);
    const g = interpolate(colorIndex.value % 1, [0, 1], [startRGB.g, endRGB.g]);
    const b = interpolate(colorIndex.value % 1, [0, 1], [startRGB.b, endRGB.b]);

    return {
      width:scale.value,
      height:scale.value,
      borderRadius:scale.value/2,
      backgroundColor: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
      shadowColor: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
      // shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: shadow.value, 
    };
  });
  const animatedStyleColor =useAnimatedStyle(()=>{
    const startColor = colors[Math.floor(colorIndex.value) % colors.length];
    const endColor = colors[(Math.floor(colorIndex.value) + 1) % colors.length];

    const startRGB = hexToRgb(startColor);
    const endRGB = hexToRgb(endColor);

    const r = interpolate(colorIndex.value % 1, [0, 1], [startRGB.r, endRGB.r]);
    const g = interpolate(colorIndex.value % 1, [0, 1], [startRGB.g, endRGB.g]);
    const b = interpolate(colorIndex.value % 1, [0, 1], [startRGB.b, endRGB.b]);
    return{
      color:`rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
      borderColor:`rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`

    }
  })
  
if(!isRender){return false}
  return (
    <View style={{flex:1, position:'absolute', top:0, left:0}}>
    <Animated.View intensity={opacity} tint='dark' experimentalBlurMethod='dimezisBlurView' style={[styles.container, containerAnimStyle]}>
      <Animated.View style={[
        {width:200, height:200},
         rotateAnimate,
         topAnim
          ]}>
        <Animated.View style={[styles.ball, animatedStyle]}>
          <Animated.Text 
          style={[
            {fontFamily:'Inter_500Medium', fontSize:18},
            // {transform:[{rotate:'-45deg'},{translateY:40}]}
            translateTextStyle]
          }
          >1</Animated.Text>
        </Animated.View>
        <View style={{justifyContent:'center', alignItems:'center', transform:[{rotate:'-45deg'}], position:'absolute', zIndex:14, height:200, width:200, borderRadius:100, backgroundColor:'#1f1f1f'}}>
         
        </View>
      </Animated.View>
      <Animated.Text style={[{position:'absolute', fontFamily:'Gilroy-Semibold', fontSize:22}, animatedStyleColor, topAnim2]}>момент</Animated.Text>
    <View style={{position:'absolute', bottom:100, zIndex:999}}>
      {infoText&&<Animated.Text style={[{textAlign:'center'}, animatedStyleColor]}>{infoText}</Animated.Text>}
      {btnText&&<Button style={[{backgroundColor:'#ffffff20', borderTopWidth:2, borderRightWidth:1, borderLeftWidth:1}, animatedStyleColor]} onPress={onPress}>{btnText}</Button>}
    </View>
    </Animated.View>
    
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    zIndex:2,
    position:'absolute',
    left:0,
    top:0,
    height:Dimensions.get('screen').height,
    width:Dimensions.get('screen').width,
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282c34',
  },
  ball: {
    // transform:[{rotate:'45deg'}],
    justifyContent:'flex-start',
    alignItems:'flex-start',
    position:'absolute',
    top:-2.5,
    left:-2.5,
    // width: 205,
    // height: 205,
   borderRadius: 102.5,
  },
});

export default PulsatingBall;
