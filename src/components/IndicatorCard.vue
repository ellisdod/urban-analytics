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
  v-else-if="item.type==='Figure' || item.type==='FigureHighlight'"
  :selected="selected"
  :name="item.text"
  :figure="item.figure"
  :description="item.description"
  :attributes="item.mapAttributes"
  :unit="item.unit"
  :year="item.year"
  :type="item.type"
  :compact="compact"
  :dateRange="item.date_range"
  :indicatorBlock="indicatorBlock"
  :showAll="showAll"
  :print="print"
  >
 </indicator-key-stat>

 <bar-chart v-else-if="item.type==='Chart'"
 :figure="item.figure"
 :attributes="item.mapAttributes"
 :unit="item.unit"
 :year="item.year"
 :type="item.type"
 >
 <div class="subheading">{{item.text}}</div>
 <div class="subheading font-weight-light">{{item.description}}</div>
</bar-chart>

 <pie-chart
  v-else-if="item.type==='Pie Chart'"
  :figure="item.figure"
  :outlabels="true"
  :dateRange="item.date_range"
 >{{item.text}}</pie-chart>

 <pie-chart
  v-else-if="item.type==='Percentage'"
  :figure="item.figure"
  :outlabels="false"
  :padding="[0,10,0,10]"
  height="160px"
 ><div class="body-1 font-weight-medium">{{item.text}}</div>
</pie-chart>

  <list-table
  v-else-if="item.type==='List'"
  :figure="item.figure"
  >
  <div class="subheading pb-2 px-3 pt-3 font-weight-medium">{{item.text}}</div>
  </list-table>

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
    v-bind:legendBottom="true"
    >
  </map-view>
</div>
</template>
<script>

import IndicatorKeyStat from './IndicatorKeyStat.vue'
import MapView from './MapView.vue'
import Timeline from './Timeline.vue'
import BarChart from './BarChart.vue'
import PieChart from './PieChart.vue'
import ListTable from './ListTable.vue'

export default {
  components: {
    MapView, IndicatorKeyStat, Timeline, PieChart, ListTable,BarChart
  },
  props: ['selected', 'item','compact','indicatorBlock','showAll', 'print'],
  data () {
    return {
    }
  },
  methods: {
    childClick() {
      this.$emit('childClick','')
    }
  }
}
</script>
