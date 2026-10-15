export function calendarLayout(year,month,weekStart=1){const start=weekStart===0?0:1,first=(new Date(year,month,1).getDay()-start+7)%7,count=new Date(year,month+1,0).getDate();return {first,count,cells:Math.ceil((first+count)/7)*7,weekdays:Array.from({length:7},(_,i)=>(start+i)%7)}}
export function isWeekend(day){return day===0||day===6}
export function weekendColor(enabled,custom,accent){if(!enabled)return undefined;return /^#[\da-f]{6}$/i.test(custom||'')?custom:accent}
