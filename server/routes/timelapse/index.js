const express = require('express');
const videoshow = require('videoshow');
const path = require('path');
const { Image } = require('../../models/image');

const router = express.Router();
const framesPerTimelapse = Number(process.env.FRAMES_PER_TIMELAPSE);

// GET timelapse video from mongodb images query
router.get('/', (req, res) => {
  Image.findLast(framesPerTimelapse)
    .then((frames) => {
      if (!frames.length) return res.status(401).send();
      const frameFilenames = frames.map((frame) => path.join(__dirname, '../../../public/images', frame.filename));
      const options = {
        fps: 30,
        loop: 1/30,
        transition: false,
        videoBitrate: 1024,
        videoCodec: 'libx264',
        size: '1024x768',
        format: 'mp4',
        pixelFormat: 'yuv420p'
      };
      videoshow(frameFilenames, options)
        .save(path.join(__dirname, '../../../public/vid/tmp.mp4'))
        .on('error', (err, stdout, stderr) => {
          console.log(err);
          console.log(stderr);
          res.status(401).send(err);
        })
        .on('end', (output) => {
          console.log('video done', output);
          res.send();
        });
    })
    .catch(() => {
      res.status(400).send({ status: 'could not find frames' });
    });
});

module.exports = router;
