const path = require('path');
const { ObjectId } = require('mongodb');
const { Image } = require('../models/image');
const { prune } = require('../utils/prune.js');

const framesPerTimelapse = Number(process.env.FRAMES_PER_TIMELAPSE);

exports.imageCreatePost = (req, res) => {
  if (!req.files) return res.status(400).send({ status: 'no file' });

  const file = req.files.file;
  const fileId = new ObjectId();
  file.mv(path.join(__dirname, '../public/images', `${fileId}.png`), (err) => {
    if (err) res.status(500).send({ status: 'could not save file' });

    const image = new Image({
      _id: fileId,
      filename: `${fileId}.png`
    });
    image
      .save()
      .then(() => {
        res.send({ status: 'ok' });
      })
      .catch(() => {
        res.status(400).send({ status: 'could not write to database'});
      });
  });
};

exports.imageDelete = (req, res) => {
  Image
    .find()
    .sort({ _id: -1 })
    .then((images) => {
      if (images.length <= framesPerTimelapse) return res.send({ status: 'no action' });

      const prunePath = path.join(__dirname, '../public/images');
      const toPrune = images.slice(framesPerTimelapse);
      const prunePromise = prune(prunePath, toPrune);
      prunePromise
        .then(() => {
          const imageIds = toPrune.map((image) => image._id);
          return Image.remove({ _id: { $in: imageIds }});
        })
        .then(() => {
          res.send({ status: 'ok' });
        })
        .catch((e) => {
          console.log(e);
          res.status(500).send({ status: 'error processing delete' });
        });
    });
};

exports.imagesFindLastNGet = (req, res) => {
  Image.findLast(framesPerTimelapse)
    .then((frames) => {
      if (!frames.length) return res.status(404).send();
      res.send({ status: 'ok', frames });
    })
    .catch((e) => {
      console.log(e);
      res.status(400).send({ status: 'could not find frames' });
    });
}
