/*

*/
export function translate(data,keys,language) {

  function translateObject (obj) {
     keys.forEach(key=>{
          if (obj[key+"_"+language]) {
            obj[key] = obj[key+"_"+language];
          } else if (language !== 'en' && obj[key+"_en"] && dicts[language][obj[key+"_en"].toLowerCase()]) {
            obj[key] = dicts[language][obj[key+"_en"].toLowerCase()]
          }
        })
      Object.values(obj).forEach(x=>{
          if (typeof x === 'object') translateObject(x, keys,language)
      });
     return obj
  }

  keys = typeof keys === "string" ? [keys] : keys;
  if (typeof data === 'string' && dicts[language] && dicts[language][data.toLowerCase()]) {
    return dicts[language][data.toLowerCase()]
  } else if (Array.isArray(data) ) {
    return data.map(x=>translateObject(x,keys,language));
  } else if (typeof data === 'object') {
    return translateObject(data,keys,language);
  } else {
    return data
  }
}

const dicts =
{ "ar" : {
  "feature":"خاصية",
  "features" : "الميزات",
  "layer":"طبقة",
  "layers": "طبقات",
  "attributes" : "سمات",
  "calculations" : "العمليات الحسابية",
  "features table" : "ميزات الجدول",
  "style" : "أسلوب",
  "styles" : "الأنماط",
  "area" : "منطقة",
  "areas" : "المناطق",
  "survey" : "الدراسة الاستقصائية",
  "surveys" : "الدراسات الاستقصائية",
  "section" : "الجزء",
  "sections" : "الأقسام",
  "survey results" : "نتائج الاستطلاع",
  "question":"سؤال",
  "questions":"الأسئلة",
  "blocks":"كتل",
  "education": "التعليم",
  "east jerusalem": "القدس",
  "upload":"رفع",
  "update feature analysis" : "تحليل التحديث",
  "add":"ضم",
}
}
