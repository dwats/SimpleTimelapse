const express = require('express');
const imageController = require('../../controllers/images');
const { authenticate } = require('../../middleware/authenticate');

const router = express.Router();

// POST request image to be created from form buffer data
router.post('/', imageController.imageCreatePost); // Authenticate!

// DELETE request image prune action
router.delete('/', authenticate, imageController.imageDelete);

// GET request last n image filepath(s)
router.get('/', imageController.imagesFindLastNGet);

module.exports = router;
