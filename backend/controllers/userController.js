const fs = require('fs');
const path = require('path');

const getProfile = (req, res) => {
    const filePath = path.join(__dirname, '../data/profile.json');
    const profileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.status(200).json({ status: 'success', data: profileData });
};

const saveProfile = (req, res) => {
    // 假裝儲存成功，直接回傳前端傳來的資料
    res.status(200).json({ status: 'success', message: '設定已儲存', data: req.body });
};

module.exports = { getProfile, saveProfile };