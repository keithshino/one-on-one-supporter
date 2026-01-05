// src/lib/firestore.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Log } from "../types";

// ログを保存する関数
export const addLogToFirestore = async (memberId: string, content: Omit<Log, 'id' | 'createdAt' | 'memberId'>) => {
  try {
    const docRef = await addDoc(collection(db, "logs"), {
      memberId,
      ...content,
      createdAt: serverTimestamp(), // サーバーの時間を使う（正確だから！）
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};