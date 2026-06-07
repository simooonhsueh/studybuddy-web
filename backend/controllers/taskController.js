// backend/controllers/taskController.js
const openaiService = require('../services/openaiService');
const fs = require('fs');
const path = require('path');

let currentWeeklyPlan = null;

const generatePlan = async (req, res) => {
    const profilePath = path.join(__dirname, '../data/profile.json');
    
    let targetGoal = "自主提升計畫"; 
    let targetSubject = "核心範圍複習"; 

    const reqBody = req.body || {};
    const currentLoginName = reqBody.name || reqBody.username || "";
    
    console.log(`🔑 [後端驗證] 目前前端登入的帳號名稱為：【${currentLoginName}】`);

    if (fs.existsSync(profilePath)) {
        try {
            const rawData = fs.readFileSync(profilePath, 'utf-8');
            let parsed = JSON.parse(rawData);
            
            let matchedProfile = null;

            if (Array.isArray(parsed)) {
                if (currentLoginName) {
                    matchedProfile = parsed.reverse().find(p => p.name === currentLoginName);
                }
                if (!matchedProfile && parsed.length > 0) {
                    matchedProfile = parsed[0];
                }
            } else {
                matchedProfile = parsed;
            }
            
            const p = matchedProfile?.profile || matchedProfile?.data || matchedProfile?.user || matchedProfile || {};
            
            if (p.examGoal) targetGoal = p.examGoal.trim();
            if (p.weakSubjects) targetSubject = p.weakSubjects.trim();
            else if (p.preferredSubjects) targetSubject = p.preferredSubjects.trim();
            
            console.log(`📂 [帳號匹配成功] 成功鎖定【${p.name || '未知'}】的檔案 -> 目標：【${targetGoal}】| 科目：【${targetSubject}】`);
        } catch (e) {
            console.error("解析 profile.json 失敗", e.message);
        }
    }

    try {
        const cleanProfile = {
            target: targetGoal,
            preferredSubject: targetSubject
        };

        const weeklyPlan = await openaiService.generateWeeklyPlanWithAI(cleanProfile);
        
        if (weeklyPlan && Array.isArray(weeklyPlan)) {
            currentWeeklyPlan = weeklyPlan.slice(0, 7).map((plan, index) => {
                return { ...plan, day: `Day ${index + 1}` };
            });
            console.log(`✅ [後端] Real OpenAI 成功依據帳號【${currentLoginName}】吐回精準排程！`);
        } else {
            throw new Error("OpenAI 回傳格式非合法陣列");
        }

        res.status(200).json({ status: 'success', message: 'AI 計畫已產生' });

    } catch (error) {
        console.error("💥 AI 生成失敗，嘗試讀取 tasks.json 作為備援：", error.message);
        
        try {
            const filePath = path.join(__dirname, '../data/tasks.json');
            const fileData = fs.readFileSync(filePath, 'utf-8');
            const tasksData = JSON.parse(fileData);

            const fallbackPlan = [];
            for (let i = 1; i <= 7; i++) {
                fallbackPlan.push({
                    day: `Day ${i}`,
                    tasks: (tasksData.tasks || []).map((t, idx) => ({
                        id: t.id || `static-d${i}-${idx}`,
                        title: t.title || '未命名任務',
                        isCompleted: t.completed || false
                    }))
                });
            }
            currentWeeklyPlan = fallbackPlan;
            console.log("📂 [備援] 已從 tasks.json 載入靜態排程");

        } catch (fileError) {
            console.error("tasks.json 讀取失敗，使用最終防墜：", fileError.message);
            const fallbackPlan = [];
            for (let i = 1; i <= 7; i++) {
                fallbackPlan.push({
                    day: `Day ${i}`,
                    tasks: [
                        { id: `fb-d${i}-1`, title: `精進研讀與重點核心突破：${targetSubject}`, isCompleted: false },
                        { id: `fb-d${i}-2`, title: `針對【${targetGoal}】進行歷屆試題實戰演練`, isCompleted: false }
                    ]
                });
            }
            currentWeeklyPlan = fallbackPlan;
        }

        res.status(200).json({ status: 'success', message: '備援計畫已產生' });
    }
};

const getTasks = async (req, res) => {
    try {
        if (!currentWeeklyPlan) {
            return res.status(200).json({ status: 'success', weeklyPlan: [] });
        }
        res.status(200).json({ status: 'success', weeklyPlan: currentWeeklyPlan });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { generatePlan, getTasks };