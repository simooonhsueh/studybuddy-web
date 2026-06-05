const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

router.get('/', progressController.getProgress);
router.post('/checkin', progressController.checkIn);
router.patch('/tasks/:id/complete', progressController.completeTask);

module.exports = router;