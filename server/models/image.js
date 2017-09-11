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

const Image = mongoose.model('Image', ImageSchema);

module.exports = { Image };
