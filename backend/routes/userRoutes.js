const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // 存在記憶體，不寫檔案

const {
  getProfile,
  saveProfile,
  loginProfile,
  updateProfile,
  parseSchedule,
} = require("../controllers/userController");

router.get("/profile", getProfile);
router.post("/profile", saveProfile);
router.post("/login", loginProfile);
router.post("/parse-schedule", upload.single('schedule'), parseSchedule);
router.patch("/profile/:id", updateProfile);

module.exports = router;
