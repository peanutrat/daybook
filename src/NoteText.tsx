import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import RichNoteEditor,{type RichNoteHandle} from './RichNoteEditor';
import NoteBody from './NoteBody';import NoteIcon,{type NoteIconName} from './NoteIcon';
import {type ParagraphAction,type TableAction} from './note-layout';
import {plainNote,portableNote,safeNoteLink,bulletSymbols,noteCharacterCount,type NoteMark} from './note-format';
import {exportNoteText,exportNoteImage} from './note-export';import type {Picture} from './media-helpers';
type Panel='format'|'color'|'list'|'table'|'symbols'|null;
export default function NoteText({text,onChange,date,images=[],draft=false,symbols=[],onSymbolsChange,findRequest,findQuery='',activeMatch=-1}:{text:string;onChange:(text:string)=>void;date:string;images?:Picture[];draft?:boolean;symbols?:string[];onSymbolsChange?:(symbols:string[])=>void;findRequest?:unknown;findQuery?:string;activeMatch?:number}){
 const [editing,setEditing]=useState(draft),[expanded,setExpanded]=useState(false),[long,setLong]=useState(false),[exporting,setExporting]=useState(false),[error,setError]=useState(''),[panel,setPanel]=useState<Panel>(null);
 const rich=useRef<RichNoteHandle>(null),body=useRef<HTMLDivElement>(null);
 const [ink,setInk]=useState('#708269'),[highlight,setHighlight]=useState('#e3c34d'),[fontSize,setFontSize]=useState('18'),[copied,setCopied]=useState(false),[bullet,setBullet]=useState('•'),[customBullet,setCustomBullet]=useState('✦'),[symbolText,setSymbolText]=useState('');
 useLayoutEffect(()=>{const content=body.current;if(content){const check=()=>setLong(content.scrollHeight>242);check();const observer=new ResizeObserver(check);observer.observe(content);return()=>observer.disconnect()}},[text,editing]);
 useEffect(()=>{if(findQuery&&activeMatch>=0){setEditing(false);setExpanded(true)}},[findQuery,activeMatch,findRequest]);
 function mark(kind:NoteMark,value?:string){rich.current?.mark(kind,value)}
 function link(){rich.current?.remember();const url=prompt('連結網址（https://…）');if(!url)return;const safe=safeNoteLink(url);if(!safe){setError('請填入完整的 http 或 https 網址。');return}setError('');mark('link',safe)}
 async function copy(plain=false){try{await navigator.clipboard.writeText(plain?plainNote(text):portableNote(text));setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{setError('無法自動複製，請選取筆記文字後手動複製。')}}
 async function imageExport(){setExporting(true);setError('');try{const style=getComputedStyle(document.querySelector('.bookApp')!);await exportNoteImage(text,date,images,{paper:style.getPropertyValue('--paper').trim()||'#fffdf7',ink:style.getPropertyValue('--ink').trim()||'#3d4942',accent:style.getPropertyValue('--accent').trim()||'#708269'})}catch(e){setError((e as Error).message)}finally{setExporting(false)}}
 const tool=(icon:NoteIconName,label:string,run:()=>void,options:{pressed?:boolean;disabled?:boolean;color?:string}={})=><button key={label} type="button" className={'noteIconButton '+(options.pressed?'active':'')} aria-label={label} data-tip={label} aria-pressed={options.pressed} disabled={options.disabled} onMouseDown={e=>e.preventDefault()} onClick={run}><NoteIcon name={icon} color={options.color}/></button>;
 const togglePanel=(next:Panel)=>setPanel(current=>current===next?null:next);
 return <div className={'noteText '+(editing?'editing':'reading')} onDragStart={e=>e.stopPropagation()}>
 {editing?<><div className="noteFormatTools compactNoteTools" role="toolbar" aria-label="筆記文字格式" onPointerDownCapture={()=>rich.current?.remember()}>
 <div className="noteToolRow">
 {tool('format','格式',()=>togglePanel('format'),{pressed:panel==='format'})}
 {tool('bold','粗體',()=>mark('bold'))}{tool('italic','斜體',()=>mark('italic'))}{tool('strike','刪除線',()=>mark('strike'))}
 {tool('spoiler','防雷海苔',()=>mark('spoiler'))}
 <span className="noteHighlighterTools">{tool('highlight','螢光筆',()=>mark('highlight',highlight))}
 <label className="noteHighlightDot" data-tip="螢光筆顏色"><input type="color" aria-label="螢光筆顏色" value={highlight} onChange={e=>{setHighlight(e.target.value);mark('highlight',e.target.value)}}/><span aria-hidden="true" style={{background:highlight}}/></label></span>
 {tool('link','文字連結',link)}
 {tool('quote','引用區塊',()=>rich.current?.paragraph('quote'))}
 {tool('color','字色・字級',()=>togglePanel('color'),{pressed:panel==='color',color:ink})}
 {tool('list','清單',()=>togglePanel('list'),{pressed:panel==='list'})}
 {tool('table','插入表格',()=>togglePanel('table'),{pressed:panel==='table'})}
 {tool('up','整行上移',()=>rich.current?.move(-1))}{tool('down','整行下移',()=>rich.current?.move(1))}
 {tool('clear','清除格式',()=>mark('clear'))}
 {tool('symbols','收藏符號',()=>togglePanel('symbols'),{pressed:panel==='symbols'})}
 </div>
 {panel&&<div className="noteToolPanel" role="group" aria-label={{format:'格式',color:'字色・字級',list:'清單',table:'表格',symbols:'收藏符號'}[panel]}>
 <div className="notePanelHeading"><small>{{format:'格式',color:'字色・字級',list:'清單',table:'表格',symbols:'收藏符號'}[panel]}</small></div>
 <div className="notePanelControls">
 {panel==='format'&&<>
 {tool('heading','標題',()=>mark('heading'))}{tool('subtitle','次標題',()=>mark('subtitle'))}{tool('body','本文',()=>mark('body'))}
 <span className="noteToolDivider"/>
 {(['left','center','right','justify','outdent','indent'] as ParagraphAction[]).map((action)=>tool(action,({left:'靠左',center:'置中',right:'靠右',justify:'左右對齊',quote:'引用區塊',outdent:'減少縮排',indent:'增加縮排'} as Record<string,string>)[action],()=>rich.current?.paragraph(action)))}
 </>}
 {panel==='color'&&<>
 <label className="noteColorControl"><span>字色</span><input type="color" aria-label="筆記文字顏色" value={ink} onChange={e=>setInk(e.target.value)}/>{tool('color','套用字色',()=>mark('color',ink),{color:ink})}</label>
 <label className="noteColorControl"><span>字級</span><select aria-label="筆記字級" value={fontSize} onChange={e=>{setFontSize(e.target.value);mark('size',e.target.value)}}>{[12,14,16,18,20,24,28,32,36].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
 {tool('small','縮小文字',()=>mark('small'))}
 </>}
 {panel==='list'&&<>
 <span className="noteBulletPicker">{tool('bullet','套用項目清單',()=>rich.current?.list(false,bullet==='custom'?customBullet:bullet))}
 <select aria-label="項目符號" value={bullet} onChange={e=>setBullet(e.target.value)}>{bulletSymbols.map(symbol=><option key={symbol} value={symbol}>{symbol}</option>)}<option value="custom">自訂</option></select></span>
 {bullet==='custom'&&<input aria-label="自訂項目符號" value={customBullet} maxLength={8} onChange={e=>setCustomBullet(e.target.value)} className="bulletInput"/>}
 {tool('numbered','編號清單',()=>rich.current?.list(true))}
 </>}
 {panel==='table'&&<>
 {tool('table','插入表格',()=>rich.current?.table(2,2))}
 {(['row','column','removeRow','removeColumn','widths','heights'] as TableAction[]).map(action=>tool(action,({row:'增加橫列',column:'增加直欄',removeRow:'刪除橫列',removeColumn:'刪除直欄',widths:'平均欄寬',heights:'平均列高'} as Record<string,string>)[action],()=>rich.current?.tableEdit(action)))}
 
 </>}
 {panel==='symbols'&&<><form className="noteSymbolForm" onSubmit={e=>{e.preventDefault();const value=symbolText.trim();if(!value)return;onSymbolsChange?.(Array.from(new Set([...symbols,value])));setSymbolText('')}}><input aria-label="新增特殊符號或顏文字" placeholder="貼上符號或顏文字…" value={symbolText} maxLength={240} onChange={e=>setSymbolText(e.target.value)}/><button type="submit" className="noteSymbolSave" disabled={!symbolText.trim()||!onSymbolsChange}>儲存</button></form>
 <div className="noteSymbolShelf">{symbols.map((value,index)=><span className="noteSavedSymbol" key={value}><button type="button" aria-label={'插入符號 '+value} onMouseDown={e=>e.preventDefault()} onClick={()=>rich.current?.insert(value)}>{value}</button><button type="button" className="removeSavedSymbol" aria-label={'移除收藏符號 '+value} onClick={()=>onSymbolsChange?.(symbols.filter((_,i)=>i!==index))}>−</button></span>)}</div>
 {!symbols.length&&<small className="notePanelHelp">儲存後，點符號即可插入游標位置。</small>}
 </>}
 </div>{panel==='table'&&<small className="notePanelHelp">先點儲存格，再增減列欄；拖曳右邊／下邊調整寬高。</small>}</div>}
 </div>
 <details className="noteSyntax"><summary>語法與操作說明</summary>
 <p>可直接反白文字後點圖示；再點一次可取消效果。電腦滑鼠停在圖示上可查看名稱。</p>
 <p>也能直接輸入或貼上語法，完成後會轉為效果：*斜體* · **粗體** · ~~刪除線~~ · ||防雷海苔|| · ==螢光筆==。</p>
 <p>標題：## 空格文字；次標題：### 空格文字；縮小：-# 空格文字；引用：&gt; 空格文字。</p>
 <p>連結：[文字](https://網址)；字色：[文字]&#123;color=#708269&#125;；底色：[文字]&#123;background=#e3c34d&#125;；字級：[文字]&#123;size=20&#125;。</p>
 <p>海苔編輯時可見，預覽時點文字切換顯示／隱藏。整行上移／下移會連同格式移動，反白多行可一起移動。</p>
 </details>
 <RichNoteEditor ref={rich} text={text} onChange={onChange}/>
 </>:<><div ref={body} className={'noteReading '+(expanded||!!findQuery?'expanded':'collapsed')}><NoteBody text={text} query={findQuery} activeMatch={activeMatch}/></div>{long&&!findQuery&&<button type="button" className="noteMore quiet" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'收起 ▴':'⋯ 查看更多'}</button>}</>}
 <div className="noteCharacterCount">共 {noteCharacterCount(text).toLocaleString('zh-TW')} 字</div>
 {!draft&&<div className="noteActionTools iconNoteActions" role="group" aria-label="筆記操作">
 {tool(editing?'check':'edit',editing?'預覽':'編輯文字',()=>setEditing(v=>!v))}
 {tool(copied?'check':'copy',copied?'已複製':'複製文字',()=>copy())}{tool('plain','複製純文字',()=>copy(true))}
 {tool('txt','匯出 TXT',()=>exportNoteText(text,date))}{tool('image',exporting?'製作中':'匯出圖片',imageExport,{disabled:exporting})}
 </div>}
 {error&&<p className="mediaError" role="status">{error}</p>}</div>;
}
