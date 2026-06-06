const fs = require('fs');
const path = require('path');

const getProgress = (req, res) => {
    const filePath = path.join(__dirname, '../data/progress.json');
    const progressData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.status(200).json({ status: 'success', data: progressData });
};

const checkIn = (req, res) => {
    res.status(200).json({ status: 'success', message: '今日打卡成功！Streak +1' });
};

const completeTask = (req, res) => {
    res.status(200).json({ status: 'success', message: `任務 ${req.params.id} 已標記為完成` });
};

module.exports = { getProgress, checkIn, completeTask };