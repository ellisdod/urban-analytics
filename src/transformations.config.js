const calculator = require('../src/plugins/calculator.js')
const Features = require('../src/plugins/geotools.js').default

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

module.exports = {
  buffer : {
    name: 'buffer',
    text_en : 'Buffer',
    singular : true,
    description_en : 'Creates a buffer of x radius around input features',
    params : [
      {
        name : 'radius',
        type : Number
      }
    ],
    function : function(acc,params) {
      return acc.map(a=>turf.buffer(a.feature, params.map(x=>x.value), {steps:10} ) )
    },
  },
  circle : {
    name: 'circle',
    text_en : 'Circle',
    singular : true,
    description_en : 'Creates a buffer of x radius around input features',
    opts : {
      steps : 10
    },
    params : [
      {
        name : 'radius',
        type : Number
      }
    ],
    function : function(features,params) {
      console.log('circle ' +features.length + ' features')
      return features.map(a=>turf.circle(a.feature, params.map(x=>x.value), {steps:10} ) )
    },
  },
  union : {
    name: 'union',
    text_en: 'Union',
    featuresAsParams : true,
    description_en : 'Merges overlapping polygons into a single shape',
    params : [],
    function : function(features,params) {
      const f = new Features()
      console.log('union ' +features.length + ' features')
      f.load(features)
      return [turf.union(f.toFeatureCollection())]
    }
  },
  filter : {
    name: 'filter',
    text_en: 'Filter',
    description_en : 'Filters features by their properties',
    params :[ {
      component:'Calculator',
      type: 'conditional',
      items : (store) => store.state._col_layerAttributes
        .reduce((acc,x)=> {
          if (x.layer!==store.state._col_layers_selected) return acc
          x.value = '$'+x._id
          acc.push(x)
          return acc
        },[])
    }],
    function : function(features,params,attributes) {
      console.log('filter',JSON.stringify(features[0]), JSON.stringify(params), JSON.stringify(attributes))
      return features.filter(a=>{
        const cal = calculator()
        return cal.process(params[0].value, a.feature.properties, attributes)
      })
    },
  }
}
