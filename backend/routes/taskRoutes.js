const express = require('express');
const router = express.Router();
// 引入剛才寫好的控制器
const taskController = require('../controllers/taskController');

// 當收到 GET 請求時，交給 taskController.getTasks 處理
router.get('/', taskController.getTasks);

module.exports = router;