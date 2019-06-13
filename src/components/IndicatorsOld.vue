<template>
  <div class="section">
    <div id="indicators-panel" class="ejmap-border-right">
      <v-container id="indicators-header" px-5>
        <div style="padding-left:20px;">
          <span class="title text-uppercase grey--text">East Jerusalem</span>
          <span class="title text-uppercase">&nbsp;| URBAN INDICATORS</span>
        </div>
        <v-layout row wrap pb-2 pt-2>
          <v-flex xs12>
            <v-menu max-height="300px" offset-y>
              <template v-slot:activator="{ on }">
                <v-btn v-if="$store.getters.dataByHoodYear" class="btn-title display-1 px-0 mx-0" flat v-on="on">
                  {{ $store.getters.dataByHoodYear.name }}
                </v-btn>
              </template>
              <v-list>
                <v-list-tile
                v-for="(item, index) in $store.getters.areaSelect"
                :key="index"
                @click="$store.commit('UPDATE_AREA', item.area_code)"
                >
                <v-list-tile-title v-if="item.name">{{ item.name }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-flex>
        <v-flex xs>
          <v-select
          v-model="$store.state.year"
          :items="$store.getters.years">
        </v-select>
      </v-flex>
      <v-spacer/>
      <v-btn :color="$store.state.theme.primary"
      round depressed dark small
      @click=""
      >East Jerusalem</v-btn>

    </v-layout>
  </v-container>
  <v-tabs
    v-model="activeTab"
    light
    color="#fff0"
    slider-color="black"
    >
    <v-tab
        v-for="i in items"
        ripple
        @click="$store.commit('UPDATE',{key:'tab',value:i.value})"
    >
      {{i.name_en}}
    </v-tab>
    <v-tab-item
        v-for="i in items"
        class="indicators-content-wrapper"
      >

  <!-- items -->
   <!--<v-container id="indicators-content">-->
   <v-container class="indicators-content" px-5>
    <div v-for="item in i.items">
     <template v-if="$store.state.tab === i.value">

      <div v-if="item.datatable" class="py-3">
        <v-divider/>
        <div class="title py-3">{{item.name}}</div>
      <v-data-table :items="item.data" :headers="item.headers" :rows-per-page-items="[-1]">
        <template v-slot:items="props">
        <td v-for="header in item.headers">{{ props.item[header.value] }}</td>
       </template>
      </v-data-table>
    </div>

      <indicator-key-stat v-else-if="item.keystat"
      :name="item.name"
      :figure="item.figure"
      :description="item.description"
      :unit="item.unit"
      :year="item.year"
      >
    </indicator-key-stat>

    <v-layout row wrap v-else-if="item.blocks">

      <v-flex xs8 py-4 pr-4>
        <div class="title">{{item.left[0].name}}</div>
        <bar-vertical
        style="margin-left:-20px;height:320px;"
        v-bind:x-labels="true"
        v-bind:y-labels="true"
        v-bind:chart-data="{
          datasets:item.left[0].datasets,
          labels:item.left[0].labels
          }">
        </bar-vertical>

      </v-flex>
      <v-flex xs4>
        <indicator-key-stat
        v-for="i in item.right"
        :name="i.name"
        :figure="i.figure"
        :description="i.description"
        :unit="i.unit"
        small="true"
        :year="item.year"
        >
      </indicator-key-stat>
    </v-flex>
  </v-layout>
</template>
</div>
</v-container>
<!-- items-end -->

</v-tab-item>
</v-tabs>

</div>

<map-view id="map-panel-main" class="ejmap-border-right"></map-view>
<map-navigator id="map-panel-navigator"></map-navigator>
<div id="info-panel">
<div id="photos">
  <img v-for="img in images" :src="img.src">
</div>
</div>

</div>

</template>

<script>
import BarHorizontal from '../plugins/barHorizontal.js'
import BarVertical from '../plugins/barVertical.js'
import IndicatorKeyStat from './IndicatorKeyStat.vue'
import IndicatorHeading from './IndicatorHeading.vue'
import colors from 'vuetify/es5/util/colors'
import {indicators} from '../plugins/indicators.js'
import {translate} from '../plugins/translate.js'
import MapView from 'components/MapView.vue'
import MapNavigator from 'components/MapNavigator.vue'
import axios from 'axios'

export default {
  components: {
    MapView, MapNavigator, BarHorizontal,BarVertical, IndicatorKeyStat, IndicatorHeading
  },
  data () {
    return {
      activeTab: null,
      selectedData : this.$store.getters.selected,
      images: [
        {src:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/City_of_david2.jpg/250px-City_of_david2.jpg'},
        {src:'https://skipschiel.files.wordpress.com/2012/04/palestine-silwan-jerusalem-4784.jpg?w=500&h=332'},
        {src:'https://www.archaeology.wiki/wp-content/uploads/2015/07/city-of-david.jpg'},
        {src:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/City_of_david2.jpg/250px-City_of_david2.jpg'},
        {src:'https://skipschiel.files.wordpress.com/2012/04/palestine-silwan-jerusalem-4784.jpg?w=500&h=332'},
        {src:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLksyW4wJAs2CTuQ44r-69sedNmMOgbe-jYaR4fAEeoaHKgPikVA'},
        {src:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/City_of_david2.jpg/250px-City_of_david2.jpg'},
        {src:'https://skipschiel.files.wordpress.com/2012/04/palestine-silwan-jerusalem-4784.jpg?w=500&h=332'},
        {src:'https://www.archaeology.wiki/wp-content/uploads/2015/07/city-of-david.jpg'},
        {src:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/City_of_david2.jpg/250px-City_of_david2.jpg'},
        {src:'https://skipschiel.files.wordpress.com/2012/04/palestine-silwan-jerusalem-4784.jpg?w=500&h=332'},
        {src:'https://www.archaeology.wiki/wp-content/uploads/2015/07/city-of-david.jpg'}
      ]
    }
  },
  computed: {
    items () {
      return translate(indicators(this.$store), ['name','description'], this.$store.state.language);
    }
  },
  methods: {
  },
  mounted () {
    this.$store.commit('GET_INDICATORS');
    //this.indicators = indicators(this.$store);
    //console.log(this.indicators)
    //console.log('databyneigh', this.$store.getters.dataByNeighbourhood)
    //console.log('databyneigh', this.$store.getters.dataByYear)
    console.log(this.$store.getters.educationalByHood)
  }
}
</script>

<style>
.small {
  max-width: 600px;
  margin: auto;
}
.bar-chart-minimal {
  height:100px;
}
.bar-chart-minimal-small {
  height:80px;
}
.btn-title div {
  text-transform:none;
}
#map-panel-main{
  left:40%;
  height:100%;
  width:40%;
  top:0;
}
#map-panel-navigator{
  left:80%;
  height:80%;
  width:20%;
}
#info-panel{
  display:none;
  left:75%;
  height:50%;
  width:25%;
  background-color:#333;
}
#map-panel-main,  #map-panel-navigator, #info-panel{
  position:fixed;
}
#indicators-header,.indicators-content {
  width:100%;
  background-color:inherit;
  margin:0;
}
#indicators-header {
  border-bottom: 1px solid #e3e3e3;
  padding-bottom:0;
}
.indicators-content {
  padding-top:0;
  background-color:rgb(250, 250, 250);
  flex:2;
}
.indicators-content-wrapper {
  overflow-x:hidden;
  overflow-y:auto;
  height:70vh;
}

#indicators-panel {
  position:fixed;
  width:40%;
  height:100%;
}
.ejmap-border-right {
  border-right:1px solid #e3e3e3;
}
.ejmap-border-bottom {
  border-bottom:1px solid #e3e3e3 !important;
}
.ejmap-border-top {
  border-top:1px solid #e3e3e3 !important;
}


#photos {
  /* Prevent vertical gaps */
  line-height: 0;

  -webkit-column-count: 5;
  -webkit-column-gap:   0px;
  -moz-column-count:    5;
  -moz-column-gap:      0px;
  column-count:         5;
  column-gap:           0px;
}

#photos img {
  /* Just in case there are inline attributes */
  width: 100% !important;
  height: auto !important;
}
@media (max-width: 1200px) {
  #photos {
  -moz-column-count:    4;
  -webkit-column-count: 4;
  column-count:         4;
  }
}
@media (max-width: 1000px) {
  #photos {
  -moz-column-count:    3;
  -webkit-column-count: 3;
  column-count:         3;
  }
}
@media (max-width: 800px) {
  #photos {
  -moz-column-count:    2;
  -webkit-column-count: 2;
  column-count:         2;
  }
}
@media (max-width: 400px) {
  #photos {
  -moz-column-count:    1;
  -webkit-column-count: 1;
  column-count:         1;
  }
}

</style>
