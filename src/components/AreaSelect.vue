<template>
    <v-menu v-if="$store.getters.selectedArea" offset-y>
          <template v-slot:activator="{ on }">
            <v-btn class="btn-title px-0 mx-0" flat v-on="on">
              {{ $store.getters.selectedArea.feature.properties.id }}
            </v-btn>
          </template>
          <v-list>
            <v-list-tile
            v-for="(item, index) in $store.getters.selectedAreas"
            :key="index"
            @click="update(item.feature.properties)"
              >
              <v-list-tile-title>{{ item.feature.properties.id }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
    </v-menu>
</template>

<script>
export default {
  data () {
    return {}
  },
  computed : {
  },
  methods : {
    update (properties) {
      this.$store.commit('UPDATE',{
        key:'neighbourhood',
        value: properties.id
      })
      this.$store.commit('UPDATE',{
        key:['map','center'],
        value: {
          lon:properties.Centroids_x,
          lat:properties.Centroids_y
        }
      })
    }
  }
}
</script>

<style scoped>
.btn-title div {
  text-transform:none;
}
</style>
