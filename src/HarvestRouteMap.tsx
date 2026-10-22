import {useEffect,useRef,useState} from 'react';
import {language,locale} from './i18n';
import type {routeReview} from './harvest-route';
import {restBadgeForDay} from './rest-badges';
const tx=(zh:string,en:string)=>language==='en'?en:zh;
type Point=ReturnType<typeof routeReview>['points'][number];
export default function HarvestRouteMap({points,max,onDay}:{points:Point[];max:number;onDay:(day:string)=>void}){
 const host=useRef<HTMLDivElement>(null),[width,setWidth]=useState(480),[selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{const update=()=>setWidth(Math.max(240,host.current?.clientWidth??480));update();const ro=new ResizeObserver(update);if(host.current)ro.observe(host.current);return()=>ro.disconnect();},[]);
 useEffect(()=>setSelected(null),[points]);
 const left=20,right=width-49,top=94,bottom=207,coords=points.map((p,i)=>({...p,x:left+(right-left)*i/Math.max(1,points.length-1),y:bottom-p.routeMl/max*(bottom-top)}));
 const path=coords.length===1?`M${left},${coords[0].y}H${right}`:coords.map((p,i)=>{if(!i)return `M${p.x},${p.y}`;const before=coords[i-1],mid=(before.x+p.x)/2;return`C${mid},${before.y} ${mid},${p.y} ${p.x},${p.y}`;}).join(' '),detail=points.find(p=>p.day===selected);
 return <div className="folderMap" ref={host}>
  <svg viewBox={`0 0 ${width} 250`} role="group" aria-label={tx('飲水冒險路線圖；橫向為日期，縱向為毫升。休息站維持路線連續，不代表當天有飲水紀錄。','Water route: dates horizontally, millilitres vertically. Rest stops keep the illustrated road continuous and do not add water records.')}>
   <defs><pattern id="folder-map-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#907e53" strokeWidth=".4" opacity=".17"/></pattern><g id="folder-map-tree"><path d="m0 0-5 9h3l-5 7h5v5h4v-5h5L2 9h3Z" fill="#6c7a53"/><path d="M0 4v14" stroke="#475d45" strokeWidth=".7"/></g><g id="folder-map-mountain"><path d="m-13 12 13-24 15 24-10-6-5-9-5 10Z" fill="#a9986e" stroke="#81704a" strokeWidth=".7"/><path d="m0-12-2 13 6 7m-6-7-5 9m10-5 4 5" fill="none" stroke="#81704a" strokeWidth=".5"/></g></defs>
   <rect x="1" y="1" width={width-2} height="248" rx="2" fill="#e8dcbb" stroke="#ac956b"/>
   <rect x="8" y="8" width={width-16} height="234" fill="url(#folder-map-grid)" stroke="#b8a37d" strokeWidth=".5"/>
   <g opacity=".28"><path d={`M8 111Q${width*.28} 148 ${width*.47} 97T${width-10} 131`} fill="none" stroke="#7c9f97" strokeWidth="13"/><path d={`M${width*.25} 75l21-28 25 28-16-7-9-11-8 14Zm${width*.59} 134l20-30 27 30-15-8-12-12-7 16Z`} fill="#a68b59" stroke="#796a48"/><use href="#folder-map-tree" x={width*.17} y="155"/><use href="#folder-map-tree" x={width*.76} y="53"/><use href="#folder-map-tree" x={width*.8} y="68"/><use href="#folder-map-tree" x={width*.5} y="165"/></g>
   <g opacity=".22">{Array.from({length:14},(_,i)=><use key={i} href="#folder-map-tree" x={16+(i*37)%(width-80)} y={65+(i*43)%125} transform={i%3===0?'scale(1.1)':undefined}/>)}<use href="#folder-map-mountain" x={width*.24} y="64"/><use href="#folder-map-mountain" x={width*.3} y="74"/><use href="#folder-map-mountain" x={width*.65} y="165"/></g><g className="folderCompass" transform={`translate(${width-76},25)`}><circle r="12"/><path d="m0-15 3 12 12 3-12 3-3 12-3-12-12-3 12-3Zm0-9v18"/></g>
   <text x="16" y="25" className="folderMapTitle">{tx('沿途補水紀事','REFILL EXPEDITION')}</text>
   {[0,.25,.5,.75,1].map(v=><g key={v}><path d={`M12 ${bottom-v*(bottom-top)}H${right+5}`} stroke="#9d8b61" strokeDasharray="3 5" strokeWidth=".6" opacity=".55"/><path d={`M${right+8} ${bottom-v*(bottom-top)}h4`} stroke="#8c774b"/><text x={right+15} y={bottom-v*(bottom-top)+3} className="folderMapScale">{Math.round(max*v).toLocaleString(locale)}</text></g>)}
   <text x={right+16} y="30" className="folderMapScale">mL</text>
   <path d={path} stroke="#a69262" strokeWidth="12" fill="none" strokeLinecap="round" opacity=".35"/>
   <path d={path} stroke="#f7eccb" strokeWidth="8" fill="none" strokeLinecap="round"/>
   <path d={path} stroke="#8d533d" strokeWidth="2" strokeDasharray="5 5" fill="none" strokeLinecap="round"/>
   {coords.map((p,i)=><g key={p.day} className="folderMapStop" role="button" tabIndex={0} aria-label={p.day+' · '+(p.kind==='recorded'?p.ml.toLocaleString(locale)+' mL':p.kind==='rest'?tx('休息站：未紀錄','Rest stop: no record'):tx('尚未出發','Not yet travelled'))} onClick={()=>setSelected(p.day)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(p.day);}}}>
    <title>{p.day+' · '+p.ml+' mL'}</title>
    {p.kind==='rest'?(()=>{const badge=restBadgeForDay(p.day),size=Math.min(36,(right-left)/Math.max(1,points.length-1)+3);const badgeY=p.y-size*1.2-12;return <><svg x={p.x-size/2} y={badgeY} width={size} height={size*1.2} viewBox={badge.viewBox} preserveAspectRatio="xMidYMid meet" overflow="hidden" className="folderRestBadge" aria-hidden="true" data-badge={badge.id}><image href={badge.src} x="0" y="0" width={badge.imageWidth} height={badge.imageHeight}/></svg><g className="folderRestHouse" transform={`translate(${p.x},${p.y})`} aria-hidden="true"><path d="M-8-1 0-8 8-1M-6-2v8H6v-8" fill="#9a7148" stroke="#68472e" strokeWidth="1.5" strokeLinejoin="round"/><path d="M-1 6V1H2v5" fill="#f2e1b5"/><path d="M-4-1h2v2h-2" fill="#ead6a6"/></g></>;})():<><circle cx={p.x} cy={p.y} r={p.kind==='planned'?4:5} fill={p.kind==='planned'?'#e8dcbb':'#6c7950'} stroke="#5c653f" strokeWidth="1.5"/>{p.kind==='recorded'&&<circle cx={p.x} cy={p.y} r="2" fill="#f7eccb"/>}</>}
    <text x={p.x} y="231" textAnchor="middle" className="folderMapDate">{p.day.slice(5).replace('-','/')}</text>
   </g>)}
  </svg>
  {detail?<div className="folderMapDetail"><span>{detail.day} · {detail.kind==='recorded'?detail.ml.toLocaleString(locale)+' mL · '+detail.times+tx(' 次補給',' refills'):detail.kind==='rest'?tx('休息站 · 今天沒有留下紀錄','Rest stop · no record today'):tx('旅程尚未開始','Journey ahead')}</span><button onClick={()=>onDay(detail.day)}>{tx('查看此日','View day')}</button></div>:<p className="folderMapHint">{tx('點選路線上的日期查看紀錄。','Select a date on the route to read its record.')}</p>}
 </div>;
}
