
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateLogSummary = async (memo: string, good: string, more: string, next: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "AI要約機能を利用するにはAPIキーの設定が必要です。";
  }

  const prompt = `
    以下の1on1ミーティングの内容から、簡潔な要約（150文字程度）を作成してください。
    
    【Good】: ${good}
    【More/課題】: ${more}
    【ネクストアクション】: ${next}
    【マネージャー用メモ】: ${memo}
    
    要約は「〜という状況で、今後は〜を行う方針」のような一貫した文体でお願いします。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0.7,
      }
    });

    return response.text || "要約の生成に失敗しました。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI要約の生成中にエラーが発生しました。";
  }
};
