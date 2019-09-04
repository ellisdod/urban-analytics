<template>
  <div v-if="item.datatable" class="py-3">
    <v-divider/>
    <div class="title py-3">{{item.name}}</div>
    <v-data-table :items="item.data" :headers="item.headers" :rows-per-page-items="[-1]">
      <template v-slot:items="props">
        <td v-for="header in item.headers">{{ props.item[header.value] }}</td>
      </template>
    </v-data-table>
  </div>

  <!-- KEYSTAT -->
  <indicator-key-stat
  v-else-if="item.type==='Figure' || item.type==='List' || item.type==='Chart'"
  :selected="selected"
  :name="item.text"
  :figure="item.figure"
  :description="item.description"
  :unit="item.unit"
  :year="item.year"
  :type="item.type"
  :compact="compact"
  @childClick="childClick"
  >
 </indicator-key-stat>

<!-- MAP -->
<div v-else-if="item.type==='Map'">
    <div class="subheading font-weight-light mb-2 mt-5 px-2 ejmap-border-bottom" style="">{{item.text}}</div>
    <map-view
    contextmenu=""
    style="position:relative;"
    featuresCollection="features"
    zoomLevel="12"
    height="400px"
    :featureLayers="item.figure"
    v-bind:areas="true"
    class="ejmap-border"
    >
  </map-view>
</div>
</template>
<script>

import IndicatorKeyStat from './IndicatorKeyStat.vue'
import MapView from './MapView.vue'
import Timeline from './Timeline.vue'

export default {
  components: {
    MapView, IndicatorKeyStat, Timeline
  },
  props: ['selected', 'item','compact'],
  data () {
    return {
    }
  },
  methods: {
    childClick() {
      this.$emit('childClick')
    }
  }
}
</script>
