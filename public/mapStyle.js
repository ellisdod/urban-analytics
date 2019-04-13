var vectorTileStyling = {

  water: {
    fill: true,
    weight: 1,
    fillColor: '#06cccc',
    color: '#06cccc',
    fillOpacity: 0.2,
    opacity: 0.4,
  },
  admin: [],
  waterway: {
    weight: 1,
    fillColor: '#2375e0',
    color: '#2375e0',
    fillOpacity: 0.2,
    opacity: 0.4
  },
  landcover: {
    fill: true,
    weight: 1,
    fillColor: '#53e033',
    color: '#53e033',
    fillOpacity: 0.1,
    opacity: 0.4,
  },
  landuse: {
    fill: true,
    weight: 1,
    fillColor: '#efe6f2',
    color: '#efe6f2',
    fillOpacity: 0.2,
    opacity: 0.4
  },
  park: {
    fill: true,
    weight: 1,
    fillColor: '#84ea5b',
    color: '#84ea5b',
    fillOpacity: 0.2,
    opacity: 0.4
  },
  boundary: function(){
    const disputed = {
      weight: 3,
      fillColor: 'red',
      color: 'red',
      fillOpacity: 0.2,
     opacity: 0.8
   };

   if (arguments[0].disputed == 1 ) {
     return disputed;
   }
   if (arguments[0].admin_level == 4 ) {
   return ({
     weight: 2,
     fillColor: 'pink',
     color: 'pink',
     fillOpacity: 0.2,
     opacity: 0.8
   });
 }
 if (arguments[0].admin_level < 4 ) {
 return ({
   weight: 3,
   fillColor: '#999',
   color: '#999',
   fillOpacity: 0.2,
   opacity: 0.8
 });
} else {
   return [];
 }

  },
  aeroway: {
    weight: 1,
    fillColor: '#51aeb5',
    color: '#51aeb5',
    fillOpacity: 0.2,
    opacity: 0.4
  },
  road: {	// mapbox & mapzen only
    weight: 1,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4
  },
  tunnel: {	// mapbox only
    weight: 0.5,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4,
    // 					dashArray: [4, 4]
  },
  bridge: {	// mapbox only
    weight: 0.5,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4,
    // 					dashArray: [4, 4]
  },
  transportation: {	// openmaptiles only
    weight: 0.5,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4,
    // 					dashArray: [4, 4]
  },
  transit: {	// mapzen only
    weight: 0.5,
    fillColor: '#f2b648',
    color: '#f2b648',
    fillOpacity: 0.2,
    opacity: 0.4,
    // 					dashArray: [4, 4]
  },
  building: {
        fill: true,
        weight: 0.5,
        fillColor: '#999',
        color: '#999',
        fillOpacity: 0.4,
        opacity: 0.8
  },
  water_name: [],
  transportation_name: [],
  place: [],
  housenumber: [],
  poi: [],
earth: [],	// mapzen only
  // Do not symbolize some stuff for mapbox
  country_label: [],
  marine_label: [],
  state_label: [],
  place_label: [],
  waterway_label: [],
  poi_label: [],
  road_label: [],
  housenum_label: [],

  // Do not symbolize some stuff for openmaptiles
  country_name: [],
  marine_name: [],
  state_name: [],
  place_name: [],
  waterway_name: [],
  poi_name: [],
  road_name: [],
  housenum_name: [],
  mountain_peak:[],
  poi_name:[],
}

export default vectorTileStyling;
