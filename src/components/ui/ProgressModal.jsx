import { BlurView } from "expo-blur"
import { Modal } from "react-native"
import * as Progress from "react-native-progress";

const ProgressModal  = ({modal, prog, loading})=>{
    return(
        <Modal visible={modal} transparent={true} animationType="fade">
          <BlurView
            intensity={50}
            tint="dark"
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {loading ? (
              <>
                <Progress.Bar
                  height={2}
                  width={250}
                  borderRadius={2}
                  useNativeDriver={true}
                  color={"white"}
                  animationType="spring"
                  progress={prog}
                />
              </>
            ) : (
              <></>
            )}
          </BlurView>
        </Modal>
    )
}
export default ProgressModal