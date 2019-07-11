const formidable = require('formidable');
const fs = require('fs');
const Papa = require('papaparse');
const mongoose = require('mongoose');
//const indicatorsModel = require('../models/indicators.model')
const layers = require('../models/models.model')
const geojson = require('../models/geojson.model')
const functions = require('../src/api.functions')
const arrayUtils = require('../src/plugins/arrayUtils.js')


mongoose.Promise = Promise;


const Controller = function(model) {
  "use strict"

  //model = model
  console.log(this)


this.find = function (req, res, next) {
  console.log('Controller this',this)
  if (!model) return res.status(500).send('cannot find model')
  console.log(req.params)
  let query = req.params ? JSON.parse(req.params.query) || {} : {}
  const layer = req.params ? req.params.collection : null
  if (layer) Object.assign(query,{layer:layer})
  model.find(query||{}, function (err, x) {
    if (err) return next(err)
    //x.forEach(x=>console.log(x._id))
    res.send(x)
  })
}

this.distinct = function (req, res, next) {
  console.log('distinct')
  model.distinct(req.params.key, function (err, x) {
    if (err) return next(err)
    res.send(x)
  })
}

this.update = function (req, res, next) {

  const params = JSON.parse(req.params.params)
  let query = {_id: params.id || new mongoose.mongo.ObjectID()}

  const body = {}
  if (params.path) {
    delete req.body._id
    delete req.body._path
    body[params.path] = req.body
  } else {
    body['$set'] = req.body
  }

  console.log('UPDATING:', query._id, body, params)
  console.log('model',model)

  model.findOneAndUpdate(query, body, {upsert:true}, function (err, Building) {
    if (err) return next(err);
    const message = req.params.id ? 'Updated!' : 'Inserted!';
    res.send(message);
  })
}

this.updateMany = function (req,res,next) {
  let jsonParsed;
  const update = JSON.parse(req.fields.update)
  this.parseFile(req.files.file.path, req.fields.format)
  .then(jsonParsed=>{
    ops = jsonParsed.reduce((acc,item)=>{

      if (typeof update.matchExisting === 'string' && typeof update.matchUpload === 'string') {
        filter = Utils.arraysToObjects([update.matchExisting],[[ item[update.matchUpload] ]])
      } else if (Array.isArray(update.matchExisting) && Array.isArray(update.matchUpload)) {
        filter = Utils.arraysToObjects(update.matchExisting,[ update.matchUpload.map(i=>item[i]) ])
      } else {
        next("match values need to be either strings or arrays")
      }
      acc.push(this.createUpdateReq(filter, update.key, item,{upsert:true}))

    },[])

    //const ops = jsonParsed.map(x=>createUpdateReq(filter, update.key, x))
    //console.log('update',JSON.stringify(update) )filter, updateKey, data, opts
    //console.log(req.fields.update.key,req.fields.update.matchExisting)
    //console.log('ops', ops[0])
    model.bulkWrite(ops, function(err,x){
      if (err) return next(err);
      res.send(x);
    })
  })
}

this.create = function (req, res, next) {
  console.log('fields',req.fields);
  const data = JSON.parse(req.fields.data)
  console.log(data)
  model.insertMany(data).then((x,err)=>{
    if (err) return next(err);
    res.send(x)
  })
}

this.deleteMany = function (req, res, next) {
  //accepts array of ids
  console.log('deleting',req.body)
  let filter;
  if (Array.isArray(req.body)) {
    filter = { _id : { $in:req.body.map(x=>mongoose.Types.ObjectId(x)) } }
  } else {
    filter = req.body
  }
  model.deleteMany(filter, function (err, x) {
    if (err) {
      console.log(err)
      return next(err);
    }
    res.send(x);
  })
}

this.del = function (req, res, next) {
  //console.log('DELETING')
  model.findOneAndDelete({ _id :req.params.id}, function (err, x) {
    if (err) return next(err);
    res.send(x);
  })
}


this.createUpdateReq = function (filter, updateKey, data, opts) {
  const updateObj = updateKey ? {} : data
  if (updateKey) updateObj[updateKey] = data
  //const filterObj = {}
  const req = {
    updateOne : {
      filter : filter,
      update : {$set:updateObj}
    }
  }
  req.updateOne = Object.assign({},req.updateOne,opts)
  return req
}


this.parseFile = function(file,format) {
  return new Promise((res,rej)=>{
    fs.readFile(file,'utf8',
    function(err, data) {
      switch(format) {
        case 'csv':
        jsonParsed = Papa.parse(data, {
          header : true,
          skipEmptyLines: true,
          dynamicTyping:true //converts strings to numbers and boolean
        }).data
        break
        case 'json':
        jsonParsed = JSON.parse(data)
        break
      }
      if (!jsonParsed) return rej('Could not parse file type.')
      res(jsonParsed)
    })
  })
}

this.indicator = (function() {

  //createIndicator
  var create = function (year,code,areaLayer) {
    return {
      year : year,
      layer : areaLayer._id,
      areaCode : code,
      attached : {}
    }
  }

  //unflattenIndicators
  var unflatten = function (indicators) {
    return Array.from(indicators).reduce((acc,x)=>{
      let year = x.year
      if (!year) return acc
      //year = year.toString()
      acc[year] = acc[year] || {}
      acc[year][x.areaCode] = x
      return acc
    },{})
  }

  return {
    create : create,
    unflatten : unflatten
  }

})();

this.chainError = function(err,res) {
   if (res) res.status(500).send(err)
   return Promise.reject(err)
}

}





/*
const buildingsController = function(model) {
Controller.call(this,model)

this.create = function(req, res, next) {
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

(async function(){
const insertMany = await model.buildings.insertMany(features.Feature);
res.status(200).send('Ok');
})();

})

}

}
*/

//console.log('geojson model', JSON.stringify(geojson))
//console.log('geojson keys', Object.keys(geojson))
module.exports = {
  controller : Controller,
  layerCalcs : new Controller(layers.layerCalcs),
  indicatorAttributes : new Controller(layers.indicatorAttributes),
  indicatorBlocks: new Controller(layers.indicatorBlocks),
  indicatorSections: new Controller(layers.indicatorSections),
  areaLayers : new Controller(layers.areaLayers),
  areaAttributes : new Controller(layers.areaAttributes)
}
