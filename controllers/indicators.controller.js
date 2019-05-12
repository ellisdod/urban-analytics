//https://codeburst.io/writing-a-crud-app-with-node-js-and-mongodb-e0827cbbdafb

const indicators = require('../models/indicators.model');
const formidable = require('formidable');
const fs = require('fs');
const mongoose = require('mongoose');
const Papa = require('papaparse');


exports.create = function (req, res, next) {
  //console.log(req.fields);
  console.log('fuking do soemthing');
  console.log(req.fields.format === 'csv');
  //console.log(req.files.file);

  fs.readFile(req.files.file.path,'utf8',
    function(err, data) {
      const output = []
      let jsonParsed = null;
      if (req.fields.format === 'csv') {
        console.log('parsing csv...')
        jsonParsed = Papa.parse(data, {
           header : true,
           skipEmptyLines: true,
           dynamicTyping:true //converts strings to numbers and boolean
         }).data
      } else {
        jsonParsed = JSON.parse(data);
      }

        console.log(jsonParsed);

        /*const features = jsonParsed.features.reduce((acc,x) => {
        const obj = {};
        obj[x.type.toLowerCase()] = x;
        acc[x.type] = acc[x.type] || [];
        acc[x.type].push(obj);
        return acc;
      },{});*/

      (async function(){

        const insertMany = await indicators.insertMany(jsonParsed);

        res.status(200).send('Ok');
      })();

    });

  };

  exports.getAll = function (req, res) {
    indicators.find({}, function (err, x) {
      if (err) return next(err);
      console.log(x);
      res.send(x);
    })
  };

  exports.getNeighbourhood = function (req, res, next) {
    indicators.distinct('feature.properties.name', function (err, x) {
      if (err) return next(err);
      res.send(x);
    });

  };
