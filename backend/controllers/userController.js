const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/profile.json");

function readProfiles() {
  if (!fs.existsSync(filePath)) return [];
  const fileContent = fs.readFileSync(filePath, "utf-8");
  if (!fileContent.trim()) return [];
  const data = JSON.parse(fileContent);
  return Array.isArray(data) ? data : [];
}

function writeProfiles(profiles) {
  fs.writeFileSync(filePath, JSON.stringify(profiles, null, 2), "utf-8");
}

const getProfile = (req, res) => {
  try {
    const profiles = readProfiles();
    res.status(200).json({ status: "success", data: profiles });
  } catch (error) {
    console.error("讀取 profile 失敗：", error);
    res.status(500).json({ status: "error", message: "讀取 profile 失敗" });
  }
};

const saveProfile = (req, res) => {
  try {
    const profiles = readProfiles();
    const newProfile = req.body;

    if (!newProfile.name || !newProfile.name.trim()) {
      return res.status(400).json({ status: "error", message: "使用者名稱不能為空" });
    }

    const inputName = newProfile.name.trim().toLowerCase();
    const nameExists = profiles.some(
      (p) => p.name && p.name.trim().toLowerCase() === inputName
    );

    if (nameExists) {
      return res.status(409).json({ status: "error", message: "此使用者名稱已存在，請換一個名稱" });
    }

    const profileToSave = {
      id: Date.now(),
      ...newProfile,
      name: newProfile.name.trim(),
      createdAt: new Date().toISOString(),
    };

    profiles.push(profileToSave);
    writeProfiles(profiles);

    res.status(201).json({ status: "success", message: "設定已儲存", data: profileToSave });
  } catch (error) {
    console.error("儲存 profile 失敗：", error);
    res.status(500).json({ status: "error", message: "儲存 profile 失敗" });
  }
};

const loginProfile = (req, res) => {
  try {
    const profiles = readProfiles();
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ status: "error", message: "請輸入使用者名稱" });
    }

    const inputName = name.trim().toLowerCase();
    const user = profiles.find(
      (p) => p.name && p.name.trim().toLowerCase() === inputName
    );

    if (!user) {
      return res.status(404).json({ status: "error", message: "找不到此使用者，請確認名稱是否正確" });
    }

    res.status(200).json({ status: "success", message: "登入成功", data: user });
  } catch (error) {
    console.error("登入失敗：", error);
    res.status(500).json({ status: "error", message: "登入失敗" });
  }
};

const updateProfile = (req, res) => {
  try {
    const profiles = readProfiles();
    const { id } = req.params;
    const updatedProfile = req.body;

    const targetIndex = profiles.findIndex(
      (profile) => String(profile.id) === String(id)
    );

    if (targetIndex === -1) {
      return res.status(404).json({
        status: "error",
        message: "找不到此使用者資料",
      });
    }

    if (!updatedProfile.name || !updatedProfile.name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "使用者名稱不能為空",
      });
    }

    const inputName = updatedProfile.name.trim().toLowerCase();

    const nameExists = profiles.some(
      (profile) =>
        String(profile.id) !== String(id) &&
        profile.name &&
        profile.name.trim().toLowerCase() === inputName
    );

    if (nameExists) {
      return res.status(409).json({
        status: "error",
        message: "此使用者名稱已存在，請換一個名稱",
      });
    }

    const oldProfile = profiles[targetIndex];

    const profileToUpdate = {
      ...oldProfile,
      ...updatedProfile,
      id: oldProfile.id,
      name: updatedProfile.name.trim(),
      updatedAt: new Date().toISOString(),
    };

    profiles[targetIndex] = profileToUpdate;
    writeProfiles(profiles);

    res.status(200).json({
      status: "success",
      message: "個人資料已更新",
      data: profileToUpdate,
    });
  } catch (error) {
    console.error("更新 profile 失敗：", error);

    res.status(500).json({
      status: "error",
      message: "更新 profile 失敗",
    });
  }
};

// ── PDF 解析：上傳到 OpenAI Files → Responses API 讀取 → 刪除暫存 ───────────
const { OpenAI, toFile } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const parseSchedule = async (req, res) => {
  let uploadedFileId = null;

  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "請上傳 PDF 檔案" });
    }

    // Step 1：把 PDF buffer 上傳到 OpenAI Files（用途設為 user_data）
    const uploadedFile = await openai.files.create({
      file: await toFile(req.file.buffer, "schedule.pdf", { type: "application/pdf" }),
      purpose: "user_data",
    });
    uploadedFileId = uploadedFile.id;

    // Step 2：用 Responses API 讓 GPT 讀取這份 PDF
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              file_id: uploadedFileId,
            },
            {
              type: "input_text",
              text: `請從這份課表 PDF 中提取所有課程資訊，回傳純 JSON 陣列（不要加任何說明文字或 markdown backtick），格式如下：
[
  {
    "courseName": "資料結構緒論",
    "credits": 3,
    "courseCode": "E231600",
    "type": "選修"
  }
]`,
            },
          ],
        },
      ],
    });

    // Step 3：解析回傳的 JSON
    let jsonText = response.output_text.trim();
    jsonText = jsonText.replace(/```json|```/g, "").trim();
    const courses = JSON.parse(jsonText);

    res.status(200).json({ status: "success", data: courses });
  } catch (error) {
    console.error("解析課表失敗：", error);
    res.status(500).json({ status: "error", message: "課表解析失敗，請稍後再試" });
  } finally {
    // Step 4：不論成功失敗，都刪除 OpenAI 上的暫存檔案
    if (uploadedFileId) {
      openai.files.delete(uploadedFileId).catch(() => {});
    }
  }
};

module.exports = { getProfile, saveProfile, loginProfile, updateProfile, parseSchedule };