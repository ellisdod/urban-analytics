<template>
  <v-card flat style="border:none;">
    <table v-if="showLegend" id="navigator-key" v-bind:class="{mobile:$vuetify.breakpoint.xsOnly}">
      <tr id="navigator-header" class="hidden-xs-only">
        <td colspan="2">
          <div class="subheading grey--text text--darken-2">
            {{ indicator['text_'+$store.state.language] }} - {{ $store.state.year }}
          </div>
          <div class="caption py-1">
          {{details.neighbourhood}}
          <div style="height:15px;">
          {{details.value}}
        </div>
          </div>
        </td>
      </tr>
      <tr>
      </tr>
      <tr>
        <td class="key-gradient ejmap-border">
        </td>
        <td class="key-figures">
          <div class="key-max">
            {{scale.max.toFixed(0) }}
          </div>
          <div class="key-min">
            {{scale.min.toFixed(0) }}
          </div>
        </td>
      </tr>
    </table>

    <l-map ref="map"
    :zoom="zoom || $store.state.navigator.zoom"
    :center="center || $store.state.navigator.center"
    :options="mapOptions"
    id="navigation-map"
    @click="log()"
    >

    <l-geo-json
    v-if="$store.getters.indicatorsForSelectedYear"
    v-for="(item, i) in $store.state._col_areas.filter(x=>x.feature)"
    :key="item._id"
    :geojson="item.feature"
    :options="areasGeoJsonOptions"
    v-bind:options-style="getAreaStyle(item.feature.properties.areaCode)"
    >
  </l-geo-json>


</l-map>

</v-card>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup, LTooltip, LPolygon, LGeoJson} from 'vue2-leaflet';
//var vectorTileStyling = require('../../public/mapStyle.js');
import API from '@/api.js'
import chroma from 'chroma-js'
//import L from 'leaflet'
import L from 'leaflet'
import mapbox from 'mapbox-gl-leaflet'

//const Vue2LeafletVectorGridProtobuf = require('../../public/Vue2LeafletVectorGridProtobuf.vue');
//var vectorTileStyling = require('../../public/mapStyle.js');
//const vectorTileStyling = require('../../public/mapStyle.js');

export default {
  props: {
    zoom : {
      type : Number
    },
    center : {
      type : Object,
    },
    showBaseMap : {
      default : true,
      type : Boolean
    },
    showLegend : {
      default : true,
      type : Boolean
    },
    showControls : {
      default : true,
      type: Boolean
    },
    showData : {
      default : true,
      type : Boolean
    }
  },
  components: {
    LMap:LMap,
    LTileLayer:LTileLayer,
    LMarker:LMarker,
    LPopup:LPopup,
    LTooltip:LTooltip,
    LPolygon : LPolygon,
    LGeoJson : LGeoJson,
  },
  data () {
    return {
      attribution: '',
      showParagraph: false,
      details:{
        neighbourhood : '',
        value : '',
        key : ''
      },
      detailsDefault : {
        neighbourhood : '',
        value : '',
        key : ''
      },
      mapOptions: {
        zoomSnap: 0.5,
        zoomControl: this.$props.showControls ? true : false,
        attributionControl:false
      },
      areasGeoJsonOptions:{
        onEachFeature: (feature, layer) => {
          var self = this
          const n = self.$store.getters.indicatorsForSelectedYear.filter(x=>x.areaCode === feature.properties.areaCode)[0]
          layer.bindPopup('<p><b>'+
             feature.properties.name+'</b></p><p>'+
             self.indicator['text_'+self.$store.state.langauge] +
             ': '+n[self.indicator.figure[0]]+'</p>'
           )
          layer.on({
            click : function(e) {
              console.log('nnnnn',n)
              const p = e.target.feature.properties
              self.$store.commit('UPDATE',{key:'neighbourhood',value:p.id});
              self.$store.commit('UPDATE',{key:['map','zoom'],value:15});
              //console.log('changed',this.$store.state.neighbourhood);
              console.log('coords',e.target._map.getCenter());
              self.$store.commit('UPDATE',{
                key:['map','center'],
                value: {
                  lon:p.centroid_lng,
                  lat:p.centroid_lat
                }
              })
            },
            mouseover : function(e) {

              /*self.details = {
                neighbourhood : n.name,
                value : n[self.$store.state.navigator.indicator.figure],
                key : ''
              }*/
              e.target.openPopup()
            },
            mouseout : function(e) {
              self.details = self.detailsDefault
              e.target.closePopup()
            }
          })

        }
      },
      layers :{
        areas : true
      },
    }
  },
  computed: {
    indicator() {
      return this.$store.state._col_indicatorBlocks.filter(x=>x._id===this.$store.state._col_indicatorBlocks_selected)[0]
    },
    scale () {
      const sorted = this.$store.getters.indicatorsForSelectedYear.map( x =>
        parseInt(x[this.indicator.figure[0]])
      ).sort((a,b)=> a-b);
      console.log('scale sorted', this.indicator.figure[0], sorted)
      return {
        min : sorted[0] || 0,
        constant : sorted[sorted.length-1] - sorted[0] || 0,
        max : sorted[sorted.length-1] ||0
      }
    }
  },
  methods: {
    log() {
    },
    getAreaStyle(id){
      const selected = this.$store.state.neighbourhood === id
      const f = chroma.scale(['#eaeaea', this.$vuetify.theme.primary]);
      const area = this.$store.getters.indicatorsForSelectedYear.filter(x=>x.areaCode === id)[0]
      if (!area) return {
        opacity: 0,
        fillOpacity: 0
      }
      const val = area[this.indicator.figure[0]]
      let hex,lineColor;
      if (this.showData) {
        hex = f( (val - this.scale.min)/this.scale.constant )
        lineColor = selected ? this.$vuetify.theme.tertiary :'#eee'
      } else if (selected) {
        hex = this.$vuetify.theme.primary
      } else {
        hex = '#fff'
        lineColor = '#555'
      }
      //console.log(id, this.scale,val,hex, (val - this.scale.min)/this.scale.max )
      const lineWeight = selected ? 1:1
      return {
        weight: lineWeight,
        color: lineColor,
        opacity: 1,
        fillColor: hex,
        fillOpacity: 1,
      }

    },
    selectArea(e) {
      //console.log('selected',e.target.feature.properties.id);
      //console.log(this.center)
    },
    mouseoverArea(e) {

    },
    centerMap() {
      const lng = 35.1300 - ((window.innerWidth - 800) * 0.00016175)
      console.log('navigation lng',lng)
      this.$store.commit('UPDATE',{
        key:['navigator','center'],
        value: {
          lon:lng,
          lat:this.$store.state.navigator.center.lat
        }
      })
    }
  },
  mounted(){
    this.$refs.map.mapObject.on('click', function(e) {  console.log(e) })
    this.$refs.map.mapObject.zoomControl.setPosition('bottomright')


    this.$refs.map.mapObject.eachLayer(function(l){
        console.log('maplayer2',l)
        //l.sendToBack()
      })



    this.$nextTick(()=>{
      const map = this.$refs.map.mapObject
      //const tileLayer = map._layers[tileLayerId]
      //console.log('tilelayer',tileLayer)
      console.log('panes',map.getPanes())
      map.createPane('leaflet-top-pane', map.getPanes().mapPane)
      var topPane = map.getPane('leaflet-top-pane')
      topPane.style.zIndex=1000;
      topPane.style.pointerEvents = 'none';
      map.getPanes().popupPane.style.zIndex=1010;
      //topPane.appendChild(tileLayer.getPane());
      if (this.showBaseMap) L.mapboxGL({
            attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
            accessToken: 'not-needed',
            pane:'leaflet-top-pane',
            style: 'https://api.maptiler.com/maps/2785ad5b-ec8f-4c26-b65b-0fd7a95f2a2e/style.json?key=ArAI1SXQTYA6P3mWFnDs'
          }).addTo(this.$refs.map.mapObject)

      //console.log('maplayers',this.$refs.map.mapObject._layers)
    })




    /*for (var key in layers) {
      console.log('maplayer',layers[key])
    }
    console.log(Array.isArray(layers))
*/

    //console.log('map', this.$refs.map.mapObject.zoomControl) //setPosition('bottomright')
    //800 = (35.1400 - 35.0753) / 400
    //1200 = 35.0753

    if (this.$vuetify.breakpoint.xsOnly) {
      this.$store.commit('UPDATE',{key:['navigator','zoom'],value:11})
      this.$store.commit('UPDATE',{key:['navigator','center'],value:this.$store.state.map.defaultCenter})
    } else {
      //this.centerMap()
    }



    //document.getElementsByClassName('leaflet-control-container')[1].style.display = 'none';
    //onsole.log('navmapdata',this.$store.state._col_areas.filter(x=>x.feature))
    /*
    this.$store.watch(
      (state, getters) => state.neighbourhood,
      (newValue, oldValue) => {
        // Do whatever makes sense now
        if (newValue === 9999) {
          this.$store.commit('UPDATE',{key:['map','zoom'],value:12})
          //this.$store.commit('UPDATE',{key:['map','center'],value:this.$store.state.map.defaultCenter})
        }
      }
    )
    this.$store.watch(
      (state, getters) => state.navigator.indicator.figure,
      (newValue, oldValue) => {
        this.$store.commit('UPDATE',{key:['navigator','zoom'],value:11})
        //this.$store.commit('UPDATE',{key:['navigator','center'],value:this.$store.state.navigator.defaultCenter})
      }
    )
    */
  }

  //window.onload = function(){

};

</script>

<style>
@import "../../node_modules/leaflet/dist/leaflet.css";
#navigation-map {
  z-index:1;
  background:none;
}
.highlighted {
  background-color:#e8e8e8;
}

.v-label {
  font-size: 13px;
}

.leaflet-bar a {
  background-color:#fff0;
  border-bottom:none;
}

#navigator-key {
  position: absolute;
  z-index:2;
  left:20px;
  top:20px;
}

#navigator-key.mobile {
  left:16px !important;
  top:60px !important;
}

#navigation-map .leaflet-control-container .leaflet-top {
  bottom:0;
  top:auto;
}
#navigator-header {
  height:70px !important;
  max-height:70px !important;
  overflow:visible;
  white-space: nowrap;
}
.key-gradient {
  width:8px;
  height:150px;
  background-image: linear-gradient(var(--v-primary-base), #eaeaea);
}

#navigator-key td {
  vertical-align:top;
  max-width:10px;
  overflow:visible;
}
.key-max {
  height: 130px;
}
td.key-figures {
  padding-left:10px;
  padding-top:0;
}
.leaflet-popup-content-wrapper {
  background:rgba(0,0,0,0.8);
  border-radius:5px;
  shadow:none;
  padding:4px 2px;
}
.leaflet-popup-content {
  padding:0px;
  margin: 0 5px;
  color:#fff;
}
.leaflet-popup-content p {
  margin:0;
}
.leaflet-popup-tip-container{
  margin-left: -10px;
}
.leaflet-popup-tip {
    height: 11px;
    margin: -10px auto 0;
}

</style>
