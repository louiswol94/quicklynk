const Url = require('../models/urlModel');
const { generateShortId } = require('../utils/utils');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001/';

exports.shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const shortId = generateShortId();
    const fullShortUrl = `${BASE_URL}${shortId}`;
    const newUrl = new Url({ originalUrl, shortId });

    await newUrl.save();

    res.status(201).json({ shortUrl: fullShortUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.redirectToOriginalUrl = async (req, res) => {
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
};
