import {useEffect,useRef,useState} from 'react';
// Pointer capture keeps the gesture working on phones; a tap retains the color-picker action.
export default function useColorDrop(enabled:boolean,onDrop:(x:number,y:number)=>void){
 const active=useRef<{id:number;x:number;y:number;moved:boolean}|null>(null),suppress=useRef(false),latest=useRef(onDrop),[point,setPoint]=useState<{x:number;y:number}|null>(null);latest.current=onDrop;
 useEffect(()=>{if(!enabled){active.current=null;setPoint(null)}},[enabled]);
 return {point:enabled?point:null,consumeClick(){if(!suppress.current)return false;suppress.current=false;return true},handlers:{
  onPointerDown(e:React.PointerEvent<HTMLButtonElement>){suppress.current=false;if(!enabled||e.button!==0||active.current)return;e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);active.current={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false}},
  onPointerMove(e:React.PointerEvent<HTMLButtonElement>){const a=active.current;if(!a||a.id!==e.pointerId)return;if(Math.hypot(e.clientX-a.x,e.clientY-a.y)>=10)a.moved=true;if(a.moved){e.preventDefault();e.stopPropagation();setPoint({x:e.clientX,y:e.clientY})}},
  onPointerUp(e:React.PointerEvent<HTMLButtonElement>){const a=active.current;if(!a||a.id!==e.pointerId)return;active.current=null;setPoint(null);if(a.moved){e.preventDefault();e.stopPropagation();suppress.current=true;if(enabled)latest.current(e.clientX,e.clientY)}if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)},
  onPointerCancel(e:React.PointerEvent<HTMLButtonElement>){if(active.current?.id!==e.pointerId)return;suppress.current=!!active.current.moved;active.current=null;setPoint(null)},
  onLostPointerCapture(e:React.PointerEvent<HTMLButtonElement>){if(active.current?.id!==e.pointerId)return;active.current=null;setPoint(null)}
 }};
}
