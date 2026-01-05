// src/lib/firestore.ts
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Log } from "../types";

// ログを保存する関数（これは前回と同じ）
export const addLogToFirestore = async (memberId: string, content: Omit<Log, 'id' | 'createdAt' | 'memberId'>) => {
  try {
    const docRef = await addDoc(collection(db, "logs"), {
      memberId,
      ...content,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// 👇【今回追加！】ログを全部取ってくる関数
export const getLogsFromFirestore = async (): Promise<Log[]> => {
  try {
    // 日付が新しい順（desc）に並べて取ってくる
    const q = query(collection(db, "logs"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    // Firestoreのデータを、アプリで使いやすい形（Log型）に変換する
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            memberId: data.memberId,
            date: data.date,
            mood: data.mood,
            good: data.good,
            more: data.more,
            nextAction: data.nextAction,
            memo: data.memo,
            summary: data.summary || "",
            isPlanned: data.isPlanned || false,
        } as Log;
    });
  } catch (e) {
    console.error("Error fetching documents: ", e);
    return [];
  }
};