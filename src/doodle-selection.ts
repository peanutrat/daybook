import type {Dot,Span} from './doodle';
export function rectangleSelection(a:Dot,b:Dot,width:number,height:number):Span[]{const left=Math.max(0,Math.floor(Math.min(a.x,b.x))),right=Math.min(width,Math.ceil(Math.max(a.x,b.x))),top=Math.max(0,Math.floor(Math.min(a.y,b.y))),bottom=Math.min(height,Math.ceil(Math.max(a.y,b.y)));if(left>=right||top>=bottom)return [];return Array.from({length:bottom-top},(_,i)=>[top+i,left,right] as Span)}
export function outlineSelection(spans:Span[],size:number,width:number,height:number):Span[]{
 const mask=spansMask(spans,width,height),distance=new Float32Array(width*height).fill(width+height),diagonal=Math.SQRT2;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x;if(!mask[i]){distance[i]=0;continue}distance[i]=Math.min(x===0||y===0?1:distance[i],x?distance[i-1]+1:1,y?distance[i-width]+1:1,x&&y?distance[i-width-1]+diagonal:Infinity,y&&x+1<width?distance[i-width+1]+diagonal:Infinity)}
 for(let y=height-1;y>=0;y--)for(let x=width-1;x>=0;x--){const i=y*width+x;if(!mask[i])continue;distance[i]=Math.min(distance[i],x===width-1||y===height-1?1:Infinity,x+1<width?distance[i+1]+1:1,y+1<height?distance[i+width]+1:1,x+1<width&&y+1<height?distance[i+width+1]+diagonal:Infinity,x&&y+1<height?distance[i+width-1]+diagonal:Infinity)}
 for(let i=0;i<mask.length;i++)if(distance[i]>Math.max(1,size))mask[i]=0;return selectionSpans(mask,width,height);
}
export function spansMask(spans:Span[]|null,width:number,height:number){const mask=new Uint8Array(width*height);for(const [y,left,right] of spans??[])if(y>=0&&y<height)mask.fill(1,y*width+Math.max(0,left),y*width+Math.min(width,right));return mask}
export function selectionSpans(mask:Uint8Array,width:number,height:number):Span[]{const out:Span[]=[];for(let y=0;y<height;y++){let x=0;while(x<width){if(!mask[y*width+x]){x++;continue}const start=x;while(x<width&&mask[y*width+x])x++;out.push([y,start,x])}}return out}
// Scanline even-odd fill closes the freehand polygon, including concave outlines.
export function lassoSelection(points:Dot[],width:number,height:number):Span[]{
 if(points.length<3)return [];const out:Span[]=[];
 const top=Math.max(0,Math.floor(Math.min(...points.map(p=>p.y)))),bottom=Math.min(height,Math.ceil(Math.max(...points.map(p=>p.y))));
 for(let y=top;y<bottom;y++){const sy=y+.5,crossings:number[]=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a.y<=sy&&b.y>sy)||(b.y<=sy&&a.y>sy))crossings.push(a.x+(sy-a.y)*(b.x-a.x)/(b.y-a.y))}crossings.sort((a,b)=>a-b);for(let i=0;i+1<crossings.length;i+=2){const left=Math.max(0,Math.ceil(crossings[i]-.5)),right=Math.min(width,Math.ceil(crossings[i+1]-.5));if(right>left)out.push([y,left,right])}}
 return out;
}
// Paint a capsule into the selection mask: fast strokes never leave gaps.
export function paintSelection(mask:Uint8Array,a:Dot,b:Dot,size:number,erase:boolean,width:number,height:number){
 const radius=Math.max(.5,size/2),dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
 for(let y=Math.max(0,Math.floor(Math.min(a.y,b.y)-radius));y<Math.min(height,Math.ceil(Math.max(a.y,b.y)+radius));y++)for(let x=Math.max(0,Math.floor(Math.min(a.x,b.x)-radius));x<Math.min(width,Math.ceil(Math.max(a.x,b.x)+radius));x++){const t=length?Math.max(0,Math.min(1,((x+.5-a.x)*dx+(y+.5-a.y)*dy)/length)):0;if((x+.5-a.x-dx*t)**2+(y+.5-a.y-dy*t)**2<=radius*radius)mask[y*width+x]=erase?0:1}
}
export function combineSelection(before:Span[]|null,area:Span[],mode:'replace'|'add'|'subtract',width:number,height:number){if(mode==='replace')return area;const mask=spansMask(before,width,height);for(const [y,left,right] of area)mask.fill(mode==='add'?1:0,y*width+left,y*width+right);return selectionSpans(mask,width,height)}
