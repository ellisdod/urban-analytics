<template>
  <div>
    <v-select
    v-if="!hideControls&&attributes"
    style="width:100%;margin-top:-10px;"
    class="caption grey--text pt-1"
    color="grey"
    :items="Object.keys(attributes)"
    :value="attributeName"
    @change="function(e){updateFilter('attribute',e)}"
    ></v-select>

    <div v-if="attribute&&attribute.range" class="caption">

      <v-range-slider
        class="px-2 scale-gradient"
        v-if="attribute&&attribute.range"
        v-model="range"
        :min="rangeMin"
        :max="rangeMax"
        track-color="rgba(0,0,0,0)"
        @end="function(e){updateFilter('range',range)}"
     ></v-range-slider>

    <div style="margin-top:-15px;">
      <span>{{range[0]}}</span>
      <span style="float:right;">{{range[1]}}</span>
    </div>

    </div>

    <div v-if="valueStyles&&Object.keys(valueStyles).length>1" class="caption font-weight-medium">{{layer.text_en}}</div>
    <div v-for="(val,index) in valueStyles" :key="index" style="background-color:none;!important" class="caption px-0">
        <v-switch
        v-if="!small"
        :color="val.style ? val.style.fillColor : '#e3e3e3'"
        :input-value="val.on"
        @change="updateFilterObject('categories',val.name,$event)"
        :label="val.name === '__d' ? layer.text_en : val['_text_'+$store.state.language] || val.name">
      </v-switch>
        <div v-else style="width:100%;display:inline-block;float:left;">
         <div v-if="val.style"
         v-bind:class="[{'legend-icon-point':isPoint,'legend-icon-line':isLine},'legend-icon']"
         v-bind:style="{
             background: val.style.fillColor,
             borderWidth: val.style.borderWidth+'px',
             borderColor: val.style.borderColor,
             }"></div>
         <span class="caption">{{  val['_text_'+$store.state.language] ||  (val.name === '__d' ? layer.text_en : val.name)  }}</span>
        </div>
    </div>


  </div>
</template>

<script>

export default {
  props: ['layer','attributeName','attributes','small','hideControls'],
  data () {
    return {
      range : [],
      fillOpacity : this.layer.fillOpacity*100,
      strokeOpacity: this.layer.strokeOpacity*100,
      rangeMin : '',
      rangeMax : '',
    }
  },
  computed : {
    attribute () {
      return this.attributes[this.attributeName]
    },
    isPoint () {
       return this.layer.data_type === 'Point'
    },
    isLine () {
      return this.layer.data_type.indexOf('Line') > -1
    },
    valueStyles () {
      if (!this.$store.getters.styles[this.layer._id]) return {}
      return this.$store.getters.styles[this.layer._id][this.attributeName]
    }
  },
  methods : {
    updateLayer(key,e) {
      //console.log('updtelayer',{key:key,value:e})
      this.$emit('layerChange', {key:key,value:e})
    },
    updateFilter(key,e) {
      //console.log('updtelayer',{key:key,value:e})
      this.$emit('filterChange', {key:key,value:e})
    },
    updateFilterObject(key,objKey,objVal) {
      const obj = {}
      obj[objKey] = objVal
      this.updateFilter(key,obj)
    },
    setRange() {
      console.log('setting range')
      if (!this.attribute||!this.attribute.range) return
      this.rangeMin = this.attribute.range.defaultMin
      this.rangeMax = this.attribute.range.defaultMax
      this.range = [this.rangeMin,this.rangeMax].slice(0)
    },
    toggleFeature(e,key) {
      this.$emit('input', {
        val:e,
        attribute:key,
        range:this.range
      })
    },
  },
  watch : {
    attributeName : function(newVal,oldVal) {
      this.setRange()
    }
  },
  mounted () {

    this.setRange()

    //console.log(this.legend,this.items)
  },
}
</script>
<style>
#map-legend {
  width:20%;
  left:auto;
  max-width:300px;
  min-width:200px;
  color: var(--v-grey-darken2);
  display:flex;
  flex-flow: column;
  flex-direction:column;
}

#map-legend .v-slider__track__container, #map-legend .v-slider__track, #map-legend .v-slider__track, #map-legend  .v-slider__track-fill {
  height:5px;
}

#map-legend .v-slider__track__container {
  border: 1px solid #e3e3e3
}

#map-legend .scale-gradient.theme--light.v-input--slider .v-slider__track-fill {
  background-image: linear-gradient(to left, var(--v-scaleMin-base),var(--v-scaleMax-base))
}

#map-legend div.v-slider__thumb {
  background-color: var(--v-background-darken1) !important;
  border: 1px solid #e3e3e3;
  border-color:var(--v-grey-lighten1) !important;
}

#map-legend .v-label {
  font-size: 12px;
  left: 6px !important;
}
#map-legend .theme--light.v-list {
  background:none;
}
#map-legend .v-input--switch__thumb {
  height:16px;
  width:16px;
  top: calc(50% - 8px);
  right: 0px;
  box-shadow:none;
  border:1px solid var(--v-grey-lighten1) !important;
}

#map-legend .v-input--selection-controls {
  margin-top: 0;
  padding-top: 0;
}
#map-legend .v-input--switch .v-input--selection-controls__input {
  width:30px;
}

#map-legend .v-input--selection-controls__ripple {
  display:none
}

#map-legend .theme--light.v-input--switch__track {
    color: rgba(0,0,0,0) !important;
    border:1px solid var(--v-grey-lighten1) !important;
}

#map-legend .v-messages {
  min-height:4px;
}

#map-legend .v-list__tile {
  height:auto;
}
#map-legend .v-expansion-panel__header__icon {
  display: none;
}
#map-legend .v-expansion-panel__header:hover{
  background-color:#eee;
}
#map-legend .v-expansion-panel__container{
  border-top:none;
  background:none;
}
#map-legend .v-expansion-panel__container--active {
  /*border-top:1px solid #e3e3e3;
  border-bottom:1px solid #e3e3e3;*/
}
#map-legend .v-expansion-panel__container--active .v-expansion-panel__header{
  color:var(--v-primary-base);
  font-weight:700;
}
#map-legend .v-expansion-panel {
  box-shadow: none;
}

#map-legend .v-card {
  background: none;
  box-shadow:none;
}

#map-legend div.label {
  margin-top:10px;
  margin-bottom:-10px;
}

.leaflet-bar a:hover {
    background-color: #0000001c !important;
}

.legend-icon {
  display:inline-block;
  height:12px;
  width: 24px;
  margin-right:5px;
  margin-bottom:-3px;
  border:solid;
}

.legend-icon-point {
  width: 12px;
  margin-right:11px;
  margin-left:6px;
  border-radius: 50%;
}
.legend-icon-line {
  border-top: none;
  border-left: none;
  border-right: none;
}


</style>
