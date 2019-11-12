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
  },
  union : {
    name: 'union',
    text_en: 'Union',
    featuresAsParams : true,
    description_en : 'Merges overlapping polygons into a single shape',
    params : []
  }
}
