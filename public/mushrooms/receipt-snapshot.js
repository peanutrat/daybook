import {t as uiText} from "./i18n.js";
// Draw the visible receipt using its actual DOM geometry and computed theme styles.
// No second weekly layout: wrapping, selected sprites and responsive grids come from the page.
function length(value,base=0){if(!value||value==='auto')return 0;if(value.endsWith('%'))return parseFloat(value)*base/100;const calc=value.match(/^calc\(([\d.]+)%\s*([+-])\s*([\d.]+)px\)$/);return calc?parseFloat(calc[1])*base/100+(calc[2]==='-'?-1:1)*parseFloat(calc[3]):parseFloat(value)||0}
function visible(style){return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>0}
function font(style){return [style.fontStyle||'normal',style.fontWeight||'400',style.fontSize||'14px',style.fontFamily||'sans-serif'].join(' ')}
function shape(ctx,rect,radius=0){ctx.beginPath();if(radius&&ctx.roundRect)ctx.roundRect(rect.left,rect.top,rect.width,rect.height,Math.min(radius,rect.width/2,rect.height/2));else ctx.rect(rect.left,rect.top,rect.width,rect.height)}
function baseline(ctx,style,rect){const metrics=ctx.measureText(uiText("國Ag")),size=parseFloat(style.fontSize)||14,ascent=metrics.fontBoundingBoxAscent??size*.88,descent=metrics.fontBoundingBoxDescent??size*.25;return rect.top+(rect.height-ascent-descent)/2+ascent}
export async function snapshotWeeklyReceipt(root,width=760){
 const doc=root.ownerDocument||document,view=doc.defaultView||window,styles=(el,pseudo)=>view.getComputedStyle(el,pseudo);
 await doc.fonts?.ready;
 await Promise.all(Array.from(root.querySelectorAll('img')).map(im=>im.decode?.().catch(()=>{})));
 const box=root.getBoundingClientRect();if(!box.width)throw Error(uiText("請先開啟每週回顧，再匯出圖片。"));
 const footer=root.querySelector('.receiptEnd'),footerTop=footer?.getBoundingClientRect().top,rootStyle=styles(root),report=root.querySelector('#weeklyReport'),reportTop=report?.getBoundingClientRect().top;
 const contentTop=reportTop>box.top?Math.max(box.top,reportTop-length(rootStyle.paddingTop)):box.top;
 const note=root.querySelector('.receiptTimingNote'),noteBox=note?.getBoundingClientRect(),noteStyle=note?styles(note):null;
 const noteGap=noteBox&&visible(noteStyle)?noteBox.height+length(noteStyle.marginTop)+length(noteStyle.marginBottom):0;
 function position(rect){const shift=noteGap&&rect.top>=noteBox.bottom?noteGap:0;return {left:rect.left,top:rect.top-shift,width:rect.width,height:rect.height,right:rect.right,bottom:rect.bottom-shift}}
 const bottom=footerTop>contentTop?Math.min(box.bottom,footerTop+length(rootStyle.paddingBottom)):box.bottom,height=bottom-contentTop-noteGap;
 const canvas=doc.createElement('canvas'),scale=width/box.width;canvas.width=width;canvas.height=Math.ceil(height*scale);const ctx=canvas.getContext('2d');if(!ctx)throw Error(uiText("無法建立收成圖片，請稍後再試。"));
 ctx.fillStyle=rootStyle.backgroundColor||'#fffdf0';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.setTransform(scale,0,0,scale,-box.left*scale,-contentTop*scale);
 function background(style,rect){const radius=length(style.borderTopLeftRadius);if(style.backgroundColor&&style.backgroundColor!=='transparent'&&style.backgroundColor!=='rgba(0, 0, 0, 0)'){ctx.fillStyle=style.backgroundColor;shape(ctx,rect,radius);ctx.fill()}const border=length(style.borderTopWidth);if(border&&style.borderTopStyle!=='none'){ctx.strokeStyle=style.borderTopColor;ctx.lineWidth=border;shape(ctx,{left:rect.left+border/2,top:rect.top+border/2,width:rect.width-border,height:rect.height-border},Math.max(0,radius-border/2));ctx.stroke()}}
 function pseudo(el,rect){const style=styles(el,'::before');if(!visible(style)||!style.content||style.content==='none'||style.content==='normal')return;const w=length(style.width,rect.width),h=length(style.height,rect.height);if(!w||!h)return;const area={left:rect.left+length(style.left,rect.width),top:rect.top+length(style.top,rect.height),width:w,height:h};ctx.save();ctx.globalAlpha*=Number(style.opacity||1);const points=style.clipPath?.match(/^polygon\((.*)\)$/);if(points){ctx.beginPath();points[1].split(',').forEach((point,i)=>{const [x,y]=point.trim().split(/\s+/),px=area.left+length(x,w),py=area.top+length(y,h);if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py)});ctx.closePath();ctx.clip()}background(style,area);ctx.restore()}
 function text(node,parentStyle){const value=node.textContent||'';ctx.font=font(parentStyle);ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillStyle=parentStyle.color;let offset=0;for(const ch of Array.from(value)){const range=doc.createRange();range.setStart(node,offset);offset+=ch.length;range.setEnd(node,offset);const raw=Array.from(range.getClientRects()).find(r=>r.width&&r.height);if(!raw||!ch.trim())continue;const rect=position(raw),y=baseline(ctx,parentStyle,rect);if(parentStyle.textShadow&&parentStyle.textShadow!=='none'&&ctx.strokeText){ctx.strokeStyle='#fff4d8';ctx.lineWidth=1.5;ctx.strokeText(ch,rect.left,y)}ctx.fillText(ch,rect.left,y)}}
 function draw(el,parentOpacity=1,imageArea=null){
  if(el===footer||el===note||el.hidden||['SELECT','INPUT','TEXTAREA'].includes(el.tagName)||el.classList.contains('receiptMeta'))return;
  if(el.tagName==='BUTTON'){if(el.classList.contains('weeklyDecoration')){const bounds=position(el.getBoundingClientRect());for(const child of Array.from(el.childNodes))if(child.nodeType===1&&child.tagName==='IMG'){const original=child.getBoundingClientRect(),size=Math.min(original.width*1.5,bounds.width,bounds.height);draw(child,parentOpacity,{left:bounds.left+(bounds.width-size)/2,top:bounds.top+(bounds.height-size)/2,width:size,height:size})}}return}const style=styles(el);if(!visible(style))return;const rect=imageArea||position(el.getBoundingClientRect());if(!rect.width||!rect.height)return;
  ctx.save();ctx.globalAlpha=parentOpacity*Number(style.opacity||1);const opacity=ctx.globalAlpha;
  const area=el===root?{left:box.left,top:contentTop,width:box.width,height}:rect;background(style,area);
  if(style.overflow==='hidden'||style.overflowX==='hidden'||style.overflowY==='hidden'){shape(ctx,area,length(style.borderTopLeftRadius));ctx.clip()}
  if(el.classList.contains('weekBars')){ctx.strokeStyle='#dedbb44d';ctx.lineWidth=1;for(let y=rect.bottom-42.5;y>rect.top;y-=43){ctx.beginPath();ctx.moveTo(rect.left,y);ctx.lineTo(rect.right,y);ctx.stroke()}}
  pseudo(el,rect);
  if(el.tagName==='IMG'){
   if(el.complete&&el.naturalWidth){const left=rect.left+length(style.paddingLeft)+length(style.borderLeftWidth),top=rect.top+length(style.paddingTop)+length(style.borderTopWidth),w=rect.width-length(style.paddingLeft)-length(style.paddingRight)-length(style.borderLeftWidth)-length(style.borderRightWidth),h=rect.height-length(style.paddingTop)-length(style.paddingBottom)-length(style.borderTopWidth)-length(style.borderBottomWidth),ratio=Math.min(w/el.naturalWidth,h/el.naturalHeight),iw=style.objectFit==='contain'?el.naturalWidth*ratio:w,ih=style.objectFit==='contain'?el.naturalHeight*ratio:h;ctx.imageSmoothingEnabled=style.imageRendering!=='pixelated';ctx.drawImage(el,left+(w-iw)/2,top+(h-ih)/2,iw,ih)}
  }else for(const child of Array.from(el.childNodes)){if(child.nodeType===3)text(child,style);else if(child.nodeType===1)draw(child,opacity)}
  ctx.restore();
 }
 draw(root);return canvas;
}
