// src/lib/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mood } from "../types"; // Mood型を使うのでインポート

// 環境変数から鍵を取り出す
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ---------------------------------------------------------
// 🟢 既存機能: テキストを渡して「要約だけ」をもらう関数
// ---------------------------------------------------------
export const generateSummary = async (content: string): Promise<string> => {
  if (!API_KEY) {
    console.error("Gemini API Keyが見つかりません❗️.envを確認してね");
    return "APIキー設定エラー";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      以下の1on1ミーティングのメモを読んで、重要なポイントを「簡潔に、最大3行程度で」要約してください。
      口調は「〜について話した」「〜することになった」のような客観的なトーンでお願いします。

      【ログ内容】
      ${content}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "要約の生成に失敗しました";
  }
};

// ---------------------------------------------------------
// 🟣 新機能: 議事録ファイルを渡して「全項目(JSON)」をもらう関数
// ---------------------------------------------------------

// 返却データの型定義
interface LogAIResponse {
  summary: string;
  good: string;
  more: string;
  nextAction: string;
  mood: Mood;
}

export const generateLogFromTranscript = async (transcript: string): Promise<LogAIResponse> => {
  if (!API_KEY) {
    throw new Error("APIキー設定エラー");
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      あなたは優秀なマネージャーの秘書です。
      以下の1on1ミーティングの文字起こしテキストを読み、
      JSON形式で以下の5つの項目を抽出・要約してください。

      1. summary: 全体の要約（100文字程度）
      2. good: 話し手（部下）の良かった点や成果
      3. more: 課題や改善点、悩み
      4. nextAction: 次にやるべきこと（To-Do）
      5. mood: 部下の雰囲気 (sunny, cloudy, rainy, stormy のいずれかを選択)

      出力は必ず純粋なJSONのみを返してください。Markdownのコードブロックは不要です。

      --- 文字起こし ---
      ${transcript}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSONとしてパースする（余計な記号が入っていたら削除）
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText) as LogAIResponse;

  } catch (error) {
    console.error("Gemini Error (Transcript):", error);
    throw new Error("AI生成に失敗しました");
  }
};