import "../firebase/config";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

export const getChatBetweenTwo = async (uid, uid2) => {
  const db = getFirestore();
  let arr = [uid, uid2];
  let arr2 = [uid2, uid];
  const q = query(
    collection(db, "chats")
    ,where("users", "in", [arr,arr2])

  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.docs.length > 0) {
    return querySnapshot.docs[0];
  } else {
    // If chat doesn't exist, create it.
    await addDoc(collection(db, "chats"), {
      messages: [],
      users: [uid, uid2],
    });
    // return getChatBetweenTwo(uid, uid2);
  }
};

export const deleteChat = async (id)=>{
  console.log(id)
  const db = getFirestore();
  await deleteDoc(doc(db, "chats", id));

}

export const markAllReaded = async(chatId, uid)=> {
  const db = getFirestore();
  let chat = doc(db, "chats", chatId);

  let docs = await getDoc(chat);
  let mes = docs.data().messages;
  mes.forEach(element => {
    if(element.sender_id==uid){
    element.unread = false;}
  });
  await updateDoc(chat, {
    messages: mes
  })
}