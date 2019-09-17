const mongoose = require('mongoose');
const GeoJSON = require('mongoose-geojson-schema');
const axios = require('axios')
const Models = require('./models.model')
const dbConfig = require('../src/db.config')
const arrayUtils = require('../src/plugins/arrayUtils')

/*
var featureSchema = new mongoose.Schema({
  point: mongoose.Schema.Types.Point,
  multipoint: mongoose.Schema.Types.MultiPoint,
  linestring: mongoose.Schema.Types.LineString,
  multilinestring: mongoose.Schema.Types.MultiLineString,
  polygon: mongoose.Schema.Types.Polygon,
  multipolygon: mongoose.Schema.Types.MultiPolygon,
  geometry: mongoose.Schema.Types.Geometry,
  geometrycollection: mongoose.Schema.Types.GeometryCollection,
  feature: mongoose.Schema.Types.Feature,
  featurecollection: mongoose.Schema.Types.FeatureCollection
}, {typeKey: '$type'});
*/

function stringToType(string){
  switch(string) {
    case 'Number':
    return Number
    case 'String':
    return String
    case 'Text':
    return String
    case 'Date':
    return Date
    case 'Array':
    return Array
    case 'Boolean':
    return Boolean
    default:
    throw new mongoose.Error(`Schema Type ${string} not valid`)
  }
}
//const featureSchemaBase = mongoose.Schema({},baseOptions);
//const Features = mongoose.model('Features',featureSchema,'features');
function Schema(name,collection) {
  this.name = name
  this.collection = collection

  this.schema = {}

  this.merge = function(key,value) {
    Object.assign(arrayUtils.getNested(key,this.schema), value)
  }

  this.set = function(key,value) {
    this.schema.feature[key] = value
  }

  this.addPropertiesFromLayerAttrs = function(layer,attributes,schemaPath) {
    //console.log('this.schema',this.schema)
    const schema = schemaPath ? arrayUtils.getNested(schemaPath,this.schema) : this.schema
    attributes.reduce((acc,i) => {
      if (i.layer.toString() !== layer._id.toString()) return acc
      acc[i.name] = {
        type : stringToType(i.type),
        required : i.required || false
      }
      return acc
    },schema)
  }

  this.addDataTypeVerifier = function(layer) {

    this.schema.feature.properties.data_type = {
      type: String,
      required:true,
      validate: {
        validator: function(v) {

          return v.toLowerCase().replace('multi','') === layer.data_type.toLowerCase().replace('multi','')

        },
        message: props => `${props.value} does not match layer data type:
                           \n Layer: ${layer.data_type.toLowerCase()}
                           \n Feature: ${props.value.toLowerCase()}`
      }
    }
  }

  this.exportModel = function(opts) {
    const schema = new mongoose.Schema(this.schema,opts)
    try {
      exports[this.name] = mongoose.model(this.name,schema,this.collection);
    } catch (err) {
      delete mongoose.models[this.name];
      delete mongoose.modelSchemas[this.name];
      exports[this.name] = mongoose.model(this.name,schema,this.collection);
    }
  }
}

const geoSchema = function (name,collection) {
  Schema.call(this,name,collection)
  this.schema = {
    feature:  {
      type : {
        type : String,
        required : true
      },
      geometry : mongoose.Schema.Types.Geometry,
      properties : {
        year : {
          type: Number,
          required:true,
        },
        _survey : {
          type: mongoose.Schema.Types.Mixed,
          required:false,
        },
      }
    },
    layer : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    }
  }

}


const indicatorSchema = function (name,collection) {
  Schema.call(this,name,collection)
  this.schema = {
  year : {
    type : Number,
    required : true
  },
  layer : {
    type : mongoose.Schema.Types.ObjectId,
    required : true
  },
  areaCode : {
    type : Number,
    required : true
  },
  attached : {
    type : mongoose.Schema.Types.Mixed,
  }
}
}

const surveySchema = function (name,collection) {
  Schema.call(this,name,collection)
  this.schema = {
    feature:  {
      type : {
        type : String,
        required : true
      },
      geometry : mongoose.Schema.Types.Geometry,
      properties : {
        year : {
          type: Number,
          required:true,
        },
        _survey : {
          type: mongoose.Schema.Types.Mixed,
          required:false,
        },
        _createdBy : {
          type: String,
          required : true
        },
        _lastEditedBy : {
          type: String,
          required : true
        },
        _createdDate : {
          type : Date,
          required : true
        },
        _lastEditedDate : {
          type : Date,
          required : true
        },
      }
    },
    layer : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    },
    linkedFeature : {
      type : mongoose.Schema.Types.ObjectId,
      required : true
    },
  }
}


function setLayerModels () {
  console.log('creating layer models')
  return new Promise((res,rej) => {
    Promise.all(['layers','layerAttributes'].map(x => Models[x].find({})))
    .then(arr=>{
      const layers = arr[0];
      const attributes = arr[1]
      if (layers.length===0) return null;
      for (var x=0;x<layers.length;x++){
        let schema = new geoSchema(layers[x]._id,'features')
        schema.addPropertiesFromLayerAttrs(layers[x],attributes,'feature.properties')
        //console.log('layer schema ' + layers[x]._id.toString(),schema.schema)
        schema.addDataTypeVerifier(layers[x])
        schema.exportModel()
        //console.log('schema',schema.schema)
        //console.log(Object.keys(exports))
      }
      res()
    })
  })
}


function setAreaModels () {
  console.log('creating area models')
  return new Promise((res,rej) => {
    Models['areaAttributes'].find({}).then(attributes=>{
      const layer = {_id:'areas',data_type:'multipolygon'}
      let schema = new geoSchema('areas','areas')
      schema.addPropertiesFromLayerAttrs(layer,attributes,'feature.properties')
      delete schema.schema.feature.properties.year;
      schema.exportModel()
      //console.log('areas',schema.schema)
      //console.log(Object.keys(exports))
      res()
    })
  })
}


function setIndicatorModels () {
  console.log('creating indicator models')
  return new Promise((res,rej) => {
    Promise.all(['areaLayers','indicatorAttributes'].map(x => Models[x].find({})))
    .then(arr=>{
      const layers = arr[0];
      const attributes = arr[1]
      if (layers.length===0) return null;
      layers.forEach( layer => {
        let schema = new indicatorSchema('indicators','indicators')
        schema.addPropertiesFromLayerAttrs(layer,attributes)
        schema.exportModel({strict:false})
        //console.log('schema',schema.schema)
        //console.log(Object.keys(exports))
      })
      res()
    })
  })
}


function setSurveyModels () {
  console.log('creating survey models')
  return new Promise((res,rej) => {
    Promise.all(['surveyLayers','surveyLayerAttributes'].map(x => Models[x].find({})))
    .then(arr=>{
      const layers = arr[0];
      const attributes = arr[1]
      //if (layers.length===0) return null;
      layers.forEach( layer => {
        let schema = new surveySchema(layer._id,'surveyRecords')
        schema.addPropertiesFromLayerAttrs(layer,attributes,'feature.properties')
        schema.exportModel()
        //console.log('schema',schema.schema)
        //console.log(Object.keys(exports))
      })
      res()
    })
  })
}

exports.load = function() {
  return new Promise((res,rej) => {
    Promise.all([
      setLayerModels(),
      setAreaModels(),
      setIndicatorModels(),
      setSurveyModels()
    ]).then(x=>{
      Object.keys(dbConfig).forEach(x=>{
        if (dbConfig[x].schema==='spatial') {
          let schema = new Schema(x,x)
          schema.set('properties',mongoose.Schema.Types.Mixed)
          schema.exportModel()
          //console.log('buildings',schema.schema)
        }
      })
      res()
    })
  })
}
