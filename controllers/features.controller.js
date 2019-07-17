const Controller = require('./base.controller')
const formidable = require('formidable');
const fs = require('fs');
const Papa = require('papaparse');
const mongoose = require('mongoose');
//const indicatorsModel = require('../models/indicators.model')
const layers = require('../models/models.model')
const geojson = require('../models/geojson.model')
const functions = require('../src/api.functions')
const arrayUtils = require('../src/plugins/arrayUtils.js')

mongoose.Promise = global.Promise;

const turf = {
  length :require('@turf/length').default,
  area : require('@turf/area').default,
  tag : require('@turf/tag'),
  centroid : require('@turf/centroid').default
}

function FeatureController (model) {
  Controller.controller.call(this,model)

  this.create = function (req, res, next) {
    console.log('inserting to layer:', req.fields.layer);
    //console.log(req.files.file);
    const self = this
    this.res = res
    //console.log('schema',model.schema)

    let tagAreas = []
    let areaLayers;
    let features;
    //res.status(200).send('complete')
    //return null

    return new Promise((resolve,reject)=>{
      fs.readFile(req.files.file.path, function(err, data) {
        if (err) reject(err)
        resolve(data)
      })
    })
    .then(data=>{

      features = JSON.parse(data);

      //set year
      const year = 1900+new Date().getYear()
      features.features.forEach(f=>{
        f.properties.year = f.properties.year || year
      })
      //console.log('features',jsonParsed.features[0]);

      //get list of spatial intersects for layer
      return layers.layers.find({_id:mongoose.Types.ObjectId(req.fields.layer)})
    })
    .then(layers=>{
      //console.log('layers: ',layers)
      const queries = layers[0].spatial_intersect.reduce((acc,x)=>{
        if (x!=='') {
          acc.push({layer:mongoose.Types.ObjectId(x)})
        }
        return acc
      },[])

      //console.log('layers queries: ',queries)
      return geojson.areas.find().or(queries)
    })
    //combine into groups and run tests
    .then(i=>{
      //console.log('tagAreas',i)
      tagAreas = i.reduce((acc,x)=>{
        acc[x.layer] = acc[x.layer] || []
        acc[x.layer].push(x)
        return acc
      },{})
      //console.log('tag Areas: ',tagAreas)

      const query = Object.keys(tagAreas).map(x=>{
        return {_id:x}
      })
      return query
    })
    .then(i=>{
      //console.log('area layers queries: ',i)
      return layers.areaLayers.find().or(i)
    })
    .then(i=>{
      this.areaLayers = i
      this.areaLayers.forEach(areaLayer=>{
        features = self.spatialJoin(features,tagAreas[areaLayer._id],areaLayer.code)
      })

      features = features.reduce((acc,j)=>{
        j.properties.data_type = j.geometry.type
        acc.push({
          feature : j,
          layer : req.fields.layer
        })
        return acc
      },[])
      console.log('inserting ' + features.length + ' records')
      return model.insertMany(features)
    })
    .then(x=>{
      return model.count({layer:req.fields.layer})
    })
    .then(records=>{
      if (records > 500) {
        layers.layers.findOneAndUpdate({_id:mongoose.Types.ObjectId(req.fields.layer)},{filtered:true})
      }

      console.log('total of ' + records + ' for layer ' + req.fields.layer )
      console.log(records)
      console.log('applying layer functions for '+ this.areaLayers.length + 'area layers')
      return Promise.all(this.areaLayers.map(areaLayer=>self.applyLayerFunctions(features,areaLayer)))
    })
    .then(x=>res.status(200).send(x))
    .catch(err => {
      this.chainError(err,res)
    })

  }


  this.getSubset = function(req, res, next) {

    const params = JSON.parse(req.params.params)
    console.log(params)
    //verifyLayer(params.layer)
    model[params.layer].find({ layer :params.layer, "feature.properties.stat_area" : params.location },
    function (err, x) {
      if (err) return next(err)
      res.send(x);
    })
  }


  this.updateAnalysis = function(req, res, next) {
    console.log('params',req.params)
    let features = model.find({layer:req.params.collection},'',{lean: true})
    let areaLayer = layers.areaLayers.find({ _id :req.params.areaLayerId},'',{lean: true})
    let areas = geojson.areas.find({ layer :req.params.areaLayerId},'',{lean: true})

    Promise.all([features,areaLayer,areas])
    .then(arr=>{
      features = arr[0]
      areaLayer = arr[1][0]
      areas = arr[2]
      if (features.length===0) res.status(500).send('No features found for selected layer')
      console.log('analysing ' + features.length + ' features...')

      const joined = this.spatialJoin(features,areas,areaLayer.code)

      console.log('joined',joined[0])

      const ops = []
      for(var x=0;x<features.length;x++){
        features[x].feature.properties = joined[x].properties
        ops.push( this.createUpdateReq({_id:features[x]._id},null,features[x]) )
      }

      return model.bulkWrite(ops)
    })
    .then(()=>{
      console.log('completed spatial join')
      //console.log(features[0].feature.properties)
      return this.applyLayerFunctions(features,areaLayer)
    })
    .then(x=>res.status(200).send(x),this.chainError)
    .catch(err => {
      this.chainError(err,res)
    })
  }


  this.makeFeatureCollection = function(features) {
    return {
      type :"FeatureCollection",
      features : features.map(i=>i.feature)
    }
  }


  /*
  this.reloadGeoJSON = function () {
  console.log('reloading GeoJson')
  delete require.cache[require.resolve(pathToGeoJSON)];
  geojson = require(pathToGeoJSON);
}
*/

this.computeAttributeFunctions = function(accumulator,attributes,feature,count){
  const property = feature.properties || {}
  let geoKey;
  switch(feature.geometry.type) {
    case 'MultiPolygon':
    case 'Polygon':
    geoKey = 'shape_area'
    property[geoKey] = property[geoKey] || turf.area(feature)*1000000
    break
    case 'LineString':
    case 'MultiLineString':
    geoKey = 'shape_length'
    property[geoKey] = property[geoKey] || turf.length(feature)*1000
    break
  }
  count = count || 1
  return attributes.reduce((obj,i)=>{
    if(!i.func)return obj
    i.func.forEach(func=>{
      const key = `${i.name}`
      switch(func.toLowerCase()) {
        case 'sum':
        obj[key] = obj[key] || {}
        obj[key].sum = obj[key].sum || 0
        obj[key].sum = obj[key].sum + parseInt(property[i.name]||'0')
        break
        case 'count':
        obj[key] = obj[key] || {}
        obj[key].count = obj[key].count || {}
        obj[key].total = obj[key].total || {}
        const p = property[i.name] || 'unknown'
        obj[key].count[p] =  (obj[key].count[p] || 0) + 1
        obj[key].total.count = (obj[key].total.count || 0) + 1
        if (geoKey) {
          const val = parseInt(property[geoKey]||'0')
          obj[key][geoKey] = obj[key][geoKey] || {}
          obj[key][geoKey][p] = obj[key][geoKey][p] || 0
          obj[key][geoKey][p] = obj[key][geoKey][p] + val
          obj[key].total[geoKey] = (obj[key].total[geoKey] || 0) + val
        }
        break
      }
    })
    return obj
  },accumulator)

}


this.computeLayerCalc = function (calc,ind) {
  function roundObj(acc) {
    if (typeof acc === 'number') return Math.round(acc*1e1)/1e1
    else if (acc) return Object.keys(acc).reduce((obj,key)=>{
      if (typeof obj[key] === 'number') {
        obj[key] = Math.round(obj[key]*1e1)/1e1
      } else if (obj[key] && typeof obj[key] === 'object') {
        obj[key] = roundObj(obj[key])
      }
      return obj
    },acc)
  }

  var mathIt = {
    '+': function (x, y) { return x + y },
    '-': function (x, y) { return x - y },
    '/': function (x, y) { return x / y },
    '*':function (x, y) { return x * y }
  }

  function mathObj(obj,val,op){
    return Object.keys(obj).reduce((acc,x)=>{
      if (typeof obj[x] === 'object') {
          acc[x] = mathObj(obj[x],val,op)
      } else {
        acc[x] = mathIt[op](obj[x],val)
      }
      return acc
    },{})
  }

  let result = calc.reduce((acc,x, index)=>{
    //console.log('key', x)
    x = x.length < 26 ? parseInt(x) : arrayUtils.getNested(x,ind)
    //console.log('nested value', x)
    if (index === 0) {
      acc = x
    } else if (index % 2 === 0) {
      const operator = calc[index-1].slice(0,1)
      if (typeof acc === 'number' && typeof x === 'number') {
        acc = mathIt[ operator ](acc,x)
      } else if (acc && typeof acc === 'object' && typeof x === 'number') { // null is object
        //console.log('object/number')
        acc = mathObj(acc,x,operator)
      } else if (typeof acc === 'number' && x && typeof x === 'object'){
        //console.log('number/object')
        acc = mathObj(x,acc,operator)
      } else if (acc && typeof acc === 'object' && x && typeof x === 'object'){
        //console.log('number/object')

        Object.keys(acc).forEach(key=>{
             acc[key] = mathObj(x,acc[key],operator)
        })

     }
    }
    //console.log(index, acc)
    return acc
  },0)
  console.log('rounded',roundObj(result))
  return roundObj(result)


}



this.applyLayerFunctions = function(features,areaLayer) {
  const self = this
  const layerId = features[0].layer
  //console.log('layerId',layerId)
  //console.log('areaLayer',areaLayer)
  //console.log('indquery',indquery)

  let layerAttributes = layers.layerAttributes.find({layer:layerId},'',{lean: true})
  let areas = geojson.areas.find({layer: areaLayer._id},'',{lean: true})
  let layerCalcs = layers.layerCalcs.find({layer:layerId},'',{lean: true})
  let indicators = geojson.indicators.find({layer: areaLayer._id },'',{lean: true})


  return Promise.all([layerAttributes,areas,layerCalcs,indicators])
  .then(arr=>{
    layerAttributes = arr[0]
    areas = arr[1]
    layerCalcs = arr[2]
    indicators = arr[3]

    //console.log('found ' + indicators.length + ' indicators with areaLayer: ' + areaLayer._id )
    //console.log('inds',indicators[0])

    //check matching layer attribute exists for areaLayer
    const match = layerAttributes.filter(x=>x.name === areaLayer.code)
    if (match.length === 0) {
      const attribute = {
        name : areaLayer.code,
        type : "Number",
        layer : layerId,
        required : false
      }
      layerAttributes.push(attribute)
      return layers.layerAttributes.findOneAndUpdate({}, attribute, {upsert:true})
    }
    return null

  })
  .then(x=>{
     if (x) geojson.reload()

    //reset existing indicators for this layer to avoid adding to exisitng numbers
    indicators.forEach(indicator=>{
      indicator[layerId] = {}
    })

    indicators = this.indicator.unflatten(indicators)

    const indObj = features.reduce((acc,x)=>{
      const code = x.feature.properties[areaLayer.code]
      if (!code) return acc
      const year = x.feature.properties.year
      acc[year] = acc[year] || {} //{2019:{}}
      acc[year][code] = acc[year][code] || self.indicator.create(year,code,areaLayer._id)// { 2019:{ 1113:{} }
      acc[year][code][layerId] = acc[year][code][layerId] || {}
      acc[year][code][layerId] = self.computeAttributeFunctions(acc[year][code][layerId], layerAttributes, x.feature)
      if (acc[year][code][layerId].Eng_name) {
        //console.log('calculated', acc[year][code][layerId])
      }
      return acc
    },indicators)

    //Flatten and create update docs
    let newCount = 0
    let updateCount = 0;
    const ops = Object.keys(indObj).reduce((acc,year)=>{
      Object.keys(indObj[year]).forEach(code =>{
        //console.log(code, indObj[year][code]['5ce7864a04b2593fbc10981c'])
        let insertDoc = {}
        const id = indObj[year][code]._id
        if (id) {
          updateCount++
          insertDoc = this.createUpdateReq({'_id':id}, layerId, indObj[year][code][layerId])
          //console.log(insertDoc.updateOne.update)
        } else {
          //console.log('insert',indObj[year][code])
          //indObj[year][code]._id = mongoose.mongo.ObjectId()
          insertDoc.insertOne = {document: indObj[year][code]}
          newCount ++
        }
        if (indObj[year][code][layerId] &&indObj[year][code][layerId]!=={}) acc.push(insertDoc)

      })
      return acc
    },[])

    console.log('adding: '+newCount+' updating: '+updateCount)
    if (ops.length === 0) {
      this.res.status(500).send('no matching indicators')
      return Promise.reject()
    }
    return geojson.indicators.bulkWrite(ops)
  },this.chainError)
  .then((x,err) =>{
    console.log('attribute functions completed')
    const query = {}
    query[layerId] = { $exists : true }
    return geojson.indicators.find(query,'',{lean: true})
  },this.chainError)
  .then((inds,err)=>{
    console.log(`calculating ${layerCalcs.length} for ${inds.length} indicators`)
    const ops = []
    inds.forEach((x,i)=>{
      layerCalcs.forEach(calc=>{
        //console.log(i, inds[i])
        inds[i][layerId] = inds[i][layerId] || {} // null values exist for areas without features
        inds[i][layerId][calc.name] = self.computeLayerCalc(calc.func,x)
      })
      console.log('computed indicator', inds[i][layerId])
      ops.push( this.createUpdateReq({'_id':inds[i]._id}, layerId, inds[i][layerId]) )
      //console.log('completed ' + ops.length)
    })

    if (ops.length > 0 ) {
      return geojson.indicators.bulkWrite(ops)
    } else {
      return Promise.resolve()
    }
  },this.chainError)


}

this.spatialJoin = function (features, areas, code) {
  areas = this.makeFeatureCollection(areas)
  if (features.type !== 'FeatureCollection') {
    features = this.makeFeatureCollection(features)
  }
  //console.log('first feature',features.features[0])
  const shapeType = features.features[0].geometry.type
  if (shapeType === 'Point') {
    return turf.tag(features, areas, 'id', code).features
  } else {
    //console.log(centroid)
    //console.log(typeof centroid)
    const centroids = features.features.map(x=>turf.centroid(x))
    console.log('centroids',centroids.length)
    const tagged = turf.tag( { type :"FeatureCollection", features :centroids}, areas, 'id', code)
    console.log('tagged',tagged.length)
    //console.log('total tagged',tagged.features.filter(x=>x.properties.JIIS_stat_area).length )
    return features.features.map((x,i)=>{
      x.properties[code] = tagged.features[i].properties[code]
      return x
    })

    //return tag(features, areas, 'id', code)
  }
}
}

const GeoJsonWrapper = function(controller) {
  //this.cache = {}
  functions.forEach(func=>{
    this[func.name] = function(req,res,next) {
      //if (this.cache[func.name]) return res.status(500).send('already fired')
      //this.cache[func.name] = true
      console.log('model name: ' + req.params.collection + ' func: ' + func.name)
      //console.log(this)
      //console.log('model', geojson[req.params.collection])
      return new controller(geojson[req.params.collection])[func.name](req,res,next)
      //if (type === 'surveyRecords') return new Controller.controller(geojson[req.params.collection])[func.name](req,res,next)
    }
  })

}



const AreaController = function(model) {

  FeatureController.call(this,model)

  this.create = function (req, res, next) {

    fs.readFile(req.files.file.path,
      function(err, data) {
        const jsonParsed = JSON.parse(data);

        const features = jsonParsed.features.map(x=>{
          return {
            feature: x,
            layer: mongoose.Types.ObjectId(req.fields.layer)
          }
        })

        //console.log('features',features[0]);
        return model.insertMany(features).then((x,err)=>{
          if (err) res.status(500).send(err)
          res.status(200).send('success')
        });
      });
    }

  }


  const IndicatorController = function(model) {
    Controller.controller.call(this,model)

    this.create = function (req, res, next) {

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

        jsonParsed = jsonParsed.filter(x=>x.year)

        jsonParsed = jsonParsed.map(x=>{
          return {
            year : x.year,
            layer : req.fields.layer,
            areaCode : x.area_code,
            attached : x
          }
        })
        //console.log(req.fields)

        model.insertMany(jsonParsed, function(err,x){
          if (err) return next(err);
          res.send(x);
        })

      });

    }

    this.updateMany = function (req,res,next) {
      let jsonParsed;
      const update = JSON.parse(req.fields.update)

      fs.readFile(req.files.file.path,'utf8', function(err, data) {

        let jsonParsed;
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

        const ops = jsonParsed.map(i=> {
          const areaCode = i.areaCode || i.area_code || i.area
          if (!areaCode) return null
          const indicator = {
            year : i.year || 2019,
            layer : req.fields.layer,
            areaCode : i.areaCode || i.area_code || i.area,
            attached : i
          }
          /*const filter = {}
          for (let x = 0;x<update.matchExisting.length;x++) {
          filter[update.matchExisting[x]] = i[update.matchUpload[x]]
        }*/
        return {
          updateOne : {
            filter : {
              year:indicator.year,
              areaCode:indicator.areaCode
            },
            update : indicator,
            upsert : true
          }
        }
      })
      //console.log('update',JSON.stringify(update) )
      //console.log(req.fields.update.key,req.fields.update.matchExisting)
      //console.log('ops', ops[0])
      model.bulkWrite(ops.filter(x=>x!==null), function(err,x){
        if (err) return next(err);
        res.send(x);
      })
    })

  }

  this.updateAll = function() {
    geojson.indicators.find({},'',{lean: true})
    .then(indicators=>{

      const ops = indicators.map(i=> {

        i.layer=mongoose.Types.ObjectId(i.areaLayer)
        delete i.areaLayer

        return {
          updateOne : {
            filter : {_id:i._id},
            update : i,
            upsert : true
          }
        }
      })
      console.log(indicators)
      //console.log('update',JSON.stringify(update) )
      //console.log(req.fields.update.key,req.fields.update.matchExisting)
      //console.log('ops', ops[0])
      model.bulkWrite(ops.filter(x=>x!==null), function(err,x){
        console.log('complete')
      })
    })
  }
}



const LayerController = function(collection) {

    functions.forEach(func=>{
      this[func.name] = function(req,res,next) {
        new Controller.controller(layers[collection])[func.name](req,res,next)
        if (func.method === "post") {
          console.log('reloading geojson model')
          geojson.load()
        }
      }
    })

}



module.exports = new Promise((res,rej)=>{

  geojson.load().then(()=> {
    Controller.layers = new LayerController('layers')
    Controller.layerAttributes = new LayerController('layerAttributes')
    Controller.features = new GeoJsonWrapper(FeatureController)
    Controller.areas = new AreaController(geojson.areas)
    Controller.indicators = new IndicatorController(geojson.indicators)
    Controller.surveyLayers = new LayerController('surveyLayers')
    Controller.surveyLayerAttributes = new LayerController('surveyLayerAttributes')
    Controller.surveyRecords = new GeoJsonWrapper(Controller.controller)
    res(Controller)

    /*const ops=[{
    updateOne : {
    filter : {_id:mongoose.Types.ObjectId("5d171f00966528a33b94da94")},
    update : {'att':4},
  }
}]


geojson.indicators.bulkWrite(ops.filter(x=>x!==null), function(err,x){
console.log('complete',err,x)
})
//geojson.indicators.findOneAndUpdate({_id:mongoose.Types.ObjectId('5d171f00966528a33b94da94')},{$set:{'a':4}},function(err,x){
//  console.log('UPDATE ONE ',err,x)
})
*/
//console.log('ROADS MODEL',geojson['5d1287403341c2415eb58f48'].schema)

})

})
