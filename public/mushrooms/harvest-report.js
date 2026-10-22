import {MUSHROOMS} from './assets/mushrooms.js';
import {activityRows} from './receipt.js';
import {mushroomGroups} from './mushroom-logic.js';
// A read-only projection of the existing settlement; paging never touches the store.
export function harvestReport(state,data,{period,anchor,logo,weekly}){return{schema:1,period,anchor,begin:data.begin,end:data.end,title:data.title,seconds:data.seconds,daily:Object.entries(data.sessions.reduce((days,s)=>{days[s.day]=(days[s.day]||0)+s.seconds;return days;},{})).map(([day,seconds])=>({day,seconds})),count:data.count,sessionsCount:data.sessions.length,logo,weekly:weekly??null,decoration:state.decorMushroom||'Penny_Bun',catalog:MUSHROOMS.map(({id,label,src})=>({id,label,src})),activities:activityRows(data.sessions,data.batches,state.sessions).map(a=>({...a,src:MUSHROOMS.find(m=>m.id===a.icon)?.src||MUSHROOMS[8].src})),groups:mushroomGroups(data.batches).map(g=>({id:g.plant.id,label:g.plant.label,src:g.plant.src,count:g.count}))};}
