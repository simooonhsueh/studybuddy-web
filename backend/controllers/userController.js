const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../data");
const profileFilePath = path.join(dataDir, "profile.json");

function ensureDataDirExists() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getProfile(req, res) {
  try {
    ensureDataDirExists();

    if (!fs.existsSync(profileFilePath)) {
      return res.status(200).json({
        status: "success",
        message: "尚未建立使用者設定",
        data: null,
      });
    }

    const fileContent = fs.readFileSync(profileFilePath, "utf-8");
    const profile = JSON.parse(fileContent);

    return res.status(200).json({
      status: "success",
      message: "成功取得使用者設定",
      data: profile,
    });
  } catch (error) {
    console.error("讀取使用者設定失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "讀取使用者設定失敗",
    });
  }
}

function saveProfile(req, res) {
  try {
    ensureDataDirExists();

    const profile = req.body;

    if (!profile.name || !profile.examGoal) {
      return res.status(400).json({
        status: "error",
        message: "缺少必要欄位：name 或 examGoal",
      });
    }

    fs.writeFileSync(
      profileFilePath,
      JSON.stringify(profile, null, 2),
      "utf-8"
    );

    return res.status(200).json({
      status: "success",
      message: "使用者設定已儲存",
      data: profile,
    });
  } catch (error) {
    console.error("儲存使用者設定失敗：", error);

    return res.status(500).json({
      status: "error",
      message: "儲存使用者設定失敗",
    });
  }
}

module.exports = {
  getProfile,
  saveProfile,
};