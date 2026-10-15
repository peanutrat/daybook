import {noteBlocks,noteLines,blocksSyntax,safeNoteLink,type NoteToken} from './note-format';
function wrapLines(value:string,prefix:string,suffix:string){return value.split('\n').map(line=>line?prefix+line+suffix:line).join('\n')}
function descendants(el:HTMLElement,tag:string):HTMLElement[]{const out:HTMLElement[]=[];for(const child of Array.from(el.childNodes)){if(child.nodeType!==1)continue;const c=child as HTMLElement;if(c.tagName.toLowerCase()===tag)out.push(c);else out.push(...descendants(c,tag))}return out}
export function serializeNoteDOM(root:HTMLElement){
 function read(node:Node):string{
  if(node.nodeType===3)return(node.textContent||'').replace(/\u00a0/g,' ');
  if(node.nodeType!==1)return '';const el=node as HTMLElement,tag=el.tagName.toLowerCase();if(tag==='br')return '\n';
  if(tag==='table'){const rows=descendants(el,'tr').map(row=>Array.from(row.childNodes).filter(n=>n.nodeType===1&&['TD','TH'].includes((n as HTMLElement).tagName)).map(cell=>noteLines(Array.from(cell.childNodes).map(read).join('').replace(/\n/g,' '))[0].tokens));return blocksSyntax([{type:'table',rows}])+'\n'}
  let value=Array.from(el.childNodes).map(read).join('');
  if(el.dataset.noteTable==='true')return value;
  if(['div','p','h1','h2','h3'].includes(tag)){
   if(el.childNodes.length===1&&(el.firstChild as HTMLElement)?.tagName==='BR')value='';
   if(el.dataset.noteSubtitle==='true'||tag==='h2')value=wrapLines(value,'### ','');else if(/^h[1-3]$/.test(tag))value=wrapLines(value,'## ','');else if(el.dataset.noteSmall==='true')value=wrapLines(value,'-# ','');
   if(el.dataset.noteListMarker){const marker=el.dataset.noteListMarker;value=wrapLines(value,/^\d+[.)]$/.test(marker)||/^[•◦▪▫◆◇–\-*+→✓☐★]$/u.test(marker)?marker+' ':'::bullet('+marker+') ','')}
   return value+'\n';
  }
  if(tag==='strong'||tag==='b')value=wrapLines(value,'**','**');if(tag==='em'||tag==='i')value=wrapLines(value,'*','*');if(['s','strike','del'].includes(tag))value=wrapLines(value,'~~','~~');
  if(el.dataset.noteSpoiler==='true')value=wrapLines(value,'||','||');
  if(tag==='a'&&safeNoteLink(el.getAttribute('href')||''))value=wrapLines(value,'[',']('+el.getAttribute('href')+')');
  const style=[];if(/^#[0-9a-f]{6}$/i.test(el.dataset.noteColor||''))style.push('color='+el.dataset.noteColor);if(/^#[0-9a-f]{6}$/i.test(el.dataset.noteBackground||''))style.push('background='+el.dataset.noteBackground);if(Number(el.dataset.noteSize)>=12&&Number(el.dataset.noteSize)<=36)style.push('size='+el.dataset.noteSize);if(style.length)value=wrapLines(value,'[',']{'+style.join(';')+'}');return value;
 }
 return Array.from(root.childNodes).map(read).join('').replace(/\n$/,'');
}
function tokenDOM(token:NoteToken){let node:Node=document.createTextNode(token.text);const wrap=(tag:string)=>{const el=document.createElement(tag);el.append(node);node=el;return el};
 if(token.bold)wrap('strong');if(token.italic)wrap('em');if(token.strike)wrap('s');if(token.href){const a=wrap('a');a.setAttribute('href',token.href)}
 if(token.spoiler){const el=wrap('span');el.dataset.noteSpoiler='true';el.className='richSpoiler'}
 if(token.color||token.size||token.background){const el=wrap('span');if(token.color){el.dataset.noteColor=token.color;el.style.color=token.color}if(token.size){el.dataset.noteSize=String(token.size);el.style.fontSize=token.size+'px'}if(token.background){el.dataset.noteBackground=token.background;el.className='richHighlight';el.style.setProperty?.('--highlight-color',token.background)}}return node;
}
export function renderNoteDOM(root:HTMLElement,text:string){root.replaceChildren(...noteBlocks(text).map((block,index)=>{
 if(block.type==='table'){const wrapper=document.createElement('div');wrapper.className='noteTableWrap';wrapper.dataset.noteTable='true';wrapper.dataset.noteBlock=String(index);const table=document.createElement('table'),body=document.createElement('tbody');table.className='noteTable';table.style.minWidth=Math.max(240,(block.rows[0]?.length||1)*80)+'px';for(const [i,row] of block.rows.entries()){const tr=document.createElement('tr');for(const tokens of row){const cell=document.createElement(i===0?'th':'td');cell.append(...tokens.map(tokenDOM));if(!tokens.length)cell.append(document.createElement('br'));tr.append(cell)}body.append(tr)}table.append(body);wrapper.append(table);return wrapper}
 const line=block.line,el=document.createElement(line.kind==='heading'?'h3':line.kind==='subtitle'?'h2':'div');el.dataset.noteBlock=String(index);if(line.kind==='subtitle')el.dataset.noteSubtitle='true';if(line.kind==='small'){el.dataset.noteSmall='true';el.className='smallNote'}if(line.list){el.dataset.noteListMarker=line.list.marker;el.className+=' noteListLine'}el.append(...line.tokens.map(tokenDOM));if(!line.tokens.length)el.append(document.createElement('br'));return el;
}))}
