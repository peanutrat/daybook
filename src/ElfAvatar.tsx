import {normalizeAvatar,partsFor,type ElfAvatar as Appearance} from './elf-avatar';
function recolor(color:string,base:string,target:string){
 if(base.toLowerCase()===target.toLowerCase())return color;
 const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),[c,b,t]=[color,base,target].map(rgb);
 const light=(v:number[])=>v[0]*.2126+v[1]*.7152+v[2]*.0722,cl=light(c),bl=light(b);
 const adjusted=cl<=bl?t.map(v=>v*cl/Math.max(1,bl)):t.map(v=>v+(255-v)*(cl-bl)/Math.max(1,255-bl));
 return '#'+adjusted.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
}

export const avatarLayerOrder=['backHair','body','head','ears','blush','eyes','mouth','frontHair','sideHair','decoration','clothes','shirt','hands','headwear'] as const;
export function ElfAvatar({avatar,portrait=false,carPose=false,centered=false}:{avatar?:Appearance;portrait?:boolean;carPose?:boolean;centered?:boolean}){
 const a=normalizeAvatar(avatar);
 const find=(key:string,id:string)=>partsFor(key).find(p=>p.id===id);
 const part=(key:typeof avatarLayerOrder[number])=>key==='shirt'?(['clothes-2','clothes-3'].includes(a.clothes)?find('clothes','clothes-4'):undefined):key==='body'?partsFor('body')[0]:key==='head'?partsFor('body')[1]:key==='decoration'?(a.decorativeHair?partsFor('decoration')[0]:undefined):key==='hands'||key==='blush'?partsFor(key)[0]:find(key,a[key]);
 function paint(key:string,c:string,p:ReturnType<typeof part>,x:number,y:number){
  const custom=p?a.partColors?.[p.id]:undefined;if(custom==='source')return c;if(custom)return p?.base&&p.tints.includes(c)?recolor(c,p.base,custom):c;
  if(key==='hands'||key==='shirt')return c;
  if(key==='blush')return a.blushColor?recolor(c,'#fdac9b',a.blushColor):c;
  if(['body','head','ears'].includes(key)){if(c==='#000000')return c;return recolor(c,'#fee6d6',a.skin);}
  if(key==='eyes')return ['#000000','#ffffff'].includes(c)?c:c==='#fee6d6'?recolor(c,'#fee6d6',a.skin):a.eyeColor?recolor(c,'#959595',a.eyeColor):c;
  const color=['frontHair','backHair','sideHair','decoration'].includes(key)?a.hairColor:key==='clothes'?a.clothesColor:key==='headwear'?a.accessoryColor:a.mouthColor;
  return p?.base&&color&&p.tints.includes(c)?recolor(c,p.base,color):c;
 }
 const visibleParts=avatarLayerOrder.flatMap(key=>key==='headwear'?partsFor('headwear').filter(p=>(a.headwears??(a.headwear==='none'?[]:[a.headwear])).includes(p.id)):(part(key)?[part(key)!]:[]));
 const points=centered?visibleParts.flatMap(p=>p.pixels.filter(pixel=>Number(pixel[3])>0)):[];
 let camera='0 0 32 32';
 if(points.length){const xs=points.map(p=>Number(p[0])),ys=points.map(p=>Number(p[1])),left=Math.min(...xs),right=Math.max(...xs)+1,top=Math.min(...ys),bottom=Math.max(...ys)+1,size=Math.max(right-left,bottom-top)+4;camera=[(left+right-size)/2,(top+bottom-size)/2,size,size].join(' ');}
 return <svg className="elfAvatar" viewBox={camera} aria-hidden="true" shapeRendering="crispEdges" data-avatar-art="parts32" data-avatar-portrait={portrait?'true':'false'}>{avatarLayerOrder.map(key=>{const p=part(key),selected=key==='headwear'?partsFor('headwear').filter(p=>(a.headwears??(a.headwear==='none'?[]:[a.headwear])).includes(p.id)):p?[p]:[];return <g key={key} data-avatar-layer={key} data-part={p?.id}>{selected.flatMap(p=>p!.pixels.filter(pixel=>!carPose||!['body','backHair','clothes','shirt'].includes(key)||Number(pixel[1])<26).map(([x,y,c,alpha])=><rect key={p!.id+':'+x+':'+y} x={x} y={y} width="1" height="1" fill={paint(key,String(c),p,Number(x),Number(y))} opacity={alpha===255?undefined:Number(alpha)/255}/>))}</g>})}</svg>;
}
