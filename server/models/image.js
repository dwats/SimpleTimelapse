const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const ImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  }
});

/**
 * Return the latest image record from mongodb.
 * @return {Object}
 */
ImageSchema.statics.findLatest = function findLatest() {
  const Image = this;

  return Image.find().sort({ _id: -1 }).limit(1)
    .then((image) => {
      if (!image[0]) return Promise.reject();
      return image[0];
    });
};

/**
 * Return the last n images filename and timestamp from mongodb.
 * @param {Number} n - number of images to find and return
 * @return {Object}  - object.filename && object.timestamp
 */
ImageSchema.statics.findLast = function findLast(n) {
  const Image = this;

  return Image.find().sort({ _id: -1 }).limit(n)
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
