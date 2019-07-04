<template>
  <v-app id="keep" app >

<v-toolbar app light clipped-left flat color="#fff" class="ejmap-border-bottom">
  <v-toolbar-side-icon @click="log()"></v-toolbar-side-icon>

  <v-toolbar-title>
  <div style="margin-bottom:-5px;">Urban Analytics</div>
  <div class="grey--text" style="font-size:0.6em">East Jerusalem</div>
  </v-toolbar-title>

  <v-spacer></v-spacer>

  <v-tooltip v-for="(item,i) in items" bottom :key="i" open-delay="100">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" :to="item.route" icon>
          <v-icon color="grey darken-2">{{ item.icon }}</v-icon>
        </v-btn>
      </template>
      <span>{{item.text}}</span>
  </v-tooltip>



  <v-menu min-width="300" offset-y>
    <template  #activator="{ on: menu }">
      <!--<v-btn @click.prevent="login" flat v-on="on"><v-icon @click.prevent="login" v-on="on">person</v-icon></v-btn>-->
      <v-tooltip bottom open-delay="100">
        <template #activator="{ on: tooltip }">
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title v-if="activeUser" class="grey--text body-1">
                {{ activeUser.email }}
              </v-list-tile-title>
              <v-list-tile-title v-else class="grey--text">
                Login
              </v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn v-on="{...menu,...tooltip}" icon>
              <v-icon color="grey darken-2">person</v-icon>
            </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </template>
        <span>Account</span>
      </v-tooltip>



    </template>

    <v-card>
      <v-list>
        <v-list-tile avatar v-if="activeUser">
          <v-list-tile-content>
            <v-list-tile-title>{{ activeUser.name }}</v-list-tile-title>
            <v-list-tile-sub-title>IPCC</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn v-if="activeUser" color="primary" flat @click="logout">Logout</v-btn>
        <v-btn v-else color="primary" flat @click.prevent="login">Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

</v-toolbar-items>
</v-toolbar>

<v-container v-if="loading">
  <v-layout align-center justify-center row fill-height>
    <div class="text-xs-center">
    <v-progress-circular indeterminate></v-progress-circular>
    <div class="mt-5">Loading data...</div>
  </div>
  </v-layout>
</v-container>

<v-content v-else>
  <router-view style="height:100%;"></router-view>
</v-content>

<!--<div class="pa-3" style="position:absolute;bottom:20px;left:20px;" >
  <img src="../public/undp-logo.svg" width="46px;" style="position:absolute;bottom:20px;"></img>
</div>-->

</v-app>
</template>

<script>
import MapView from './components/MapView.vue'
import MapNavigator from './components/MapNavigator.vue'
import Viewer from './components/Viewer.vue'
import axios from 'axios'


export default {
  name:'App',
  components : {
    MapView, Viewer
  },
  data: () => ({
    loading:true,
    miniNav: true,
    activeUser: null,
    authenticated: false,
    drawerIndicators : false,
    layersPanel:true,
    currentView: 'map-view',
    layers : []
  }),
  computed : {
    items () {
      const actions = [
        { icon: 'help', text: 'About', route: 'help' },
        { icon: 'map', route: 'map', text: 'Map'  },
        { icon: 'bar_chart', text: 'Urban Indicators', route: 'indicators' },
      ];
      const loggedInActions = [
        { icon: 'settings', text: 'Manage Data', route: 'manage' }
      ]
      return this.activeUser ? actions.concat(loggedInActions): actions;
    }
  },
  props: {
    source: String
  },
  async created () {
    await this.refreshActiveUser()
  },
  watch: {
    // everytime a route is changed refresh the activeUser
    '$route': 'refreshActiveUser'
  },
  methods: {
    log(){
      console.log('store',this.$store.state)
    },
    login () {
      this.$auth.loginRedirect()
    },
    async refreshActiveUser () {
      this.activeUser = await this.$auth.getUser()
    },
    async logout () {
      await this.$auth.logout()
      await this.refreshActiveUser()
      this.$router.push('/')
    },
    printUser () {
      console.log('USER')
      console.log(this.activeUser)
      console.log(this.$auth)
    }
  },
  mounted () {
  var layerIds;
  Promise.all([
    this.$store.dispatch('UPDATE_COLLECTION','areaLayers'),
    this.$store.dispatch('UPDATE_COLLECTION','layers')
    ])
  .then(arr=>{
    const areaLayer = arr[0][0]
    layerIds = arr[1].reduce((acc,x)=> {
      acc[x._id] = []
      return acc
    },{})
    console.log('layerIds',layerIds)
    const data = [
    this.$store.dispatch('UPDATE_COLLECTION',{name:'areas',layer:areaLayer._id}),
    this.$store.dispatch('UPDATE_COLLECTION',{name:'indicators',layer:areaLayer._id}),
    this.$store.dispatch('UPDATE_COLLECTION','indicatorSections'),
    this.$store.dispatch('UPDATE_COLLECTION','indicatorBlocks'),
    this.$store.dispatch('UPDATE_COLLECTION','layerCalcs'),
    this.$store.dispatch('UPDATE_COLLECTION','layerAttributes'),
    this.$store.dispatch('UPDATE_COLLECTION','areaAttributes'),
    this.$store.dispatch('UPDATE_COLLECTION','indicatorAttributes'),
    ]

  return Promise.all(data)
  })
  .then(()=> {
    console.log('LOADING COMPLETE')
    this.loading = false
    this.$store.commit('UPDATE',{key:'_col_features',value: layerIds})
  })

  }

}
</script>

<style>

#keep .v-navigation-drawer__border {
  display: none
}

#keep {
  background-color:#f8f9fa
}

.fill {
  width:100%;
  height:100%;
}

#layers-palette {
  position:absolute;
  top:10px;
  left:10px;
  z-index:1;
  border-radius:3px;
}
#layers-palette .theme--light.v-list {
  background:none;
}

#layers-palette .v-list__group--active:before, .theme--light.v-list .v-list__group--active:after {
  background:none;
}

#navigation-btn {
  position:fixed;
  z-index:100;
}


</style>
