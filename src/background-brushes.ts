import {dotRadius as halftoneRadius} from './halftone';
import type {DoodleStroke,Dot} from './doodle';
import type {StrokeProgress} from './doodle-brushes';

export const backgroundBrushes=[
 {id:'gouache',name:'水粉平頭筆',hint:'厚實鋪色 · 輕微混色與紙紋'},
 {id:'dryTexture',name:'乾刷紋理筆',hint:'斷續刷痕 · 木石與地面質感'},
 {id:'softMix',name:'柔邊混色筆',hint:'柔和過渡 · 帶入目前圖層底色'},
 {id:'scatter',name:'散布色塊筆',hint:'不規則色塊 · 樹叢與碎石'},
 {id:'hatching',name:'排線筆',hint:'隨筆跡彎曲的平行細線'},
 {id:'halftoneSoft',name:'柔邊網點筆',hint:'中央密實 · 邊緣漸小網點 · 鋪色與背景'},
 {id:'polkaDots',name:'圓點筆',hint:'整齊圓點 · 固定在畫布上的花紋'},
] as const;
export const availableBackgroundBrushes=backgroundBrushes.filter(b=>b.id!=='gouache'&&b.id!=='scatter');
export type BackgroundBrush=typeof backgroundBrushes[number]['id'];
export type BrushSource={data:Uint8ClampedArray;width:number;height:number;left:number;top:number};
export function readBrushSource(canvas:HTMLCanvasElement,stroke:DoodleStroke,start=0):BrushSource|undefined{if(!['watercolor','gouache','softMix'].includes(stroke.brush)||!stroke.points.length)return;const points=stroke.points.slice(Math.max(0,start-1)),margin=stroke.size/2+8;let left=canvas.width,top=canvas.height,right=0,bottom=0;for(const p of points){left=Math.min(left,p.x-margin);top=Math.min(top,p.y-margin);right=Math.max(right,p.x+margin);bottom=Math.max(bottom,p.y+margin)}left=Math.max(0,Math.floor(left));top=Math.max(0,Math.floor(top));right=Math.min(canvas.width,Math.ceil(right));bottom=Math.min(canvas.height,Math.ceil(bottom));if(right<=left||bottom<=top)return;const image=canvas.getContext('2d')!.getImageData(left,top,right-left,bottom-top);return {data:image.data,width:image.width,height:image.height,left,top}}
export type BackgroundProgress={mask:HTMLCanvasElement;hatch?:Dot[]};
export function isBackgroundBrush(brush:string){return backgroundBrushes.some(b=>b.id===brush)}
const limit=(n:number)=>Math.max(0,Math.min(1,n));
function hash(x:number,y:number){let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296}
function samplePath(points:Dot[],spacing:number,state:StrokeProgress){const out:Dot[]=state.index===0?[points[0]]:[];let carry=state.carry;for(let i=Math.max(1,state.index);i<points.length;i++){const a=points[i-1],b=points[i],distance=Math.hypot(b.x-a.x,b.y-a.y);if(!distance)continue;for(let d=spacing-carry;d<=distance;d+=spacing){const t=d/distance;out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,p:a.p+(b.p-a.p)*t})}carry=(carry+distance)%spacing}state.carry=carry;return out}
function makeMask(ctx:CanvasRenderingContext2D){const mask=document.createElement('canvas');mask.width=ctx.canvas.width;mask.height=ctx.canvas.height;return {mask}}

// Stroke-local opaque coverage prevents repeated dabs from darkening one watercolour stroke.
// Texture coordinates stay fixed on the paper; only the newly touched rectangle is processed.
export function paintBackgroundStroke(ctx:CanvasRenderingContext2D,stroke:DoodleStroke,state:StrokeProgress,source?:BrushSource){
 const {brush,size,points,color}=stroke;if(!points.length)return;
 const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),w=ctx.canvas.width,h=ctx.canvas.height;
 if(brush==='hatching'){
  const gap=Math.max(1,size/7);ctx.lineWidth=Math.max(.65,size*.018);ctx.lineCap='round';
  for(let i=state.index;i<points.length;i++){const p=points[i],a=points[Math.max(0,i-1)],length=Math.hypot(p.x-a.x,p.y-a.y),nx=length?-(p.y-a.y)/length:0,ny=length?(p.x-a.x)/length:1,spread=.7+.3*p.p;
   const strand=Array.from({length:7},(_,k)=>({x:p.x+nx*(k-3)*gap*spread,y:p.y+ny*(k-3)*gap*spread,p:1}));
   for(let k=0;k<7;k++){const from=state.hatch?.[k]??strand[k];ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(strand[k].x,strand[k].y);ctx.stroke();ctx.beginPath();ctx.arc(strand[k].x,strand[k].y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill()}state.hatch=strand;
  }return;
 }
 const random=()=>{state.seed=(Math.imul(state.seed,1664525)+1013904223)>>>0;return state.seed/4294967296};
 if(brush==='scatter'){
  for(const p of samplePath(points,Math.max(2,size*.24),state))for(let n=0;n<4;n++){const angle=random()*Math.PI*2,spread=Math.sqrt(random())*size*.44,x=p.x+Math.cos(angle)*spread,y=p.y+Math.sin(angle)*spread,r=Math.max(.8,size*(.045+random()*.095))*(.6+.4*p.p),shade=.84+random()*.27;ctx.fillStyle='rgb('+rgb.map(v=>Math.min(255,Math.round(v*shade))).join(',')+')';ctx.beginPath();for(let k=0;k<7;k++){const a=angle+k*Math.PI*2/7,radius=r*(.65+random()*.5),xx=x+Math.cos(a)*radius,yy=y+Math.sin(a)*radius*.72;if(k)ctx.lineTo(xx,yy);else ctx.moveTo(xx,yy)}ctx.closePath();ctx.fill()}return;
 }
 const bg=state.background??(state.background=makeMask(ctx)),mask=bg.mask.getContext('2d')!,soft=brush==='softMix',flat=brush==='gouache'||brush==='dryTexture',dots=brush==='polkaDots',halftone=brush==='halftoneSoft',water=brush==='watercolor';
 const patternGap=Math.max(3,Math.min(32,stroke.halftone?.spacing??Math.max(4,size*.12))),padding=halftone?patternGap*2+5:5;
 const stamps=samplePath(points,Math.max(.7,size*(soft?.1:.045)),state);if(!stamps.length)return;
 let left=w,top=h,right=0,bottom=0;
 for(const p of stamps){const r=Math.max(.7,size*(.55+.45*p.p)/2);left=Math.min(left,p.x-r-padding);right=Math.max(right,p.x+r+padding);top=Math.min(top,p.y-r-padding);bottom=Math.max(bottom,p.y+r+padding);mask.fillStyle='#000';
  if(soft||halftone){const g=mask.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'#000');g.addColorStop(halftone?1-(stroke.halftone?.softness??75)/100:.3,'#000');g.addColorStop(1,'#0000');mask.fillStyle=g}
  mask.beginPath();if(flat)mask.ellipse(p.x,p.y,r,r*.38,-Math.PI/7,0,Math.PI*2);else mask.arc(p.x,p.y,r,0,Math.PI*2);mask.fill();
 }
 left=Math.max(0,Math.floor(left));top=Math.max(0,Math.floor(top));right=Math.min(w,Math.ceil(right));bottom=Math.min(h,Math.ceil(bottom));const width=right-left,height=bottom-top;if(width<=0||height<=0)return;
 const coverage=mask.getImageData(left,top,width,height).data,output=ctx.createImageData(width,height),base=source?.data;


 if(halftone){
  for(let iy=Math.floor(top/patternGap);iy<Math.ceil(bottom/patternGap);iy++)for(let ix=Math.floor(left/patternGap);ix<Math.ceil(right/patternGap);ix++){
   const cx=(ix+.5)*patternGap,cy=(iy+.5)*patternGap,sx=Math.floor(cx)-left,sy=Math.floor(cy)-top,amount=sx>=0&&sy>=0&&sx<width&&sy<height?coverage[(sy*width+sx)*4+3]/255:0;if(!amount)continue;const radius=halftoneRadius(amount,patternGap),x0=Math.max(left,Math.ceil(ix*patternGap-.5)),x1=Math.min(right,Math.ceil((ix+1)*patternGap-.5)),y0=Math.max(top,Math.ceil(iy*patternGap-.5)),y1=Math.min(bottom,Math.ceil((iy+1)*patternGap-.5));
   for(let yy=y0;yy<y1;yy++){const dy=yy+.5-cy,dy2=dy*dy;for(let xx=x0;xx<x1;xx++){const dx=xx+.5-cx,raw=amount>=1?1:radius+.5-Math.sqrt(dx*dx+dy2);if(raw<=0)continue;const i=((yy-top)*width+xx-left)*4;output.data[i]=rgb[0];output.data[i+1]=rgb[1];output.data[i+2]=rgb[2];output.data[i+3]=Math.round(255*(raw>=1?1:raw)*stroke.opacity)}}
  }
  const dx=left>0?Math.ceil(patternGap):0,dy=top>0?Math.ceil(patternGap):0,dw=width-dx-(right<w?Math.ceil(patternGap):0),dh=height-dy-(bottom<h?Math.ceil(patternGap):0);if(dw>0&&dh>0)ctx.putImageData(output,left,top,dx,dy,dw,dh);return}

 const dilution=limit((stroke.water?.dilution??65)/100),load=limit((stroke.water?.load??55)/100),gap=Math.max(4,size*.32),dotRadius=Math.max(.75,gap*.145);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,cover=coverage[i+3]/255;if(!cover)continue;const xx=left+x,yy=top+y,fine=brush==='dryTexture'?hash(xx,yy):0,grain=dots||soft?0:brush==='dryTexture'&&stroke.textureVersion===2?hash(xx,yy):hash(Math.floor(xx/2),Math.floor(yy/2)),coarse=dots||soft?0:hash(Math.floor(xx/(brush==='dryTexture'&&stroke.textureVersion===2?3:7)),Math.floor(yy/(brush==='dryTexture'&&stroke.textureVersion===2?3:7)));let alpha=1,shade=1,mix=0;
  if(dots){const dx=((xx+.5)%gap+gap)%gap-gap/2,dy=((yy+.5)%gap+gap)%gap-gap/2;alpha=limit(dotRadius+.5-Math.hypot(dx,dy))}
  else if(brush==='dryTexture'){const refined=stroke.textureVersion===2,fiber=hash(Math.floor((xx+yy*.45)*(refined?1.6:.5)),Math.floor(yy/(refined?5:12)));alpha=fiber>(refined?.34:.38)&&grain>(refined?.12:.18)?(refined?.5+.38*fine:.45+.5*fine):0;shade=refined?.94+.08*coarse:.9+.13*coarse}
  else if(brush==='gouache'){alpha=grain>.025?.94:0;shade=.94+.08*coarse;mix=.22}
  else if(soft){alpha=.58;mix=.58}
  else if(water){const near=(dx:number,dy:number)=>{const px=x+dx,py=y+dy;return px<0||py<0||px>=width||py>=height?0:coverage[(py*width+px)*4+3]/255};const edge=limit(cover-Math.min(near(-2,0),near(2,0),near(0,-2),near(0,2)));alpha=(.48-.28*dilution)*(.45+.55*load)+edge*.1;alpha*=.82+.18*grain;shade=.96+.06*coarse;mix=.12+.18*dilution}
  if(alpha<=0)continue;const sx=source?xx-source.left:-1,sy=source?yy-source.top:-1,si=source&&sx>=0&&sy>=0&&sx<source.width&&sy<source.height?(sy*source.width+sx)*4:-1,baseAlpha=base&&si>=0?base[si+3]/255:0,amount=mix*baseAlpha;for(let k=0;k<3;k++)output.data[i+k]=Math.round(Math.min(255,rgb[k]*shade)*(1-amount)+(base&&si>=0?base[si+k]:0)*amount);
  output.data[i+3]=Math.round(255*cover*alpha*stroke.opacity);
 }const dx=left>0?2:0,dy=top>0?2:0,dw=width-dx-(right<w?2:0),dh=height-dy-(bottom<h?2:0);if(dw>0&&dh>0)ctx.putImageData(output,left,top,dx,dy,dw,dh);
}
