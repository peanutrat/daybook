import {distance,LEG_KM,countries,ticketForDay,type WaterTrip} from './water-trip.ts';
import type {waterPeriod} from './water-review.ts';

/** Includes the start and arrival scenery, including a boundary crossed by one drink. */
export function visitedDayScenes(trip:WaterTrip,day:string){
 const ticket=ticketForDay(trip,day);if(!ticket)return [];
 const first=Math.floor(ticket.start/LEG_KM),last=Math.floor(ticket.end/LEG_KM);
 return [...new Set(Array.from({length:Math.min(countries.length,last-first+1)},(_,i)=>(first+i)%countries.length))];
}
export function routeReview(stats:ReturnType<typeof waterPeriod>,today:string){
 let carry=stats.daily.find(d=>d.times>0)?.ml??0;
 const points=stats.daily.map(d=>{if(d.times)carry=d.ml;return{...d,routeMl:carry,kind:d.times?'recorded' as const:d.day>today?'planned' as const:'rest' as const};});
 const largest=Math.max(1,...points.map(d=>d.ml)),step=largest<=2000?500:largest<=10000?1000:5000;
 return{points,max:Math.ceil(largest/step)*step,ml:stats.ml,km:distance(stats.ml),times:stats.times,restDays:points.filter(d=>d.kind==='rest').length,recordedDays:points.filter(d=>d.kind==='recorded').length};
}
