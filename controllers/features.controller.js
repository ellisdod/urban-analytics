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
    console.log('schema',model.schema)

    let tagAreas = []
    let areaLayers;
    let features;

    return new Promise((res,rej)=>{
      fs.readFile(req.files.file.path, function(err, data) {
        if (err) rej(err)
        res(data)
      })
    },this.chainError)
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
    },this.chainError)
    .then(layers=>{
      console.log('layers: ',layers)
      const queries = layers[0].spatial_intersect.reduce((acc,x)=>{
        if (x!=='') {
          acc.push({layer:mongoose.Types.ObjectId(x)})
        }
        return acc
      },[])

      console.log('layers queries: ',queries)
      return geojson.areas.find().or(queries)
    },this.chainError)
    //combine into groups and run tests
    .then(i=>{
      console.log('tagAreas',i)
      tagAreas = i.reduce((acc,x)=>{
        acc[x.layer] = acc[x.layer] || []
        acc[x.layer].push(x)
        return acc
      },{})
      console.log('tag Areas: ',tagAreas)

      const query = Object.keys(tagAreas).map(x=>{
        return {_id:x}
      })
      return query
    },this.chainError)
    .then(i=>{
      console.log('area layers queries: ',i)
      return layers.areaLayers.find().or(i)
    },this.chainError)
    .then(i=>{
      //console.log('area Layers: ',i)
      areaLayers = i;

      areaLayers.forEach(areaLayer=>{
        features = self.spatialJoin(features,tagAreas[areaLayer._id],areaLayer.code)
      })
      console.log('tagged feature',features[0])
      //console.log('model',model)

      features = features.reduce((acc,j)=>{
        j.properties.data_type = j.geometry.type
        acc.push({
          feature : j,
          layer : req.fields.layer
        })
        return acc
      },[])

      return model.insertMany(features)

    },this.chainError)
    .then((x,err)=>{
      if (err) {
        res.status(500)
        res.send('error', { error: err })
      }
      const records = model.count({layer:req.fields.layer})
      if (records > 500) {
        layers.layers.findOneAndUpdate({_id:mongoose.Types.ObjectId(req.fields.layer)},{filtered:true})
      }
      console.log('total of ' + records + ' for layer ' + req.fields.layer )
      console.log('applying layer functions for '+ areaLayers.length + 'area layers')
      return Promise.all(areaLayers.map(areaLayer=>self.applyLayerFunctions(features,areaLayer)))
    },this.chainError)

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
    const areaLayer = layers.areaLayers.find({ _id :req.params.areaLayerId},'',{lean: true})
    const areas = geojson.areas.find({ layer :req.params.areaLayerId},'',{lean: true})
    const features = model.find({layer:req.params.collection},'',{lean: true})

    Promise.all([features,areaLayer,areas])
    .then(arr=>{
      const features = arr[0]
      const areaLayer = arr[1][0]
      const areas = arr[2]
      if (features.length===0) res.status(500).send('No features found for selected layer')
      console.log('analysing ' + features.length + ' features...')

      const joined = this.spatialJoin(features,areas,areaLayer.code)

      console.log('joined',joined[0])

      for(var x=0;x<features.length;x++){
        features[x].feature.properties = joined[x].properties
      }
      console.log('completed spatial join')
      //console.log(features[0].feature.properties)
      this.applyLayerFunctions(arr[0],arr[1][0])
    })
    .then(x=>res.send(x))
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
        obj[key].count[p] = obj[key].count[p] || 0
        obj[key].count[p] ++
        obj[key].total.count ++
        if (geoKey) {
          const val = parseInt(property[geoKey]||'0')
          obj[key][geoKey] = obj[key][geoKey] || {}
          obj[key][geoKey][p] = obj[key][geoKey][p] || 0
          obj[key][geoKey][p] = obj[key][geoKey][p] + val
          obj[key].total[geoKey] = obj[key].total[geoKey] + val
        }
        break
      }
    })
    return obj
  },accumulator)

}


this.computeLayerCalc = function (calc,ind) {
  function round(num) {
    return Math.round(num*1e1)/1e1
  }

  var mathIt = {
    '+': function (x, y) { return round(x + y) },
    '-': function (x, y) { return round(x - y) },
    '/': function (x, y) { return round(x / y) },
    '*':function (x, y) { return round(x * y) }
  }

  function mathObj(obj,val,op){
    return Object.keys(obj).reduce((acc,x)=>{
      acc[x] = mathIt[op](obj[x],val)
      return acc
    })
  }
  console.log('calc',calc,ind)
  if (calc.length === 1) {
    return arrayUtils.getNested(calc[0],ind)
  } else if (calc.length === 3) {
    const a = typeof calc[0] === 'number' ? calc[0] : arrayUtils.getNested(calc[0],ind)
    const b = typeof calc[2] === 'number' ? calc[2] : arrayUtils.getNested(calc[2],ind)
    if (typeof a === 'number' && typeof b === 'number') {
      console.log('numbers')
      return mathIt[calc[1]](a,b)
    } else if (typeof a === 'object' && typeof b === 'number') {
      console.log('object/number')
      return mathObj(a,b,calc[1])
    } else if (typeof a === 'number' && typeof b === 'object'){
      console.log('number/object')
      return mathObj(b,a,calc[1])
    }
  }

}


this.applyLayerFunctions = function(features,areaLayer) {
  const self = this
  const layerId = features[0].layer
  console.log('layerId',layerId)
  console.log('areaLayer',areaLayer)
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

    console.log('found ' + indicators.length + ' indicators with areaLayer: ' + areaLayer._id )
    console.log('inds',indicators[0])

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
    } else {
      return Promise.resolve()
    }

  })
  .then(()=>{

    indicators = this.indicator.unflatten(indicators)

    //delete existing indicators for this layer to avoid adding to exisitng numbers
    Object.keys(indicators).forEach(year=>{
      if(indicators[year][layerId]) {
        delete indicators[year][layerId]
      }
    })

    console.log('indObj keys',Object.keys(indicators))
    console.log('feature properties', features[0].feature.properties)
    //if (indicators === {}) return null
    //console.log('areaLayer', areaLayer)
    features.forEach(x=>{
      //  if (x.feature.properties['JIIS_stat_area']) console.log(x.feature.properties)
    })

    const indObj = features.reduce((acc,x)=>{
      const code = x.feature.properties[areaLayer.code]
      if (!code) return acc
      const year = x.feature.properties.year
      acc[year] = acc[year] || {} //{2019:{}}
      acc[year][code] = acc[year][code] || self.indicator.create(year,code,areaLayer._id)// { 2019:{ 1113:{} }
      acc[year][code][layerId] = acc[year][code][layerId] || {}
      acc[year][code][layerId] = self.computeAttributeFunctions(acc[year][code][layerId], layerAttributes, x.feature)
      if (acc[year][code][layerId].Eng_name) {
        console.log('calculated', acc[year][code][layerId])
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
          console.log(insertDoc.updateOne.update)
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
    if (err) {
      this.res.status(500).send({ error: err })
      return Promise.reject()
    }
    console.log('first stage success!')
    const query = {}
    query[layerId] = { $exists : true }
    return geojson.indicators.find(query,'',{lean: true})
  },this.chainError)
  .then((inds,err)=>{
    console.log(`calculating ${layerCalcs.length} for ${inds.length} indicators`)
    const ops = []
    inds.forEach((x,i)=>{
      layerCalcs.forEach(calc=>{
        console.log(i, inds[i])
        inds[i][layerId] = inds[i][layerId] || {} // null values exist for areas without features
        inds[i][layerId][calc.name] = self.computeLayerCalc(calc.func,x)
      })
      //console.log('computed', inds[i][layerId])
      ops.push( this.createUpdateReq({'_id':inds[i]._id}, layerId, inds[i][layerId]) )
      //console.log('completed ' + ops.length)

    })
    if (ops.length > 0 ) {
      return geojson.indicators.bulkWrite(ops)
    } else {
      return true
    }
  },this.chainError)


}

this.spatialJoin = function (features, areas, code) {
  areas = this.makeFeatureCollection(areas)
  if (features.type !== 'FeatureCollection') {
    features = this.makeFeatureCollection(features)
  }
  console.log('first feature',features.features[0])
  const shapeType = features.features[0].geometry.type
  if (shapeType === 'Point') {
    return turf.tag(features, areas, 'id', code).features
  } else {
    //console.log(centroid)
    //console.log(typeof centroid)
    const centroids = features.features.map(x=>turf.centroid(x))
    console.log('first centroid',centroids[0])
    const tagged = turf.tag( { type :"FeatureCollection", features :centroids}, areas, 'id', code)
    console.log('tagged',tagged.features[0])
    console.log('total tagged',tagged.features.filter(x=>x.properties.JIIS_stat_area).length )
    return features.features.map((x,i)=>{
      x.properties[code] = tagged.features[i].properties[code]
      return x
    })

    //return tag(features, areas, 'id', code)
  }
}
}

const FeatureControllerWrapper = function() {
  functions.forEach(func=>{
    this[func.name] = function(req,res,next) {
      console.log('model name:', req.params.collection)
      console.log('model', geojson[req.params.collection])
      new FeatureController(geojson[req.params.collection])[func.name](req,res,next)
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
        return this.model.insertMany(features).then((x,err)=>{
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



module.exports = new Promise((res,rej)=>{

  geojson.load().then(()=> {

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

Controller.features = new FeatureControllerWrapper()
Controller.areas = new AreaController(geojson.areas)
Controller.indicators = new IndicatorController(geojson.indicators)
res(Controller)
})

})
