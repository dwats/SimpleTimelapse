const expect = require('expect');
const request = require('supertest');
const { ObjectId } = require('mongodb');

const { app } = require('./../server');
const { User } = require('./../models/user');
const { testUsers, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
