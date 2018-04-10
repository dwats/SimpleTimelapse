const express = require('express');
const { ObjectId } = require('mongodb');
// models
const { Image } = require('../models/image');
// routes
const users = require('./users');
const images = require('./images');

const router = express.Router();
router.use('/users', users);
router.use('/images', images);

/**
 * @todo Examine the consequences of having no images in the database.
 */
router.get('/', (req, res) => {
  Image.findLatest()
    .then((data) => {
      res.render('index.hbs', {
        latestImage: data ? data.filename : undefined,
        datetime: ObjectId(data._id).getTimestamp(),
        year: new Date().getFullYear(),
        APP_URL: process.env.APP_URL
      });
    })
    .catch((e) => {
      console.log('error fetching image from db', e);
    });
});

module.exports = router;
