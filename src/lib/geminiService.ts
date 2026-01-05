// src/lib/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// 環境変数から鍵を取り出す
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 👇 LogEditorから「ひとまとまりのテキスト」が送られてくるので、引数を content 1つに変更！
export const generateSummary = async (content: string): Promise<string> => {
  if (!API_KEY) {
    console.error("Gemini API Keyが見つかりません！.envを確認してね");
    return "APIキー設定エラー";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // 👇 確実に動く最新モデル 'gemini-1.5-flash' に指定
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // AIへの命令文（プロンプト）
    // 以前の丁寧な口調指定などはそのまま残したよ！
    const prompt = `
      以下の1on1ミーティングのメモを読んで、重要なポイントを「簡潔に、最大3行程度で」要約してください。
      口調は「〜について話した」「〜することになった」のような客観的なトーンでお願いします。

      【ログ内容】
      ${content}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "要約の生成に失敗しました";
  }
};