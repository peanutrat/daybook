import {t as uiText} from "./i18n.ts";
import {useRef,useState} from 'react';
import CanvasIcon from './CanvasIcon';
import GradientMapEditor from './GradientMapEditor';
import {defaultGradient,gradientCSS,type GradientMap} from './gradient-map';
import {defaultGradientLibrary,folderPresets,type GradientLibrary} from './gradient-library';
import {neutralAdjustments,type Adjustments} from './studio-pixels';

const copySettings=(v:Adjustments):Adjustments=>JSON.parse(JSON.stringify(v));
export default function MobileGradientAdjustment({initialValue,library=defaultGradientLibrary(),onLibraryChange=()=>{},onPreview,onApply,onCancel}:{initialValue?:Adjustments;library?:GradientLibrary;onLibraryChange?:(v:GradientLibrary)=>void;onPreview:(v:Adjustments)=>void;onApply:()=>void;onCancel:()=>void}){
 const original=useRef<Adjustments>(copySettings(initialValue??{...neutralAdjustments(),gradient:defaultGradient()})),[value,setValue]=useState(original.current),[editing,setEditing]=useState(false),strip=useRef<HTMLDivElement>(null);
 const gradient=value.gradient??defaultGradient(),presets=folderPresets(library),selected=presets.findIndex(p=>JSON.stringify(p.stops)===JSON.stringify(gradient.stops)),folder=library.folders.find(f=>f.id===library.activeFolder)??library.folders[0];
 function update(next:GradientMap){const settings={...value,gradient:next};setValue(settings);onPreview(settings)}
 function choose(index:number){const preset=presets[index];if(!preset)return;update({...gradient,stops:preset.stops.map(s=>({...s}))});strip.current?.querySelector<HTMLElement>('[data-preset-index="'+index+'"]')?.scrollIntoView?.({block:'nearest',inline:'center',behavior:'smooth'})}
 function reset(){const next=copySettings(original.current);setValue(next);onPreview(next)}
 return <section className="mobileGradientDock" role="region" aria-label={uiText("漸層對應底部色卡列")}>
  {editing&&<div className="mobileGradientEditor"><GradientMapEditor value={gradient} onChange={update} library={library} onLibraryChange={onLibraryChange}/></div>}
  <div className="mobileGradientDockHeader"><strong>{uiText("漸層對應")}</strong><select aria-label={uiText("漸層對應色卡分組")} value={folder.id} onChange={e=>onLibraryChange({...library,activeFolder:e.target.value})}>{library.folders.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select><div className="mobileGradientDockActions">
   <button type="button" aria-label={uiText("編輯漸層設定")} title={uiText("編輯漸層設定")} aria-expanded={editing} onClick={()=>setEditing(v=>!v)}><CanvasIcon name="adjust"/></button>
   <button type="button" aria-label={uiText("重設調整")} title={uiText("還原原本設定")} onClick={reset}><CanvasIcon name="reset"/></button>
   <button type="button" aria-label={uiText("取消調整")} title={uiText("不套用")} onClick={onCancel}><CanvasIcon name="close"/></button>
   <button type="button" className="primary" aria-label={uiText("套用調整")} title={uiText("確定套用")} onClick={onApply}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg></button>
  </div></div>
  <div className="mobileGradientCarousel"><button type="button" className="mobileGradientPrevious" aria-label={uiText("上一張漸層色卡")} disabled={!presets.length} onClick={()=>choose(selected<0?presets.length-1:(selected-1+presets.length)%presets.length)}><CanvasIcon name="back"/></button>
   <div ref={strip} className="mobileGradientCards" aria-label={uiText("左右滑動瀏覽漸層色卡")}>{selected<0&&<div className="mobileGradientCard custom" aria-label={uiText("目前自訂配色")}><span>{uiText("自訂配色")}</span><i style={{background:gradientCSS(gradient.stops)}}/></div>}{presets.map((p,i)=><button type="button" data-preset-index={i} key={p.id} className="mobileGradientCard" aria-label={uiText("預覽漸層：")+p.name} aria-pressed={i===selected} onClick={()=>choose(i)}><span>{p.name}</span><i style={{background:gradientCSS(p.stops)}}/></button>)}{!presets.length&&<small>{uiText("此分組還沒有色卡，可從設定新增。")}</small>}</div>
   <button type="button" className="mobileGradientNext" aria-label={uiText("下一張漸層色卡")} disabled={!presets.length} onClick={()=>choose(selected<0?0:(selected+1)%presets.length)}><CanvasIcon name="back"/></button></div>
 </section>
}
