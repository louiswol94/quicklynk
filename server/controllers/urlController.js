const Url = require('../models/urlModel');
const { generateShortId } = require('../utils/utils');
const AWS = require('aws-sdk');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001/';

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
	region: process.env.AWS_REGIOB
});

const sqs = new AWS.SQS();
const queueUrl = process.env.AWS_SQS_QUEUE_URL;

exports.shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const shortId = generateShortId();
    const fullShortUrl = `${BASE_URL}${shortId}`;

    // Send message to SQS queue
    const params = {
      MessageBody: JSON.stringify({ originalUrl, shortId }),
      QueueUrl: queueUrl
    };

	sqs.sendMessage(params, (err, data) => {
		if (err) {
		  console.error('Error sending message:', err);
		  return res.status(500).json({ message: 'Error sending message to queue' });
		} else {
		  console.log('Message sent successfully:', data.MessageId);
		  res.status(201).json({ shortUrl: fullShortUrl });
		}
	});
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
