import {useLayoutEffect,useRef,useState} from 'react';
import RichNoteEditor,{type RichNoteHandle} from './RichNoteEditor';
import NoteBody from './NoteBody';
import {markNote,plainNote,portableNote,safeNoteLink,tableSyntax,bulletSymbols,noteCharacterCount,type NoteMark} from './note-format';
import {exportNoteText,exportNoteImage} from './note-export';import type {Picture} from './media-helpers';
export default function NoteText({text,onChange,date,images=[],draft=false}:{text:string;onChange:(text:string)=>void;date:string;images?:Picture[];draft?:boolean}){
 const [editing,setEditing]=useState(draft),[expanded,setExpanded]=useState(false),[long,setLong]=useState(false),[exporting,setExporting]=useState(false),[error,setError]=useState(''),[sourceMode,setSourceMode]=useState(false);
 const rich=useRef<RichNoteHandle>(null),input=useRef<HTMLTextAreaElement>(null),body=useRef<HTMLDivElement>(null);
 const [ink,setInk]=useState('#708269'),[highlight,setHighlight]=useState('#e3c34d'),[fontSize,setFontSize]=useState('18'),[copied,setCopied]=useState(false),[paragraph,setParagraph]=useState(''),[bullet,setBullet]=useState('•'),[customBullet,setCustomBullet]=useState('✦'),[tableOpen,setTableOpen]=useState(false),[tableRows,setTableRows]=useState(3),[tableCols,setTableCols]=useState(3),[hoverCell,setHoverCell]=useState<[number,number]>([0,0]);
 useLayoutEffect(()=>{const el=input.current;if(el){el.style.height='auto';el.style.height=el.scrollHeight+'px'}const content=body.current;if(content){const check=()=>setLong(content.scrollHeight>242);check();const observer=new ResizeObserver(check);observer.observe(content);return()=>observer.disconnect()}},[text,editing,sourceMode]);
 function mark(kind:NoteMark,value?:string){if(!sourceMode){rich.current?.mark(kind,value);return}const el=input.current;if(!el)return;const result=markNote(text,el.selectionStart,el.selectionEnd,kind,value);onChange(result.text);requestAnimationFrame(()=>{el.focus();el.setSelectionRange(result.start,result.end)})}
 function link(){rich.current?.remember();const url=prompt('連結網址（https://…）');if(!url)return;const safe=safeNoteLink(url);if(!safe){setError('請填入完整的 http 或 https 網址。');return}setError('');mark('link',safe)}
 function sourceInsert(value:string){const el=input.current,start=el?.selectionStart??text.length,end=el?.selectionEnd??start;onChange(text.slice(0,start)+value+text.slice(end));requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(start,start+value.length)})}
 function addList(ordered:boolean){const marker=bullet==='custom'?customBullet:bullet;if(!sourceMode){rich.current?.list(ordered,marker);return}const el=input.current;if(!el)return;const from=text.lastIndexOf('\n',Math.max(0,el.selectionStart-1))+1,find=text.indexOf('\n',el.selectionEnd),to=find<0?text.length:find;const lines=text.slice(from,to).split('\n').map((l,i)=>(ordered?(i+1)+'. ':bulletSymbols.includes(marker)?marker+' ':'::bullet('+marker.replace(/[()\n]/g,'').slice(0,8)+') ')+l);onChange(text.slice(0,from)+lines.join('\n')+text.slice(to))}
 function addTable(rows:number,columns:number){if(sourceMode)sourceInsert('\n'+tableSyntax(rows,columns)+'\n');else rich.current?.table(rows,columns);setTableOpen(false)}
 async function copy(plain=false){try{await navigator.clipboard.writeText(plain?plainNote(text):portableNote(text));setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{setError('無法自動複製，請選取筆記文字後手動複製。')}}
 async function imageExport(){setExporting(true);setError('');try{const style=getComputedStyle(document.querySelector('.bookApp')!);await exportNoteImage(text,date,images,{paper:style.getPropertyValue('--paper').trim()||'#fffdf7',ink:style.getPropertyValue('--ink').trim()||'#3d4942',accent:style.getPropertyValue('--accent').trim()||'#708269'})}catch(e){setError((e as Error).message)}finally{setExporting(false)}}
 return <div className={'noteText '+(editing?'editing':'reading')} onDragStart={e=>e.stopPropagation()}>
 {editing?<><div className="noteFormatTools" role="toolbar" aria-label="筆記文字格式" onPointerDownCapture={()=>rich.current?.remember()}>
  <label>樣式<select aria-label="段落樣式" value={paragraph} onChange={e=>{mark(e.target.value as NoteMark);setParagraph('')}}><option value="" disabled>選擇樣式</option><option value="heading">標題</option><option value="subtitle">次標題</option><option value="body">本文</option></select></label>
  <button type="button" title="粗體；再按取消" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('bold')}><b>B</b> 粗體</button>
  <button type="button" title="斜體；再按取消" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('italic')}><i>I</i> 斜體</button>
  <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('strike')}><s>刪除線</s></button>
  <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('spoiler')}>防雷海苔</button>
  <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('highlight',highlight)}>螢光筆</button>
  <button type="button" onMouseDown={e=>e.preventDefault()} onClick={link}>文字連結</button>
  <button type="button" title="清除反白文字的格式；未反白時清除目前段落格式" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('clear')}>清除格式</button>
  <details className="noteToolGroup"><summary>字色・底色・字級</summary><div className="noteToolBody">
   <label>字色<input type="color" aria-label="筆記文字顏色" value={ink} onChange={e=>setInk(e.target.value)}/></label><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('color',ink)}>套用字色</button>
   <label>螢光筆色<input type="color" aria-label="螢光筆底色" value={highlight} onChange={e=>setHighlight(e.target.value)}/></label><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('highlight',highlight)}>套用底色</button>
   <label>字級<select aria-label="筆記字級" value={fontSize} onChange={e=>setFontSize(e.target.value)}>{[12,14,16,18,20,24,28,32,36].map(n=><option key={n} value={n}>{n}</option>)}</select></label><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('size',fontSize)}>套用字級</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>mark('small')}>縮小文字</button>
  </div></details>
  <details className="noteToolGroup"><summary>清單</summary><div className="noteToolBody">
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>addList(true)}>1. 編號清單</button>
   <label>項目符號<select aria-label="項目符號" value={bullet} onChange={e=>setBullet(e.target.value)}>{bulletSymbols.map(symbol=><option key={symbol} value={symbol}>{symbol}</option>)}<option value="custom">自訂</option></select></label>
   {bullet==='custom'&&<input aria-label="自訂項目符號" value={customBullet} maxLength={8} onChange={e=>setCustomBullet(e.target.value)} className="bulletInput"/>}
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>addList(false)}>套用項目清單</button>
  </div></details>
  <div className="noteTablePicker"><button type="button" aria-expanded={tableOpen} onMouseDown={e=>e.preventDefault()} onClick={()=>setTableOpen(v=>!v)}>▦ 表格</button>
  {tableOpen&&<div className="tablePopover"><div className="titleline"><strong>插入表格</strong><button type="button" aria-label="關閉表格選擇" onClick={()=>setTableOpen(false)}>×</button></div><p>{hoverCell[0]?hoverCell[0]+' 列 × '+hoverCell[1]+' 欄（含標題列）':'點格子選擇列數與欄數'}</p><div className="tableGridPicker">{Array.from({length:42},(_,i)=>{const row=Math.floor(i/7)+1,col=i%7+1;return <button type="button" key={i} className={row<=hoverCell[0]&&col<=hoverCell[1]?'chosen':''} aria-label={row+' 列 '+col+' 欄'} onPointerEnter={()=>setHoverCell([row,col])} onFocus={()=>setHoverCell([row,col])} onMouseDown={e=>e.preventDefault()} onClick={()=>addTable(row,col)}/>})}</div><div className="tableSizeInputs"><label>列<input type="number" min="1" max="20" value={tableRows} onChange={e=>setTableRows(Math.max(1,Math.min(20,+e.target.value||1)))}/></label><label>欄<input type="number" min="1" max="10" value={tableCols} onChange={e=>setTableCols(Math.max(1,Math.min(10,+e.target.value||1)))}/></label><button type="button" onClick={()=>addTable(tableRows,tableCols)}>插入</button></div><small>直接點儲存格編輯；Tab 可移至下一格。</small></div>}
  </div>
  {!draft&&<button type="button" className="quiet" onClick={()=>setEditing(false)}>完成編輯</button>}
 </div><div className="noteEditorModes"><button type="button" className={!sourceMode?'active':''} onClick={()=>setSourceMode(false)}>視覺編輯</button><button type="button" className={sourceMode?'active':''} onClick={()=>setSourceMode(true)}>手打語法</button></div>
 <details className="noteSyntax"><summary>語法與操作說明</summary><p>*斜體* · **粗體** · ~~刪除線~~ · ||防雷海苔|| · ==螢光筆==</p><p>標題：## 空格文字；次標題：### 空格文字；縮小：-# 空格文字。</p><p>連結：[文字](https://網址)；字色：[文字]&#123;color=#708269&#125;；底色：[文字]&#123;background=#e3c34d&#125;；字級：[文字]&#123;size=20&#125;。</p><p>海苔編輯時可見，預覽時點擊顯示。螢光筆一直保留淡底色。複製會保留常見語法，移除網站專用樣式。</p></details>
 {sourceMode?<textarea ref={input} aria-label="筆記內容" placeholder="工作交接、臨時規則、突然想到的事…" value={text} onChange={e=>onChange(e.target.value)}/>:<RichNoteEditor ref={rich} text={text} onChange={onChange}/>}
 </>:<><div ref={body} className={'noteReading '+(expanded?'expanded':'collapsed')}><NoteBody text={text}/></div>{long&&<button type="button" className="noteMore quiet" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'收起 ▴':'⋯ 查看更多'}</button>}</>}
 <div className="noteCharacterCount" title="計算顯示文字；包含空格，全形與半形各計 1，換行、表格分隔及格式語法不計入。">共 {noteCharacterCount(text).toLocaleString('zh-TW')} 字元 <small>含空格・全／半形皆計入</small></div>
 {!draft&&<div className="noteActionTools"><button type="button" onClick={()=>setEditing(v=>!v)}>{editing?'預覽':'✎ 編輯文字'}</button><button type="button" onClick={()=>copy()} title="保留粗體、斜體、連結等常見語法；不含網站專用樣式">{copied?'✓ 已複製':'複製文字'}</button><button type="button" onClick={()=>copy(true)}>複製純文字</button><button type="button" onClick={()=>exportNoteText(text,date)}>匯出 TXT</button><button type="button" disabled={exporting} onClick={imageExport}>{exporting?'製作中…':'匯出圖片'}</button></div>}
 {error&&<p className="mediaError" role="status">{error}</p>}</div>;
}
