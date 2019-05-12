//https://codeburst.io/writing-a-crud-app-with-node-js-and-mongodb-e0827cbbdafb

const GeoJSON = require('../models/geojson.model');
const formidable = require('formidable');
const fs = require('fs');
const mongoose = require('mongoose');

//Simple version, without validation or sanitation
exports.test = function (req, res) {
  res.send('Greetings from the Test controller!');
};

exports.building_create = function (req, res, next) {
   console.log(req.fields);
  //console.log(req.files.file);

    fs.readFile(req.files.file.path,
      function(err, data) {
        const jsonParsed = JSON.parse(data);
        //console.log(jsonParsed);

        const features = jsonParsed.features.reduce((acc,x) => {
           x.properties.neighbourhood = req.fields.neighbourhood || '';
           const obj = {};
           obj[x.type.toLowerCase()] = x;
           acc[x.type] = acc[x.type] || [];
           acc[x.type].push(obj);
           return acc;
        },{});
        //console.log(JSON.stringify(features));

        /*
        const GeoJSON = db.model('GeoJSON',geoJSONSchema);

        const features = new GeoJSON({
          title:'test',
          featurecollection: jsonParsed
         });

        features.save(function (er) {
          if (err) {
            next(er);
          }
            //next('Buildings uploaded successfully');
            res.send('uploaded')
        });
        */
        (async function(){

        const insertMany = await GeoJSON.building.insertMany(features.Feature);

        //console.log(JSON.stringify(insertMany,'','\t'));

        res.status(200).send('Ok');
        })();

      });

  };

  exports.building_details = function (req, res) {
    GeoJSON.building.findById(req.params.id, function (err, Building) {
      if (err) return next(err);
      res.send(Building);
    })
  };

  exports.building_neighbourhood = function (req, res) {
    console.log(req.params.name);
    GeoJSON.building.find({'feature.properties.neighbourhood':req.params.name}, function (err, x) {
      if (err) return next(err);
      res.send(x);
    })
  };

  exports.building_update = function (req, res, next) {
    console.log(req);
    console.log(req.body);
    GeoJSON.building.findOneAndUpdate({ _id :req.params.id }, {$set: req.body}, function (err, Building) {
      if (err) return next(err);
      res.send('Building udpated.');
    });
  };

 exports.surveys = function (req, res, next) {
   GeoJSON.building.distinct('feature.properties.neighbourhood', function (err, x) {
     if (err) return next(err);
     res.send(x);
   });

  };
