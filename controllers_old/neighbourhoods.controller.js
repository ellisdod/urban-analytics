//https://codeburst.io/writing-a-crud-app-with-node-js-and-mongodb-e0827cbbdafb
const formidable = require('formidable');
const fs = require('fs');
const genController = require('./generic.controller')
const model = require('../models/geojson.model').neighbourhoods

/*
exports.getAll = genController.getAll(model)
exports.getDistinct = genController.getDistinct(model)
exports.update = genController.update(model)
*/
module.exports = genController.baseFunctions(model)
//console.log('basefunctions', JSON.stringify(genController.getAll))

//exports = genController.baseFunctions(model)
//exports.update = genController.update(model)

exports.create = function (req, res, next) {
   //console.log(req.fields);
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

        const insertMany = await model.insertMany(features.Feature);

        res.status(200).send('Ok');
        })();

      });
}
