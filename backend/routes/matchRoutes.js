const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

// POST /api/match  body: { userId }
router.post('/', matchController.getMatches);

module.exports = router;