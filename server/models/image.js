const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  buffer: {
    type: [Buffer],
    required: true
  }
});

ImageSchema.statics.findLatest = function findLatest() {
  const Image = this;

  return Image.find().sort({ _id: -1 }).limit(1)
    .then((image) => {
      if (!image) return Promise.reject();
      return image;
    });
};

const Image = mongoose.model('Image', ImageSchema);

module.exports = { Image };
