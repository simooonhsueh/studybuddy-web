// backend/services/openaiService.js
const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY 
});

const generateWeeklyPlanWithAI = async (userProfile) => {
    const { target, preferredSubject } = userProfile;
    
    console.log(`🚀 [OpenAI 動態任務量發動] 核心目標：【${target}】| 參考學科：【${preferredSubject}】`);

    const prompt = `
你是一個頂尖的 AI 智慧學習排程專家。請為一位學生量身打造一份為期 7 天（Day 1 到 Day 7）的衝刺讀書計畫。
使用者的備考資訊如下：
- 🎯 最高核心備考目標：${target}
- 📝 填寫的參考學科：${preferredSubject}

【動態任務量與難度分級指令】：
1. **任務數量由你自由決定（不要固定！）**：每天的任務數量請**根據任務的難度與備考進程動態調整**。
   - 如果當天安排的是大魔王任務（例如：全真模擬考、跨學科長篇文獻深度拆解），當天只需要排 **1 ~ 2 個** 任務，讓學生有足夠時間深挖。
   - 如果當天安排的是基礎奠定或零碎複習（例如：核心單字記憶、常錯文法盲點快速瀏覽），當天可以排 **3 ~ 4 個** 任務。
   - 讓 7 天的任務總量看起來錯落有致、鬆緊度完全依據難度而定。
2. **目標絕對最高權重**：至少要有 70% 以上的火力完全針對該最高核心目標（如英文）進行全面衝刺。如果學科（如歷史公民）與目標不一致，請進行跨學科融合（例如：閱讀歷史/公民範疇的英文文獻、拆解相關專業英文術語）。
3. 任務標題（title）請回傳純內容描述，嚴禁包含任何時間區間標籤（不准寫 [20:00-21:00] 或 60分鐘 等字眼）。

【回傳格式限制】：
1. 請直接回傳一個 JSON 陣列，最外層必須是陣列，陣列內包含 7 個物件，分別代表 Day 1 到 Day 7。
2. 格式範例：
   [
     {
       "day": "Day 1",
       "tasks": [
         { "id": "隨機字串1", "title": "難度高的核心大任務", "isCompleted": false }
       ]
     },
     {
       "day": "Day 2",
       "tasks": [
         { "id": "隨機字串2", "title": "較輕鬆的任務A", "isCompleted": false },
         { "id": "隨機字串3", "title": "較輕鬆的任務B", "isCompleted": false },
         { "id": "隨機字串4", "title": "較輕鬆的任務C", "isCompleted": false }
       ]
     }
   ]
3. 嚴格禁止包含任何 markdown 標籤（如 \`\`\`json ），只能回傳純 JSON 字串。
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", 
            messages: [
                { role: "system", content: "你是一個擅長根據任務難度動態調配每日任務數量的 JSON 排程助手。" },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, 
        });

        let rawText = response.choices[0].message.content.trim();
        
        if (rawText.startsWith("```")) {
            rawText = rawText.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
        }

        const weeklyPlan = JSON.parse(rawText);
        console.log("🎯 [OpenAI Service] 成功算回彈性任務量的智慧排程！");
        return weeklyPlan;

    } catch (error) {
        console.error("💥 OpenAI 雲端呼叫或解析失敗:", error.message);
        throw error;
    }
};

module.exports = {
    generateWeeklyPlanWithAI
};