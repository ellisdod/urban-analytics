<template>
  <v-app id="keep" app >

<v-toolbar app light clipped-left flat color="#fff" class="ejmap-border-bottom">
  <img src="../public/ejmap-logo.svg" @click="log()">

  <v-toolbar-title>
  <div style="margin-bottom:-5px;">Urban Analytics</div>
  <div class="grey--text" style="font-size:0.6em">East Jerusalem</div>
  </v-toolbar-title>

  <v-spacer></v-spacer>

  <v-tooltip v-for="(item,i) in items" bottom :key="i" open-delay="100">
      <template v-slot:activator="{ on }">
        <v-btn class="hidden-xs-only" v-on="on" :to="item.route" icon>
          <v-icon color="grey darken-1">{{ item.icon }}</v-icon>
        </v-btn>
      </template>
      <span>{{item.text}}</span>
  </v-tooltip>



  <v-menu>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" class="hidden-sm-and-up">
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>
        <v-list>

        <v-list-tile v-for="(item,i) in items" bottom :key="i" :to="item.route">
          <v-list-tile-action>
                <v-icon color="grey darken-1">{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
              {{ item.text }}
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="toggleLogin">
          <v-list-tile-action>
                <v-icon color="grey darken-1">person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content v-if="activeUser">
            Logout
          </v-list-tile-content>
          <v-list-tile-content v-else>
            Login
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
  </v-menu>



  <v-menu min-width="300" offset-y>
    <template  #activator="{ on: menu }">
      <!--<v-btn @click.prevent="login" flat v-on="on"><v-icon @click.prevent="login" v-on="on">person</v-icon></v-btn>-->
      <v-tooltip bottom open-delay="100">
        <template #activator="{ on: tooltip }">
          <v-list-tile class="hidden-xs-only">
            <v-list-tile-content>
              <v-list-tile-title v-if="activeUser" class="grey--text body-1" >
                {{ activeUser.email }}
              </v-list-tile-title>
              <v-list-tile-title v-else class="grey--text hidden-xs-only">
                Login
              </v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn class="hidden-xs-only" v-on="{...menu,...tooltip}" icon>
              <v-icon color="grey darken-1">person</v-icon>
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
const planMonitor = require('./plugins/planMonitor.js')
const dbconfig = require('./db.config')


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
    toggleLogin() {
      if(  this.activeUser ) this.logout()
      else this.login()
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

    planMonitor.getPlanData('101-0554477')

  let layerCols = Object.keys(dbconfig).reduce((acc,key)=> {
    const col = dbconfig[key].layerCollection
    if (col && acc.indexOf(col) < 0) acc.push(col)
    return acc
  } ,[])

  Promise.all(
    layerCols.map(key=>this.$store.dispatch('UPDATE_COLLECTION',key))
  )
  .then(arr=>{

    const layerColsObj = arr.reduce((acc,x,index)=>{
      acc[layerCols[index]] = x
      return acc
    },{})

    console.log('layerColsObj',layerColsObj)

    return Promise.all(
      Object.keys(dbconfig).reduce((acc,key)=>{
      const layerCol = dbconfig[key].layerCollection
      if (dbconfig[key].storeByLayer) {
        const layerIds = layerColsObj[layerCol].reduce((obj,x)=> {
          obj[x._id] = []
          return obj
        },{})
        this.$store.commit('UPDATE',{key:'_col_'+key, value: layerIds})
      } else if (layerCol) {
        console.log('update by layer',key,layerCol, layerColsObj[layerCol][0]._id)
        acc.push(this.$store.dispatch('UPDATE_COLLECTION',{
          name:key,
          layer:layerColsObj[layerCol][0]._id
        }))
      } else if (!layerColsObj[key]) {
        console.log('this.$store.dispatch',key)
        acc.push(this.$store.dispatch('UPDATE_COLLECTION',key))
      } else {
        console.log('did not dispatch',key)
      }
      return acc
    },[])
  )

/*
    this.$store.dispatch('UPDATE_COLLECTION',{name:'areas',layer:areaLayer._id}),
    this.$store.dispatch('UPDATE_COLLECTION',{name:'indicators',layer:areaLayer._id}),
    this.$store.dispatch('UPDATE_COLLECTION','indicatorSections'),
    this.$store.dispatch('UPDATE_COLLECTION','indicatorBlocks'),
    this.$store.dispatch('UPDATE_COLLECTION','layerCalcs'),
    this.$store.dispatch('UPDATE_COLLECTION','layerAttributes'),
    this.$store.dispatch('UPDATE_COLLECTION','areaAttributes'),
    this.$store.dispatch('UPDATE_COLLECTION','indicatorAttributes'),
    ]
    */

  })
  .then(()=> {
    console.log('LOADING COMPLETE')
    this.loading = false
    //this.$store.commit('UPDATE',{key:'_col_features',value: layerIds})
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
