import "../firebase/config";
import { collection, query, where, getDoc, addDoc, update, doc, updateDoc, getDocs, onSnapshot } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import firebase from 'firebase/compat/app';
import { setClubData, setClubs } from "../reducers/clubs";
import { useDispatch, useSelector } from "react-redux";

const db = getFirestore();
export const enterClub = async (uid, cid) => {
await updateDoc(doc(db, "users", uid),{club:cid});
}

export const exitClub = async (uid, cid) => {
  await updateDoc(doc(db, "users", uid),{club:''});

};
export const changeWorking = async(isWorking, id)=>{
  if(isWorking){
    await updateDoc(doc(db, "club", id),{
      working:false
    })
  }else{
    await updateDoc(doc(db, "club", id),{
      working:true
    })
  }
  
  

}
export const getClubDataById = async (cid) => {
  const firestore = getFirestore();
  const docRef = doc(firestore, "club", cid);
  const data = await getDoc(docRef);
  if (data) {
    return data.data();
  } else {
    return false;
  }
};


export const getClubDataByName = async (name) => {
  let data;
  const firestore = getFirestore();
  const q =  query(collection(firestore, 'club'), where('name', '==', name));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    data = doc.data();

  });
  return data
};

