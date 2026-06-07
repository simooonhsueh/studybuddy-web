const express = require('express');
const cors = require('cors');

// 引入所有路由
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progressRoutes');
const matchRoutes = require('./routes/matchRoutes');
const groupRoutes = require("./routes/groupRoutes");

// 💡 關鍵引入：直接把你的 taskController 抓進來用
const taskController = require('./controllers/taskController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 測試用 API
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'StudyBuddy Backend is running smoothly!' });
});

// 掛載所有路由 [cite: 20]
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);
app.use('/api/progress', progressRoutes);
// 企劃書裡的 checkin 寫在根目錄，我們把它掛進 progress 裡比較好管理，前端呼叫 /api/progress/checkin
app.use('/api/match', matchRoutes);
app.use("/api/groups", groupRoutes);

// 🔥 【超級大修正】不要在這裡寫死 res.json！
// 讓前端 POST /api/generate-plan 時，真正走進你的 taskController 裡去跑 OpenAI 大腦！
app.post('/api/generate-plan', taskController.generatePlan);

// 啟動伺服器 [cite: 46]
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
