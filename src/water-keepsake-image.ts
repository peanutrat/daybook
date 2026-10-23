import {language} from './i18n';
import {waterKeepsakeModel,waterKeepsakeSvg} from './water-keepsake';
import {roadScenes} from './road-scenes';
import type {WaterKeepsakeModel} from './water-keepsake';
import type {WaterTrip} from './water-trip';
function keepsakeAssets(model:WaterKeepsakeModel,trip:WaterTrip){const scene=roadScenes[model.scene];return{banner:scene.src,place:model.hasScene?scene.place():language==='en'?'Your journey awaits':'旅程待出發',stickers:'./trip/license-stickers.png',car:'./trip/cars/'+(trip.carStyle??'forest')+'.webp'};}
const embedded=new Map<string,Promise<string>>();
function embed(url:string){if(!embedded.has(url))embedded.set(url,fetch(url).then(r=>{if(!r.ok)throw Error('Asset unavailable');return r.blob();}).then(blob=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('Image read failed'));reader.readAsDataURL(blob);})).catch(error=>{embedded.delete(url);throw error;}));return embedded.get(url)!;}
export async function waterKeepsakeImage(trip:WaterTrip,anchor:string,period:'week'|'month'){
 const model=waterKeepsakeModel(trip,anchor,period),assets=keepsakeAssets(model,trip),[banner,stickers,car]=await Promise.all([embed(assets.banner),embed(assets.stickers!),embed(assets.car!)]);
 if(document.fonts)await document.fonts.ready;
 const svg=waterKeepsakeSvg(model,{...assets,banner,stickers,car},language),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
 try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=2000;canvas.height=2920;const c=canvas.getContext('2d');if(!c)throw Error('Canvas unavailable');c.drawImage(img,0,0,2000,2920);return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG export failed')),'image/png'));}finally{URL.revokeObjectURL(url);}
}
