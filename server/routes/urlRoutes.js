const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.post('/', urlController.shortenUrl);

module.exports = router;
