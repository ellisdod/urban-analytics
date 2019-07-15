import axios from 'axios'

export function getPlanData(plan_id) {
  const url = `<html><body><form action="http://mavat.moin.gov.il/MavatPS/Forms/SV4.aspx?tid=4" method="post" name="redirect_form">
   <input type="hidden" name="PL_ID" value="${plan_id}">
   </form><script language="javascript">document.redirect_form.submit();</script></body></html>`
   axios.post('http://mavat.moin.gov.il/MavatPS/Forms/SV4.aspx?tid=4',{
    PL_ID: 'plan_id'
  })
   .then(resp=>{
     console.log('plandata',resp)
   })
   .catch(err=>{
     console.log(err)
   })
}

export function main(plans,blocks) {

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
