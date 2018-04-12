const path = require('path');
const fs = require('fs-extra');
const videoshow = require('videoshow');

const imageDir = path.join(__dirname, './images');
const videoDir = path.join(__dirname, '.');
const videoOptions = {
  fps: 60,
  loop: 0.05,
  transition: false,
  videoBitrate: 4068,
  videoCodec: 'libx264',
  size: '1024x768',
  format: 'mp4',
  pixelFormat: 'yuv420p'
};

function makeTimelapseFromDir(options, inputDir, outputDir) {
  fs.readdir(inputDir)
    .then((files) => {
      if (!files.length) return console.log(`[${new Date()}] timelapse has no frames!`);
      const frameFilenames = files.map((frame) => path.join(inputDir, frame));
      console.log(frameFilenames);
      videoshow(frameFilenames, videoOptions)
        .save(path.join(outputDir, 'test.mp4'))
        .on('error', (err, stdout, stderr) => {
          console.log(`[${new Date()}] timelapse node error`);
          console.log(err);
          console.log(`[${new Date()}] timelapse stdout`);
          console.log(stdout);
          console.log(`[${new Date()}] timelapse stderr`);
          console.log(stderr);
        })
        .on('end', (output) => {
          console.log(`[${new Date()}] timelapse complete`, output);
        });
    })
    .catch((e) => {
      console.log(e);
    });
}

makeTimelapseFromDir(videoOptions, imageDir, videoDir);
