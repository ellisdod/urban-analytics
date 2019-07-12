const mongoose = require('mongoose');

module.exports = {
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
         sourceUrl : {
            type : String,
            _text : "Source Link",
         },
         sourceLong : {
            type : String,
            _text : "Source - Full Text",
         },
         sourceShort : {
            type : String,
            _text : "Source - Short Text",
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
            _options : [
               {
                  name : 'String',
               },
               {
                  name : 'Number',
               },
               {
                  name : 'Boolean',
               }
            ]
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
            _options : [
               {
                  name : 'String',
               },
               {
                  name : 'Number',
               },
               {
                  name : 'Boolean',
               }
            ]
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
            _options: function(store,edited) {
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

            }
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

               const replaceString = '%%%'
               const areaKey = 'attached'

               const layers = store.state._col_layers

               if (edited.type==='Map') {
                  return layers.reduce((acc,x)=>{
                  acc.push({'name': x.text_en,'value':x._id})
                  return acc
               },[])
               } else if (!edited.areaLayer) {
               return {error:{name:'First select a spatial intersect',value:'error'}}
               }

               const layersObj = layers.reduce((acc,x)=>{
                  acc[x._id]=x
                  return acc
               },{'attached':{text_en:'Area'}})

               const areaAttrs = store.state._col_indicatorAttributes.map(x => {
                  x.func = [replaceString]
                  x.layer = areaKey
                  return x
               })

               const layerCalcs = store.state._col_layerCalcs.map(x => {
                  x.func = [replaceString]
                  return x
               })
               const layerAttrs = layerCalcs.concat(store.state._col_layerAttributes).concat(areaAttrs)

               console.log('options layerAttrs',layerAttrs)

               const filtered = layers.reduce((acc,x)=>{
                  if(x.spatial_intersect.some(a=>edited.areaLayer.indexOf(a)>-1)) acc.push(x._id)
                  return acc
               },[areaKey])

               const options = layerAttrs.reduce((acc,att)=>{
                  if (att.func.length > 0) {
                     const index = filtered.indexOf(att.layer)
                     if (index>-1) {
                        const id = filtered[index]
                        acc[id] = acc[id] || { name: layersObj[id].text_en, items : [] }
                        att.func.forEach(func=>{
                           if (func) acc[id].items.push((att.name+'.'+func).replace('.'+replaceString,''))
                        })
                     }
                  }
                  return acc
               },{})

               console.log('categorised options',options)
               return options

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
      canUpload: true,
      storeByLayer : true,
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
            _options : [
               {
                  name : 'String',
               },
               {
                  name : 'Number',
               },
               {
                  name : 'Boolean',
               }
            ]
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
            _options : [
               {
                  name : 'String',
               },
               {
                  name : 'Number',
               },
               {
                  name : 'Boolean',
               }
            ]
         },
         required : {
            type : Boolean,
            _text : "Required",
         },
         layer : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
         }
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
            _options : function(store) {
               return store.state._col_layers
            }
         }
      }
   },
   surveyLayerAttributes : {
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
            _options : [
               {
                  name : 'String',
               },
               {
                  name : 'Number',
               },
               {
                  name : 'Boolean',
               }
            ]
         },
         required : {
            type : Boolean,
            _text : "Required",
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
   }
}
