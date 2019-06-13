export const featureAnalysis = function(){

  /* Sums integers and counts strings */
  var sum = function(arr,keys) {
    return arr.reduce((acc,x)=>{
      if (!x.feature.properties.mygeodat_5) return acc

      //console.log(loc)
      const prop = x.feature.properties
      //console.log(acc[loc])
      const hoodCode = x.feature.properties.mygeodat_5.toString()
      const areaCodes = ['total',hoodCode]

      areaCodes.forEach(function(code) {
        acc[code] = acc[code] || {};
        acc[code].types = acc[code].types || {}
        keys.forEach(function(i){
          if (typeof prop[i] === 'string') {
            acc[code].types[prop[i]] = !acc[code].types[prop[i]] ? 1 : acc[code].types[prop[i]] + 1
          } else {
            acc[code][i] = !acc[code][i] ? prop[i] || 0 : acc[code][i] + parseInt(prop[i])
          }
        })
      })
      return acc;
    },{})
   }

   return {
     sum : sum
   }

}
