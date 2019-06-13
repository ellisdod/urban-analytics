//https://codeburst.io/writing-a-crud-app-with-node-js-and-mongodb-e0827cbbdafb

const pathToGeoJSON = '../models/geojson.model';
let GeoJSON = require(pathToGeoJSON);
const formidable = require('formidable');
const fs = require('fs');
const mongoose = require('mongoose');
const tag = require('@turf/tag');
const centroid = require('@turf/centroid')


exports.create = function (req, res, next) {
  console.log('inserting to layer:', req.fields.layer);
  //console.log(req.files.file);

  fs.readFile(req.files.file.path,
    function(err, data) {
      const jsonParsed = JSON.parse(data);
      console.log('features',jsonParsed);

      GeoJSON.neighbourhoods.find({},function (err,x) {

        const areas = {
          type: "FeatureCollection",
          features: x.map(i=>i.feature)
        }
        const tagged = tag(jsonParsed, areas, 'id', 'stat_area')

        const features = tagged.features.reduce((acc,x)=>{
          x.properties.data_type = x.geometry.type;
          acc.push({
            feature : x,
            layer : req.fields.layer
          })
          return acc
        },[])
        verifyLayer(req.fields.layer)
        const insertMany = GeoJSON[req.fields.layer].insertMany(features)
        res.status(200).send('Ok');
      });

    })

    //console.log('layer',req.fields.layer)
    //console.log('example feature',JSON.stringify(features.Feature[0]));
  };

  exports.getSubset = function(req, res, next) {

    const params = JSON.parse(req.params.params)
    console.log(params)
    verifyLayer(params.layer)
    GeoJSON[params.layer].find({ layer :params.layer, "feature.properties.stat_area" : params.location }, function (err, x) {
      if (err) return next(err);
      res.send(x);
    });
}
