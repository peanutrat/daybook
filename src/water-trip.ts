export type Drink={id:string;ml:number;at:string;day:string};
import {normalizeAvatar,type ElfAvatar} from './elf-avatar.ts';
import {normalizeHydration,calculateWaterGoal,type HydrationProfile} from './water-goal.ts';
import {roadStops} from './road-route.ts';
export type WaterTrip={version:1;ticketScenes?:Record<string,number>;drinks:Drink[];settledDays:string[];cupMl?:number;driverName?:string;carStyle?:'forest'|'cranberry'|'cream'|'navy';avatar?:ElfAvatar;mode?:'free'|'goal';goalMl?:number;cupPresets?:number[];hydration?:HydrationProfile};
export const KM_PER_ML=.1;
export const LEG_KM=80;
export const countries=roadStops;
export const emptyTrip=():WaterTrip=>({version:1,drinks:[],settledDays:[]});
export function localDate(date=new Date()){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
const validDay=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T12:00:00'))&&localDate(new Date(v+'T12:00:00'))===v;
export function normalizeTrip(value:unknown):WaterTrip{
 if(!value||typeof value!=='object')return emptyTrip();
 const v=value as Partial<WaterTrip>,seen=new Set<string>();
 const drinks=(Array.isArray(v.drinks)?v.drinks:[]).filter((d):d is Drink=>!!d&&typeof d.id==='string'&&!seen.has(d.id)&&!!seen.add(d.id)&&Number.isInteger(d.ml)&&d.ml>0&&d.ml<=5000&&validDay(d.day)&&typeof d.at==='string'&&Number.isFinite(Date.parse(d.at))).map(d=>({id:d.id,ml:d.ml,day:d.day,at:d.at})).sort((a,b)=>a.at.localeCompare(b.at));
 const cup=typeof v.cupMl==='number'&&Number.isInteger(v.cupMl)&&v.cupMl>0&&v.cupMl<=5000?v.cupMl:undefined;
 const driver=typeof v.driverName==='string'?v.driverName.trim().slice(0,32):'';
 return {version:1,drinks,...(v.ticketScenes&&typeof v.ticketScenes==='object'?{ticketScenes:Object.fromEntries(Object.entries(v.ticketScenes).filter(([day,index])=>validDay(day)&&Number.isInteger(index)&&index>=0&&index<countries.length))}:{}),...(['forest','cranberry','cream','navy'].includes(v.carStyle??'')?{carStyle:v.carStyle}:{}),settledDays:[...new Set((Array.isArray(v.settledDays)?v.settledDays:[]).filter(validDay))].sort(),...(cup!==undefined?{cupMl:cup}:{}),...(driver?{driverName:driver}:{}),...(normalizeHydration(v.hydration)?{hydration:normalizeHydration(v.hydration)}:{}),...(v.avatar?{avatar:normalizeAvatar(v.avatar)}:{}),...(v.mode==='free'||v.mode==='goal'?{mode:v.mode}:{}),...(Number.isInteger(v.goalMl)&&v.goalMl!>=1&&v.goalMl!<=20000?{goalMl:v.goalMl}:{}),...(Array.isArray(v.cupPresets)?{cupPresets:[...new Set(v.cupPresets.filter(n=>Number.isInteger(n)&&n>0&&n<=5000))].slice(0,12)}:{})};
}
export const distance=(ml:number)=>Math.round(ml*KM_PER_ML*10)/10;
export function routeAt(km:number){const value=Math.max(0,Number.isFinite(km)?km:0),leg=Math.floor(value/LEG_KM),index=leg%countries.length,along=Math.round((value%LEG_KM)*10)/10;return {index,country:countries[index],next:countries[(index+1)%countries.length],progress:along/LEG_KM,remaining:Math.round((LEG_KM-along)*10)/10,lap:Math.floor(leg/countries.length)+1};}
export function tripSummary(value:WaterTrip,day:string){const drinks=value.drinks.filter(d=>d.day===day),ml=drinks.reduce((n,d)=>n+d.ml,0),totalMl=value.drinks.reduce((n,d)=>n+d.ml,0);return {drinks,ml,km:distance(ml),totalKm:distance(totalMl),times:drinks.length,route:routeAt(distance(totalMl))};}
export function recordDrink(value:WaterTrip,ml:number,date=new Date(),id=globalThis.crypto?.randomUUID?.()??('drink-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2))):WaterTrip{
 if(!Number.isInteger(ml)||ml<1||ml>5000)throw Error('Invalid volume');
 if(value.drinks.some(d=>d.id===id))return value;
 return {...value,drinks:[...value.drinks,{id,ml,at:date.toISOString(),day:localDate(date)}]};
}
export function settleDay(value:WaterTrip,day:string):WaterTrip{if(!validDay(day)||!value.drinks.some(d=>d.day===day)||value.settledDays.includes(day))return value;return {...value,settledDays:[...value.settledDays,day].sort()};}
export function settlePreviousDays(value:WaterTrip,today:string):WaterTrip{const days=[...new Set(value.drinks.filter(d=>d.day<today).map(d=>d.day))];return days.reduce(settleDay,value);}
export function ticketForDay(value:WaterTrip,day:string){const summary=tripSummary(value,day);if(!summary.times)return null;const before=value.drinks.filter(d=>d.day<day).reduce((n,d)=>n+d.ml,0),start=distance(before),end=distance(before+summary.ml);return {day,ml:summary.ml,km:summary.km,times:summary.times,start,end,from:routeAt(start),to:routeAt(end),number:'SANTA-'+day.replaceAll('-','')};}

export function activeWaterGoal(value:WaterTrip){return value.mode==='free'?undefined:calculateWaterGoal(value.hydration);}
