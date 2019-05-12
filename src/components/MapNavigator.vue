<template>
  <div>

    <l-map
    :zoom="$store.state.navigator.zoom"
    :center="$store.state.navigator.center"
    :options="mapOptions"
    id="navigation-map"
    >

    <l-geo-json
    v-if="layers.areas"
    v-for="(item, i) in $store.state.geo.areas"
    :key="item._id"
    :options="areasGeoJsonOptions"
    :geojson="item.feature"
    v-bind:options-style="getAreaStyle(item.feature.properties.id)"
    >
  </l-geo-json>
</l-map>


  <table id="navigator-key">
    <tr>
      <td colspan="2" height="40px;" class="title">
        {{$store.state.navigator.indicator.name}}
      </td>
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

</v-menu>
</div>

</div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup, LTooltip, LPolygon, LGeoJson} from 'vue2-leaflet';
//var vectorTileStyling = require('../../public/mapStyle.js');
import API from '@/api.js'
import chroma from 'chroma-js'

//const Vue2LeafletVectorGridProtobuf = require('../../public/Vue2LeafletVectorGridProtobuf.vue');
//var vectorTileStyling = require('../../public/mapStyle.js');
//const vectorTileStyling = require('../../public/mapStyle.js');
import axios from 'axios';

export default {
  name: 'MapView',
  components: {
    LMap:LMap,
    LTileLayer:LTileLayer,
    LMarker:LMarker,
    LPopup:LPopup,
    LTooltip:LTooltip,
    LPolygon : LPolygon,
    LGeoJson : LGeoJson
  },
  data () {
    return {
      zoom: 14,
      center: L.latLng(31.778837,35.243452),
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
      },
      areasGeoJsonOptions:{
        onEachFeature: (feature, layer) => {
          var self = this;
          layer.on({
            click : function(e) {
              self.selectArea(e)
            }
          });
        }
      },
      layers :{
        areas : true
      },
    }
  },
  computed: {
    scale () {
      const sorted = this.$store.getters.dataByYear.map( x =>
        parseInt(x[this.$store.state.navigator.indicator.figure])
      ).sort((a,b)=> a-b);
      return {
        min : sorted[0],
        constant : sorted[sorted.length-1] - sorted[0],
        max : sorted[sorted.length-1]
      }
    }
  },
  methods: {
    getAreaStyle(id){
      const f = chroma.scale(['yellow', 'red']);
      const area = this.$store.getters.dataByYear.filter(x=>x.area_code === id)[0]
      if (!area) return {
        opacity: 0,
        fillOpacity: 0
      }
      const val = area[this.$store.state.navigator.indicator.figure]
      const hex = f( (val - this.scale.min)/this.scale.constant )
      //console.log(id, this.scale,val,hex, (val - this.scale.min)/this.scale.max )
      return {
        weight: 1,
        color: '#eee',
        opacity: 1,
        fillColor: hex,
        fillOpacity: 1,
      }

    },
    selectArea(e) {
      //console.log('selected',e.target.feature.properties.id);
      this.$store.commit('UPDATE',{key:'neighbourhood',value:e.target.feature.properties.id});
      this.$store.commit('UPDATE',{key:['map','zoom'],value:15});
      //console.log('changed',this.$store.state.neighbourhood);
      console.log(e)
      console.log(e.target._map.getCenter());
      this.$store.commit('UPDATE',{
        key:['map','center'],
        value: {
          lon:e.target.feature.properties.Centroids_x,
          lat:e.target.feature.properties.Centroids_y
        }
      })
      //console.log(this.center)
    }
  },
  mounted(){
    //document.getElementsByClassName('leaflet-control-container')[1].style.display = 'none';
    this.$store.watch(
      (state, getters) => state.neighbourhood,
      (newValue, oldValue) => {
        // Do whatever makes sense now
        if (newValue === 9999) {
          this.$store.commit('UPDATE',{key:['map','zoom'],value:12})
          this.$store.commit('UPDATE',{key:['map','center'],value:this.$store.state.map.defaultCenter})
        }
      }
    )
    this.$store.watch(
      (state, getters) => state.navigator.indicator.figure,
      (newValue, oldValue) => {
        this.$store.commit('UPDATE',{key:['navigator','zoom'],value:11})
        this.$store.commit('UPDATE',{key:['navigator','center'],value:this.$store.state.naviagtor.defaultCenter})
      }
    )
  }
  //window.onload = function(){

};

</script>

<style>
@import "../../node_modules/leaflet/dist/leaflet.css";
#navigation-map {
  z-index:0;
  background-color:#eee;
}
.v-toolbar__content, .v-toolbar__extension {
  align-items:start !important;
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
  top:20px;
  left:60px;
  position: absolute;
  z-index:900;
  width:50%;
  height:60%;
}

.key-gradient {
  width:12px;
  height:50%;
  background-image: linear-gradient(red, yellow);
}

#navigator-key td {
  vertical-align:top;
}
.key-max {
  height:90%;
}
td.key-figures {
  padding-left:10px;
  padding-top:0;
}

</style>
