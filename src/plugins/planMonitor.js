import axios from 'axios'

export function getPlanData(plan_id) {
  plan_id = plan_id || 'TOpflW7W09+v72bfNTNNuVIQg7HrM9yHNs5qCwtxESOQg3YZB16Gw5GTRQjuKeTStGGVEIMWRuT2l7QcUI7c44fDhzuoJNrc2mLvX+5Tgy0='

     const html = `<html><body><form action="http://mavat.moin.gov.il/MavatPS/Forms/SV4.aspx?tid=4" method="post" name="redirect_form" target="my_iframe">
                   <input type="hidden" name="PL_ID" value="${plan_id}"></form>
                   <iframe name="my_iframe" src="not_submitted_yet.aspx"></iframe>
                   </body></html>`
     var win = window.open("", "Title", "resizable=yes,width=780,height=200,top="+(screen.height-400)+",left="+(screen.width-840));
     win.document.body.innerHTML = html;
     win.document.querySelector("form").submit()

     const tableRows = win.document.getElementById('tblQuantities').getElementsByTagName('tr')
     const headers = ['name_he','approved','change','detailed_plan_total','outline_plan_total','notes']
     quantities = tableRows.reduce((acc,row)=>{
       row.children()
     },[])



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
