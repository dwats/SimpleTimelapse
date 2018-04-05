const express = require('express');
const userController = require('../../controllers/users');
const { authenticate } = require('../../middleware/authenticate');

const router = express.Router();

// POST request for new user to be created
// router.post('/users', userController.newUser);

// POST request for user login token
router.post('/login', userController.login);

// DELETE request for user token deletion
router.delete('/me/token', authenticate, userController.logout);

module.exports = router;
