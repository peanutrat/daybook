import {MUSHROOMS} from './assets/mushrooms.js';
export const GROW_SECONDS=300;
export function stumpProgress(stump,activeSeconds=0){const seconds=Math.max(0,(stump.carrySeconds||0)+(stump.pendingSeconds||0)+activeSeconds);return{count:Math.floor(seconds/GROW_SECONDS),partial:seconds%GROW_SECONDS,ratio:(seconds%GROW_SECONDS)/GROW_SECONDS};}
export function harvestMushrooms(stump,seconds,id,day){if(stump.harvests.some(h=>h.id===id))return stump;const p=stumpProgress(stump,seconds),counts=new Map();for(let i=0;i<p.count;i++){const m=mushroomAt(stump,i);counts.set(m.id,(counts.get(m.id)||0)+1);}
return{...stump,pendingSeconds:0,carrySeconds:p.partial,nextSerial:stump.nextSerial+p.count,harvests:[...stump.harvests,{id,day,count:p.count,counts:[...counts].map(([id,count])=>({id,count}))}]};}
export function mushroomGroups(batches){const counts=new Map();for(const h of batches)for(const c of h.counts){counts.set(c.id,(counts.get(c.id)||0)+c.count);}return [...counts].map(([id,count])=>({plant:MUSHROOMS.find(m=>m.id===id),count})).filter(g=>g.plant);}
export function mushroomAt(stump,offset=0){let n=(stump.nextSerial+offset+stump.seed)|0;n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return MUSHROOMS[((n^(n>>>16))>>>0)%MUSHROOMS.length];}
