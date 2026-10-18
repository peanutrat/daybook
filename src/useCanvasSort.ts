import {t as uiText} from "./i18n.ts";
import {useRef,useState,type PointerEvent,type KeyboardEvent} from 'react';

// Reuse object identities: reordering must never change the artwork or layer data.
export function moveById<T extends {id:string}>(items:T[],from:string,to:string):T[]{
 const a=items.findIndex(x=>x.id===from),b=items.findIndex(x=>x.id===to);
 if(a<0||b<0||a===b)return items;
 const next=items.slice(),[item]=next.splice(a,1);next.splice(b,0,item);return next;
}

// Pointer capture keeps touch dragging independent of the browser's native HTML drag support.
export default function useCanvasSort(ids:string[],onMove:(from:string,to:string)=>void){
 const list=useRef<HTMLDivElement>(null),drag=useRef<{id:string;pointer:number;over:string|null}|null>(null);
 const pending=useRef<{id:string;pointer:number;x:number;y:number}|null>(null),suppressClick=useRef(false);
 const [visual,setVisual]=useState<{id:string;over:string|null}|null>(null);
 function target(e:PointerEvent<HTMLElement>){
  const root=list.current;if(!root)return null;
  const bounds=root.getBoundingClientRect();
  if(root.scrollHeight>root.clientHeight&&e.clientX>=bounds.left&&e.clientX<=bounds.right){
   const delta=e.clientY<bounds.top+28?-16:e.clientY>bounds.bottom-28?16:0;
   if(delta)root.scrollTop+=delta;
  }
  const row=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-sort-id]');
  return row&&root.contains(row)&&ids.includes(row.dataset.sortId??'')?row.dataset.sortId!:null;
 }
 function end(e:PointerEvent<HTMLElement>,cancel=false){
  const current=drag.current;if(!current||current.pointer!==e.pointerId)return;
  e.stopPropagation();const to=cancel?null:target(e);drag.current=null;setVisual(null);
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  if(to&&to!==current.id)onMove(current.id,to);
 }
 function handle(id:string){return {
  onPointerDown(e:PointerEvent<HTMLElement>){if(e.button!==0||drag.current)return;e.preventDefault();e.stopPropagation();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);drag.current={id,pointer:e.pointerId,over:id};setVisual({id,over:id})},
  onPointerMove(e:PointerEvent<HTMLElement>){if(drag.current?.pointer!==e.pointerId)return;e.preventDefault();e.stopPropagation();const over=target(e);drag.current.over=over;setVisual({id:drag.current.id,over})},
  onPointerUp(e:PointerEvent<HTMLElement>){end(e)},
  onPointerCancel(e:PointerEvent<HTMLElement>){end(e,true)},
  onLostPointerCapture(e:PointerEvent<HTMLElement>){end(e,true)},
  onKeyDown(e:KeyboardEvent<HTMLButtonElement>){if(e.key==='Escape'){drag.current=null;setVisual(null);e.stopPropagation();return}if(e.key!=='ArrowUp'&&e.key!=='ArrowDown')return;e.preventDefault();e.stopPropagation();const to=ids[ids.indexOf(id)+(e.key==='ArrowUp'?-1:1)];if(to)onMove(id,to)},
  onClick(e:React.MouseEvent<HTMLButtonElement>){e.preventDefault();e.stopPropagation()},
  'aria-label':uiText("拖曳排序"),title:uiText("拖曳排序（↑／↓ 可調整順序）"),className:'canvasSortHandle',
 }}
 function row(id:string){return {'data-sort-id':id,'data-dragging':visual?.id===id||undefined,'data-drop':visual?.over===id&&visual.id!==id?(ids.indexOf(visual.id)<ids.indexOf(id)?'after':'before'):undefined}}
 function direct(id:string){return {
  tabIndex:0,
  onPointerDown(e:PointerEvent<HTMLElement>){const el=e.target as Element;if(e.button!==0||drag.current||el.closest('input,select,textarea')||(el.closest('button')&&!el.closest('.canvasLayerSelect')))return;pending.current={id,pointer:e.pointerId,x:e.clientX,y:e.clientY};suppressClick.current=false},
  onPointerMove(e:PointerEvent<HTMLElement>){const p=pending.current;if(!p||p.pointer!==e.pointerId)return;if(!drag.current&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>=6){e.currentTarget.setPointerCapture(e.pointerId);drag.current={id,pointer:e.pointerId,over:id};suppressClick.current=true}if(drag.current){e.preventDefault();e.stopPropagation();const over=target(e);drag.current.over=over;setVisual({id,over})}},
  onPointerLeave(){if(!drag.current)pending.current=null},
  onPointerUp(e:PointerEvent<HTMLElement>){pending.current=null;end(e)},
  onPointerCancel(e:PointerEvent<HTMLElement>){pending.current=null;end(e,true)},
  onLostPointerCapture(e:PointerEvent<HTMLElement>){pending.current=null;end(e,true)},
  onClickCapture(e:React.MouseEvent<HTMLElement>){if(suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false}},
  onKeyDown(e:KeyboardEvent<HTMLElement>){if(e.target!==e.currentTarget)return;if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();const to=ids[ids.indexOf(id)+(e.key==='ArrowUp'?-1:1)];if(to)onMove(id,to)}}
 }}
 return {list,handle,row,direct,dragging:visual?.id??null};
}
