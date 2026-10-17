import {sortedStops} from './gradient-map';
import type {GradientFill} from './doodle';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
// Circle radius for a requested ink coverage, including overlapping dots near solid ink.
const radii=Float32Array.from({length:1025},(_,i)=>{const area=i/1024;let lo=0,hi=Math.SQRT1_2;for(let j=0;j<20;j++){const r=(lo+hi)/2,a=Math.PI*r*r-(r>.5?4*(r*r*Math.acos(.5/r)-.5*Math.sqrt(r*r-.25)):0);if(a<area)lo=r;else hi=r}return (lo+hi)/2});
export const dotRadius=(amount:number,spacing:number)=>radii[Math.round(clamp(amount)*1024)]*spacing;
const blendColor=(a:string,b:string,t:number)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
// Native circle paths keep drag previews fast even on large canvases.
export function halftoneGradient(op:GradientFill,width:number,height:number){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d')!;
 const spacing=Math.max(3,Math.min(64,op.halftone?.spacing??12)),angle=(op.halftone?.angle??45)*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle),dx=op.to.x-op.from.x,dy=op.to.y-op.from.y,length=Math.hypot(dx,dy);
 if(length<.01)return canvas;
 let stops=sortedStops(op.stops??[]);if(stops.length<2)stops=[{at:0,color:op.colors[0]==='transparent'?'#000000':op.colors[0]},{at:1,color:op.colors[1]==='transparent'?'#000000':op.colors[1]}];
 if(op.reverse)stops=stops.map(s=>({...s,at:1-s.at})).sort((a,b)=>a.at-b.at);
 const transparent=op.erase||op.fade||op.colors[1]==='transparent',corners=[[0,0],[width,0],[0,height],[width,height]],us=corners.map(([x,y])=>x*cos+y*sin),vs=corners.map(([x,y])=>-x*sin+y*cos),cells:{u:number;v:number;amount:number;a:string;b:string}[]=[];
 for(let iy=Math.floor(Math.min(...vs)/spacing)-1;iy<=Math.ceil(Math.max(...vs)/spacing);iy++)for(let ix=Math.floor(Math.min(...us)/spacing)-1;ix<=Math.ceil(Math.max(...us)/spacing);ix++){
  const u=(ix+.5)*spacing,v=(iy+.5)*spacing,cx=u*cos-v*sin,cy=u*sin+v*cos,t=clamp(op.radial?Math.hypot(cx-op.from.x,cy-op.from.y)/length:((cx-op.from.x)*dx+(cy-op.from.y)*dy)/(length*length));let r=stops.findIndex(s=>s.at>t);if(r<0)r=stops.length-1;const l=Math.max(0,r-1),span=stops[r].at-stops[l].at,fraction=span?clamp((t-stops[l].at)/span):1;
  cells.push({u,v,a:op.erase?'#000000':transparent?blendColor(stops[l].color,stops[r].color,fraction):stops[l].color,b:stops[r].color,amount:transparent?1-t:1-fraction});
 }
 ctx.rotate(angle);
 if(!transparent)for(const c of cells){ctx.fillStyle=c.b;ctx.fillRect(c.u-spacing/2-.15,c.v-spacing/2-.15,spacing+.3,spacing+.3)}
 for(const c of cells){if(c.amount<=0)continue;ctx.fillStyle=c.a;ctx.beginPath();ctx.arc(c.u,c.v,radii[Math.round(c.amount*1024)]*spacing,0,Math.PI*2);ctx.fill()}
 if(op.erase&&op.opacity<1){ctx.resetTransform();const mask=ctx.getImageData(0,0,width,height),alpha=clamp(op.opacity);for(let i=3;i<mask.data.length;i+=4)mask.data[i]=Math.round(mask.data[i]*alpha);ctx.putImageData(mask,0,0)}
 return canvas;
}
