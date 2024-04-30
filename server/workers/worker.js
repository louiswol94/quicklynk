require('dotenv').config({ path: '../.env' });
const AWS = require('aws-sdk');
const mongoose = require('mongoose');
const Url = require('../models/urlModel');
const WebSocket = require('ws');

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
	region: process.env.AWS_REGIOB
});

const sqs = new AWS.SQS();
const queueUrl = process.env.AWS_SQS_QUEUE_URL;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI);
const db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to MongoDB');
  startWorker();
});

const wss = new WebSocket.Server({ port: process.env.WS_PORT });

  console.log('WebSocket server listening on port', process.env.WS_PORT);

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

function startWorker() {
  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20 // Long polling to reduce unnecessary API calls
  };

  sqs.receiveMessage(params, async (err, data) => {
    if (err) {
      console.error('Error receiving message:', err);
      return;
    }

    if (!data.Messages || data.Messages.length === 0) {
      console.log('No messages received');
      return startWorker(); // Continue listening for messages
    }

    const message = data.Messages[0];
    const body = JSON.parse(message.Body);

    try {
      // Save data to MongoDB
      const { originalUrl, shortId } = body;
      await Url.create({ originalUrl, shortId });

      console.log('Data saved to MongoDB:', { originalUrl, shortId });

	  // Send data to connected WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ originalUrl, shortId }));
        }
      });

      // Delete message from the queue
      const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle
      };
      sqs.deleteMessage(deleteParams, (err) => {
        if (err) {
          console.error('Error deleting message:', err);
        } else {
          console.log('Message deleted from the queue');
        }
        startWorker(); // Continue listening for messages
      });
    } catch (error) {
      console.error('Error saving data to MongoDB:', error);
      startWorker(); // Continue listening for messages
    }
  });
}
