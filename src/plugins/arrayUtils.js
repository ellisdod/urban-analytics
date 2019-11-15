const sort = function(arr,descending,key) {
  if (!arr) return null

  const greater = descending ? -1 : 1
  const lesser = descending ? 1 : -1

  function sortFunc(m1,p1){

      var m = key ? getNested(key,m1) : parseInt(m1),
          p = key ? getNested(key,p1) : parseInt(p1);

      if(m > p) return greater;
      if(m < p) return lesser;
      return 0;
  }


const res = arr.sort(sortFunc)
//console.log('arrayUtils',res)
return res

}


const sortNumbers = function (arr, key) {
  //const sorted = arr.map( x => parseInt(getNested(key,x))).sort((a,b)=> (!getNested(key,b))-(!getNested(key,a)) || +(getNested(key,a)>getNested(key,b))||-(getNested(key,a)<getNested(key,b)));
  //numbers to the front
  if (!arr || !key ) return null

  arr = arr.reduce((acc,x)=>{
    const val = getNested(key,x)
    if (val) acc.push(val)
    return acc
  },[])
  const sorted = sort(arr)
  const result = {
    min : sorted[0]
  }
  //loop backwards
  for(var x=sorted.length - 1; x >= 0;x--){
    const val = sorted[x]
    if (typeof val === 'number') {
      result.max = val
      break
    }
  }
  result.constant = result.max - result.min
  //console.log('sorted',sorted, result)
  return result
}

const getNested = function (p, o) {
  p = typeof p === 'string' ? p.split('.') : p
  if (!p) return o
  return p.reduce((acc, x) => (acc && (acc[x]||acc[x]===0) ) ? acc[x] : null, o)
  //console.log('nested',n)
}

const rowsToObjects = function (headers,rows) {
  return rows.reduce((arr,row)=>{
    arr.push(headers.reduce((acc,x,index)=>{
      acc[x] = row[index]
      return acc
    },{}))
    return arr
  },[])
}

exports.rowsToObjects = rowsToObjects
exports.sortNumbers = sortNumbers
exports.getNested = getNested
exports.sort = sort
