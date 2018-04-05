const express = require('express');
const _ = require('lodash');
const { User } = require('../../models/user');
const { authenticate } = require('../../middleware/authenticate');

const router = express.Router();

// POST user login
router.post('/login', (req, res) => {
  const body = _.pick(req.body, ['username', 'password']);
  User.findByCredentials(body.username, body.password)
    .then(user => user.generateAuthToken()
      .then((token) => {
        res.header('x-auth', token).send(user);
      })
    )
    .catch(() => {
      res.status(400).send();
    });
});

// DELETE my user token
router.delete('/me/token', authenticate, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(() => {
      res.status(400).send();
    });
});

// POST new user to database
// app.post('/users', (req, res) => {
//   const body = _.pick(req.body, ['username', 'password']);
//   const user = new User(body);

//   user
//     .save()
//     .then(() => user.generateAuthToken())
//     .then((token) => {
//       res.header('x-auth', token).send(user);
//     })
//     .catch((e) => {
//       res.status(400).send(e.message);
//     });
// });

module.exports = router;
