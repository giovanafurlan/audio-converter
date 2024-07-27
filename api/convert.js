const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: '/tmp/' }); // Use /tmp/ for serverless functions

app.post('/api/convert', upload.single('audio'), (req, res) => {
  const inputFilePath = req.file.path;
  const outputFilePath = `/tmp/${path.parse(req.file.originalname).name}.m4a`;

  ffmpeg(inputFilePath)
    .toFormat('m4a')
    .on('end', () => {
      res.download(outputFilePath, (err) => {
        if (err) {
          console.error(err);
        }
        fs.unlinkSync(inputFilePath);
        fs.unlinkSync(outputFilePath);
      });
    })
    .on('error', (err) => {
      console.error(err);
      res.status(500).send('Error converting file');
    })
    .save(outputFilePath);
});

module.exports = app;
