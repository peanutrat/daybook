import {affineMatrix,matrixPoint,type Affine} from './studio-pixels';
export type TransformMode='uniform'|'free'|'skew';
export type Point={x:number;y:number};
export type Bounds={x:number;y:number;width:number;height:number};
export const handles=[[0,0],[.5,0],[1,0],[1,.5],[1,1],[.5,1],[0,1],[0,.5]] as const;
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function anchored(next:Affine,before:Affine,bounds:Bounds,anchor:Point){const cx=bounds.x+bounds.width/2,cy=bounds.y+bounds.height/2,a=matrixPoint(affineMatrix(before,cx,cy),anchor.x,anchor.y),b=matrixPoint(affineMatrix(next,cx,cy),anchor.x,anchor.y);return {...next,x:next.x+a.x-b.x,y:next.y+a.y-b.y}}
export function dragHandle(before:Affine,bounds:Bounds,index:number,delta:Point,mode:TransformMode):Affine{const [hx,hy]=handles[index],cx=bounds.x+bounds.width/2,cy=bounds.y+bounds.height/2,handle={x:bounds.x+hx*bounds.width,y:bounds.y+hy*bounds.height},opposite={x:bounds.x+(1-hx)*bounds.width,y:bounds.y+(1-hy)*bounds.height},m=affineMatrix(before,cx,cy),start=matrixPoint(m,handle.x,handle.y),anchor=matrixPoint(m,opposite.x,opposite.y),next={...before};
 if(mode==='free'&&(hx===.5||hy===.5)){
  const det=m[0]*m[3]-m[1]*m[2];if(Math.abs(det)<1e-8)return before;
  const [a,b,c,d]=m;
  // Move the grabbed edge by the entire pointer delta, keeping the opposite edge fixed.
  const height=handle.y-opposite.y,width=handle.x-opposite.x;
  const aa=hx===.5?a:a+delta.x/width,bb=hx===.5?b:b+delta.y/width,cc=hx===.5?c+delta.x/height:c,dd=hx===.5?d+delta.y/height:d;
  // Decompose against the existing rotation: R * scale/shear supports both edge directions.
  const angle=-before.rotation*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle),sx=aa*cos-bb*sin,sy=cc*sin+dd*cos;
  next.scaleX=clamp(sx*100,-800,800);next.scaleY=clamp(sy*100,-800,800);
  next.skewX=clamp(Math.atan((cc*cos-dd*sin)/(Math.abs(sy)<.005?(sy<0?-.005:.005):sy))*180/Math.PI,-80,80);
  next.skewY=clamp(Math.atan((aa*sin+bb*cos)/(Math.abs(sx)<.005?(sx<0?-.005:.005):sx))*180/Math.PI,-80,80);
  for(const key of ['scaleX','scaleY'] as const)if(Math.abs(next[key])<.5)next[key]=(next[key]<0?-1:1)*.5;
  return anchored(next,before,bounds,opposite)
 }
 if(mode==='skew'){const angle=-before.rotation*Math.PI/180,dx=delta.x*Math.cos(angle)-delta.y*Math.sin(angle),dy=delta.x*Math.sin(angle)+delta.y*Math.cos(angle);if(hy!==.5&&(hx===.5||Math.abs(dx)>=Math.abs(dy))){const span=(handle.y-opposite.y)*before.scaleY/100;if(Math.abs(span)>.001)next.skewX=clamp(Math.atan(Math.tan(before.skewX*Math.PI/180)+dx/span)*180/Math.PI,-80,80)}else{const span=(handle.x-opposite.x)*before.scaleX/100;if(Math.abs(span)>.001)next.skewY=clamp(Math.atan(Math.tan(before.skewY*Math.PI/180)+dy/span)*180/Math.PI,-80,80)}}
 else if(mode==='uniform'){const vx=start.x-anchor.x,vy=start.y-anchor.y,den=vx*vx+vy*vy,ratio=den?((vx+delta.x)*vx+(vy+delta.y)*vy)/den:1;next.scaleX=clamp(before.scaleX*ratio,-800,800);next.scaleY=clamp(before.scaleY*ratio,-800,800)}
 else{const det=m[0]*m[3]-m[1]*m[2];if(Math.abs(det)<1e-8)return before;const dx=(m[3]*delta.x-m[2]*delta.y)/det,dy=(-m[1]*delta.x+m[0]*delta.y)/det;if(hx!==.5)next.scaleX=clamp(before.scaleX*(1+dx/(handle.x-opposite.x)),-800,800);if(hy!==.5)next.scaleY=clamp(before.scaleY*(1+dy/(handle.y-opposite.y)),-800,800)}
 // Keep a small invertible footprint, including when dragging across the opposite side.
 for(const key of ['scaleX','scaleY'] as const)if(Math.abs(next[key])<.5)next[key]=(next[key]<0?-1:1)*.5;
 return anchored(next,before,bounds,opposite)
}
export function angleDelta(previous:number,next:number){return ((next-previous+Math.PI*3)%(Math.PI*2))-Math.PI}
