export function indicators(store) {
  console.log('storedata',store.getters.dataByHoodYear.age_distribution);
  return [
    {
      heading:true,
      name_en : "Demographics",
      name_ar : ""
    },
    {
      keystat:true,
      name_en : "Population",
      name_ar : "",
      figure : "pop_year_end",
      description_en : ""
    },
    {
      blocks : true,
      left : [
        {
          type:"barchart",
          name_en:"Age Distribution (%)",
          name_ar:"",
          color:"",
          datasets :[
            {
              //label:store.state.neighbourhood,
              data: store.getters.dataByHoodYear.age_distribution,
              borderColor: '#000',
              type:"line",
              fill:false,
            },
            {
              label:'East Jerusalem Avg',
              data: store.getters.dataByCityYear.age_distribution,
              borderColor: store.state.theme.primary,
              type:"line",
              fill:false,
            }
          ],
          labels: ['0-4','5-14','15-24','25-44','45-64','65-74','75+'],
          description_en:"",
          description_ar:""
        }
      ],
      right:[
        {
          keystat:true,
          figure : "age_median",
          name_en : "Median Age",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:""
        },
        {
          keystat:true,
          figure : "dependency_youth",
          name_en : "Youth Dependency",
          name_ar : "",
          description_en : "Aged 24 or under",
          description_ar : "",
          unit:"%"
        }
      ]
    },
    {
      keystat:true,
      figure : "growth_total",
      name_en : "Population Growth",
      name_ar : "",
      description_en : 'For year ('+store.state.year+')',
      description_ar : "",
      unit:"%"
    },
    {
      heading:true,
      name_en : "Housing",
      name_ar : ""
    },
    {
      keystat:true,
      figure : "dwellings_total",
      name_en : "Housing Units",
      name_ar : "",
      description_en : "",
      description_ar : "",
      unit:""
    },
    {
      keystat:true,
      figure : "household_size",
      name_en : "Avg. Household Size",
      name_ar : "",
      description_en : "Persons per household",
      description_ar : "",
      unit:""
    },
    {
      blocks : true,
      left: [
        {
          type:"barchart",
          name_en:"Dwelling Area Distribution %/m²",
          name_ar:"",
          color:"",
          datasets :[
            {
              data: store.getters.dataByHoodYear.dwelling_area_distribution,
              borderColor: '#000',
              type:"line",
              fill:false,
            },
            {
              data: store.getters.dataByCityYear.dwelling_area_distribution,
              borderColor: store.state.theme.primary,
              type:"line",
              fill:false,
            }
          ],
          labels: ['0-40','41-60','61-80','81-100','101-140','141+'],
          description_en:"",
          description_ar:""
        }
      ],
      right: [
        {
          keystat:true,
          figure : "dwellings_new",
          name_en : "New Housing Units",
          name_ar : "",
          description_en : 'Constructed in '+store.state.year,
          description_ar : "",
          unit:""
        },
        {
          keystat:true,
          figure : "dwelling_growth",
          name_en : "Housing Units Growth",
          name_ar : "",
          description_en : "Annual increase in number of housing units",
          description_ar : "",
          unit:"%"
        }
      ]
    }
  ]
}
