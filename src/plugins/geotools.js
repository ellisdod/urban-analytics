const turf = {
  length :require('@turf/length').default,
  area : require('@turf/area').default,
  tag : require('@turf/tag'),
  centroid : require('@turf/centroid').default,
  circle : require('@turf/circle').default,
  union : require('turf-merge'),//require('@turf/union').default,
  buffer : require('@turf/buffer').default,
  booleanCrosses : require('@turf/boolean-crosses').default
}


var Features = function() {}

Features.prototype.load = function(features) {

    if (!features) return null

    if (features.type === 'FeatureCollection') {
      this.features = features.features.map(i=>{return {feature:i}})
    } else if (features[0]&&features[0].feature) {
      this.features = features
    } else if (features[0]&&features[0].geometry) {
      this.features = features.map(i=>{return {feature:i}})
    }
}

Features.prototype.toFeatureCollection = function(geojson) {
  return {
    type :'FeatureCollection',
    features : geojson || this.features.map(i=>i.feature)
  }
}

Features.prototype.arePoints = function() {
  return this.features[0].feature.geometry.type === 'Point'
}

Features.prototype.arePolygons = function() {
  const type = this.features[0].feature.geometry.type
  return type === 'Polygon' || type === 'MultiPolygons'
}

Features.prototype.filterGeometry = function() {
 if (!this.features.length) return null
 this.features = features.filter(x=>x.feature&&x.feature.geometry)
}

Features.prototype.toCentroids = function() {
  return this.features.map(x=>turf.centroid(x.feature))
}

Features.prototype.addMissingProperties = function(key,value) {
  for (var i=0;i<this.features.length;i++) {
    this.features[i].feature.properties[key] = this.features[i].feature.properties[key] || value
  }
}

Features.prototype.embedDataTypes = function() {
  for (var i=0;i<this.features.length;i++) {
    const type = this.features[i].feature.geometry.type
    this.features[i].feature.properties.data_type = type
  }
}

Features.prototype.embedLayer = function(layer) {
  for (var i=0;i<this.features.length;i++) {
    this.features[i].layer = layer
  }
}

/**
* Tags features with an attribute of an overlapping polygon
* Create centroids of features so work for tagging small features within a large area
* If no areaAttribute is provided, a Boolean is used
* @param  {Array} areas
* @param  {String} featureAttribute
* @param  {String} areaAttribute
* @return {Array}
*/
Features.prototype.spatialJoin = function (joinAreas, featureAtt, areaAtt) {

  //confirm areas are polygons
  const areas = new Features()
  areas.load(joinAreas)

  if (!areas.arePolygons()) return null

  const proxyAtt = '__p'
  //add proxy areaAtt
  if (!areaAtt) {
    areaAtt = proxyAtt
    areas.features = areas.features.map(x=>{
      x.feature.properties[proxyAtt] = true
      return x
    })
  }
  //console.log('for spatial join', features[0])
  features.filterGeometry()
  areas.filterGeometry()

  let tagged;

  if (this.arePoints()) {
    tagged = turf.tag(features.toFeatureCollection(), areas.toFeatureCollection(), areaAtt, featureAtt)
  } else if (this.arePolygons()) {

    const centroids = this.toFeatureCollection(features.toCentroids())
    console.log('centroids',centroids.length,centroids[0])
    tagged = turf.tag( centroids, areas.toFeatureCollection(), areaAtt, featureAtt)
    //console.log('tagged',tagged.features.length, tagged.features.filter(x=>x.properties[featureAtt]).length, tagged.features[0])
    //console.log('total tagged',tagged.features.filter(x=>x.properties.JIIS_stat_area).length )
  }

  if (!tagged) return null

  for (let i =0;i<tagged.features.length;i++) {
    const val = tagged.features[i].properties[featureAtt]
    this.features[i].properties[featureAtt] = areaAtt === proxyAtt ? val || false : val
  }

}

exports.default = Features
