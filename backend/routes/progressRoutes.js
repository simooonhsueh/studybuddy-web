const express = require("express");
const progressController = require("../controllers/progressController");

const router = express.Router();

router.get("/", progressController.getProgress);
router.put("/tasks", progressController.replaceTasks);
router.patch("/tasks/:id/complete", progressController.completeTask);
router.post("/checkin", progressController.checkIn);

module.exports = router;
