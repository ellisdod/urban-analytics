const Controller = require('./base.controller')
const formidable = require('formidable');
const fs = require('fs');
const Papa = require('papaparse');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//const indicatorsModel = require('../models/indicators.model')
const layers = require('../models/models.model')
const geojson = require('../models/geojson.model')
const functions = require('../src/api.functions')
const arrayUtils = require('../src/plugins/arrayUtils.js')
const flatten = require('flatten-obj')()
const transConfig = require('../src/transformations.config')
//const building_survey_backup = require('../static/building_survey_backup.json')



const turf = {
  length :require('@turf/length').default,
  area : require('@turf/area').default,
  tag : require('@turf/tag'),
  centroid : require('@turf/centroid').default,
  circle : require('@turf/circle').default,
  union : require('turf-merge'),//require('@turf/union').default,
  buffer : require('@turf/buffer').default,
  booleanCrosses : require('@turf/boolean-crosses').default
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
        if (err) reject(err + ': could not read file')
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

      //get list of spatial intersects for layer
      return layers.layers.find({_id:mongoose.Types.ObjectId(req.fields.layer)})
    })
    .then(layers=>{
      //console.log('layers: ',layers)
      const queries = layers[0].spatial_intersect.reduce((acc,x)=>{
        if (x!=='') acc.push(geojson[x].find())
        return acc
      },[])

      //console.log('layers queries: ',queries)
      return Promise.all(queries)
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
        features = self.spatialJoin(features,tagAreas[areaLayer._id],areaLayer.code,'areaCode')
      })

      features = features.map(j=>{
        j.feature.properties.data_type = j.feature.geometry.type
        j.layer = req.fields.layer
        return j
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
      //console.log(records)
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
    //console.log('layers model', layers.surveyLayers.find)
    //console.log('geojson.surveyRecords', Object.keys(geojson))
    let surveyMode = layers.surveyLayers.countDocuments({_id:req.params.collection})
    let areaMode = layers.areaLayers.countDocuments({_id:req.params.collection})
    Promise.all([surveyMode,areaMode])
    .then(arr=>{
      console.log('modes',arr,req.params.collection)
      surveyMode = arr[0] ? true : false
      areaMode = arr[1] ? true : false

      //console.log('surveyMode', surveyMode)
      let attributesModel = layers.layerAttributes
      let model = geojson[req.params.collection]

      if (surveyMode) {
        attributesModel = layers.surveyLayerAttributes
      } else if (areaMode) {
        model = geojson[req.params.areaLayerId]
        attributesModel = layers.areaAttributes
      }

      let layerAttributes = attributesModel.find({layer:req.params.collection},'',{lean: true})
      let features = model.find({layer:req.params.collection},'',{lean: true})
      let areaLayer = layers.areaLayers.find({ _id :req.params.areaLayerId},'',{lean: true})
      let areas = geojson[req.params.areaLayerId].find({ layer :req.params.areaLayerId},'',{lean: true})

      return Promise.all([features,areaLayer,areas,layerAttributes])
    })
    .then(arr=>{
      features = arr[0]
      areaLayer = arr[1][0]
      areas = arr[2]
      layerAttributes = arr[3]

      if (features.length===0) throw new Error('No features found for selected layer')
      //features = building_survey_backup

      console.log('analysing ' + features.length + ' features...')

      const shape_area = layerAttributes.filter(x=>x.name==='shape_area')[0]
      const shape_length = layerAttributes.filter(x=>x.name==='shape_length')[0]

      console.log('features example',features[0])
      console.log('areas example',areas[0])

      features = this.spatialJoin(features,areas,areaLayer.code,'areaCode')

      console.log('joined',features[0])


      features = features.map((x,index)=>{
        //x.feature.properties = joined[index].properties
        if (!surveyMode&&shape_area) x.feature.properties.shape_area = turf.area(x.feature)
        if (!surveyMode&&shape_length) x.feature.properties.shape_length = turf.length(x.feature) * 1000
        return x
      })
      if (surveyMode) return null

      console.log('features joined', features[0])

      return this.calculateSpatialIntersects(features, layerAttributes)

      //return Promise.reject('testing')

      //

    })
    .then(x=>{
      features = x
      console.log('features intersect joined', features[0])
      const ops = features.map(x=>this.createUpdateReq({_id:x._id},null,x))
      return model.bulkWrite(ops)
    })
   .then(()=>{
      console.log('completed spatial join')
      //console.log(features[0].feature.properties)
      return this.applyLayerFunctions(features,areaLayer,surveyMode)

    })
    .then(x => res.status(200).send(x) )
    .catch(err => {
      this.chainError(err,res)
    })
  }


this.makeFeatureCollection = function(features) {

   if (!features[0]) return null

    if (features.type === 'FeatureCollection') {
      return features
    } else {
      return {
        type :'FeatureCollection',
        features : features[0].feature ? features.map(i=>i.feature) : features
      }
    }
}

this.filterGeometry = function(features) {
  if (features&&features.type === 'FeatureCollection')  {
    features.features = features.features.filter(x=>x.geometry)
  } else if (features.length) {
    features = features.filter(x=>(x.feature && x.feature.geometry)||x.geometry)
  }
  return features
}


  /*
  this.reloadGeoJSON = function () {
  console.log('reloading GeoJson')
  delete require.cache[require.resolve(pathToGeoJSON)];
  geojson = require(pathToGeoJSON);
}
*/
this.computeSpatialFunctions = function(features,layer) {
  return layers.layerTransformations.find({layer:layer._id})
  .then(transformations=>{
    transformations.forEach(x=>this.computeTransformation(features,layer,x))
  })
}

function toMultiPolygon(polygons) {
  let featuresLen = []
  let coords = polygons.reduce((acc,x)=>{
    const coords = x.geometry.coordinates
    acc.push(coords)
    featuresLen.push(coords.length)
    return acc
  },[])

  return {
    geometry : {
      type : 'MultiPolygon',
      coordinates : coords
    },
    type : 'Feature',
    properties : Object.assign(polygons[0].properties,{featuresLen:featuresLen})
  }

}

this.computeTransformation = function(features,layer,transformation){

  let output;
  let outputLayer;
  let type;
  let year;

  layers.layerTransformations.find({layer:layer._id})
  .then(transformations=>{

    //for (var x=0;x<transformations.length;x++) {  }
    const transformation = transformations[0]

    output = transformation.func.reduce((acc,func)=>{
      if (transConfig[func.name].singular) {
        console.log('feature sample',acc.length,acc[0])
        acc = acc.map(a=>turf[func.name](a.feature, ...func.params.map(x=>x.value), transConfig[func.name].opts ) )
      } else if (transConfig[func.name].featuresAsParams)  {
        //console.log('feature sample',acc.length,JSON.stringify(acc[0]))
        //console.log('feature collection',this.makeFeatureCollection(acc))
        acc = [turf[func.name](this.makeFeatureCollection(acc))]

      } else {
        acc = turf[func.name](acc, ...func.params.map(x=>x.value))
      }
      return acc.filter(x=>x)
    },features)

    type = output.features ? output.features[0].geometry.type : output[0].geometry.type
    year = output.features ? output.features[0].properties.year : output[0].properties.year

    const transLayer = Object.assign(layer, {
      _id : transformation.outputLayer || mongoose.mongo.ObjectID(),
      name : transformation.name,
      text_en : transformation.text_en,
      text_ar : transformation.text_ar,
      data_type : type,
      parent : layer._id
    })

    return layers.layers.findOneAndUpdate({_id:transLayer._id}, transLayer, { upsert:true, new:true })
  })
  .then(x=>{
    outputLayer = x
    //console.log('outputlayer', outputLayer)
    geojson.load()
    transformation.outputLayer = outputLayer._id
    return layers.layerTransformations.findOneAndUpdate({_id:transformation._id},transformation)
    // delete existing
    //return geojson[outputLayer._id].deleteMany({layer:outputLayer._id})
  })
  .then(() =>{
    return geojson[outputLayer._id].deleteMany({layer:outputLayer._id})
  })
  .then(() =>{
    console.log('output sample',output.length, JSON.stringify(output[0]))
    return geojson[outputLayer._id].insertMany(output.map(x=>{
      x.properties.data_type = type
      x.properties.year = year || 2019
      return {
        feature : x,
        layer : outputLayer._id
      }
    }))
  })
  .catch(err => {
    this.chainError(err)
  })


}


this.computeAttributeFunctions = function(accumulator,attributes,feature,count){
  const property = feature.properties || {}
  let geoKey;
  switch(feature.geometry.type) {
    case 'MultiPolygon':
    case 'Polygon':
    geoKey = 'shape_area'
    property[geoKey] = property[geoKey] || turf.area(feature)
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
        obj[key].total.categories = Object.keys(obj[key].count).length
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
    else return null
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

  function nestArray(array,startKey,endKey) {
    startKey = startKey || '('
    endKey = endKey || ')'
    let index = 0
    var nest = function (arr) {
      const mainArr = []
      while (index<arr.length) {
        if ( arr[index]===startKey ) {
          index ++
          mainArr.push(nest(arr))
        }
        else if (arr[index]===endKey) break
        else mainArr.push(arr[index])
        index ++
      }
      return mainArr
    }

    return nest(array)
  }

  function calculateArray(arr) {
    let operator;
    //console.log(arr,ind,calc)
    const res = arr.reduce((acc, x, index,arr)=>{

      //console.log(x, 'operator: '+ operator, mathIt[x])
      if (Array.isArray(x)) {
        //console.log('is array')
        x = calculateArray(x)
      } else if (typeof x === 'string' && !mathIt[x]) {
        //console.log('is string', arrayUtils.getNested(x.replace(calc.layer,calc.key),ind))
        //console.log(x.replace(calc.layer,calc.key))
        x = x.length < 26 ? parseInt(x) : arrayUtils.getNested(x.replace(calc.layer,calc.key),ind)
      }
      //console.log('nested value', x)
      if ( x === null || x === undefined ) {
        acc = null
        arr.slice(0) // break early
        return acc
      } else if (index === 0) {
        acc = x
      } else if (mathIt[x]) {
        operator = x
        //console.log('operator: '+ operator)
      } else if (x&&operator) {
        if (typeof acc === 'number' && typeof x === 'number') {
          acc = mathIt[ operator ](acc,x)
        } else if (acc && typeof acc === 'object' && typeof x === 'number') { // null is object
          //console.log('object/number')
          acc = mathObj(acc,x,operator)
        } else if (typeof acc === 'number' && x && typeof x === 'object') {
          //console.log('number/object')
          acc = mathObj(x,acc,operator)
        } else if (acc && typeof acc === 'object' && x && typeof x === 'object') {
          //console.log('number/object')
          Object.keys(acc).forEach(key=>{
            acc[key] = mathObj(x,acc[key],operator)
          })
        }
        //console.log('res: '+ acc)
      }
      //console.log(index, acc)
      return acc
    },0)
    //console.log(res)
    return res
  }

  let result = calculateArray(nestArray(calc.func))

  //console.log('rounded',roundObj(result))
  return roundObj(result)


}

/**
* Aggregate feature properties to indicators
* @param  {Array} features
* @param  {Object} areaLayer
* @param  {Boolean} surveyMode
* @return {Promise}
*/
this.applyLayerFunctions = function(features,areaLayer,surveyMode) {
  const self = this
  const layerId = features[0].layer
  const opts = {lean: true}

  let layerAttributes;
  let layerCalcs
  if (surveyMode) {
    layerAttributes = layers.surveyLayerAttributes.find({layer:layerId},'',opts)
    layerCalcs = Promise.resolve()
  } else {
    layerAttributes = layers.layerAttributes.find({layer:layerId},'',opts)
    layerCalcs = layers.layerCalcs.find({$or:[{layer:layerId},{layer:areaLayer._id}]},'',opts)
  }

  let areas = geojson[areaLayer._id].find({},'',opts)
  let indicators = geojson.indicators.find({layer: areaLayer._id },'',opts)
  let styles = layers.styles.find({layer:layerId},'',opts)
  let layer = layers.layers.findOne({_id:layerId},'',opts)

  let styleOps = []

  return Promise.all([layerAttributes,areas,layerCalcs,indicators,layer,styles])
  .then(arr=>{
    layerAttributes = arr[0]
    areas = arr[1]
    layerCalcs = arr[2]
    indicators = arr[3]
    layer = arr[4]

    layerAttributes = layerAttributes.map(a=>{
      if (a._options) {
        a._options = a._options.reduce((acc,x)=>{
          acc[x.value] = x
          return acc
        },{})
      }
      return a
    })
    console.log('layerAttributes',JSON.stringify(layerAttributes[0]) )

    styles = arr[5].reduce((acc,x)=>{
      //console.log(x.name)
      acc[x.name] = x
      return acc
    },{}) || {}

    if (surveyMode) return null

    layerCalcs.forEach(x=>{
      //console.log('x.layer:areaLayer',x.layer,areaLayer._id)
      x.key = x.layer.toString() === areaLayer._id.toString() ? 'attached' : layerId
      return x
    })

    //check matching layer attribute exists for areaLayer
    const match = layerAttributes.filter(x=>x.name === areaLayer.code)
    if (match.length === 0) return null
    const attribute = {
      name : areaLayer.code,
      type : "Number",
      layer : layerId,
      required : false
    }
    layerAttributes.push(attribute)
    return layers.layerAttributes.findOneAndUpdate({}, attribute, {upsert:true})

  })
  .then(x=>{
    if (x) geojson.load()
    // spatial intersect calculations
    // configure as Promise.all()
    return

  })
  .then(()=>{

    //console.log('after spatial interesect', features)

    //reset existing indicators for this layer to avoid adding to exisitng numbers
    indicators.forEach(indicator=>{
      indicator[layerId] = {}
    })

    //console.log('layerAttributes: ' + JSON.stringify(layerAttributes))
    //console.log('feature sample: ' + JSON.stringify(features[10]))

    indicators = this.indicator.unflatten(indicators)

    const indObj = features.reduce((acc,x)=>{
      const code = x.feature.properties[areaLayer.code]
      if (!code) return acc
      const year = x.feature.properties.year
      if (!year) return acc
      acc[year] = acc[year] || {} //{2019:{}}
      acc[year][code] = acc[year][code] || self.indicator.create(year,code,areaLayer._id)// { 2019:{ 1113:{} }
      acc[year][code][layerId] = acc[year][code][layerId] || {}
      acc[year][code][layerId] = self.computeAttributeFunctions(acc[year][code][layerId], layerAttributes, x.feature)
      //console.log('styles',styles)

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

    if (surveyMode) return null
    if (inds) console.log(`calculating ${layerCalcs.length} for ${inds.length} indicators`)

    const ops = inds.reduce((acc,ind,i)=>{
      //if (!inds[i][layerId]) return //why?
      let updateObj;
      layerCalcs.forEach(calc=>{
        //console.log(i, inds[i])
        //inds[i][layerId] = inds[i][layerId] || {} // null values exist for areas without features
        const calcResult = self.computeLayerCalc(calc,ind,inds)
        //console.log('calcResult',calcResult)
        //if (calcResult !== null && calcResult !== undefined ) {
        updateObj = updateObj || {}
        updateObj[calc.key] = updateObj[calc.key] || {}
        updateObj[calc.key][calc.name] = calcResult
        //}
      })
      //console.log('updateObj',updateObj)
      if (updateObj) acc.push( this.createUpdateReq({'_id':ind._id}, null, flatten(updateObj) ) )
      //console.log('computed indicator', JSON.stringify(this.createUpdateReq({'_id':x._id}, null, flatten(updateObj) )))
      //acc.push( this.createUpdateReq({'_id':x._id}, null, flatten(updateObj) ) )
      return acc
      //console.log('completed ' + ops.length)
    },[])

    //console.log('operations',ops)
    if (ops.length > 0 ) {
      console.log('updating ' + ops.length + ' indicators'  )
      return geojson.indicators.bulkWrite(ops)
    } else {
      return Promise.reject()
    }
  })
  .then(()=>{
    return this.computeSpatialFunctions(features,layer)
  })
  .then((x)=> {
    //console.log(x)
    return this.createAttributeStyles(features,layerAttributes)
  })
  .catch(err=>{
    console.log(err)
    return Promise.reject()
  })


}


this.calculateSpatialIntersects = function(features, layerAttributes) {
  //console.log('filtere attributes', layerAttributes.filter(att => att.intersect&&att.intersect.length))
  const calcs = layerAttributes
    .filter(att => att.intersect&&att.intersect.length)
    .map(att => geojson[att.intersect[0]].find({
      layer:mongoose.Types.ObjectId(att.intersect[0])
      })
      .then(areas => {
        console.log('areas',areas[0])
        console.log('features',features[0])
        features = this.spatialJoin(features, areas, att.name)
        //console.log(att.name, features.filter(x=>x.feature.properties[att.name]).length, features[0])
      })
    )

  return Promise.all(calcs).then(()=>features)

}

this.createAttributeStyles = function(features,attributes) {
  const ops = []
  attributes = attributes.filter(x=>x.legend)
  const obj = features.reduce((acc,x)=>{

    for (var i=0;i<attributes.length;i++) {
      const a = attributes[i]
      if (a.type === 'String' || a.type === 'Text') {
        const attr = a.name
        const val =  x.feature.properties[attr]
        acc[attr] = acc[attr] || {}

        const uploadObj = {
          layer:mongoose.Types.ObjectId(x.layer),
          attribute:attr,
          name:val
        }

        const valKey = parseInt(val)+1+''
        if (a._options&&a._options[valKey]) {
          uploadObj._text_en = a._options[valKey].text_en
          uploadObj._text_ar = a._options[valKey].text_ar
        }

        //console.log(uploadObj)

        if (!acc[attr][val]) {
          acc[attr][val] = true
          ops.push(this.createUpdateReq({
            $and:[
              { layer : mongoose.Types.ObjectId(x.layer) },
              { attribute : attr },
              { name : val }
            ]
          },null,uploadObj,
          {upsert:true},
        ))
      }
    } else if (a.type === 'Number') {
      /*if(val===null || val===undefined) return acc
      val = parseInt(val)
      acc[attr].range = acc[attr].range || {min:val,max:val}
      acc[attr].range.min = val < acc[attr].range.min ? val : acc[attr].range.min
      acc[attr].range.max = val > acc[attr].range.max ? val : acc[attr].range.max*/
    }
  }
  return acc
},{})

//console.log(obj,features.length,layerAttributes.length)

console.log('operations: ' + ops.length + '\nfeatures: ' + features.length + ' \nattributes: ' + attributes.length)

return ops.length ? layers.styles.bulkWrite(ops) : null
}


/**
* Tags features with an attribute of an overlapping polygon
* Create centroids of features so work for tagging small features within a large area
* If no areaAttribute is provided, a Boolean is used
* @param  {Array} features
* @param  {Array} areas
* @param  {String} featureAttribute
* @param  {String} areaAttribute
* @return {Array}
*/
this.spatialJoin = function (features, areas, featureAttribute, areaAttribute) {
  //confirm areas are polygons
  if (areas[0].feature.geometry.type.indexOf('Polygon') === -1 ) {
    return null
  }

  //add proxy areaAttribute
  if (!areaAttribute) {
    areaAttribute = '__p'
    areas = areas.map(x=>{
      x.feature.properties[areaAttribute] = true
      return x
    })
  }
  console.log('for spatial join', features[0])
  features = this.filterGeometry(features)
  areas = this.filterGeometry(this.makeFeatureCollection(areas))

  let tagged;

  if (features[0].feature.geometry.type === 'Point') {
    tagged = turf.tag(this.makeFeatureCollection(features), areas, areaAttribute, featureAttribute)
  } else {
    const centroids = features.map(x=>turf.centroid(x.feature))
    console.log('centroids',centroids.length,centroids[0])
    tagged = turf.tag( this.makeFeatureCollection(centroids), areas, areaAttribute, featureAttribute)
    console.log('tagged',tagged.features.length, tagged.features.filter(x=>x.properties[featureAttribute]).length, tagged.features[0])
    //console.log('total tagged',tagged.features.filter(x=>x.properties.JIIS_stat_area).length )
  }
  return features.map((x,i)=>{
    x.feature.properties[featureAttribute] = tagged.features[i].properties[featureAttribute]
    return x
  })
  //return tag(features, areas, 'id', code)

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

        console.log('features',features[0]);
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
    console.log(Object.keys(geojson))
    Controller.layers = new LayerController('layers')
    Controller.layerAttributes = new LayerController('layerAttributes')
    Controller.features = new GeoJsonWrapper(FeatureController)
    Controller.areas = new GeoJsonWrapper(AreaController)
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
