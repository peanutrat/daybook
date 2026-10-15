import {noteBlocks,blocksSyntax,type NoteMark,type NoteToken,type NoteLine} from './note-format';
export function toggleNoteFormat(text:string,start:number,end:number,kind:NoteMark,value?:string,accent?:string){
 const blocks=noteBlocks(text),units:{line:NoteLine;set:(tokens:NoteToken[])=>void}[]=[];
 for(const b of blocks){if(b.type==='line')units.push({line:b.line,set:t=>{b.line.tokens=t}});else b.rows.forEach(row=>row.forEach((tokens,i)=>units.push({line:{kind:'text',tokens},set:t=>{row[i]=t}})))}
 let cursor=0;const selected:NoteToken[]=[];
 const effective=(t:NoteToken,k:string)=>({...t,...(k==='heading'||k==='subtitle'?{bold:true,size:t.size??(k==='heading'?32:24),...(accent?{color:t.color??accent}:{})}:k==='small'?{size:t.size??12}:{})});
 for(const u of units)for(const t of u.line.tokens){if(cursor<end&&cursor+t.text.length>start)selected.push(effective(t,u.line.kind));cursor+=t.text.length}
 if(!selected.length)return text;
 const active=(t:NoteToken)=>kind==='heading'?t.size===32:kind==='subtitle'?t.size===24:kind==='small'?t.size===12:kind==='size'?t.size===Number(value):kind==='color'?t.color===value:kind==='highlight'?t.background===(value||'#e3c34d'):kind==='link'?!!t.href:kind==='body'||kind==='clear'?false:!!t[kind];
 const remove=selected.every(active);cursor=0;
 for(const u of units){const line=u.line,length=line.tokens.reduce((n,t)=>n+t.text.length,0),affected=cursor<end&&cursor+length>start,output:NoteToken[]=[];
  for(const original of line.tokens){const t=affected?effective(original,line.kind):original,from=Math.max(0,start-cursor),to=Math.min(t.text.length,end-cursor);cursor+=t.text.length;
   if(from>=to){output.push(t);continue}if(from)output.push({...t,text:t.text.slice(0,from)});let middle={...t,text:t.text.slice(from,to)};
   if(kind==='clear')middle={text:middle.text};
   if(kind==='bold'||kind==='italic'||kind==='strike'||kind==='spoiler'){if(remove)delete middle[kind];else middle[kind]=true}
   if(['size','small','heading','subtitle','body'].includes(kind)){if(remove||kind==='body')delete middle.size;else middle.size=kind==='small'?12:kind==='heading'?32:kind==='subtitle'?24:Number(value);if(['heading','subtitle','body'].includes(kind)){if(remove||kind==='body'){delete middle.bold;if(middle.color===accent)delete middle.color}else{middle.bold=true;if(accent)middle.color=accent}}}
   if(kind==='color'){if(remove)delete middle.color;else middle.color=value}
   if(kind==='highlight'){if(remove)delete middle.background;else middle.background=value||'#e3c34d'}
   if(kind==='link'){if(remove)delete middle.href;else middle.href=value}
   output.push(middle);if(to<t.text.length)output.push({...t,text:t.text.slice(to)});
  }
  const merged:NoteToken[]=[];for(const t of output){const previous=merged.at(-1);const styles=(x:NoteToken)=>[x.bold,x.italic,x.strike,x.spoiler,x.href,x.color,x.background,x.size];if(previous&&JSON.stringify(styles(previous))===JSON.stringify(styles(t)))previous.text+=t.text;else merged.push({...t})}
  if(affected){line.kind='text';if(kind==='clear')delete line.list}u.set(merged);
 }
 return blocksSyntax(blocks);
}
export function listNote(text:string,start:number,end:number,ordered:boolean,marker='•',blockIndex?:number){
 const blocks=noteBlocks(text);let cursor=0,number=1;const chosen:NoteLine[]=[];
 for(const [index,b] of blocks.entries()){const len=b.type==='line'?b.line.tokens.reduce((n,t)=>n+t.text.length,0):b.rows.flat(2).reduce((n,t)=>n+t.text.length,0);if(b.type==='line'&&(start===end&&Number.isFinite(blockIndex)?index===blockIndex:start===end?cursor<=start&&start<=cursor+len:cursor<end&&cursor+len>start))chosen.push(b.line);cursor+=len}
 const remove=chosen.length>0&&chosen.every(l=>l.list?.ordered===ordered&&(ordered||l.list.marker===marker));
 for(const l of chosen){if(remove)delete l.list;else l.list={ordered,marker:ordered?(number++)+'.':marker.replace(/[()\n\r]/g,'').slice(0,8)||'•'}}
 return blocksSyntax(blocks);
}
