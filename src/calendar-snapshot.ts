// Paint the visible calendar's measured layout. No independent stamp/task wrapping.
export async function paintCalendarSnapshot(ctx:CanvasRenderingContext2D,grid:HTMLElement,x:number,y:number,width:number){
 const bounds=grid.getBoundingClientRect(),scale=width/bounds.width;
 if(!bounds.width||!bounds.height)throw Error('Calendar is not visible');
 const images=Array.from(grid.querySelectorAll('img'));
 await Promise.all(images.map(img=>img.decode().catch(()=>undefined)));
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.translate(-bounds.left,-bounds.top);
 const visibleColor=(c:string)=>!!c&&c!=='transparent'&&c!=='rgba(0, 0, 0, 0)';
 const segmenter=new Intl.Segmenter(undefined,{granularity:'grapheme'});
 function paint(el:HTMLElement){
  const css=getComputedStyle(el);if(css.display==='none'||css.visibility==='hidden'||el.tagName==='I')return;
  const r=el.getBoundingClientRect();ctx.save();ctx.globalAlpha*=Number(css.opacity||1);
  if(r.width&&r.height){
   const radius=Math.min(parseFloat(css.borderRadius)||0,r.width/2,r.height/2);
   const shape=()=>{ctx.beginPath();ctx.roundRect(r.left,r.top,r.width,r.height,radius)};
   if(visibleColor(css.backgroundColor)){shape();ctx.fillStyle=css.backgroundColor;ctx.fill()}
   for(const [side,line] of [['Top',[r.left,r.top,r.right,r.top]],['Right',[r.right,r.top,r.right,r.bottom]],['Bottom',[r.left,r.bottom,r.right,r.bottom]],['Left',[r.left,r.top,r.left,r.bottom]]] as const){
    const size=parseFloat(css.getPropertyValue('border-'+side.toLowerCase()+'-width')),color=css.getPropertyValue('border-'+side.toLowerCase()+'-color');
    if(size&&visibleColor(color)){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=size;ctx.moveTo(line[0],line[1]);ctx.lineTo(line[2],line[3]);ctx.stroke()}
   }
   if(el.matches('.today .daytop b')){shape();ctx.lineWidth=2;ctx.strokeStyle=getComputedStyle(grid).getPropertyValue('--accent');ctx.stroke()}
   if(['hidden','clip','auto','scroll'].includes(css.overflowX)||['hidden','clip','auto','scroll'].includes(css.overflowY)){shape();ctx.clip()}
  }
  if(el instanceof HTMLImageElement){
   if(el.complete&&el.naturalWidth){const fit=Math.min(r.width/el.naturalWidth,r.height/el.naturalHeight),w=el.naturalWidth*fit,h=el.naturalHeight*fit;ctx.drawImage(el,r.left+(r.width-w)/2,r.top+(r.height-h)/2,w,h)}
  }else for(const child of Array.from(el.childNodes)){
   if(child.nodeType===1){paint(child as HTMLElement);continue}if(child.nodeType!==3||!child.textContent?.trim())continue;
   ctx.font=`${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;ctx.fillStyle=css.color;ctx.textAlign='left';ctx.textBaseline='alphabetic';
   const size=parseFloat(css.fontSize),metrics=ctx.measureText('國Mg'),ascent=metrics.fontBoundingBoxAscent||size*.85,descent=metrics.fontBoundingBoxDescent||size*.15;
   const range=document.createRange();
   for(const {segment,index} of segmenter.segment(child.textContent)){
    range.setStart(child,index);range.setEnd(child,index+segment.length);const box=range.getBoundingClientRect();if(!box.width||!box.height)continue;
    const baseline=box.top+(box.height-ascent-descent)/2+ascent;ctx.fillText(segment,box.left,baseline);
    if(css.textDecorationLine.includes('line-through')){ctx.strokeStyle=css.color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(box.left,baseline-size*.3);ctx.lineTo(box.right,baseline-size*.3);ctx.stroke()}
   }range.detach();
  }
  ctx.restore();
 }
 paint(grid);ctx.restore();return bounds.height*scale;
}
