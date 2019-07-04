<template>
  <div>
    <table id="navigator-key">
      <tr id="navigator-header" >
        <td colspan="2">
          <area-select titleclass="title"></area-select>
          <div class="subheading grey--text text--darken-2">
          {{$store.state.navigator.indicator.name}} - {{$store.state.year}}
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
        <td class="key-gradient">
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

    <l-map
    :zoom="$store.state.navigator.zoom"
    :center="$store.state.navigator.center"
    :options="mapOptions"
    id="navigation-map"
    >



    <l-geo-json
    v-for="(item, i) in $store.state._col_areas.filter(x=>x.feature)"
    :key="item._id"
    :geojson="item.feature"
    :options="areasGeoJsonOptions"
    v-bind:options-style="getAreaStyle(item.feature.properties.id)"
    >
  </l-geo-json>
</l-map>


</v-menu>
</div>

</div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup, LTooltip, LPolygon, LGeoJson} from 'vue2-leaflet';
//var vectorTileStyling = require('../../public/mapStyle.js');
import API from '@/api.js'
import chroma from 'chroma-js'
import AreaSelect from 'components/AreaSelect.vue'

//const Vue2LeafletVectorGridProtobuf = require('../../public/Vue2LeafletVectorGridProtobuf.vue');
//var vectorTileStyling = require('../../public/mapStyle.js');
//const vectorTileStyling = require('../../public/mapStyle.js');

export default {
  name: 'MapView',
  components: {
    LMap:LMap,
    LTileLayer:LTileLayer,
    LMarker:LMarker,
    LPopup:LPopup,
    LTooltip:LTooltip,
    LPolygon : LPolygon,
    LGeoJson : LGeoJson,
    AreaSelect : AreaSelect
  },
  data () {
    return {
      zoom: 15,
      center: L.latLng(31.801141899926307,35.18584083885216),
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
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
      },
      areasGeoJsonOptions:{
        onEachFeature: (feature, layer) => {
          var self = this
          //layer.bindPopup('<p><b>'+n.name+'</b></p><p>'+self.$store.state.navigator.indicator.name +': '+n[self.$store.state.navigator.indicator.figure]+'</p>');
          layer.on({
            click : function(e) {
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
              const n = self.$store.getters.indicatorsForSelectedYear.filter(x=>x.areaCode === e.target.feature.properties.id)[0]
              self.details = {
                neighbourhood : n.name,
                value : n[self.$store.state.navigator.indicator.figure],
                key : ''
              }
            },
            mouseout : function(e) {
              self.details = self.detailsDefault
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
    scale () {
      const sorted = this.$store.getters.indicatorsForSelectedYear.map( x =>
        parseInt(x[this.$store.state.navigator.indicator.figure])
      ).sort((a,b)=> a-b);
      console.log('scale sorted', this.$store.state.navigator.indicator.figure, sorted)
      return {
        min : sorted[0] || 0,
        constant : sorted[sorted.length-1] - sorted[0] || 0,
        max : sorted[sorted.length-1] ||0
      }
    }
  },
  methods: {
    getAreaStyle(id){
      const f = chroma.scale(['#eaeaea', this.$vuetify.theme.primary]);
      const area = this.$store.getters.indicatorsForSelectedYear.filter(x=>x.areaCode === id)[0]
      if (!area) return {
        opacity: 0,
        fillOpacity: 0
      }
      const val = area[this.$store.state.navigator.indicator.figure]
      const hex = f( (val - this.scale.min)/this.scale.constant )
      //console.log(id, this.scale,val,hex, (val - this.scale.min)/this.scale.max )
      const lineColor = this.$store.state.neighbourhood === id ? this.$vuetify.theme.tertiary :'#eee'
      const lineWeight = this.$store.state.neighbourhood === id ? 1:1
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
  },
  mounted(){
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
  z-index:10;
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
  width:6px;
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
