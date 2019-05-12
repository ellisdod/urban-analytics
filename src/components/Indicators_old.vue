<template>
  <v-container grid-list-lg style="max-width:600px;">
    <v-layout row wrap py-4>
      <v-flex xs12>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn class="btn-title display-2 px-0 mx-0" flat v-on="on">
              {{ $store.state.neighbourhood }}
            </v-btn>
          </template>
          <v-list>
            <v-list-tile
            v-for="(item, index) in $store.getters.neighbourhoods"
            :key="index"
            @click="$store.commit('UPDATE',{
              key:'neighbourhood',
              value: item
              })"
              >
              <v-list-tile-title>{{ item }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-flex>
      <v-flex xs4>
        <v-select
        v-model="$store.state.year"
        :items="$store.getters.years">
      </v-select>
    </v-flex>
  </v-layout>

  <indicator-heading text="Demographics"/>

  <v-layout row>
      <indicator-key-stat
      name="Population"
      figure="pop_year_end"
      description=""
      >
    </indicator-key-stat>
 </v-layout>

<v-layout row wrap>
  <v-flex xs8>
    <bar-chart
    v-bind:x-labels="true"
    v-bind:y-labels="true"
    v-bind:chart-data="prepDstrChartData(
       $store.getters.dataByHoodYear.age_distribution,
       $store.getters.dataByHoodYear.age_distribution_labels
       )">
  </bar-chart>
</v-flex>
<v-flex xs4>
  <indicator-key-stat
  name="Median Age"
  figure="age_median"
  description=""
  v-bind:small="true"
  >
</indicator-key-stat>
<indicator-key-stat
name="Youth Dependency"
figure="dependency_youth"
description="Aged 24 or under"
unit="%"
v-bind:small="true"
>
</indicator-key-stat>
</v-flex>
</v-layout>

<v-layout row>
<v-flex xs12>
<indicator-key-stat
name="Propulation Growth"
figure="growth_total"
v-bind:description="'For year ('+$store.state.year+')'"
unit="%">
</indicator-key-stat>

<indicator-heading text="Housing"/>
<indicator-key-stat
name="Housing Units"
figure="dwellings_total"
description=""
unit="">
</indicator-key-stat>

<indicator-key-stat
name="Avg. Household Size"
figure="household_size"
description="Persons per housing unit"
unit="">
</indicator-key-stat>

</v-flex>
</v-layout>

<v-layout row>
<bar-chart
v-bind:x-labels="true"
v-bind:y-labels="true"
v-bind:chart-data="prepDstrChartData(
   $store.getters.dataByHoodYear.dwelling_area_distribution,
   ['0-40','41-60','61-80','81-100','101-140','141+']
   )">
</bar-chart>
<indicator-key-stat
name="New Housing Units"
figure="dwellings_new"
v-bind:description="'Constructed in '+$store.state.year"
unit=""
small="true"
>
</indicator-key-stat>

<indicator-key-stat
name="Housing Unit Growth"
figure="dwelling_growth"
v-bind:description="'For year ('+$store.state.year+')'"
unit="%"
small="true"
>
</indicator-key-stat>
</v-layout>

</v-container>
</template>

<script>
import BarChart from '../plugins/barchart.js'
import IndicatorKeyStat from './IndicatorKeyStat.vue'
import IndicatorHeading from './IndicatorHeading.vue'
import colors from 'vuetify/es5/util/colors'

export default {
  components: {
    BarChart, IndicatorKeyStat, IndicatorHeading
  },
  data () {
    return {
      datacollection: null,
      selectedData : this.$store.getters.selected,
    }
  },
  computed: {
    popYearEnd () {
      return this.prepBarChartData('pop_year_end', this.$store.state.neighbourhood)
    },
    growthTotalChart () {
      return this.prepBarChartData('growth_total', this.$store.state.neighbourhood)
    },
    dwellingGrowthChart () {
      return this.prepBarChartData('dwelling_growth', this.$store.state.neighbourhood)
    }

  },
  methods: {
    prepDstrChartData(data,labels,color){
      return {
        labels: labels,
        datasets :[{
          label: 'Data One',
          backgroundColor:color||colors.grey.lighten3,
          data: data
        }]
      }
    },
    getRandomInt () {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    },
    log (x) {
      console.log('YES')
      console.log(x)
    }
  },
  mounted () {
    this.$store.commit('GET_INDICATORS');
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
</style>
