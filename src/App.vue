<template>
  <v-app id="keep">

    <v-navigation-drawer
    v-model="drawer"
    fixed
    class="grey lighten-4"
    hide-overlay
    left
    clipped
    >
    <div style="height:70px;"></div>
    <v-list
    dense
    class="grey lighten-4"
    >
    <template v-for="(item, i) in items">
      <v-list-group
      v-if="item.children"
      :key="item.text"
      v-model="item.model"
      :prepend-icon="item.model ? item.icon : item['icon-alt']"
      append-icon=""
      >
      <template v-slot:activator>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ item.heading }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>

      <v-list-tile
      v-for="(child, i) in item.children"
      :key="i"
      @click=""
      >

      <v-list-tile-action>
        <v-icon>
          {{ child.icon }}
        </v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>
          {{ child.text}}
        </v-list-tile-title>
      </v-list-tile-content>

    </v-list-tile>
  </v-list-group>

  <v-layout
  v-else-if="item.heading"
  :key="i"
  row
  align-center
  >
  <v-flex xs6>
    <v-subheader v-if="item.heading">
      {{ item.heading }}
    </v-subheader>
  </v-flex>

</v-layout>
<v-divider
v-else-if="item.divider"
:key="i"
dark
class="my-3"
></v-divider>
<v-list-tile
v-else
:key="i"
:to="item.route"
>
<v-list-tile-action>
  <v-icon>{{ item.icon }}</v-icon>
</v-list-tile-action>
<v-list-tile-content>
  <v-list-tile-title class="grey--text">
    {{ item.text }}
  </v-list-tile-title>
</v-list-tile-content>
</v-list-tile>
</template>
</v-list>

<v-btn @click.prevent="login" v-if="!activeUser" small>Log in</v-btn>

<div v-else class="pt-1 mr-1">{{ activeUser.email }}</div>

<v-menu min-width="300" offset-y v-if="activeUser">
  <template v-slot:activator="{ on }">
    <v-btn fab dark flat small outline v-on="on"><v-icon>person</v-icon></v-btn>
  </template>

  <v-card>
    <v-list>
      <v-list-tile avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ activeUser.name }}</v-list-tile-title>
          <v-list-tile-sub-title>IPCC</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-divider></v-divider>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" flat @click="logout">Logout</v-btn>
    </v-card-actions>
  </v-card>
</v-menu>

</v-navigation-drawer>

<div id="navigation-btn">
       <v-btn
          color=""
          light
          flat
          fab
          @click="drawer = !drawer"
        >
          <v-icon>menu</v-icon>
        </v-btn>
</div>

<v-content>
  <router-view style="height:100%;"></router-view>
</v-content>
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
    activeUser: null,
    authenticated: false,
    drawer: false,
    drawerIndicators : false,
    layersPanel:true,
    currentView: 'map-view',
    layers : [],
    indicators: [
      {
        heading: 'Demographics',
        icon: 'keyboard_arrow_up',
        'icon-alt': 'keyboard_arrow_down',
        text: 'More',
        model: false,
        children: [
          { name: 'Persons', value: 290000 },
          { name: 'Median Age', value: 25.4 },
          { name: 'Growth - natural (2018)', value: '3.5%' },
          { name: 'Growth - migration (2018)', value: '4.5%' },
          { name: 'Gender m/f', value: '49/50' }
        ]
      },
      {
        heading: 'Housing' ,
        icon: 'keyboard_arrow_up',
        'icon-alt': 'keyboard_arrow_down',
        text: 'More',
        model: false,
        children: [
          { name: 'Housing Units', value: 36700 },
          { name: 'Avg. Persons per Household', value: 5.2 },
          { name: 'Avg. Rooms per Household', value: 3.5 },
          { name: 'Avg. Area of Household', value: '70m2' }
        ]
      },
      {
        heading: 'Services',
        icon: 'keyboard_arrow_up',
        'icon-alt': 'keyboard_arrow_down',
        text: 'More',
        model: false,
        children: [
          { name: 'Secondary Schools', value: 3 },
          { name: 'Primary Schools', value: 2 },
          { name: 'Kindergartens', value: 5 },
        ]
      }
    ]
  }),
  computed : {
    items () {
      const layers = [
        {
          heading: 'Layers',
          icon: 'keyboard_arrow_up',
          'icon-alt': 'keyboard_arrow_down',
          text: 'More',
          model: false,
          children: [
            { icon: 'add', text: 'Background' },
            { icon: 'add', text: 'Boundaries' },
            { icon: 'add', text: 'Buildings' },
            { icon: 'add', text: 'Roads' }
          ]
        }];
        const actions = [
          { divider : true},
          { icon: 'settings', text: 'Settings' },
          { icon: 'chat_bubble', text: 'About' },
          { icon: 'help', text: 'Help' },
          { icon: 'cloud_download', text: 'Export Data' },
          { icon: 'bar_chart', text: 'Urban Indicators', route: 'indicators' },
        ];
        const loggedInActions = [
          { divider : true},
          { icon: 'cloud_upload', text: 'Upload data', route: 'upload' },
          { icon: 'grid_on', text: 'View surveys', route: 'survey' }
        ]
        return this.activeUser ? layers.concat(loggedInActions).concat(actions) : layers.concat(actions);
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
    }

  }
  </script>

  <style>
  #keep .v-navigation-drawer__border {
    display: none
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
