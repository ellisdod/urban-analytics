export function translate(obj,keys,language) {
  keys = typeof keys === 'string' ? [keys] : keys;
  obj = Array.isArray(obj) ? obj : [obj];

  function selectLanguageKey (obj,keys,language) {
    return obj.reduce((acc,val) => {
      if(typeof val === 'object') {
        keys.forEach(key=>{
          if (val[key+'_'+language]) val[key] =  val[key+'_'+language];
        })
        Object.keys(val).forEach(x=>{
          if (Array.isArray(val[x])) selectLanguageKey(val[x], keys,language)
        });
        acc = acc || []
        acc.push(val);
        return acc;
      }
    },[]);
  }
  return selectLanguageKey(obj,keys,language);
}
