const express = require('express');
const cors = require('cors');

// 引入所有路由
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progressRoutes');
const matchRoutes = require('./routes/matchRoutes');

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
// AI 排程的部分，我們可以直接沿用 taskRoutes 來回傳資料
app.post('/api/generate-plan', (req, res) => {
    res.status(200).json({ status: 'success', message: 'AI 計畫已產生，請呼叫 GET /api/tasks 取得任務' });
});

// 啟動伺服器 [cite: 46]
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});