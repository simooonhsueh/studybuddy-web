const express = require("express");
const router = express.Router();

const {
  getProfile,
  saveProfile,
  loginProfile,
} = require("../controllers/userController");

router.get("/profile", getProfile);
router.post("/profile", saveProfile);
router.post("/login", loginProfile);

module.exports = router;