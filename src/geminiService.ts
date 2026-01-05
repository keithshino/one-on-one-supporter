// src/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// 環境変数から鍵を取り出す
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateSummary = async (
  good: string, 
  more: string, 
  nextAction: string, 
  memo: string
): Promise<string> => {
  if (!API_KEY) {
    console.error("Gemini API Keyが見つかりません！.env.localを確認してね");
    return "APIキー設定エラー";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // AIへの命令文（プロンプト）
    const prompt = `
      以下の1on1ミーティングのメモを読んで、重要なポイントを「簡潔に、最大3行程度で」要約してください。
      口調は「〜について話した」「〜することになった」のような客観的なトーンでお願いします。

      【Good（良かったこと）】
      ${good}

      【More（課題・悩み）】
      ${more}

      【Next Action（次やること）】
      ${nextAction}

      【Memo（その他）】
      ${memo}
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