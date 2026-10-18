import {t as uiText} from "./i18n.ts";
import {tableCells} from './note-table';
import {noteBlocks,plainNote,type NoteToken} from './note-format';import type {Picture} from './media-helpers';
function download(blob:Blob,name:string){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function filename(text:string,date:string){return uiText("筆記-")+date+'-'+(plainNote(text).split('\n').find(l=>l.trim())||uiText("圖片筆記")).slice(0,22).replace(/[\\/:*?"<>|]/g,'_')}
export function exportNoteText(text:string,date:string){download(new Blob(['\ufeff'+plainNote(text)],{type:'text/plain;charset=utf-8'}),filename(text,date)+'.txt')}
export async function exportNoteImage(text:string,date:string,images:Picture[],colors:{paper:string;ink:string;accent:string}){
 await document.fonts.ready;const c=document.createElement('canvas');c.width=900;const ctx=c.getContext('2d')!,ops:(()=>void)[]=[];const left=48,max=804;let y=76;
 type Glyph={char:string;token:NoteToken;size:number;width:number;font:string};
 function rows(tokens:NoteToken[],width:number,size:number,bold=false){const result:{glyphs:Glyph[];height:number;size:number}[]=[];let row:Glyph[]=[],used=0,largest=size;const push=()=>{result.push({glyphs:row,height:largest*1.5,size:largest});row=[];used=0;largest=size};
  for(const token of tokens)for(const char of Array.from(token.text)){const n=token.size||size,font=(token.italic?'italic ':'')+(token.bold||bold?'bold ':'')+n+'px "Microsoft JhengHei", sans-serif';ctx.font=font;const widthOfChar=ctx.measureText(char).width;if(char==='\n'){push();continue}if(used+widthOfChar>width&&row.length)push();row.push({char,token,size:n,width:widthOfChar,font});used+=widthOfChar;largest=Math.max(largest,n)}push();return result;
 }
 function rounded(x:number,top:number,w:number,h:number){if(typeof ctx.roundRect==='function'){ctx.beginPath();ctx.roundRect(x,top,w,h,4);ctx.fill()}else ctx.fillRect(x,top,w,h)}
 function paint(lines:ReturnType<typeof rows>,x:number,top:number,color:string,align='left',available=804){for(const [ri,row] of lines.entries()){const used=row.glyphs.reduce((n,g)=>n+g.width,0),offset=align==='right'?available-used:align==='center'?(available-used)/2:0,gap=align==='justify'&&ri<lines.length-1&&row.glyphs.length>1?(available-used)/(row.glyphs.length-1):0;const baseline=top+row.size;const glyphs=row.glyphs;const drawTop=top;ops.push(()=>{
    let px=x+offset;for(let i=0;i<glyphs.length;){const g=glyphs[i];if(g.token.background&&!g.token.spoiler){let width=g.width,j=i+1;while(j<glyphs.length&&glyphs[j].token.background===g.token.background&&!glyphs[j].token.spoiler){width+=glyphs[j++].width}ctx.globalAlpha=.28;ctx.fillStyle=g.token.background;rounded(px-1,drawTop+1,width+2,row.size*1.25);ctx.globalAlpha=1;px+=width;i=j}else{px+=g.width+gap;i++}}
    px=x+offset;for(const g of glyphs){ctx.font=g.font;ctx.fillStyle=g.token.color||color;if(g.token.spoiler){ctx.fillStyle=colors.accent;ctx.fillRect(px,drawTop+1,g.width+gap+.6,row.size*1.25);px+=g.width+gap;continue}ctx.fillText(g.char,px,baseline);if(g.token.href){ctx.strokeStyle=ctx.fillStyle;ctx.beginPath();ctx.moveTo(px,baseline+3);ctx.lineTo(px+g.width,baseline+3);ctx.stroke()}if(g.token.strike){ctx.strokeStyle=ctx.fillStyle;ctx.beginPath();ctx.moveTo(px,baseline-g.size*.3);ctx.lineTo(px+g.width,baseline-g.size*.3);ctx.stroke()}px+=g.width+gap}
   });top+=row.height;
  }return top;
 }
 for(const block of noteBlocks(text)){
  if(block.type==='table'){const cols=Math.max(1,block.rows[0]?.length||1),widths=Array.from({length:cols},(_,i)=>(block.widths?.[i]??100/cols)*max/100),positions=[0,...widths.map((_,i)=>widths.slice(0,i+1).reduce((a,b)=>a+b,0))],cells=tableCells(block),heights=block.rows.map((_,r)=>block.heights?.[r]||42);y+=12;
   const rendered=cells.map(cell=>{const width=positions[cell.c+cell.cs]-positions[cell.c];return {cell,width,lines:rows(cell.tokens,width-20,cols>6?14:18,cell.r===0&&block.header!==false)}});
   for(const {cell,lines} of rendered){const needed=lines.reduce((n,line)=>n+line.height,0)+16,available=heights.slice(cell.r,cell.r+cell.rs).reduce((a,b)=>a+b,0);if(needed>available)heights[cell.r+cell.rs-1]+=needed-available}
   const tops=[y,...heights.map((_,i)=>y+heights.slice(0,i+1).reduce((a,b)=>a+b,0))];
   for(const {cell,width,lines} of rendered){const x=left+positions[cell.c],top=tops[cell.r],height=tops[cell.r+cell.rs]-top;ops.push(()=>{if(cell.r===0&&block.header!==false){ctx.globalAlpha=.12;ctx.fillStyle=colors.accent;ctx.fillRect(x,top,width,height);ctx.globalAlpha=1}ctx.strokeStyle=colors.accent;ctx.globalAlpha=.4;ctx.strokeRect(x,top,width,height);ctx.globalAlpha=1});paint(lines,x+10,top+8,colors.ink,cell.align,width-20)}
   y=tops.at(-1)!+14;continue;
  }
  const line=block.line,size=line.kind==='heading'?32:line.kind==='subtitle'?25:line.kind==='small'?16:22,bold=line.kind==='heading'||line.kind==='subtitle',color=bold?colors.accent:colors.ink;
  if(bold)y+=10;const indent=(line.list?48:0)+(line.indent||0)*24+(line.quote?24:0);if(line.quote){const top=y,height=rows(line.tokens,max-indent,size,bold).reduce((n,r)=>n+r.height,0);ops.push(()=>{ctx.fillStyle=colors.accent;ctx.globalAlpha=.5;ctx.fillRect(left+(line.indent||0)*24,top,4,height);ctx.globalAlpha=1})}
  if(line.list){const marker=line.list.marker,top=y;ops.push(()=>{ctx.font='20px "Microsoft JhengHei", sans-serif';ctx.fillStyle=color;ctx.fillText(marker,left,top+size)})}
  y=paint(rows(line.tokens,max-indent,size,bold),left+indent,y,color,line.align,max-indent)+8;
 }
 for(const pic of images){const im=await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error(uiText("圖片無法匯出")));im.src=pic.display});const w=Math.min(max,im.width),h=im.height*w/im.width,top=y;y+=h+24;ops.push(()=>ctx.drawImage(im,left,top,w,h))}
 const height=Math.ceil(y+45);if(height>30000)throw Error(uiText("筆記太長，請先分成幾則再匯出圖片"));c.height=height;ctx.fillStyle=colors.paper;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=colors.ink;ctx.globalAlpha=.6;ctx.font='16px sans-serif';ctx.fillText(uiText("日日手帳 · ")+date,48,40);ctx.globalAlpha=1;ops.forEach(draw=>draw());const blob=await new Promise<Blob|null>(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error(uiText("圖片匯出失敗"));download(blob,filename(text,date)+'.png');
}
