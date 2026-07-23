const express = require('express');
const { getHealth, getReadiness } = require('../controllers/healthController');

const router = express.Router();

router.get('/health', getHealth);
router.get('/ready', getReadiness);

module.exports = router;
