export function indicators(store) {
  console.log('storedata',store.getters.dataByHoodYear.age_distribution);
  return [
    {
      name_en : "Demographics",
      name_ar : "",
      items : [
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
          keystat:true,
          figure : "socio_rank",
          name_en : "Socio-Eocnomic Rank",
          name_ar : "",
          description_en : 'For year 2008',
          description_ar : "",
          unit:""
        },
        {
          keystat:true,
          year:2012,
          figure : "socio_level",
          name_en : "Socio-Eocnomic Level",
          name_ar : "",
          description_en : 'For year 2008',
          description_ar : "",
          unit:""
        }
      ]
    },
    {
      name_en : "Housing",
      name_ar : "",
      items:[
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
    },
    {
      name_en : "Education",
      name_ar : "",
      items:[
        {
          keystat:true,
          figure : "no_student",
          name_en : "Students",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:""
        },
        {
          keystat:true,
          figure : "schools",
          name_en : "Schools",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:""
        },
        {
          keystat:true,
          figure : "no_classes",
          name_en : "Classes",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:""
        }
      ]
    },
    {
      name_en : "Public Facilities",
      name_ar : "",
      items:[
        {
          keystat:true,
          figure : "sports_facilities",
          name_en : "Sports Facilities",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:""
        },
        {
          keystat:true,
          figure : "hospitals",
          name_en : "Hospitals",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:""
        }
      ]
    },
    {
      name_en : "Planning",
      name_ar : "",
      items:[
        {
          keystat:true,
          year:2013,
          figure : "total_area",
          name_en : "Total Area",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:"dunum"
        },
        {
          keystat:true,
          year:2013,
          figure : "residential_dunum",
          name_en : "Planned Residential",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:"dunum"
        },
        {
          keystat:true,
          year:2013,
          figure : "residenial_commercial",
          name_en : "Planned Residential/Commercial",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:"dunum"
        },
        {
          keystat:true,
          year:2013,
          figure : "open_spaces",
          name_en : "Planned Open Space",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:"dunum"
        },
        {
          keystat:true,
          year:2013,
          figure : "pub_buildings",
          name_en : "Planned Public Facility",
          name_ar : "",
          description_en : "",
          description_ar : "",
          unit:"dunum"
        }
      ]
    }
  ]
}
