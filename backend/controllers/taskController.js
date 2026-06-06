// backend/controllers/taskController.js
const openaiService = require('../services/openaiService');
const fs = require('fs');
const path = require('path');

let currentWeeklyPlan = null;

// 🎯 POST /api/generate-plan
const generatePlan = async (req, res) => {
    const profilePath = path.join(__dirname, '../data/profile.json');
    
    let targetGoal = "自主提升計畫"; 
    let targetSubject = "核心範圍複習"; 

    // 🎯 1. 看看前端有沒有把目前登入者的名稱傳過來 (相容各種可能的欄位名)
    const reqBody = req.body || {};
    const currentLoginName = reqBody.name || reqBody.username || "";
    
    console.log(`🔑 [後端驗證] 目前前端登入的帳號名稱為：【${currentLoginName}】`);

    if (fs.existsSync(profilePath)) {
        try {
            const rawData = fs.readFileSync(profilePath, 'utf-8');
            let parsed = JSON.parse(rawData);
            
            let matchedProfile = null;

            if (Array.isArray(parsed)) {
                // 🎯 2. 如果目前有特定登入帳號，就去陣列裡精準篩選出 name 吻合的最新一筆資料！
                if (currentLoginName) {
                    // 從後往前找，確保拿到該帳號最新更新的紀錄
                    matchedProfile = parsed.reverse().find(p => p.name === currentLoginName);
                }
                
                // 🛡️ 保險：如果找不到該帳號，或前端沒傳名稱，就抓陣列最後一筆當預設
                if (!matchedProfile && parsed.length > 0) {
                    matchedProfile = parsed[0]; // 因為前面 reverse 了，Index 0 就是原本的最後一筆
                }
            } else {
                matchedProfile = parsed;
            }
            
            const p = matchedProfile?.profile || matchedProfile?.data || matchedProfile?.user || matchedProfile || {};
            
            // 精準咬住匹配成功的欄位名稱
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
        console.error("💥 AI 生成失敗，觸發 100% 同科目動態防墜：", error.message);
        
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
        res.status(200).json({ status: 'success', message: '動態防墜計畫已產生' });
    }
};

// 🎯 GET /api/tasks
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
