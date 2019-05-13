//https://codeburst.io/writing-a-crud-app-with-node-js-and-mongodb-e0827cbbdafb

const geojson = require('../models/geojson.model');
const formidable = require('formidable');
const fs = require('fs');
const mongoose = require('mongoose');


exports.create = function (req, res, next) {
   console.log(req.fields);
  //console.log(req.files.file);

    fs.readFile(req.files.file.path,
      function(err, data) {
        const jsonParsed = JSON.parse(data);
        //console.log(jsonParsed);

        const features = jsonParsed.features.reduce((acc,x) => {
           const obj = {};
           obj[x.type.toLowerCase()] = x;
           acc[x.type] = acc[x.type] || [];
           acc[x.type].push(obj);
           return acc;
        },{});

        (async function(){

        const insertMany = await geojson.facilities.insertMany(features.Feature);

        res.status(200).send('Ok');
        })();

      });

  };

  exports.getAll = function (req, res) {
    console.log(req.params.name);
    geojson.facilities.find({}, function (err, x) {
      if (err) return next(err);
      res.send(x);
    })
  };

 exports.getNeighbourhood = function (req, res, next) {
   geojson.facilities.distinct('feature.properties.name', function (err, x) {
     if (err) return next(err);
     res.send(x);
   });

  };
