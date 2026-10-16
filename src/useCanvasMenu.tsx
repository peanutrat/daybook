import {useEffect,useRef,useState} from 'react';
import CanvasIcon from './CanvasIcon';
export default function useCanvasMenu(onAction:(id:string,action:'copy'|'delete')=>void){
 const [menu,setMenu]=useState<{id:string;x:number;y:number}|null>(null),panel=useRef<HTMLDivElement>(null),hold=useRef<{id:string;pointer:number;x:number;y:number;timer:ReturnType<typeof setTimeout>}|null>(null),suppress=useRef(false);
 function cancel(){if(hold.current)clearTimeout(hold.current.timer);hold.current=null}
 function open(id:string,x:number,y:number){cancel();suppress.current=true;setMenu({id,x:Math.max(8,Math.min(x,window.innerWidth-180)),y:Math.max(8,Math.min(y,window.innerHeight-112))})}
 useEffect(()=>{if(!menu)return;const outside=(e:PointerEvent)=>{if(!panel.current?.contains(e.target as Node))setMenu(null)},key=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(null)};document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',key)}},[menu]);
 useEffect(()=>()=>cancel(),[]);
 const bind=(id:string)=>({onContextMenu:(e:React.MouseEvent)=>{e.preventDefault();open(id,e.clientX,e.clientY)},onPointerDown:(e:React.PointerEvent)=>{suppress.current=false;if(e.pointerType==='mouse'||e.button!==0||(e.target as Element).closest('[data-sort-handle]'))return;cancel();const {pointerId,clientX,clientY}=e;hold.current={id,pointer:pointerId,x:clientX,y:clientY,timer:setTimeout(()=>open(id,clientX,clientY),550)}},onPointerMove:(e:React.PointerEvent)=>{const h=hold.current;if(h&&(h.pointer!==e.pointerId||Math.hypot(e.clientX-h.x,e.clientY-h.y)>9))cancel()},onPointerUp:cancel,onPointerCancel:cancel,onClickCapture:(e:React.MouseEvent)=>{if(suppress.current){e.preventDefault();e.stopPropagation();suppress.current=false}}});
 const popup=menu&&<div ref={panel} className="canvasAlbumMenu" role="menu" aria-label="畫布操作" style={{left:menu.x,top:menu.y}} onContextMenu={e=>e.preventDefault()}>{([['copy','複製畫布'],['delete','刪除畫布']] as const).map(([action,label])=><button key={action} type="button" role="menuitem" onClick={()=>{onAction(menu.id,action);suppress.current=false;setMenu(null)}}><CanvasIcon name={action==='copy'?'copy':'trash'}/>{label}</button>)}</div>;
 return {bind,popup};
}
