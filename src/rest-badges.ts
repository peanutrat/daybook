// Display windows into the supplied artwork; preserve the original image pixels.
export const restBadges=[
 {id:'bed',src:'./trip/rest-badges/bed.jpg',imageWidth:254,imageHeight:306,viewBox:'0 0 254 306'},
 {id:'fuel',src:'./trip/rest-badges/roadside-sheet.jpg',imageWidth:676,imageHeight:1086,viewBox:'12 46 280 330'},
 {id:'dining',src:'./trip/rest-badges/roadside-sheet.jpg',imageWidth:676,imageHeight:1086,viewBox:'303 46 289 309'},
 {id:'lake',src:'./trip/rest-badges/roadside-sheet.jpg',imageWidth:676,imageHeight:1086,viewBox:'5 388 294 314'},
 {id:'cabin',src:'./trip/rest-badges/roadside-sheet.jpg',imageWidth:676,imageHeight:1086,viewBox:'324 374 292 327'},
 {id:'signpost',src:'./trip/rest-badges/roadside-sheet.jpg',imageWidth:676,imageHeight:1086,viewBox:'16 732 284 308'},
 {id:'cafe',src:'./trip/rest-badges/roadside-sheet.jpg',imageWidth:676,imageHeight:1086,viewBox:'326 719 294 331'},
] as const;
export function restBadgeForDay(day:string){const ordinal=Math.floor(Date.parse(day+'T00:00:00Z')/86400000);return restBadges[Number.isFinite(ordinal)?((ordinal%7)+7)%7:0];}
