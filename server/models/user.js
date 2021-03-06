const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
    minlength: 1,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function toJSON() {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'username']);
};

UserSchema.methods.generateAuthToken = function generateAuthToken() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({
    _id: user._id.toHexString(),
    access
  }, process.env.JWT_SECRET).toString();

  user.tokens.push({ access, token });

  return user
    .save()
    .then(() => token)
    .catch(e => e);
};

UserSchema.methods.removeToken = function removeToken(token) {
  const user = this;

  return user.update({
    $pull: {
      tokens: { token }
    }
  });
};

UserSchema.statics.findByToken = function findByToken(token) {
  const user = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  }
  catch (e) {
    return Promise.reject();
  }

  return user
    .findOne({
      _id: decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    });
};

UserSchema.statics.findByCredentials = function findByCredentials(username, password) {
  const User = this;

  return User.findOne({ username })
    .then((user) => {
      if (!user) return Promise.reject();

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, isValid) => {
          if (!isValid) reject();
          resolve(user);
        });
      });
    });
};

UserSchema.pre('save', function (next) {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return Promise.reject(err);
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return Promise.reject(err);
        user.password = hash;
        next();
      });
    });
  }
  else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
