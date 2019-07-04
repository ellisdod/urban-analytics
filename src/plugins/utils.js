const Utils = (function() {
  function arraysToObjects(headers,rows) {
    return rows.reduce((arr,row)=>{
      arr.push(headers.reduce((acc,x,index)=>{
        acc[x] = row[index]
        return acc
      },{}))
      return arr
    },[])
  }

  function getNested (p, o) {
    p = typeof p === 'string' ? p.split('.') : p
    if (!p) return o
    const n =  p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
    //console.log('nested',n)
    return n
  }

})();
