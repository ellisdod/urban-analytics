const mongoose = require('mongoose');

var Schema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Indicators', Schema, 'indicators');
