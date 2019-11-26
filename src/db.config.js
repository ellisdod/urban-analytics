const mongoose = require('mongoose')
const center = require('./plugins/coordinatesCenter')

const dataTypes = [{
  name:'Text',
  value:'Text'
},{
  name:'Number',
  value:'Number'
},{
  name:'Boolean',
  value:'Boolean'
},{
  name:'Array',
  value:'Array'
},{
  name:'Date',
  value:'Date'
}]

const config = {
  layers : {
    name: "Layers",
    name_en: "Layers",
    name_ar: "طبقات",
    schema : {
      name : {
        type : String,
        required : true,
        unique : true,
        _text : "Name",
      },
      text_en : {
        type : String,
        required : true,
        _text : "Text (English)",
      },
      text_ar : {
        type : String,
        _text : "Text (Arabic)"
      },
      data_type : {
        type : String,
        required : true,
        _text : "Type",
        _multiple: false,
        _options : [
          {
            name : 'Point',
            icon : 'scatter_plot'
          },
          {
            name : 'LineString',
            icon : 'timeline'
          },
          {
            name :'MultiPolygon',
            icon : 'bubble_chart'
          },
          {
            name :'Polygon',
            icon : 'bubble_chart'
          }
        ]
      },
      spatial_intersect : {
        type:Array,
        _text:"Areas for Analysis",
        _multiple: true,
        _options : function(store) {
          console.log('areas analysis select function')
          return store.state._col_areaLayers
        }
      },
      filtered : {
        type : Boolean,
        _text:"Filtered by area",
      },
      source_url : {
        type : String,
        _text : "Source - Link",
        _hint : "e.g https://jerusaleminstitute.org.il/en/yearbook/#/265/6868"
      },
      source_ref : {
        type : String,
        _text : "Source - Reference",
        _hint : "e.g Jerusalem Statistical Yearbook, Table IX/16"
      },
      source_org : {
        type : String,
        _text : "Source - Organisation",
        _hint : "e.g JIIS"
      },
      parent : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
      },
    },
  },
  layerAttributes : {
    name : "Attributes",
    name_ar : "سمات",
    canPaste : true,
    schema : {
      name : {
        type : String,
        required : true,
        _text : "Name"
      },
      type : {
        type : String,
        required : true,
        _text : "Type",
        _multiple: false,
        _options : dataTypes
      },
      func : {
        type : Array,
        _text : "Functions",
        _multiple: true,
        _options: [
          {
            name : 'count',
            color: 'secondary'
          },
          {
            name : 'sum',
            color: 'tertiary'
          }
        ],
        _computed : function(store,edited,relatedCollection,selectedId) {
          const tabledata = store.state[`_col_${relatedCollection}`].filter(x=>x.layer === selectedId)
          if(tabledata) {
            let baseOpts = ['count','']
            baseOpts = edited.type === 'Number' ? baseOpts.concat(['sum']) : baseOpts
            return tabledata.reduce((acc,x)=>{
              if (x.type === 'Number') acc.push(`sum: ${x.name}`)
              return acc
            },baseOpts)
          }
        }
      },
      intersect : {
        type : Array,
        _text : "Spatial Intersect",
        _multiple:true,
        _options : function(store) {
          return store.state._col_layers
        }
      },
      calculation : {
        type : Array,
        _text : "Calculation",
        _multiple: true,
        _combobox:true,
        _categorised : true,
        _options: {
          component:'Calculator',
          type: 'conditional',
          items : (store) => store.state._col_layerAttributes
            .reduce((acc,x)=> {
              if (x.layer!==store.state._col_layers_selected) return acc
              x.value = '$'+x._id
              acc.push(x)
              return acc
            },[])
        }
    },
      required : {
        type : Boolean,
        _text : "Required",
      },
      public : {
        type : Boolean,
        _text : "Public",
      },
      legend : {
        type : Boolean,
        _text : "Legend",
      },
      layer : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
      }
    },
  },
  layerCalcs : {
    name : "Attributes",
    name_ar : "سمات",
    schema : {
      name : {
        type : String,
        required : true,
        _text : "Name"
      },
      type : {
        type : String,
        required : true,
        _text : "Type",
        _multiple: false,
        _options : dataTypes
      },
      layer : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
      },
      func : {
        type : Array,
        _text : "Functions",
        _multiple: true,
        _combobox:true,
        _categorised : true,
        _options: {
          component:'Calculator',
          type: 'calculator',
          items : function(store,edited) {
            return store.getters.nestedAttributes(store,edited)
          }
        }
      }
    }
  },
  layerTransformations : {
    name : "Layer Transformations",
    schema : {
      name : {
        type : String,
        required : true,
        _text: "Name"
      },
      func : {
        type : Array,
        _text : "Functions",
        _multiple: true,
        _combobox:true,
        _categorised : true,
        _options: {component:'Transformations'}
      },
      layer : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
      },
      outputLayer : {
        type : mongoose.Schema.Types.ObjectId,
      }
    }
  },
  indicatorSections: {
    name : "Sections",
    name_ar : "الأقسام",
    schema : {
      name : {
        type : String,
        required: true,
        _text : "Name"
      },
      text_en : {
        type : String,
        required : true,
        _text : "Text (English)"
      },
      text_ar : {
        type : String,
        _text : "Text (Arabic)"
      },
      geodata : {
        type : Array,
        _text : "Feature Layers",
        _multiple: true,
        _options : function(store) {
          return store.state._col_layers
        }
      },
    },
  },
  indicatorBlocks : {
    name: "Modules",
    name_ar:"وحدات",
    canPaste : true,
    schema : {
      type : {
        type : String,
        required : true,
        _text : "Type",
        _multiple: false,
        _options : [
          {
            name : 'Figure',
          },
          {
            name : 'FigureHighlight',
          },
          {
            name : 'Chart',
          },
          {
            name :'Table',
          },
          {
            name :'List',
          },
          {
            name :'Pie Chart',
          },
          {
            name :'Map',
          },
          {
            name :'Timeline',
          },
          {
            name: 'Percentage'
          }
        ]
      },
      active : {
        type : Boolean,
        _text : "Active"
      },
      layer : {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        _options : function(store) {
          return store.state._col_indicatorSections
        },
        _text: "Section",
        _hasDefault:true,
      },
      text_en : {
        type : String,
        required : true,
        _text : "Name (English)"
      },
      text_ar : {
        type : String,
        _text : "Name (Arabic)"
      },
      areaLayer : {
        type : Array,
        _text : "Spatial Intersect",
        _multiple:true,
        _options : function(store) {
          return store.state._col_areaLayers
        }
      },
      figure : {
        type : Array,
        _text : "Figure",
        _categorised : true,
        _options : function(store,edited) {
          return store.getters.nestedAttributes(store,edited)
        }
      },
      zoom : {
        type : Number,
        _text : "Zoom"
      },
      mapAttributes : {
        type : Array,
        _multiple:true,
        _combobox:true,
        _text : "Map Attributes",
        _options: {
          component : 'ArrayInput',
          items : function(){
            return []
          }
      }
      },
      hideBaseMap : {
        type : Boolean,
        _text : "Hide Base Map"
      },
      useDateRange : {
        type : Boolean,
        _text : "Use date range"
      },
      date_range : {
        type : Array,
        _text : "Date Range",
        _multiple:true,
        _combobox:true,
        _options: {
          component : 'v-range-slider',
          items : function(){
            return []
          },
          defaultValue : function(store,edited) {
            const range = getIndicatorYears(store,edited.figure)
            return range ? [range[0], range.slice(-1)[0]] : []
          },
          hide : function(store,edited) {
            return !edited.useDateRange
          },
          min : function(store,edited) {
            const range = getIndicatorYears(store,edited.figure)
            return range ? range[0] : 2000
          },
          max : function(store,edited) {
            const range = getIndicatorYears(store,edited.figure)
            return range ? range.slice(-1)[0] : new Date().getFullYear()
          },
      },
        /*
        _options : function(store,edited) {
          if (!edited.figure||!edited.figure.length) return
          return store.getters.allIndicatorKeyYears[edited.figure[0]]
        },*/
        _process : {},
      },
      description_en : {
        type : String,
        _text : "Description (English)"
      },
      description_ar : {
        type : String,
        _text :  "Description (Arabic)"
      },
      unit : {
        type : String,
        _text :  "Unit"
      }
    }

  },
  features: {
    name:'Features',
    name_ar:'الميزات',
    schema:'layerAttributes',
    params : '/:collection',
    sort: 'feature.properties.year',
    canUpload: true,
    storeByLayer : true,
    embedIds : 'feature.properties',
    layerCollection: 'layers',
    layerAttributes: 'layerAttributes'
  },
  indicators: {
    name:'Indicators',
    schema : 'indicatorAttributes',
    schemaOpts : {
      strict: true
    },
    layerCollection : 'areaLayers',
    params : '/:collection',
    canUpload: true,
  },
  areaLayers : {
    name:'Area Layers',
    name_ar:'طبقات المنطقة',
    schema : {
      name : {
        type : String,
        required : true,
        _text : "Name"
      },
      code : {
        type : String,
        required : true,
        unique : true,
        _text : "Column Name"
      }
    },
  },
  areas : {
    name:'Areas',
    schema:'areaAttributes',
    params : '/:collection',
    canUpload: true,
    layerCollection: 'areaLayers',
    embedIds : 'feature.properties'
  },
  areaAttributes : {
    name:'Area Attributes',
    name_ar: 'سمات المنطقة',
    schema : {
      name : {
        type : String,
        required : true,
        _text : "Name"
      },
      type : {
        type : String,
        required : true,
        _text : "Type",
        _multiple: false,
        _options : dataTypes
      },
      required : {
        type : Boolean,
        _text : "Required",
      },
      layer : {
        type : String,
        required : true,
      }
    },
  },
  indicatorAttributes : {
    name : "Indicator Attributes",
    name_ar: "سمات المؤشر",
    canPaste : true,
    _description_en : "For non-spatial attribute data that is directly associatied with the spatial area i.e data from JIIS relating to a statistical area",
    schema : {
      name : {
        type : String,
        required : true,
        _text : "Name"
      },
      type : {
        type : String,
        required : true,
        _text : "Type",
        _multiple: false,
        _options : dataTypes
      },
      required : {
        type : Boolean,
        _text : "Required",
      },
      source_ref : {
        type : String,
        _text : "Source - Reference",
        _hint : "e.g Jerusalem Statistical Yearbook, Table IX/16"
      },
      source_org : {
        type : String,
        _text : "Source - Organisation",
        _hint : "e.g JIIS"
      },
      source_url : {
        type : String,
        _text : "Source - Link",
        _hint : "e.g https://jerusaleminstitute.org.il/en/yearbook/#/265/6868"
      },
      layer : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
      },
    },
  },
  surveyLayers : {
    name: "Survey Layers",
    name_ar: "طبقات المسح",
    schema : {
      name : {
        type : String,
        required : true,
        unique : true,
        _text : "Key",
      },
      text_en : {
        type : String,
        required : true,
        unique : true,
        _text : "Name (English)",
      },
      text_ar : {
        type : String,
        required : false,
        unique : true,
        _text : "Name (Arabic)",
      },
      featureLayer : {
        type : Array,
        _text : "Feature Layers",
        _multiple: true,
        _options : function(store) {
          return store.state._col_layers
        }
      }
    }
  },
  surveyLayerAttributes : {
    name : "Attributes",
    name_ar : "سمات",
    canPaste : true,
    translate : ['_text'],
    schema : {
      name : {
        type : String,
        required : true,
        _text : "Name"
      },
      _text_en : {
        type : String,
        required : true,
        _text : "Text (English)"
      },
      _text_ar : {
        type : String,
        required : true,
        _text : "Text (Arabic)"
      },
      required : {
        type : Boolean,
        _text : "Required",
      },
      type : {
        type : String,
        required : true,
        _text : "Type",
        _multiple: false,
        _options : dataTypes
      },
      _options : {
        type : Array,
        multiple: true,
        _text : "Options",
        _categorised : true,
        _options:'dynamic'
      },
      func : {
        type : Array,
        _text : "Functions",
        _multiple: true,
        _options: [
          {
            name : 'count',
            color: 'secondary'
          },
          {
            name : 'sum',
            color: 'tertiary'
          }
        ],
      },
      legend : {
        type : Boolean,
        _text : "Show in map",
      },
      layer : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
      }
    },
  },
  surveyRecords: {
    name:'Survey Records',
    name_ar:"سجلات المسح",
    schema:'surveyLayerAttributes',
    params : '/:collection',
    layerCollection:'surveyLayers',
    storeByLayer:true,
    embedIds : 'feature.properties',
    create: function(self) {
      const state = self.$store.state
      let coords
      console.log(typeof center)
      if (self.linkedFeature) {
        const featureLayers = state._col_surveyLayers.filter(x=>x._id===state._col_surveyLayers_selected)[0].featureLayer
        coords = featureLayers.reduce((acc,i)=>{
          const sel = state._col_features[i].filter(x=>x._id===self.linkedFeature)[0]
          if (sel) {
            acc = center(sel.feature.geometry.coordinates[0])
            console.log('coords', sel.feature.geometry.coordinates, acc)
          }
          return acc
        },null)
      }  else {
        coords = [self.$store.state.map.center.lng, self.$store.state.map.center.lat]
      }

      return {
        feature: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coords
          },
          properties : Object.assign({
            year : new Date().getYear() + 1900,
            _createdDate : new Date(),
            _lastEditedDate : new Date(),
            _createdBy : self.$store.state.activeUser.email,
            _lastEditedBy : self.$store.state.activeUser.email,
          }, self.edited)
        },
        linkedFeature: self.linkedFeature || null
      }
    }
  },
  styles : {
    name:'Styles',
    name_ar:'الأنماط',
    schema : {
      layer : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
      },
      name : {
        type: String,
        required : true,
        _text : "Key",
      },
      _text_en : {
        type : String,
        required : false,
        _text : "Text (English)"
      },
      _text_ar : {
        type : String,
        required : false,
        _text : "Text (Arabic)"
      },
      attribute : {
        type : String,
        required : true,
        _text : "Attribute",
      },
      style : {
        type: mongoose.Schema.Types.Mixed,
        _text : "Style"
      },
    }
  }
  /*
  blocks: {
  name:'Blocks',
  canUpload: true,
  schema : {
  feature: mongoose.Schema.Types.Feature,
  number : Number,
  last_checked : Date,
},
schemaOpts : {
strict: false
},
},
plans: {
name:'Plans',
schema : {
quantities : Array,
timeline : Array,
mavat_code : String,
details_link : String,
housing_units : Number,
number: String,
plan_id: Number,
status_he : String,
status_en : String
},
schemaOpts : {
strict: false
}
}*/
}

function getIndicatorYears(store,figure) {
  if (!figure||!figure.length) return
  const attributeFigure = figure[0].split('.').slice(0,2).join('.')
  return store.getters.allIndicatorKeyYears[attributeFigure]
}

module.exports = config
