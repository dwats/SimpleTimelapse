const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

require('./config/config');
const { mongoose } = require('./db/mongoose');
const { Image } = require('./models/image');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const publicPath = path.join(`${__dirname}/../public`);
const port = process.env.PORT;
const app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(publicPath));

// User Login
app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then(user => user.generateAuthToken()
      .then((token) => {
        res.header('x-auth', token).send(user);
      })
    )
    .catch(() => {
      res.status(400).send();
    });
});

// Image Submit
app.post('/images', (req, res) => {
  if (!req.body) return res.status(400).send();
  const image = new Image({ buffer: req.body.buffer.data });

  image.save()
    .then(() => {
      res.send('ok');
    })
    .catch((e) => {
      console.log('error saving image to db', e);
      res.status(400).send();
    });
});

// Get Latest
app.get('/images', (req, res) => {
  Image.findLatest()
    .then((image) => {
      if (!image) return res.status(404).send();
      res.send({ buffer: image[0].buffer });
    })
    .catch((e) => {
      console.log('error fetching image from db', e);
      res.status(400).send();
    });
});

// Get Timelapse
// app.get('/images/sequence', (req, res) => {
//
// });

app.listen(port, '0.0.0.0', () => {
  console.log(`Started at port ${port}`);
});

module.exports = { app };
