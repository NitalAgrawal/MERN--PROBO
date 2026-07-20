'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadImage, uploadVoice } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Enforce authentication on all asset management routes
router.use(protect);

router.post('/image', uploadImage, uploadController.uploadImage);
router.post('/voice', uploadVoice, uploadController.uploadVoice);
router.delete('/photo', uploadController.deletePhoto);
router.delete('/voice', uploadController.deleteVoice);

module.exports = router;
