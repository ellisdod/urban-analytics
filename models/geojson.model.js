const mongoose = require('mongoose');
const GeoJSON = require('mongoose-geojson-schema');
const axios = require('axios')
const Models = require('./models.model')
const dbConfig = require('../src/db.config')


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
    default:
    throw new mongoose.Error(`Schema Type ${string} not valid`)
  }
}
//const featureSchemaBase = mongoose.Schema({},baseOptions);
//const Features = mongoose.model('Features',featureSchema,'features');

function createLayerSchema (properties) {
  return new mongoose.Schema({
  feature: {
    type : {
      type : String,
      required : true
    },
    geometry : mongoose.Schema.Types.Geometry,
    properties : properties
  },
  layer : {
    type : mongoose.Schema.Types.ObjectId,
    required : true
  }
})
}

function createModel (name,schema,collection) {
  try {
    exports[name] = mongoose.model(name,schema,collection);
  } catch (err) {
    delete mongoose.models[name];
    delete mongoose.modelSchemas[name];
    exports[name] = mongoose.model(name,schema,collection);
  }
}

function createLayerModels(featureLayers, attributes) {
  //console.log('featureLayers',featureLayers)
  if (featureLayers.length===0) return null;

  featureLayers.forEach( layer => {

    const properties = attributes.reduce((acc,i) => {
      if (i.layer.toString() !== layer._id.toString()) return acc
      acc[i.name] = {
        type : stringToType(i.type),
        required : i.required || false
      }
      return acc
    },{})

    properties.data_type = {
        type: String,
        required:true,
        validate: {
          validator: function(v) {
            return v.toLowerCase() === layer.data_type.toLowerCase();
          },
          message: props => `${props.value} does not match layer data type`
        }
    }
    properties.year = {
      type: Number,
      required:true,
    }

    createModel(layer._id, createLayerSchema(properties), 'features')

  })

}


Models.layers.find({}, function (err, layers) {
  if (err) {
    console.log('failed to download layer schemas')
    return
  }
  Models.layerAttributes.find({}, function (err, layerAttributes) {
    if (err) {
      console.log('failed to download layer attribute schemas')
      return
    }
    //console.log('layerAttributes',layerAttributes)
    createLayerModels(layers, layerAttributes)
  })
})

//exports.education = mongoose.model('education', featureSchema, 'features')
Object.keys(dbConfig).forEach(x=>{
  if (dbConfig[x].schema==='spatial') {
    const schema = createLayerSchema(mongoose.Schema.Types.Mixed)
    createModel(x,schema, x)
  }
})

//console.log('featureschema',featureSchema)

//exports.facilities = mongoose.model('Facility',featureSchema, 'facilities');

/*
const polygonSchema = new mongoose.Schema({
type: {
type: String,
enum: ['Polygon'],
required: true
},
coordinates: {
type: [[[[Number]]]], // Array of arrays of arrays of numbers
required: true
}
});

const buildingSchema = new mongoose.Schema({
type: String,
properties: {
Id : Number,
Neighbourhood : String
},
geometry: schema
});

// Export the model
module.exports = mongoose.model('GeoJSON', schema );
*/
