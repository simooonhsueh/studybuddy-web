// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// 🎯 對齊企劃書 2.3 API 規劃規範 
// 注意：因為 server.js 裡面有一行寫了 app.post('/api/generate-plan', taskController.generatePlan);
// 為了雙重保險與彈性，我們在路由裡把兩個入口都接通！

// POST /api/tasks/generate-plan 或直接配合前端呼叫
router.post('/generate-plan', taskController.generatePlan);

// GET /api/tasks -> 取得今日 / 本週任務清單 
router.get('/', taskController.getTasks);

module.exports = router;
