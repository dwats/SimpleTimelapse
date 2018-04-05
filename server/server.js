require('dotenv').config();
require('./config/config'); // may be called to early (test)
require('./db/mongoose');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const hbs = require('hbs');
const routes = require('./routes');

const publicPath = path.join(`${__dirname}/../public`);
const port = process.env.PORT;
const app = express();

hbs.registerPartials(path.join(__dirname, '../views/partials'));
app.set('view engine', 'hbs');
app.use(fileUpload({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(express.static(publicPath));

app.use('/', routes);

app.listen(port, () => {
  console.log(`Started at port ${port}`);
});

module.exports = { app };
