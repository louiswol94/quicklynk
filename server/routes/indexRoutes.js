const express = require('express');
const router = express.Router();
const Url = require('../models/urlModel');

router.get('/:shortId', async (req, res) => {
  try {
    const shortId = req.params.shortId;
    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).json({ message: 'Short URL not found' });
    }

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
