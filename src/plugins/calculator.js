module.exports = (function() {

  var level = 0,
  left = true,
  result = false,
  equation = {
  left : [],
  right : [],
  symbol : [],
  logic : [],
  result : []
},
  properties,
  attributes;


  var convertArray = function (arr) {
    arr.reduce((acc,x)=>{
      //console.log(acc,x)
      if (x==='IF' || x==='ELSE IF'){}
      else if (x==='(') {
        getLastAtLevel(acc.left,level).push([])
        getLastAtLevel(acc.right,level).push([])
        getLastAtLevel(acc.symbol,level).push([])
        getLastAtLevel(acc.logic,level).push([])
        level ++
        left = true
        result = false
      } else if (x===')') {
        level --
        left = true
        result = level === 0 ? true : false
      } else if (Object.keys(equateArray()).includes(x)) { // AND || OR
        getLastAtLevel(acc.logic,level).push(x)
        left = true
      } else if (Object.keys(equateIt()).includes(x)) { // = || !=
        getLastAtLevel(acc.symbol,level).push(x)
        left = false
      } else if (left&&!result) {
        getLastAtLevel(acc.left,level).push(x)
      } else if (!left&&!result) {
        getLastAtLevel(acc.right,level).push(x)
      } else {
        getLastAtLevel(acc.result,level).push(x)
      }
      return acc

    },equation)
  }

  var makeAttributeKeys = function(atts) {
    return atts.reduce((acc,x)=>{
      acc[x._id] = x
      return acc
    },{})
  }

  var calculateValue = function(val) {
    if (val.indexOf('$') !== 0) return val
    const att = attributes[val.slice(1,val.length)]
    if (!att) console.log('no attribute: ' + val)
    return att ? properties[att.name] : ''
  }

  var equateIt = function(left,right) {
   return {
     '=' : left === right,
     '!=' : left !== right,
     //'in' : left.indexOf(right) > 0,
     //'not in' : left.indexOf(right) === -1
   }
  }

  var equateArray = function(arr) {
   return {
   'OR' : arr ? arr.includes(true) : null,
   'AND' : arr ? !arr.includes(false) : null
   }
  }

  var getLastAtLevel = function(array,level) {
      return level && Array.isArray(array) && Array.isArray(array.slice(-1)[0]) ?
         getLastAtLevel(array.slice(-1)[0],level-1) : array
  }

  var process = function(arr,props,atts) {
    properties = props
    attributes = makeAttributeKeys(atts)
    convertArray(arr)
    for (var i=0;i<equation.result.length;i++) {
      const t = isTrue(equation.left[i],equation.right[i],equation.symbol[i],equation.logic[i])
      if (t) return equation.result[i]
    }
  }

  var isTrue = function(left,right,symbol,logic) {

       const truths = symbol.reduce((acc,x,i)=>{
         if (Array.isArray(x)) acc.push(isTrue(left[i],right[i],symbol[i],logic[i]))
         else acc.push(equateIt(calculateValue(left[i]),calculateValue(right[i]))[symbol[i]])
         return acc
       },[])
       const levelLogic = logic.filter(x=>!Array.isArray(x))[0]
       //console.log(truths,logic,left,right,levelLogic)
       return truths.length > 1 ? equateArray(truths)[levelLogic] : truths[0]
  }

  return {
    process : process,
  }
})();



function calculatorTests() {
  let testLevelArr = [1,2,3,[4,5,6,[2,4,8,[]]]]
  //console.log(getLastAtLevel(testLevelArr,0) )
  //console.log(getLastAtLevel(testLevelArr,3) )
  //console.log(getDeepest([[2],[1],[3]]))
  const filter = ['IF','(','(','$key1','=','hello','AND','$key2','=','hiya',')','OR','$key1','=','hi',')','Hiii!','ELSE IF','(','$key2','=','goodbye',')','hey!']

  const eq1 = {
  left : [[['$key','$key2'],'$key1']],
  right : [[['hello','goodbye'],'hi']],
  symbol : [[['=','='],'=']],
  logic : [[['AND'],'OR']],
  result : []
  }

  testEq = {
  left : [],
  right : [],
  symbol : [],
  logic : [],
  result : []
  }


  function test () {
     let level=0
     getLastAtLevel(testEq.left,level).push([])
     level ++
     getLastAtLevel(testEq.left,level).push([])
     level ++
     getLastAtLevel(testEq.left,level).push(2)
     console.log('testeq',testEq)
  }

  const testobj = {
    key1 : 'hello',
    key2 : 'goodbye'
  }
}



//console.log('result:', process(res))
//console.log(equateIt(2,2)['='])
