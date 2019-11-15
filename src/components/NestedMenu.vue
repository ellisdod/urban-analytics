<!-- HTML Template -->

<template>

    <v-menu full-width offset-y absolute>
      <template>
        <v-btn slot="activator" flat small>{{title}}</v-btn>
      </template>

    <v-list dense>
      <template v-for="(val,name,index) in items">

        <v-list-tile v-if="val.value" :key="index" @click="change(val.value)">
          {{val.name}}
        </v-list-tile>

        <v-menu v-else-if="val.items" full-width offset-x max-height="500" :key="name" open-on-hover >
          <v-list-tile slot="activator" @click="">
            <v-list-tile-title>{{val.name}}</v-list-tile-title>
          </v-list-tile>
          <v-list dense>
            <v-list-tile v-for="(j,ind) in val.items " @click="change(name+'.'+j)">
              <v-list-tile-title>{{ j }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>

      </template>

    </v-list>

  </v-list>


</v-menu>

</template>

<script>
//TODO use this https://github.com/websanova/vue-upload

export default {
  props : ['items','title'],
  data () {
    return {}
  },
  methods : {
    change (val) {
      this.$emit('change',val)
    }
  }
}
</script>
