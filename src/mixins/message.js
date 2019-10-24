export default {
   methods: {
      displayMessage: function(err) {
        console.log('err.response',err.response)
        console.log(JSON.stringify(err.response))
        let message;
        if (err.response.statusText) {
           message = err.response.statusText
        } else if (!err.response||!err.response.data.errors) {
          message = err
        } else {
          const errors = err.response.data.errors
          message = Object.keys(errors).reduce((acc,x)=>{
            acc = acc + '\n' + errors[x].name + ': ' + errors[x].message
            return acc
          },'')
        }
        alert(message)
      }
   }
}
