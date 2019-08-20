<!-- HTML Template -->

<template>
    <v-layout row wrap>
      <v-flex xs12 py-4 v-for="(item, i) in items">
        <div class="title pb-2">{{item.heading}}</div>
        <div class="subheading" style="white-space:pre-wrap;">{{item.text}}</div>
        <vue-json-pretty
        class="pa-3 my-2 code"
        v-if="item.code"
      :data="item.code">
      </vue-json-pretty>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'

//TODO use this https://github.com/websanova/vue-upload

export default {
  components: {
    VueJsonPretty
  },
  data() {
    return {
      itemsX : [{heading : "Features"},{heading : "Features"},{heading : "Features"}],
      items : [{
          heading : "Features",
          text: "Spatial data points (either points, polygons or lines) with attribute information including which feature layer it is associated with.",
          code: {
            type: 'point',
            geometry: [],
            properties:
            {
              year: 2015,
              feature_layer: 'education',
              type: 'college',
              students: 500,
              gender: 'mixed',
              quality_rating: 10
            }
          }
        },
        {
          heading : "Feature Layers",
          text: "Feature layers determine the layer type and methods of analysis to be performed on it.",
          code: {
            name: 'education',
            type: 'point',
            columns: {
              type : {
                type: 'string',
                func: 'count'
              },
              students : {
                type: 'integer',
                func: 'sum'
              },
              gender : {
                type: 'string',
                func: 'count'
              },
              quality_rating : {
                type: 'integer',
                func: 'average'
              }
            }
          }
        },
        {
          heading: "Areas",
          text: "Statistical areas with which the features should be grouped for analysis"
        },
        {
          heading: "Area Indicators",
          text: "Area indicators include the results of spatial analysis between the Areas and Features and any additional secondary data e.g from JIIS"
        },
        {
          heading: "Surveys",
          text: "Surveys are extensions of Feature Layers that can be used for collecting field data.\n\nSurveys can use an existing Feature Layer as a template or create a new one."+
          " In most cases spatial data will need to be uploaded in advance of the conducting the survey.However, point data can be added live via the survey map"
        }
      ]
    }
  }
  }
  </script>
