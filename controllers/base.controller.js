const formidable = require('formidable');
const fs = require('fs');
const Papa = require('papaparse');
const tag = require('@turf/tag');
const centroid = require('@turf/centroid')
const mongoose = require('mongoose');

const pathToGeoJSON = '../models/geojson.model'
var geojson = require(pathToGeoJSON)
//const indicatorsModel = require('../models/indicators.model')
const layers = require('../models/models.model')
const functions = require('../src/api.functions')

mongoose.Promise = Promise;

function reloadGeoJSON () {
  delete require.cache[require.resolve(pathToGeoJSON)];
  geojson = require(pathToGeoJSON)
}

function createIndicator(year,code,areaLayer) {
  return {
    year : year,
    areaLayer : areaLayer._id.toString(),
    areaCode : code,
    attached : {}
  }
}

function arraysToObjects(headers,rows) {
  return rows.reduce((arr,row)=>{
    arr.push(headers.reduce((acc,x,index)=>{
      acc[x] = row[index]
      return acc
    },{}))
    return arr
  },[])
}

function parseFile(file,format) {
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

function computeAttributeFunctions(accumulator,attributes,feature,count){
  const property = feature.properties || {}
  count = count || 1
  return attributes.reduce((obj,i)=>{
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
        const p = property[i.name] || 'unknown'
        obj[key].count[p] = obj[key].count[p] || 0
        obj[key].count[p] ++
        break
      }
    })
    return obj
  },accumulator)
}

var mathIt = {
  '+': function (x, y) { return round(x + y) },
  '-': function (x, y) { return round(x - y) },
  '/': function (x, y) { return round(x / y) },
  '*':function (x, y) { return round(x * y) }
}

function round(num) {
  return Math.round(num*1e1)/1e1
}

function mathObj(obj,val,op){
  return Object.keys(obj).reduce((acc,x)=>{
    acc[x] = mathIt[op](obj[x],val)
    return acc
  })
}

function getNested (p, o) {
  p = typeof p === 'string' ? p.split('.') : p
  if (!p) return o
  const n =  p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
  //console.log('nested',n)
  return n
}

function computeLayerCalc(calc,ind) {
  console.log('calc',calc,ind)
  if (calc.length === 1) {
    return getNested(calc[0],ind)
  } else if (calc.length === 3) {
    const a = getNested(calc[0],ind)
    const b = getNested(calc[2],ind)
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

  function unflattenIndicators (indicators) {
    return Array.from(indicators).reduce((acc,x)=>{

      let year = x.year
      if (!year) return acc
      //year = year.toString()
      acc[year] = acc[year] || {}
      acc[year][x.areaCode] = x
      return acc
    },{})
  }


  function applyLayerFunctions(features,areaLayer) {

    const layerId = features[0].layer
    console.log('layerId',layerId)
    console.log('areaLayer',areaLayer)
    const indquery = { areaLayer: areaLayer._id.toString() }
    //console.log('indquery',indquery)

    let layerAttributes = layers.layerAttributes.find({layer:layerId},'',{lean: true})
    let areas = geojson.areas.find({layer:areaLayer._id},'',{lean: true})
    let layerCalcs = layers.layerCalcs.find({layer:layerId},'',{lean: true})
    let indicators = layers.indicators.find(indquery,'',{lean: true})

    Promise.all([layerAttributes,areas,layerCalcs,indicators])
    .then(arr=>{
      layerAttributes = arr[0]
      areas = arr[1]
      layerCalcs = arr[2]
      indicators = arr[3]

      console.log('found ' + indicators.length + ' indicators with areaLayer: ' + areaLayer._id )
      console.log('inds',indicators[0])
      indicators = unflattenIndicators(indicators)

      console.log('indObj keys',Object.keys(indicators))
      console.log('feature properties', features[0].feature.properties)
      //if (indicators === {}) return null
      //console.log('areaLayer', areaLayer)

      const indObj = features.reduce((acc,x)=>{
        const code = x.feature.properties[areaLayer.code]
        if (!code) return acc
        const year = x.feature.properties.year
        acc[year] = acc[year] || {} //{2019:{}}
        acc[year][code] = acc[year][code] || createIndicator(year,code,areaLayer)// { 2019:{ 1113:{} }
        acc[year][code][layerId] = acc[year][code][layerId] || {}
        acc[year][code][layerId] = computeAttributeFunctions(acc[year][code][layerId], layerAttributes, x.feature)
        if (acc[year][code][layerId].Eng_name) {
          console.log('calculated', acc[year][code][layerId])
        }
        return acc
      },indicators)

      //console.log('indObj',indObj)

      // fill missing areas with zero totals
      /*
      Object.keys(indObj).forEach(year=>{
      areas.forEach(area=>{
      const code = area.feature.properties.id
      if (!indObj[year][code]){
      indObj[year][code] = createIndicator(year,areaLayer)
      indObj[year][code][layerId] = computeAttributeFunctions(layerAttributes, {},0)
    }
  })
})
*/

//flatten years
const ops = Object.keys(indObj).reduce((acc,year)=>{
  Object.keys(indObj[year]).forEach(code =>{
    //console.log(code, indObj[year][code]['5ce7864a04b2593fbc10981c'])
      let insertDoc = {}
      const id = indObj[year][code]._id
      if (id) {
        insertDoc = createUpdateReq({'_id':id}, layerId, indObj[year][code][layerId])
      } else {
        //console.log('insert',indObj[year][code])
        //indObj[year][code]._id = mongoose.mongo.ObjectId()
        insertDoc.insertOne = {document: indObj[year][code]}
      }
      if (indObj[year][code][layerId]!=={}) acc.push(insertDoc)

  })
  return acc
},[])

  //console.log('ops',ops)
  return layers.indicators.bulkWrite(ops)
})
.then((x,err) =>{
  console.log('first stage success!')
  const query = {}
  query[layerId] = { $exists : true }
  return layers.indicators.find(query,'',{lean: true})
})
.then((inds,err)=>{
  console.log(`calculating ${layerCalcs.length} for ${inds.length} indicators`)
  const ops = []
  inds.forEach((x,i)=>{
    layerCalcs.forEach(calc=>{
      console.log(i, inds[i])
      inds[i][layerId] = inds[i][layerId] || {} // null values exist for areas without features
      inds[i][layerId][calc.name] = computeLayerCalc(calc.func,x)
    })
    //console.log('computed', inds[i][layerId])
    ops.push( createUpdateReq({'_id':inds[i]._id}, layerId, inds[i][layerId]) )
    //console.log('completed ' + ops.length)

  })
  if (ops.length > 0 ) layers.indicators.bulkWrite(ops)
})
.then(x=>console.log('resp',x))
.catch(err=>console.log(err))


}


function createUpdateReq(filter, updateKey, data, opts){
  const updateObj = updateKey ? {} : data
  if (updateKey) updateObj[updateKey] = data
  //const filterObj = {}
  const req = {
    updateOne : {
      filter : filter,
      update : updateObj
    }
  }
  req.updateOne = Object.assign({},req.updateOne,opts)
  return req
}


function Controller (model) {

  this.find = function (req, res, next) {
    const layer = req.params.collection
    const query = layer ? {layer:layer} : {}
    model.find(query, function (err, x) {
      if (err) return next(err)
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
    parseFile(req.files.file.path, req.fields.format)
    .then(jsonParsed=>{
      ops = jsonParsed.reduce((acc,item)=>{

        if (typeof update.matchExisting === 'string' && typeof update.matchUpload === 'string') {
          filter = arraysToObjects([update.matchExisting],[[ item[update.matchUpload] ]])
        } else if (Array.isArray(update.matchExisting) && Array.isArray(update.matchUpload)) {
          filter = arraysToObjects(update.matchExisting,[ update.matchUpload.map(i=>item[i]) ])
        } else {
          next("match values need to be either strings or arrays")
        }
        acc.push(createUpdateReq(filter, update.key, item,{upsert:true}))

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

  this.del = function (req, res, next) {
    //console.log('DELETING')
    model.findOneAndDelete({ _id :req.params.id}, function (err, x) {
      if (err) return next(err);
      res.send(x);
    })
  }

}

const layersController = function(model) {
  Controller.call(this,model)

  functions.forEach(func=>{
    this[func.name] = function(req,res,next) {
      this[func.name](req,res,next)
      if (func.method === "post") reloadGeoJSON()
    }
  })

}

const areasController = function(model) {
  Controller.call(this,model)

  this.update = function(req, res, next) {
    this.update(req, res, next)
    reloadGeoJSON()
  }

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

        console.log('features',features[0]);

        (async function(){

          const insertMany = await model.insertMany(features);

          res.status(200).send('Ok');
          reloadGeoJSON()
        })();

      });
    }

  }


  const indicatorsController = function(model) {
    Controller.call(this,model)

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

        console.log(jsonParsed)

        (async function(){

          const insertMany = await model.insertMany(jsonParsed);

          res.status(200).send('Ok');
        })();

      });

    }

    this.updateMany = function (req,res,next) {
      let jsonParsed;
      const update = JSON.parse(req.fields.update)
      const file = parseFile(req.files.file.path, req.fields.format)
      //let indicators = layers.indicators.find({})
      console.log('updating many...')
      Promise.all([file])
      .then(x=>{
        jsonParsed = x[0]
        const ops = jsonParsed.map(i=> {
          const areaCode = i.areaCode || i.area_code || i.area
          if (!areaCode) return null
          const indicator = createIndicator(i.year,areaCode,{_id:req.fields.layer})
          indicator[update.key] = i
          console.log('indicator',indicator)

          const filter = {}
          for (let x = 0;x<update.matchExisting.length;x++) {
            filter[update.matchExisting[x]] = i[update.matchUpload[x]]
          }
          return {
            updateOne : {
              filter : filter,
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

  }

  const featuresControllerWrapper = function() {
    functions.forEach(func=>{
      this[func.name] = function(req,res,next) {
        console.log('model name:', req.params.collection)
        console.log('model', geojson[req.params.collection])
        new featuresController(geojson[req.params.collection])[func.name](req,res,next)
      }
    })
  }

  const featuresController = function(model) {
    Controller.call(this,model)

    function makeFeatureCollection(features) {
      return {
        type :"FeatureCollection",
        features : features.map(i=>i.feature)
      }
    }

    function spatialJoin (features, areas, code) {
      areas = makeFeatureCollection(areas)
      if (features.type !== 'FeatureCollection') {
        features = makeFeatureCollection(features)
      }
      return tag(features, areas, 'id', code)
    }


    this.create = function (req, res, next) {
      console.log('inserting to layer:', req.fields.layer);
      //console.log(req.files.file);

      let tagAreas = []

      fs.readFile(req.files.file.path,
        function(err, data) {

          let features = JSON.parse(data);
          const year = 1900+new Date().getYear()

          features.features.forEach(f=>{
            f.properties.year = f.properties.year || year
          })
          //console.log('features',jsonParsed.features[0]);

          //get list of spatial intersects for layer
          layers.layers.find({_id:mongoose.Types.ObjectId(req.fields.layer)})
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
          })
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
          })
          .then(i=>{
            console.log('area layers queries: ',i)

            return layers.areaLayers.find().or(i)

          })
          .then(i=>{
            //console.log('area Layers: ',i)

            i.forEach(areaLayer=>{
              features = spatialJoin(features,tagAreas[areaLayer._id],areaLayer.code)
            })
            //console.log('features',features)
            //console.log('model',model)

            features = features.features.reduce((acc,j)=>{
              j.properties.data_type = j.geometry.type
              acc.push({
                feature : j,
                layer : req.fields.layer
              })
              return acc
            },[])


            i.forEach(areaLayer=>{
              applyLayerFunctions(features,areaLayer)
            })

            console.log('properties',features[0].feature.properties)

            //verifyLayer(req.fields.layer)
            const insertMany = model.insertMany(features)
            res.status(200).send('Ok');


          })
        })
      }

      this.getSubset = function(req, res, next) {

        const params = JSON.parse(req.params.params)
        console.log(params)
        //verifyLayer(params.layer)
        model[params.layer].find({ layer :params.layer, "feature.properties.stat_area" : params.location }, function (err, x) {
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
          console.log('analysing ' + features.length + ' features...')

          const joined = spatialJoin(features,areas,areaLayer.code)

          for(var x=0;x<features.length;x++){
            features[x].feature.properties = joined.features[x].properties
          }
          console.log('completed spatial join')
          //console.log(features[0].feature.properties)
          applyLayerFunctions(arr[0],arr[1][0])
        })
        .then(x=>res.send(x))
      }

    }

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

      console.log('layers model', layers.indicatorBlocks)
      module.exports = {
        layers : new Controller(layers.layers),
        layerAttributes : new Controller(layers.layerAttributes),
        layerCalcs : new Controller(layers.layerCalcs),
        features : new featuresControllerWrapper(),
        indicators: new indicatorsController(layers.indicators),
        indicatorBlocks: new Controller(layers.indicatorBlocks),
        indicatorSections: new Controller(layers.indicatorSections),
        areas: new areasController(geojson.areas),
        areaLayers : new Controller(layers.areaLayers),
        areaAttributes : new Controller(layers.areaAttributes),
        buildings : new buildingsController(geojson.buildings)
      }
