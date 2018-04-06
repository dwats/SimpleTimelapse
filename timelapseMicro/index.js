const path = require('path');
const videoshow = require('videoshow');
const { Image } = require('../server/models/image');

const framesPerTimelapse = Number(process.env.FRAMES_PER_TIMELAPSE);
const timeBetweenTimelapseGen = Number(process.env.TIME_BETWEEN_TIMELAPSE_GEN);
const imageDir = path.join(__dirname, '../public/images');
const videoDir = path.join(__dirname, '../public/media');
const videoOptions = {
  fps: 30,
  loop: 1/30,
  transition: false,
  videoBitrate: 1024,
  videoCodec: 'libx264',
  size: '1024x768',
  format: 'mp4',
  pixelFormat: 'yuv420p'
};

/**
 * Create timelapse from images.
 *
 * Image order and filenames are queried from the mongodb
 * then imported from `../public/images`.
 * @param {*} options - videoshow options
 * @param {*} inputDir - timelapse frames directory
 * @param {*} outputDir - timelapse mp4 output
 */
function makeTimelapse(options, inputDir, outputDir) {
  Image.findLast(framesPerTimelapse)
    .then((frames) => {
      if (!frames.length) return console.log(`[${new Date()}] timelapse has no frames!`);
      const frameFilenames = frames.map((frame) => path.join(inputDir, frame.filename));

      videoshow(frameFilenames, videoOptions)
        .save(path.join(outputDir, 'timelapse.mp4'))
        .on('error', (err, stdout, stderr) => {
          console.log(`[${new Date()}] timelapse node error`, err);
          console.log(`[${new Date()}] timelapse ffmpeg error `, stderr);
        })
        .on('end', (output) => {
          console.log(`[${new Date()}] timelapse complete`, output);
        });
    })
    .catch((e) => {
      console.log(`[${new Date()}] timelapse promise error`, e);
    });
}

setInterval(
  () => makeTimelapse(videoOptions, imageDir, videoDir),
  timeBetweenTimelapseGen
);
