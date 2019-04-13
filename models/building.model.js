const mongoose = require('mongoose');
const GeoJSON = require('mongoose-geojson-schema');

var TestSchema = new mongoose.Schema({
  title: String,
  test: {},
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
}, { typeKey: '$type', collection: 'echoes' });

module.exports = mongoose.model('GeoJSON',TestSchema);

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
