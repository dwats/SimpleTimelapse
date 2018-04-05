const { User } = require('../models/user');
const _ = require('lodash');

exports.login = (req, res) => {
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
};

exports.logout = (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(() => {
      res.status(400).send();
    });
};

exports.newUser = (req, res) => {
  const body = _.pick(req.body, ['username', 'password']);
  const user = new User(body);

  user
    .save()
    .then(() => user.generateAuthToken())
    .then((token) => {
      res.header('x-auth', token).send(user);
    })
    .catch((e) => {
      res.status(400).send(e.message);
    });
};
