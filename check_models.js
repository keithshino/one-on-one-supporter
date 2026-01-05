// check_models.js
// ⚠️ ↓ここに .env.local の VITE_GEMINI_API_KEY の中身をコピペしてね！
const apiKey = "AIzaSyDjMxsNsqpZx5j9NrWipWOblhWWy1rn23Y";

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error("エラー発生！:", data.error.message);
      return;
    }

    console.log("\n=== 🤖 今使えるGeminiモデル一覧 ===");
    const models = data.models || [];
    
    // "generateContent"（文章生成）に対応しているモデルだけ表示
    models.forEach(m => {
      if (m.name.includes("gemini") && m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`✅ ${m.name.replace("models/", "")}`);
        // console.log(`   └ ${m.displayName}`); // 詳しい名前が見たい時はコメント外して
      }
    });
    console.log("==================================\n");
    
  } catch (error) {
    console.error("通信エラー:", error);
  }
}

listModels();