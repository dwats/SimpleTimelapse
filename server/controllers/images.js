const path = require('path');
const { ObjectId } = require('mongodb');
const { Image } = require('../models/image');
const { prune } = require('../utils/prune');
const saveFile = require('../utils/saveFile');

const framesPerTimelapse = Number(process.env.FRAMES_PER_TIMELAPSE);

exports.imageCreatePost = (req, res) => {
  if (!req.files) return res.status(400).end();

  const file = req.files.file;
  const fileId = new ObjectId();
  const filepath = path.join(__dirname, `../../public/images/${fileId}.png`);

  saveFile(filepath, file)
    .then(() => {
      const image = new Image({
        _id: fileId,
        filename: `${fileId}.png`
      });
      return image.save();
    })
    .then(() => {
      res.send();
    })
    .catch(() => {
      res.status(500).end();
    });
};

exports.imageDelete = (req, res) => {
  let toPrune;

  Image
    .find()
    .sort({ _id: -1 })
    .then((images) => {
      if (!images || images.length <= framesPerTimelapse) return Promise.reject('no-action');
      const prunePath = path.join(__dirname, '../../public/images');
      toPrune = images.slice(framesPerTimelapse);
      return prune(prunePath, toPrune);
    })
    .then(() => {
      const imageIds = toPrune.map((image) => image._id);
      return Image.remove({ _id: { $in: imageIds }});
    })
    .then(() => {
      res.send();
    })
    .catch((e) => {
      console.log(e);
      if (e === 'no-action') return res.send();
      return res.status(500).end();
    });
};

exports.imagesFindLastNGet = (req, res) => {
  Image.findLast(framesPerTimelapse)
    .then((frames) => {
      if (!frames.length) return res.status(404).end();
      res.send();
    })
    .catch((e) => {
      console.log(e);
      return res.status(500).end();
    });
};
