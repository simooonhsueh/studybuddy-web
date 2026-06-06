const fs = require('fs');
const path = require('path');

// 取得所有任務清單的邏輯
const getTasks = (req, res) => {
    try {
        // 定義 tasks.json 的絕對路徑
        const filePath = path.join(__dirname, '../data/tasks.json');

        // 讀取檔案內容
        const fileData = fs.readFileSync(filePath, 'utf-8');

        // 將字串解析成 JSON 物件
        const tasksData = JSON.parse(fileData);

        // 回傳標準格式給前端
        res.status(200).json({
            status: 'success',
            data: tasksData.tasks
        });
    } catch (error) {
        // 錯誤處理
        res.status(500).json({
            status: 'error',
            message: '伺服器讀取資料失敗',
            error: error.message
        });
    }
};

// 匯出這個功能，讓 Routes 可以使用
module.exports = {
    getTasks
};
