features : {
  text_en : 'Features',
  uploadLayer : this.$store.state['_col_layers_selected'],
  uploadLayerCol : 'layers',
  filter : {
    collection : 'layers',
    listKey : 'data_type'
  },
  map : {
    featuresCollection : 'features',
    featureLayers : '$store.state._col_layers_selected'
  },
  tables : [
    {
      type: 'datalist',
      heading: 'Attributes'
      collection:'layerAttributes',
      filter:'layers',
    },
    {
      type: 'datalist',
      heading: 'Calculations',
      collection:'layerCalcs',
      filter:'layers',
    },
    {
      type: 'datalist',
      heading: 'Features Table',
      multiselect :true,
      collection:'features',
      filter:'layers',
      nestedPath:'feature.properties'
    }
  ]
},
areas : {
  text_en : 'Areas',
  uploadLayer : 'areas',
  uploadLayerCol  : 'areaLayers',
  filter : {
    collection : 'areaLayers',
  },
  map : {
    featuresCollection : 'areas',
  },
  tables : [
    {
      type: 'datalist',
      heading: 'Attributes'
      collection:'areaAttributes',
      filter:'areaLayers',
    },
    {
      type: 'datalist',
      heading: 'Areas',
      collection:'areas',
      filter:'areaLayers',
      multiselect :true,
      nestedPath:'feature.properties'
    }
  ]
},
indicatorAttributes : {
  text_en : 'Indicators',
  uploadLayer : this.$store.state['_col_areaLayers_selected'],
  uploadLayerCol : 'areaLayers',
  filter : {
    collection : 'areaLayers',
  },
  map : {
    featuresCollection : 'areas',
  },
  tables : [
    {
      type: 'datalist',
      heading: 'Attached Attributes'
      collection:'indicatorAttributes',
      filter:'areaLayers',
    },
    {
      type: 'json',
    }
  ]
},
indicatorSections : {
  text_en : 'Sections',
  filter : {
    collection : 'indicatorSections',
  },
  tables : [
    {
      type: 'datalist',
      heading: 'Attached Attributes'
      collection:'indicatorAttributes',
      filter:'areaLayers',
    },
    {
      type: 'datalist',
      heading: 'Attached Attributes'
      collection:'indicatorBlocks',
      filter:'indicatorSections',
      addbottom:true
    }
  ]
},
surveys : {
  text_en : 'Surveys',
  uploadLayer : this.$store.state['_col_surveyLayers_selected'],
  uploadLayerCol : 'surveyLayers',
  filter : {
    collection : 'surveyLayers',
    listKey : 'data_type'
  },
  map : {
    featuresCollection : 'surveyFeatures',
    featureLayers : '$store.state._col_surveyLayers_selected'
  },
  tables : [
    {
      type: 'datalist',
      heading: 'Questions'
      collection:'surveyLayerAttributes',
      filter:'surveyLayers',
    },
    {
      type: 'datalist',
      heading: 'Survey Results',
      multiselect :true,
      collection:'surveyRecords',
      filter:'surveyLayers'
    }
  ]
},
