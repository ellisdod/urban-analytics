//https://codeburst.io/writing-a-crud-app-with-node-js-and-mongodb-e0827cbbdafb
const mongoose = require('mongoose');
const genController = require('./generic.controller')
const model = require('../models/layers.model')

module.exports = genController.baseFunctions(model)
