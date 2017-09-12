const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

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
      return images
        .map((image) => ({ 
          filename: image.filename, 
          timestamp: image._id.getTimestamp()
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
};

const Image = mongoose.model('Image', ImageSchema);

module.exports = { Image };
