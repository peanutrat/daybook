import {noteLines,type NoteMark,type NoteToken} from './note-format';
function syntax(t:NoteToken){let v=t.text;const marker=t.bold&&t.italic?'***':t.bold?'**':t.italic?'*':'';if(marker)v=marker+v+marker;if(t.strike)v='~~'+v+'~~';if(t.spoiler)v='||'+v+'||';if(t.href)v='['+v+']('+t.href+')';const styles=[];if(t.color)styles.push('color='+t.color);if(t.size)styles.push('size='+t.size);if(styles.length)v='['+v+']{'+styles.join(';')+'}';return v}
export function toggleNoteFormat(text:string,start:number,end:number,kind:NoteMark,value?:string,accent?:string){
 const lines=noteLines(text);let cursor=0;
 const selected:NoteToken[]=[];
 const effective=(t:NoteToken,lineKind:string)=>({...t,...(lineKind==='heading'?{bold:true,size:t.size??24,...(accent?{color:t.color??accent}:{})}:lineKind==='small'?{size:t.size??12}:{})});
 for(const line of lines)for(const t of line.tokens){if(cursor<end&&cursor+t.text.length>start)selected.push(effective(t,line.kind));cursor+=t.text.length}
 if(!selected.length)return text;
 const active=(t:NoteToken)=>kind==='heading'?t.size===24:kind==='small'?t.size===12:kind==='size'?t.size===Number(value):kind==='color'?t.color===value:kind==='link'?!!t.href:!!t[kind];
 const remove=selected.every(active);cursor=0;
 return lines.map(line=>{const length=line.tokens.reduce((n,t)=>n+t.text.length,0),affected=cursor<end&&cursor+length>start;const output:NoteToken[]=[];
  for(const original of line.tokens){const t=affected?effective(original,line.kind):original,from=Math.max(0,start-cursor),to=Math.min(t.text.length,end-cursor);cursor+=t.text.length;
   if(from>=to){output.push(t);continue}if(from)output.push({...t,text:t.text.slice(0,from)});const middle={...t,text:t.text.slice(from,to)};
   if(kind==='bold'||kind==='italic'||kind==='strike'||kind==='spoiler'){if(remove)delete middle[kind];else middle[kind]=true}
   if(kind==='size'||kind==='small'||kind==='heading'){if(remove)delete middle.size;else middle.size=kind==='small'?12:kind==='heading'?24:Number(value);if(kind==='heading'){if(remove){delete middle.bold;if(middle.color===accent)delete middle.color}else{middle.bold=true;if(accent)middle.color=accent}}}
   if(kind==='color'){if(remove)delete middle.color;else middle.color=value}
   if(kind==='link'){if(remove)delete middle.href;else middle.href=value}
   output.push(middle);if(to<t.text.length)output.push({...t,text:t.text.slice(to)});
  }
  const merged:NoteToken[]=[];for(const t of output){const previous=merged.at(-1);if(previous&&JSON.stringify({...previous,text:''})===JSON.stringify({...t,text:''}))previous.text+=t.text;else merged.push({...t})}
  return (!affected&&line.kind==='heading'?'## ':!affected&&line.kind==='small'?'-# ':'')+merged.map(syntax).join('');
 }).join('\n');
}
