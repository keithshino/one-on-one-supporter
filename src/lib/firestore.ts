// src/lib/firestore.ts
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, setDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Log, Member } from "../types"; // Memberを追加
import { MOCK_MEMBERS } from "../mockData"; // モックデータを読み込む

// ログを保存する関数（これは前回と同じ）
export const addLogToFirestore = async (logData: {
  memberId: string;
  date: string;
  good: string;
  more: string;
  nextAction: string;
  summary: string;
  isPlanned: boolean;
}) => {
  try {
    await addDoc(collection(db, "logs"), {
      ...logData, // 中身を全部展開して保存
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("ログ追加エラー:", e);
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

// 👇 【追加1】メンバー一覧を取ってくる関数
export const getMembersFromFirestore = async (): Promise<Member[]> => {
  try {
    const q = query(collection(db, "members"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Member));
  } catch (e) {
    console.error("メンバー取得エラー:", e);
    return [];
  }
};

// 👇 【追加2】初期データをFirestoreに流し込む関数（引っ越し用）
export const seedMembers = async () => {
  try {
    // 既存のモックデータを1つずつFirestoreに入れる
    for (const member of MOCK_MEMBERS) {
      // IDが "1" とかだと被る可能性があるけん、Firestoreに自動でIDを作らせる
      // (あえて setDoc ではなく addDoc を使うばい)
      await addDoc(collection(db, "members"), {
        name: member.name,
        role: member.role,
        avatar: member.avatar,
        email: "", // 今は空っぽで
        managerId: "", // 今は紐付けなしで
        createdAt: serverTimestamp(),
      });
    }
    console.log("メンバーの移行完了！");
    alert("初期メンバーの登録が完了したばい！");
  } catch (e) {
    console.error("移行エラー:", e);
    alert("移行に失敗した...");
  }
};

// 👇 新しいメンバーを登録する関数
export const addMemberToFirestore = async (name: string, role: string, managerId: string, email: string) => {
  try {
    // アイコンはとりあえずランダムで可愛い画像を割り当てるばい！
    const randomId = Math.floor(Math.random() * 1000);
    const avatarUrl = `https://picsum.photos/seed/${randomId}/200`;

    const docRef = await addDoc(collection(db, "members"), {
      name: name,
      role: role,
      avatar: avatarUrl,
      email: email,
      managerId: managerId, // 👈 ここで紐づけ！
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (e) {
    console.error("メンバー追加エラー:", e);
    throw e;
  }
};

// 👇 【新規追加】メンバー情報を更新する関数（紐づけ変更もこれでやる！）
export const updateMemberInFirestore = async (memberId: string, updates: Partial<Member>) => {
  try {
    const docRef = doc(db, "members", memberId);
    await updateDoc(docRef, updates);
  } catch (e) {
    console.error("メンバー更新エラー:", e);
    throw e;
  }
};

// 👇 【追加】メンバーを削除する関数
export const deleteMemberFromFirestore = async (memberId: string) => {
  try {
    await deleteDoc(doc(db, "members", memberId));
  } catch (e) {
    console.error("メンバー削除エラー:", e);
    throw e;
  }
};

// 👇 既存のログを更新する関数
export const updateLogInFirestore = async (
  logId: string,
  logData: {
    date: string;
    good: string;
    more: string;
    nextAction: string;
    summary: string;
  }
) => {
  try {
    const logRef = doc(db, "logs", logId);
    await updateDoc(logRef, {
      ...logData,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("ログ更新エラー:", e);
    throw e;
  }
};
