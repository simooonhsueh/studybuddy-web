const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/profile.json");

function readProfiles() {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");

  if (!fileContent.trim()) {
    return [];
  }

  const data = JSON.parse(fileContent);

  if (Array.isArray(data)) {
    return data;
  }

  return [];
}

function writeProfiles(profiles) {
  fs.writeFileSync(filePath, JSON.stringify(profiles, null, 2), "utf-8");
}

const getProfile = (req, res) => {
  try {
    const profiles = readProfiles();

    res.status(200).json({
      status: "success",
      data: profiles,
    });
  } catch (error) {
    console.error("讀取 profile 失敗：", error);

    res.status(500).json({
      status: "error",
      message: "讀取 profile 失敗",
    });
  }
};

const saveProfile = (req, res) => {
  try {
    const profiles = readProfiles();
    const newProfile = req.body;

    if (!newProfile.name || !newProfile.name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "使用者名稱不能為空",
      });
    }

    const inputName = newProfile.name.trim().toLowerCase();

    const nameExists = profiles.some(
      (profile) => profile.name && profile.name.trim().toLowerCase() === inputName
    );

    if (nameExists) {
      return res.status(409).json({
        status: "error",
        message: "此使用者名稱已存在，請換一個名稱",
      });
    }

    const profileToSave = {
      id: Date.now(),
      ...newProfile,
      name: newProfile.name.trim(),
      createdAt: new Date().toISOString(),
    };

    profiles.push(profileToSave);
    writeProfiles(profiles);

    res.status(201).json({
      status: "success",
      message: "設定已儲存",
      data: profileToSave,
    });
  } catch (error) {
    console.error("儲存 profile 失敗：", error);

    res.status(500).json({
      status: "error",
      message: "儲存 profile 失敗",
    });
  }
};

const loginProfile = (req, res) => {
  try {
    const profiles = readProfiles();
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "請輸入使用者名稱",
      });
    }

    const inputName = name.trim().toLowerCase();

    const user = profiles.find(
      (profile) => profile.name && profile.name.trim().toLowerCase() === inputName
    );

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "找不到此使用者，請確認名稱是否正確",
      });
    }

    res.status(200).json({
      status: "success",
      message: "登入成功",
      data: user,
    });
  } catch (error) {
    console.error("登入失敗：", error);

    res.status(500).json({
      status: "error",
      message: "登入失敗",
    });
  }
};

module.exports = {
  getProfile,
  saveProfile,
  loginProfile,
};