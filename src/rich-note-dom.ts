import {tableCells} from './note-table';
import {noteBlocks,noteLines,blocksSyntax,safeNoteLink,tokenSyntax,type NoteToken} from './note-format';
function wrapLines(value:string,prefix:string,suffix:string){return value.split('\n').map(line=>line?prefix+line+suffix:line).join('\n')}
function descendants(el:HTMLElement,tag:string):HTMLElement[]{const out:HTMLElement[]=[];for(const child of Array.from(el.childNodes)){if(child.nodeType!==1)continue;const c=child as HTMLElement;if(c.tagName.toLowerCase()===tag)out.push(c);else out.push(...descendants(c,tag))}return out}
export function serializeNoteDOM(root:HTMLElement){
 function read(node:Node):string{
  if(node.nodeType===3)return(node.textContent||'').replace(/\u00a0/g,' ');
  if(node.nodeType!==1)return '';const el=node as HTMLElement,tag=el.tagName.toLowerCase();if(el.dataset.noteHandle)return '';if(tag==='br')return '\n';
  if(tag==='table'){
   let meta:any={};try{meta=JSON.parse(el.dataset.noteTableMeta||'{}')}catch{}
   const domRows=descendants(el,'tr'),rows:NoteToken[][][]=domRows.map(()=>[]),occupied=new Set<string>(),cells:Record<string,any>={};let cols=0;
   domRows.forEach((row,r)=>{let c=0;for(const node of Array.from(row.childNodes)){if(node.nodeType!==1||!['TD','TH'].includes((node as HTMLElement).tagName))continue;while(occupied.has(r+','+c))c++;const cell=node as HTMLTableCellElement,rs=Math.max(1,Math.min(domRows.length-r,cell.rowSpan||1)),cs=Math.max(1,Math.min(20,cell.colSpan||1));rows[r][c]=noteLines(Array.from(cell.childNodes).map(read).join('').replace(/\n/g,' '))[0].tokens;const align=cell.style.textAlign;if(rs>1||cs>1||['left','center','right'].includes(align))cells[r+','+c]={rowSpan:rs,colSpan:cs,align:align||undefined};for(let y=r;y<r+rs;y++)for(let x=c;x<c+cs;x++)occupied.add(y+','+x);c+=cs;cols=Math.max(cols,c)}});
   for(const row of rows)for(let c=0;c<cols;c++)row[c]??=[];
   return blocksSyntax([{type:'table',...meta,cells:Object.keys(cells).length?cells:undefined,rows}])+'\n';
  }
  let value=Array.from(el.childNodes).map(read).join('');
  if(el.dataset.noteTable==='true')return value;if(el.dataset.noteLiteral==='true')return tokenSyntax({text:value});
  if(['div','p','h1','h2','h3'].includes(tag)){
   if(el.childNodes.length===1&&(el.firstChild as HTMLElement)?.tagName==='BR')value='';
   if(el.dataset.noteSubtitle==='true'||tag==='h2')value=wrapLines(value,'### ','');else if(/^h[1-3]$/.test(tag))value=wrapLines(value,'## ','');else if(el.dataset.noteSmall==='true')value=wrapLines(value,'-# ','');
   if(el.dataset.noteListMarker){const marker=el.dataset.noteListMarker;const prefix=/^\d+[.)]$/.test(marker)||/^[•◦▪▫◆◇–\-*+→✓☐☑☒★]$/u.test(marker)?marker+' ':'::bullet('+marker+') ';value=value.split('\n').map(line=>prefix+line).join('\n')}
   if(el.dataset.noteQuote==='true')value=wrapLines(value,'> ','');if(el.dataset.noteIndent||el.dataset.noteAlign)value=wrapLines(value,'::p{'+(el.dataset.noteIndent||'0')+','+(el.dataset.noteAlign||'left')+'} ','');return value+'\n';
  }
  if(tag==='strong'||tag==='b')value=wrapLines(value,'**','**');if(tag==='em'||tag==='i')value=wrapLines(value,'*','*');if(['s','strike','del'].includes(tag))value=wrapLines(value,'~~','~~');
  if(el.dataset.noteSpoiler==='true')value=wrapLines(value,'||','||');
  if(tag==='a'&&safeNoteLink(el.getAttribute('href')||''))value=wrapLines(value,'[',']('+el.getAttribute('href')+')');
  const style=[];if(/^#[0-9a-f]{6}$/i.test(el.dataset.noteColor||''))style.push('color='+el.dataset.noteColor);if(/^#[0-9a-f]{6}$/i.test(el.dataset.noteBackground||''))style.push('background='+el.dataset.noteBackground);if(Number(el.dataset.noteSize)>=12&&Number(el.dataset.noteSize)<=36)style.push('size='+el.dataset.noteSize);if(style.length)value=wrapLines(value,'[',']{'+style.join(';')+'}');return value;
 }
 return Array.from(root.childNodes).map(read).join('').replace(/\n$/,'');
}
function tokenDOM(token:NoteToken){let node:Node=document.createTextNode(token.text);const wrap=(tag:string)=>{const el=document.createElement(tag);el.append(node);node=el;return el};
 if(/[\\*~|=\[\]{}]/.test(token.text)){const el=wrap('span');el.dataset.noteLiteral='true'}
 if(token.bold)wrap('strong');if(token.italic)wrap('em');if(token.strike)wrap('s');if(token.href){const a=wrap('a');a.setAttribute('href',token.href)}
 if(token.spoiler){const el=wrap('span');el.dataset.noteSpoiler='true';el.className='richSpoiler'}
 if(token.color||token.size||token.background){const el=wrap('span');if(token.color){el.dataset.noteColor=token.color;el.style.color=token.color}if(token.size){el.dataset.noteSize=String(token.size);el.style.fontSize=token.size+'px'}if(token.background){el.dataset.noteBackground=token.background;el.className='richHighlight';el.style.setProperty?.('--highlight-color',token.background)}}return node;
}
export function renderNoteDOM(root:HTMLElement,text:string){root.replaceChildren(...noteBlocks(text).map((block,index)=>{
 if(block.type==='table'){const wrapper=document.createElement('div');wrapper.className='noteTableWrap';wrapper.dataset.noteTable='true';wrapper.dataset.noteBlock=String(index);const table=document.createElement('table'),body=document.createElement('tbody'),cols=block.rows[0]?.length||1;table.className='noteTable';table.dataset.noteTableMeta=JSON.stringify({header:block.header,widths:block.widths,heights:block.heights,cells:block.cells});table.style.minWidth=Math.max(240,cols*80)+'px';const group=document.createElement('colgroup');for(let c=0;c<cols;c++){const col=document.createElement('col');col.style.width=(block.widths?.[c]??100/cols)+'%';group.append(col)}table.append(group);const visible=tableCells(block);
 for(let i=0;i<block.rows.length;i++){const tr=document.createElement('tr');if(block.heights?.[i])tr.style.height=block.heights[i]+'px';for(const item of visible.filter(x=>x.r===i)){const cell=document.createElement(i===0&&block.header!==false?'th':'td');cell.dataset.noteRow=String(item.r);cell.dataset.noteColumn=String(item.c);cell.rowSpan=item.rs;cell.colSpan=item.cs;if(item.align)cell.style.textAlign=item.align;cell.append(...item.tokens.map(tokenDOM));if(!item.tokens.length)cell.append(document.createElement('br'));tr.append(cell)}body.append(tr)}table.append(body);wrapper.append(table);return wrapper}
 const line=block.line,el=document.createElement(line.kind==='heading'?'h3':line.kind==='subtitle'?'h2':'div');el.dataset.noteBlock=String(index);if(line.quote){el.dataset.noteQuote='true';el.className='noteQuote'}if(line.indent){el.dataset.noteIndent=String(line.indent);el.style.marginLeft=line.indent*24+'px'}if(line.align){el.dataset.noteAlign=line.align;el.style.textAlign=line.align}if(line.kind==='subtitle')el.dataset.noteSubtitle='true';if(line.kind==='small'){el.dataset.noteSmall='true';el.className+=' smallNote'}if(line.list){el.dataset.noteListMarker=line.list.marker;el.className+=' noteListLine'}el.append(...line.tokens.map(tokenDOM));if(!line.tokens.length)el.append(document.createElement('br'));return el;
}))}
