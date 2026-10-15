export type NoteToken={text:string;bold?:boolean;italic?:boolean;strike?:boolean;spoiler?:boolean;href?:string;color?:string;background?:string;size?:number};
export type NoteLine={kind:'text'|'heading'|'subtitle'|'small';tokens:NoteToken[];list?:{ordered:boolean;marker:string}};
export type NoteBlock={type:'line';line:NoteLine}|{type:'table';rows:NoteToken[][][]};
export type NoteMark='bold'|'italic'|'heading'|'subtitle'|'body'|'small'|'strike'|'spoiler'|'highlight'|'link'|'color'|'size'|'clear';
export const bulletSymbols=['•','◦','▪','▫','◆','◇','–','-','*','+','→','✓','☐','★'];
export function safeNoteLink(value:string){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
function balanced(text:string,start:number,open:string,close:string){let depth=0;for(let i=start;i<text.length;i++){if(text[i]==='\\'){i++;continue}if(text[i]===open)depth++;if(text[i]===close&&!--depth)return i}return -1}
export function inlineNote(text:string,depth=0):NoteToken[]{
 if(depth>20)return[{text}];const tokens:NoteToken[]=[];let plain='';
 const flush=()=>{if(plain){tokens.push({text:plain});plain=''}};
 for(let i=0;i<text.length;){
  if(text[i]==='\\'&&i+1<text.length&&'\\*~|=[]{}'.includes(text[i+1])){plain+=text[i+1];i+=2;continue}
  if(text[i]==='['){const close=balanced(text,i,'[',']');if(close>=0){let end=-1,style:Omit<NoteToken,'text'>={},valid=true;
    if(text[close+1]==='('){end=balanced(text,close+1,'(',')');const href=end>=0?safeNoteLink(text.slice(close+2,end)):null;if(href)style.href=href;else valid=false}
    else if(text[close+1]==='{'){end=text.indexOf('}',close+2);if(end>=0){for(const option of text.slice(close+2,end).split(';')){const eq=option.indexOf('='),key=option.slice(0,eq).trim(),v=option.slice(eq+1).trim();if((key==='color'||key==='background')&&/^#[0-9a-f]{6}$/i.test(v))style[key]=v;else if(key==='size'&&/^\d+$/.test(v)&&+v>=12&&+v<=36)style.size=+v;else valid=false}}}
    if(end>=0){flush();if(valid)tokens.push(...inlineNote(text.slice(i+1,close),depth+1).map(t=>({...style,...t})));else tokens.push({text:text.slice(i,end+1)});i=end+1;continue}
  }}
  let found=false;for(const [marker,style] of [['***',{bold:true,italic:true}],['**',{bold:true}],['*',{italic:true}],['~~',{strike:true}],['||',{spoiler:true}],['==',{background:'#e3c34d'}]] as const){if(!text.startsWith(marker,i))continue;let end=text.indexOf(marker,i+marker.length);while(end>=0&&text[end-1]==='\\')end=text.indexOf(marker,end+marker.length);if(end<=i+marker.length)continue;flush();tokens.push(...inlineNote(text.slice(i+marker.length,end),depth+1).map(t=>({...style,...t})));i=end+marker.length;found=true;break}
  if(!found)plain+=text[i++];
 }
 flush();return tokens;
}
export function noteLines(text:string):NoteLine[]{return text.split('\n').map(raw=>{
 const small=raw.match(/^(?:#{1,3}\s+)?-#\s+(.*)$/),heading=!small&&raw.match(/^(#{1,3})\s+(.*)$/);
 const value=small?small[1]:heading?heading[2]:raw,list=value.match(/^(\s*)(\d+[.)]|[•◦▪▫◆◇–\-*+→✓☐★]|\S{1,6})\s+(.+)$/u);
 // Custom bullets are stored with an explicit prefix, so ordinary sentences remain text.
 const custom=value.match(/^::bullet\(([^)\n]{1,8})\) (.*)$/);
 const standard=list&&(/^(\d+[.)]|[•◦▪▫◆◇–\-*+→✓☐★])$/u.test(list[2]))?list:null;
 return {kind:small?'small':heading?(heading[1].length>=3?'subtitle':'heading'):'text',tokens:inlineNote(custom?custom[2]:standard?standard[3]:value),...(custom?{list:{ordered:false,marker:custom[1]}}:standard?{list:{ordered:/^\d/.test(standard[2]),marker:standard[2]}}:{})};
})}
function tableCells(row:string){const source=row.trim().replace(/^\|/,'').replace(/\|$/,'');const cells:string[]=[];let cell='',brackets=0,spoiler=false;for(let i=0;i<source.length;i++){const ch=source[i];if(ch==='\\'&&i+1<source.length){cell+=ch+source[++i];continue}if(ch==='[')brackets++;if(ch===']')brackets=Math.max(0,brackets-1);if(source.slice(i,i+2)==='||'){spoiler=!spoiler;cell+='||';i++;continue}if(ch==='|'&&!brackets&&!spoiler){cells.push(cell.trim());cell=''}else cell+=ch}cells.push(cell.trim());return cells}
export function noteBlocks(text:string):NoteBlock[]{const raw=text.split('\n'),blocks:NoteBlock[]=[];for(let i=0;i<raw.length;i++){if(raw[i].trim().startsWith('|')&&i+1<raw.length){const header=tableCells(raw[i]),divider=tableCells(raw[i+1]);if(header.length===divider.length&&divider.every(c=>/^:?-{3,}:?$/.test(c))){const rows=[header];i+=2;while(i<raw.length&&raw[i].trim().startsWith('|')){const cells=tableCells(raw[i]);rows.push(Array.from({length:header.length},(_,j)=>cells[j]??''));i++}i--;blocks.push({type:'table',rows:rows.map(r=>r.map(inline=>inlineNote(inline)))});continue}}blocks.push({type:'line',line:noteLines(raw[i])[0]})}return blocks}
export function tokenSyntax(t:NoteToken,portable=false){let v=t.text.replace(/[\\*~|=\[\]{}]/g,'\\$&');const marker=t.bold&&t.italic?'***':t.bold?'**':t.italic?'*':'';if(marker)v=marker+v+marker;if(t.strike)v='~~'+v+'~~';if(t.spoiler)v='||'+v+'||';if(t.href)v='['+v+']('+t.href+')';if(!portable){const styles=[];if(t.color)styles.push('color='+t.color);if(t.background)styles.push('background='+t.background);if(t.size)styles.push('size='+t.size);if(styles.length)v='['+v+']{'+styles.join(';')+'}'}return v}
export function lineSyntax(line:NoteLine,portable=false){const prefix=!portable?(line.kind==='heading'?'## ':line.kind==='subtitle'?'### ':line.kind==='small'?'-# ':''):'';const list=line.list?(line.list.ordered||bulletSymbols.includes(line.list.marker)?line.list.marker+' ':portable?line.list.marker+' ':'::bullet('+line.list.marker+') '):'';return prefix+list+line.tokens.map(t=>tokenSyntax(t,portable)).join('')}
export function blocksSyntax(blocks:NoteBlock[]){return blocks.map(b=>b.type==='line'?lineSyntax(b.line):b.rows.map((r,i)=>'| '+r.map(c=>c.map(t=>tokenSyntax(t)).join('')).join(' | ')+' |'+(i===0?'\n| '+r.map(()=>'---').join(' | ')+' |':'')).join('\n')).join('\n')}
export function plainNote(text:string){return noteBlocks(text).map(b=>b.type==='table'?b.rows.map(r=>r.map(c=>c.map(t=>t.text).join('')).join('\t')).join('\n'):(b.line.list?b.line.list.marker+' ':'')+b.line.tokens.map(t=>t.text).join('')).join('\n')}
export function portableNote(text:string){return noteBlocks(text).map(b=>b.type==='table'?b.rows.map(r=>r.map(c=>c.map(t=>tokenSyntax(t,true)).join('')).join('\t')).join('\n'):lineSyntax(b.line,true)).join('\n')}
export function noteCharacterCount(text:string){return Array.from(plainNote(text).replace(/[\r\n\t]/g,'')).length}
export function tableSyntax(rows:number,columns:number){rows=Math.max(1,Math.min(20,rows));columns=Math.max(1,Math.min(10,columns));return Array.from({length:rows},(_,i)=>'| '+Array.from({length:columns},(_,j)=>i===0?'欄位 '+(j+1):'內容').join(' | ')+' |'+(i===0?'\n| '+Array(columns).fill('---').join(' | ')+' |':'')).join('\n')}
export function markNote(text:string,start:number,end:number,kind:NoteMark,value?:string){
 if(['heading','subtitle','body','small'].includes(kind)){const from=start===0?0:text.lastIndexOf('\n',start-1)+1,to=text.indexOf('\n',end),finish=to<0?text.length:to,lines=text.slice(from,finish).split('\n'),marker=kind==='heading'?'## ':kind==='subtitle'?'### ':kind==='small'?'-# ':'',all=!!marker&&lines.every(l=>l.startsWith(marker)),marked=lines.map(l=>all?l.slice(marker.length):marker+l.replace(/^(?:#{1,3}\s+)?(?:-#\s+)?/,'')).join('\n');return{text:text.slice(0,from)+marked+text.slice(finish),start:from,end:from+marked.length}}
 if(kind==='clear'){if(start===end){const from=start===0?0:text.lastIndexOf('\n',start-1)+1,find=text.indexOf('\n',end);start=from;end=find<0?text.length:find}const clean=plainNote(text.slice(start,end));return{text:text.slice(0,start)+clean+text.slice(end),start,end:start+clean.length}}const selected=text.slice(start,end)||'文字';
 const markers={bold:'**',italic:'*',strike:'~~',spoiler:'||'},marker=markers[kind as keyof typeof markers];let prefix=marker,suffix=marker;if(kind==='link'){prefix='[';suffix=']('+value+')'}if(kind==='color'||kind==='size'||kind==='highlight'){prefix='[';suffix=']{'+(kind==='highlight'?'background':kind)+'='+(value||(kind==='highlight'?'#e3c34d':''))+'}'}
 if(marker&&start>=marker.length&&text.slice(start-marker.length,start)===marker&&text.slice(end,end+marker.length)===marker)return{text:text.slice(0,start-marker.length)+selected+text.slice(end+marker.length),start:start-marker.length,end:end-marker.length};
 const wrapped=selected.split('\n').map(line=>prefix+line+suffix).join('\n');return{text:text.slice(0,start)+wrapped+text.slice(end),start:start+prefix.length,end:start+wrapped.length-suffix.length};
}
