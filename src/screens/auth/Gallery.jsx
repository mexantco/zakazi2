import { View, Text } from 'react-native'
import React from 'react'
import { useDispatch } from "react-redux";
import AppSlider from '../../components/ui/appSlider'
import { setUserData } from '../../reducers/user';

const Gallery = ({route}) => {
    const userData = route.params.userData;
    const itsMy = route.params.itsMy;
    const [refresh, setResfresh] = useState(false);
  const dispatch = useDispatch();
  
  const [sliderInstance, setSliderInstance] = useState(null);
  return (
    <View style={{backgroundColor:'black', flex:1}}>
        <AppSlider
        
        />
    </View>
  )
}

export default Gallery