require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { ObjectId } = require('mongodb');
const _ = require('lodash');
const hbs = require('hbs');

require('./config/config');
require('./db/mongoose');
const { Image } = require('./models/image');
const { prune } = require('./utils/prune.js');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const publicPath = path.join(`${__dirname}/../public`);
const port = process.env.PORT;
const app = express();

hbs.registerPartials(path.join(__dirname, '../views/partials'));
app.set('view engine', 'hbs');
app.use(fileUpload({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(express.static(publicPath));

// app.all('/', (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//   next();
// });

app.get('/', (req, res) => {
  Image.findLatest()
    .then((data) => {
      res.render('index.hbs', {
        latestImage: `${data.filename}`,
        datetime: ObjectId(data._id).getTimestamp(),
        year: new Date().getFullYear(),
        APP_URL: process.env.APP_URL || 'https://tranquil-retreat-86983.herokuapp.com'
      });
    })
    .catch((e) => {
      console.log('error fetching image from db', e);
      res.status(400).send({ status: 'no image found' });
    });
});

// Submit Image
app.post('/images', authenticate, (req, res) => {
  if (!req.files) return res.status(400).send({ status: 'no file'});

  const file = req.files.file;
  const fileId = new ObjectId();
  file.mv(path.join(__dirname, '../public/images', `${fileId}.png`), (err) => {
    if (err) res.status(500).send({ status: 'could not save file' });
  
    const image = new Image({
      _id: fileId,
      filename: `${fileId}.png`
    });
    image
      .save()
      .then(() => {
        res.send({ status: 'ok' });
      })
      .catch(() => {
        res.status(400).send({ status: 'could not write to database'});
      });
  });
});

app.delete('/images', authenticate, (req, res) => {
  Image
    .find()
    .sort({ _id: -1 })
    .then((images) => {
      if (images.length <= 60) return res.send({ status: 'no action' });

      const prunePath = path.join(__dirname, '../public/images');
      const toPrune = images.slice(60);
      const prunePromise = prune(prunePath, toPrune);
      prunePromise
        .then(() => {
          const imageIds = toPrune.map((image) => image._id);
          return Image.remove({ _id: { $in: imageIds }});
        })
        .then(() => {
          res.send({ status: 'ok' });
        })
        .catch((e) => {
          console.log(e);
          res.status(500).send({ status: 'error processing delete' });
        });
    });
});

// Get last 60 images
app.get('/images', (req, res) => {
  Image.findLast60()
    .then((frames) => {
      if (!frames.length) return res.status(404).send();
      res.send({ status: 'ok', frames });
    })
    .catch(() => {
      res.status(400).send({ status: 'could not find frames' });
    });
});

// User Login
app.post('/users/login', (req, res) => {
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

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(() => {
      res.status(400).send();
    });
});

app.post('/users', (req, res) => {
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
});

app.listen(port, () => {
  console.log(`Started at port ${port}`);
});

module.exports = { app };
