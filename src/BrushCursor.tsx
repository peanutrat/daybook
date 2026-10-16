import {useEffect,useRef} from 'react';import {canvasDisplaySize,canvasPoint} from './canvas-coordinates';import type {View} from './doodle-controls';
// A DOM overlay has no browser cursor-image size cap; pointer motion does not rerender the painting component.
export default function BrushCursor({canvas,stage,size,view,enabled}:{canvas:React.RefObject<HTMLCanvasElement|null>;stage:React.RefObject<HTMLDivElement|null>;size:number;view:View;enabled:boolean}){
 const ring=useRef<HTMLDivElement>(null),last=useRef<{x:number;y:number;kind:string}|null>(null);
 useEffect(()=>{const el=stage.current,c=canvas.current,r=ring.current;if(!el||!c||!r)return;
  const hide=()=>{r.style.display='none';c.style.removeProperty('--drawing-cursor')};
  function show(){if(!el||!c||!r)return;const pointer=last.current;if(!enabled||!pointer||pointer.kind==='touch'){hide();return}const p=canvasPoint(c,pointer.x,pointer.y,view);if(p.x<0||p.y<0||p.x>c.width||p.y>c.height){hide();return}const rect=el.getBoundingClientRect(),diameter=Math.max(1,size*canvasDisplaySize(c,view).width/c.width);r.style.display='block';r.style.width=diameter+'px';r.style.height=diameter+'px';r.style.left=(pointer.x-rect.left)+'px';r.style.top=(pointer.y-rect.top)+'px';r.dataset.size=String(size);c.style.setProperty('--drawing-cursor','none')}
  const move=(e:PointerEvent)=>{const target=e.target as Element|null;if(target?.closest?.('.canvasChrome,.canvasFloatingPanel,.canvasTransformBar')){last.current=null;hide();return}last.current={x:e.clientX,y:e.clientY,kind:e.pointerType};show()};const leave=()=>{last.current=null;hide()};
  el.addEventListener('pointermove',move,{capture:true});el.addEventListener('pointerenter',move);el.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);show();return()=>{el.removeEventListener('pointermove',move,true);el.removeEventListener('pointerenter',move);el.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);hide()};
 },[canvas,stage,size,view,enabled]);
 return <div ref={ring} className="canvasBrushCursor" aria-hidden="true" style={{display:'none'}}/>;
}
