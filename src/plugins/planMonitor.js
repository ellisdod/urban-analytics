import axios from 'axios'


function ajaxPost (form, callback) {
    var url = form.action,
        xhr = new XMLHttpRequest();

    //This is a bit tricky, [].fn.call(form.elements, ...) allows us to call .fn
    //on the form's elements, even though it's not an array. Effectively
    //Filtering all of the fields on the form
    var params = [].filter.call(form.elements, function(el) {
        //Allow only elements that don't have the 'checked' property
        //Or those who have it, and it's checked for them.
        return typeof(el.checked) === 'undefined' || el.checked;
        //Practically, filter out checkboxes/radios which aren't checekd.
    })
    .filter(function(el) { return !!el.name; }) //Nameless elements die.
    .filter(function(el) { return el.disabled; }) //Disabled elements die.
    .map(function(el) {
        //Map each field into a name=value string, make sure to properly escape!
        return encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value);
    }).join('&'); //Then join all the strings by &

    xhr.open("POST", url);
    xhr.setRequestHeader("Content-type", "application/x-form-urlencoded");

    //.bind ensures that this inside of the function is the XHR object.
    xhr.onload = callback.bind(xhr);

    //All preperations are clear, send the request!
    xhr.send(params);
}

function log(x) {
  console.log(x)
}

export function getPlanData(plan_id) {
     plan_id = plan_id || 'TOpflW7W09+v72bfNTNNuVIQg7HrM9yHNs5qCwtxESOQg3YZB16Gw5GTRQjuKeTStGGVEIMWRuT2l7QcUI7c44fDhzuoJNrc2mLvX+5Tgy0='
     plan_id = encodeURIComponent(plan_id)
     let xhr = new XMLHttpRequest();
     xhr.open("POST", "http://mavat.moin.gov.il/MavatPS/Forms/SV4.aspx?tid=4");
     xhr.setRequestHeader("Content-type", "application/x-form-urlencoded");
     xhr.onload = function() {
       if (xhr.status === 200 && xhr.responseText !== newName) {
         alert('Something went wrong.  Name is now ' + xhr.responseText);
     }
     else if (xhr.status !== 200) {
         alert('Request failed.  Returned status of ' + xhr.status);
     }
     }
     xhr.send("PL_ID="+plan_id);

     /*

     const html = `<html><body><form action="http://mavat.moin.gov.il/MavatPS/Forms/SV4.aspx?tid=4" method="post" name="redirect_form">
                   <input type="hidden" name="PL_ID" value="${plan_id}"></form>
                   </body></html>`
     var win = window.open("", "Title", "resizable=yes,width=780,height=200,top="+(screen.height-400)+",left="+(screen.width-840));
     win.document.body.innerHTML = html;
     win.document.querySelector("form").submit()
 */
     //ajaxPost(win.document.querySelector("form"), log)

     //const tableRows = win.document.getElementById('tblQuantities').getElementsByTagName('tr')
     //const headers = ['name_he','approved','change','detailed_plan_total','outline_plan_total','notes']
     /*quantities = tableRows.reduce((acc,row)=>{
       row.children()
     },[])
     */


     //<script language="javascript">document.redirect_form.submit();</script>
     //toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,

}

/*exports.main = function(plans,blocks) {

  blocks.forEach(block => {
    const newPlans = []
    const url = `http://opentaba-server-jerusalem.herokuapp.com/gush/${block}/plans.json`
    axios.get(url)
    .then(results => {
      results.forEach(plan => {
        if (!plans[plan.plan_id]) newPlans.push(plan)
      })
    })
  })

}
*/
