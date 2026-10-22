import {localDate,type WaterTrip} from './water-trip.ts';
export type WaterPeriod='day'|'week'|'month';
export function waterPeriod(trip:WaterTrip,anchor:string,period:WaterPeriod){
 const start=new Date(anchor+'T12:00:00');if(Number.isNaN(start.getTime()))throw Error('Invalid date');
 if(period==='week')start.setDate(start.getDate()-(start.getDay()+6)%7);if(period==='month')start.setDate(1);
 const end=new Date(start);if(period==='month')end.setMonth(end.getMonth()+1);else end.setDate(end.getDate()+(period==='week'?7:1));
 const daily=[];for(const d=new Date(start);d<end;d.setDate(d.getDate()+1)){const day=localDate(d),entries=trip.drinks.filter(e=>e.day===day);daily.push({day,ml:entries.reduce((n,e)=>n+e.ml,0),times:entries.length});}
 return {start:localDate(start),end:daily.at(-1)!.day,daily,ml:daily.reduce((n,d)=>n+d.ml,0),times:daily.reduce((n,d)=>n+d.times,0)};
}
