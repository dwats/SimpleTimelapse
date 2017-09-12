const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  }
});

ImageSchema.statics.findLatest = function findLatest() {
  const Image = this;

  return Image.find().sort({ _id: -1 }).limit(1)
    .then((image) => {
      if (!image[0]) return Promise.reject();
      return image[0];
    });
};

ImageSchema.statics.findLast60 = function findLast60() {
  const Image = this;

  return Image.find().sort({ _id: -1 }).limit(60)
    .then((images) => {
      if (!images.length) return Promise.reject();
      return images;
    });
};

const Image = mongoose.model('Image', ImageSchema);

module.exports = { Image };
