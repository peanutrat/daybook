import {t as uiText} from "./i18n.ts";
import {useEffect,useMemo,useRef,useState} from 'react';import {findNoteMatches} from './note-find';
export type FindTarget={id:string;box:string;index:number}|null;
export default function NoteFinder({notes,query,onQuery,onLocate}:{notes:{id:string;text:string;box:string;deleted?:boolean}[];query:string;onQuery:(value:string)=>void;onLocate:(target:FindTarget)=>void}){
 const input=useRef<HTMLInputElement>(null),locate=useRef(onLocate);locate.current=onLocate;const [index,setIndex]=useState(0);
 const hits=useMemo(()=>notes.filter(n=>!n.deleted).flatMap(n=>findNoteMatches(n.text,query).map(m=>({id:n.id,box:n.box,index:m.index,unit:m.unit,start:m.start}))),[notes,query]),signature=hits.map(h=>h.id+':'+h.unit+':'+h.start).join('|');
 useEffect(()=>{setIndex(0);locate.current(hits[0]??null)},[query,signature]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'){e.preventDefault();input.current?.focus();input.current?.select()}if(e.key==='Escape'&&document.activeElement===input.current){onQuery('');input.current?.blur()}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[onQuery]);
 function next(direction:number){if(!hits.length)return;const at=(index+direction+hits.length)%hits.length;setIndex(at);locate.current(hits[at])}
 return <div className="noteFinder" role="search" aria-label={uiText("尋找筆記關鍵字")}><span aria-hidden="true">⌕</span><input ref={input} aria-label={uiText("尋找關鍵字")} placeholder={uiText("尋找關鍵字…")} value={query} onChange={e=>onQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();next(e.shiftKey?-1:1)}}}/><span className="noteFindCount" role="status" aria-live="polite">{query?(hits.length?Math.min(index+1,hits.length)+' / '+hits.length:uiText("找不到")):''}</span><button type="button" aria-label={uiText("上一個符合項目")} disabled={!hits.length} onClick={()=>next(-1)}>↑</button><button type="button" aria-label={uiText("下一個符合項目")} disabled={!hits.length} onClick={()=>next(1)}>↓</button>{query&&<button type="button" aria-label={uiText("清除尋找")} onClick={()=>onQuery('')}>×</button>}</div>
}
