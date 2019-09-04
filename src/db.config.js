const mongoose = require('mongoose');

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
         }
      },
   },
   layerAttributes : {
      name : "Attributes",
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
            _options: {component:'Calculator'}
          /*  function(store,edited) {
               //if(!edited.areaLayer)return {}
               const layers = store.state._col_layers
               const layersObj = layers.reduce((acc,x)=>{
                  acc[x._id]=x
                  return acc
               },{})

               const layerAttrs = store.state._col_layerAttributes
               //console.log('options layerAttrs',layerAttrs)
               const areaLayers = layersObj[store.state._col_layers_selected].spatial_intersect

               const filtered = layers.reduce((acc,x)=>{
                  if(x.spatial_intersect.some(a=>areaLayers.indexOf(a)>-1)) acc.push(x._id)
                  return acc
               },[])

               const options = layerAttrs.reduce((acc,att)=>{
                  if (att.func.length > 0) {
                     const index = filtered.indexOf(att.layer)
                     if (index>-1) {
                        const id = filtered[index]
                        acc[id] = acc[id] || { name: layersObj[id].text_en, items : ['count'] }
                        att.func.forEach(func=>{
                           if (func) acc[id].items.push(att.name+'.'+func)
                        })
                     }
                  }
                  return acc
               },{})

               //console.log('categorised options',options)
               return options

            } */
         }
      }
   },
   indicatorSections: {
      name : "Sections",
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
                  name : 'Chart',
               },
               {
                  name :'Table',
               },
               {
                  name :'List',
               },
               {
                  name :'Map',
               },
               {
                  name :'Timeline',
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
      name:'AreasLayers',
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
      layerCollection: 'areaLayers'
   },
   areaAttributes : {
      name:'AreaAttributes',
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
      name : "IndicatorAttributes",
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
      name: "SurveyLayers",
      schema : {
         name : {
            type : String,
            required : true,
            unique : true,
            _text : "Name",
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
         layer : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
         }
      },
   },
   surveyRecords: {
      name:'Survey Records',
      schema:'surveyLayerAttributes',
      params : '/:collection',
      layerCollection:'surveyLayers',
      storeByLayer:true,
   },
   styles : {
      name:'Styles',
      schema : {
         layer : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
         },
         name : {
            type: String,
            required : true,
         },
         attribute : {
            type : String,
            required : true,
         },
         color : String,
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

module.exports = config
