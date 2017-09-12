const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { ObjectId } = require('mongodb');
const hbs = require('hbs');
const _ = require('lodash');

require('./config/config');
const { mongoose } = require('./db/mongoose');
const { Image } = require('./models/image');
const { User } = require('./models/user');
// const { authenticate } = require('./middleware/authenticate');

const publicPath = path.join(`${__dirname}/../public`);
const port = process.env.PORT;
const app = express();

hbs.registerPartials(path.join(__dirname, '../views/partials'));
app.set('view engine', 'hbs');
app.use(fileUpload({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(express.static(publicPath));

app.all('/', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

// 'index'
app.get('/', (req, res) => {
  Image.findLatest()
    .then((data) => {
      res.render('index.hbs', {
        latestImage: `${data.filename}`,
        datetime: ObjectId(data._id).getTimestamp(),
        year: new Date().getFullYear()
      });
    })
    .catch((e) => {
      console.log('error fetching image from db', e);
      res.status(400).send({ status: 'no image found' });
    });
});

// Image Submit
app.post('/images', (req, res) => {
  if (!req.files) return res.status(400).send({ status: 'no file'});

  const file = req.files.file;
  const fileId = new ObjectId();
  file.mv(path.join(__dirname, '../public/images', `${fileId}.png`), (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ status: 'could not save file' });
    }

    const image = new Image({
      _id: fileId,
      filename: `${fileId}.png`
    });

    image
      .save()
      .then((image) => {
        res.send({ status: 'ok' });
      })
      .catch(() => {
        res.status(400).send({ status: 'could not write to database'});
      });
  });
});

app.get('/images', (req, res) => {
  Image.findLast60()
    .then((frames) => {
      if (!frames.length) return res.status(404).send();
      res.send({ status: 'ok', frames });
    })
    .catch(() => {
      res.status(400).send({ status: 'could not find frames' });
    })
});

// Get Timelapse
// app.get('/images/sequence', (req, res) => {
//
// });

// User Login
// app.post('/users/login', (req, res) => {
//   const body = _.pick(req.body, ['email', 'password']);

//   User.findByCredentials(body.email, body.password)
//     .then(user => user.generateAuthToken()
//       .then((token) => {
//         res.header('x-auth', token).send(user);
//       })
//     )
//     .catch(() => {
//       res.status(400).send();
//     });
// });

app.listen(port, () => {
  console.log(`Started at port ${port}`);
});

module.exports = { app };
