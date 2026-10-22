import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import {language,locale} from './i18n';
import {localDate,normalizeTrip,ticketForDay,type WaterTrip,type Drink} from './water-trip';
import {waterPeriod,type WaterPeriod} from './water-review';
import {roadScenes} from './road-scenes';
import {waterTicketImage} from './water-ticket-export';
import {chunks,type HarvestReport} from './harvest-pages';
import {visitedDayScenes,routeReview} from './harvest-route';
import HarvestRouteMap from './HarvestRouteMap';
import HarvestStampCalendar from './HarvestStampCalendar';
import {downloadBlob,exportWaterPeriod} from './harvest-review-export';
import './harvest-folder.css';
import './harvest-spacing.css';
const tx=(zh:string,en:string)=>language==='en'?en:zh;
const periodNames={day:tx('日','Day'),week:tx('週','Week'),month:tx('月','Month')};
const format=(n:number)=>n.toLocaleString(locale);
const minutes=(s:number)=>{const m=Math.floor(s/60);return m>=60?Math.floor(m/60)+tx(' 小時 ',' hr ')+(m%60)+tx(' 分鐘',' min'):m+tx(' 分鐘',' min');};
function DurationValue({seconds}:{seconds:number}){const m=Math.floor(seconds/60);return <>{m>=60&&<>{format(Math.floor(m/60))}<small>{tx('小時','hr')}</small></>}{format(m%60)}<small>{tx('分鐘','min')}</small></>;}
const send=(name:string,detail:unknown={})=>window.dispatchEvent(new CustomEvent('daybook:'+name,{detail}));
function Pager({index,total,onChange,label}:{index:number;total:number;onChange:(n:number)=>void;label:string}){if(total<2)return null;return <nav className="folderPager" aria-label={label}><button disabled={index===0} onClick={()=>onChange(index-1)}>{tx('上一頁','Previous')}</button><span role="status">{index+1} / {total}</span><button disabled={index+1>=total} onClick={()=>onChange(index+1)}>{tx('下一頁','Next')}</button></nav>;}

function DrinkDay({day,entries}:{day:string;entries:Drink[]}){const [page,setPage]=useState(0),pages=chunks(entries,8),safe=Math.min(page,Math.max(0,pages.length-1));return <details><summary><time>{day}</time><b>{format(entries.reduce((n,e)=>n+e.ml,0))} mL</b><span>{entries.length?entries.length+tx(' 次',' refills'):day>localDate()?tx('待出發','Ahead'):tx('休息站','Rest stop')}</span></summary><ul>{(pages[safe]??[]).map(e=><li key={e.id}><time>{new Date(e.at).toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit',hour12:false})}</time><span>{format(e.ml)} mL</span></li>)}</ul><Pager index={safe} total={pages.length} onChange={setPage} label={tx('當日飲水明細翻頁','Daily water entry pages')}/></details>;}

export default function HarvestBook({value,onChange,initialDay}:{value?:WaterTrip;onChange:(trip:WaterTrip)=>void;initialDay:string}){
 const [period,setPeriod]=useState<WaterPeriod>('day'),[anchor,setAnchor]=useState(initialDay||localDate()),[report,setReport]=useState<HarvestReport|null>(null),[metric,setMetric]=useState('time'),[mapPage,setMapPage]=useState(0),[collectionPage,setCollectionPage]=useState(0),[activityPage,setActivityPage]=useState(0),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{const receive=(event:Event)=>{const r=(event as CustomEvent).detail;if(r?.schema===1&&Array.isArray(r.groups)&&Array.isArray(r.activities))setReport(r);},done=(event:Event)=>{setBusy(false);const r=(event as CustomEvent).detail;setMessage(r?.error?tx('圖片匯出失敗，請再試一次。','Export failed. Please try again.'):tx('完整蘑菇結算已匯出。','Complete mushroom settlement exported.'));};window.addEventListener('daybook:review-report',receive);window.addEventListener('daybook:review-exported',done);return()=>{window.removeEventListener('daybook:review-report',receive);window.removeEventListener('daybook:review-exported',done);};},[]);
 useEffect(()=>{setMapPage(0);setCollectionPage(0);setActivityPage(0);setMessage('');send('review-request',{period,day:anchor,metric});},[period,anchor,metric]);
 const trip=useMemo(()=>normalizeTrip(value),[value]),stats=useMemo(()=>waterPeriod(trip,anchor,period),[trip,anchor,period]),journey=useMemo(()=>routeReview(stats,localDate()),[stats]),maps=useMemo(()=>chunks(journey.points,7),[journey]);
 const currentReport=report?.anchor===anchor&&report.period===period&&(!report.weekly||report.weekly.metric===metric)?report:null;
 const groups=chunks(currentReport?.groups??[],20),activities=chunks(currentReport?.activities??[],8),safeCollection=Math.min(collectionPage,Math.max(0,groups.length-1)),safeActivity=Math.min(activityPage,Math.max(0,activities.length-1)),safeMap=Math.min(mapPage,maps.length-1);
 const ticket=useMemo(()=>ticketForDay(trip,anchor),[trip,anchor]),visited=useMemo(()=>visitedDayScenes(trip,anchor),[trip,anchor]),savedScene=trip.ticketScenes?.[anchor],scene=savedScene!==undefined&&visited.includes(savedScene)?savedScene:visited.at(-1);
 const heading=period==='day'?tx('今日回顧','Daily review'):period==='week'?tx('本週回顧','Weekly review'):tx('里程回顧','Journey review');
 const activityDays=useMemo(()=>stats.daily.map(d=>{const seconds=currentReport?.daily?.find(r=>r.day===d.day)?.seconds??0;return{day:d.day,seconds,kind:seconds>0?'recorded' as const:d.day>localDate()?'planned' as const:'rest' as const};}),[stats,currentReport]);
 async function exportWater(){setBusy(true);setMessage('');try{const r=await exportWaterPeriod(trip,anchor,period);setMessage(tx('已匯出完整飲水明細，共 ','Exported all water entries: ')+r.entries+tx(' 筆。',' entries.'));}catch{setMessage(tx('圖片匯出失敗，請再試一次。','Export failed. Please try again.'));}finally{setBusy(false);}}
 async function exportTicket(){if(!ticket||scene===undefined)return;setBusy(true);try{downloadBlob(await waterTicketImage(ticket,roadScenes[scene].src),'water-ticket-'+anchor+'.png');setMessage(tx('風景票根已匯出。','Scenic ticket exported.'));}catch{setMessage(tx('圖片匯出失敗，請再試一次。','Export failed. Please try again.'));}finally{setBusy(false);}}
 function moveDate(direction:number){const d=new Date(anchor+'T12:00:00');if(period==='month'){const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+direction);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));}else d.setDate(d.getDate()+direction*(period==='week'?7:1));setAnchor(localDate(d));}
 function PeriodNavigation(){return <nav className="folderDateNav" aria-label={tx('結算期間','Settlement period')}><button aria-label={tx('上一個期間','Previous period')} disabled={busy} onClick={()=>moveDate(-1)}>‹</button><span>{stats.start}{period!=='day'?' — '+stats.end:''}</span><button aria-label={tx('下一個期間','Next period')} disabled={busy} onClick={()=>moveDate(1)}>›</button></nav>;}
 function WeeklyMushrooms(){const w=currentReport?.weekly;if(!w)return null;const max=Math.max(1,...w.current,...w.previous);return <div className="folderMushWeek"><label>{tx('每週統計','Weekly comparison')}<select disabled={busy} value={metric} aria-label={tx('週結算統計項目','Weekly chart metric')} onChange={e=>setMetric(e.target.value)}><option value="time">{tx('做事時間','Time spent')}</option><option value="mushrooms">{tx('採收數量','Harvest count')}</option></select></label><div className="folderLegend"><span>{tx('本週','This week')}</span><span>{tx('前一週','Previous week')}</span></div><div className="folderMushBars" role="img" aria-label={tx('本週與前一週比較','This week compared with the previous week')}>{w.current.map((n,i)=><div key={i} title={w.dates[i]+': '+n+' / '+w.previous[i]}><small>{format(Number(n.toFixed(1)))}</small><div><i style={{height:w.previous[i]/max*100+'%'}}/><b style={{height:n/max*100+'%'}}/></div><span>{new Date(w.dates[i]+'T12:00:00').toLocaleDateString(locale,{weekday:'narrow'})}</span></div>)}</div><p>{tx('前一週','Previous week')} {metric==='time'?minutes(w.previousTotal*60):format(w.previousTotal)+tx(' 朵',' mushrooms')}</p><label className="folderDecor">{tx('裝飾小菇','Decorative mushroom')}<select aria-label={tx('更換每週回顧的小菇','Change weekly decorative mushroom')} disabled={busy} value={currentReport?.decoration} onChange={e=>send('review-request',{period,day:anchor,metric,decoration:e.target.value})}>{currentReport?.catalog.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label></div>;}
 return <section className={'harvestFolder '+(period==='day'?'folderDaily':'folderPeriod')+' folder-'+period} style={{'--month-rows':Math.ceil(((new Date(stats.start+'T12:00:00').getDay()+6)%7+stats.daily.length)/7)} as CSSProperties} aria-label={tx('我的收成冊','My harvest journal')}>
 <div className="folderTabs" role="tablist" aria-label={tx('回顧週期','Review period')}>{(['day','week','month'] as const).map((p,i)=><button key={p} id={'review-tab-'+p} role="tab" disabled={busy} aria-selected={period===p} aria-controls="folder-review" tabIndex={period===p?0:-1} onClick={()=>setPeriod(p)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(['day','week','month'] as const)[(i+(e.key==='ArrowRight'?1:2))%3];setPeriod(next);document.getElementById('review-tab-'+next)?.focus();}}}>{periodNames[p]}</button>)}</div>
 <article className="folderReceipt" id="folder-review" role="tabpanel" aria-labelledby={'review-tab-'+period}>
 <div className="folderPanels">
 <section className="folderWater" aria-label={tx('飲水旅程結算','Water journey settlement')}>
 <header className="folderHeading"><div><small>{period==='day'?'DAILY KEEPSAKE':period==='week'?'WEEKLY ROAD LOG':'MONTHLY STAMP COLLECTION'}</small><h3>{heading}</h3></div></header>
 {period==='day'&&<PeriodNavigation/>}
 {period==='day'?<>
 {scene!==undefined?<figure className="folderScenery"><img src={roadScenes[scene].src} alt={roadScenes[scene].place()} decoding="async"/><figcaption>{roadScenes[scene].place()}</figcaption></figure>:<div className="folderSceneryEmpty"><span>ROAD JOURNAL</span><p>{tx('今天的旅程，從一口水開始。','A little water starts today’s journey.')}</p></div>}
 <div className="folderWaterAmount"><span>{tx('今日水量','Water today')}</span><strong>{format(stats.ml)} <small>mL</small></strong><p>{format(stats.times)} {tx('次補給','refills')}<i/> {format(journey.km)} km</p></div>
 {!!visited.length&&<div className="folderSceneControls"><label>{tx('今日走過的風景','Scenery visited today')}<select aria-label={tx('今日走過的風景','Scenery visited today')} disabled={busy} value={scene} onChange={e=>{const n=Number(e.target.value);if(visited.includes(n))onChange({...trip,ticketScenes:{...trip.ticketScenes,[anchor]:n}});}}>{visited.map(i=><option key={i} value={i}>{roadScenes[i].name()}</option>)}</select></label><button disabled={busy} onClick={()=>void exportTicket()}>{tx('匯出風景票根','Export scenic ticket')}</button></div>}
 </>:<>
 <div className="folderSectionTitle"><h4>{tx('沿途留下的飲水足跡','Water along the way')}</h4><span>{safeMap*7+1}–{Math.min((safeMap+1)*7,journey.points.length)} {tx('日','days')}</span></div>
 {period==='month'?<HarvestStampCalendar points={journey.points} onDay={day=>{if(!busy){setAnchor(day);setPeriod('day');}}}/>:<HarvestRouteMap points={maps[safeMap]} max={journey.max} onDay={day=>{if(!busy){setAnchor(day);setPeriod('day');}}}/>}
 <PeriodNavigation/>
 <div className="folderWaterStats"><div><span>{tx('總飲水量','Water recorded')}</span><strong>{format(stats.ml)} <small>mL</small></strong></div><div><span>{tx('行駛距離','Distance')}</span><strong>{format(journey.km)} <small>km</small></strong></div><div><span>{tx('休息站','Rest stops')}</span><strong>{journey.restDays} <small>{tx('天','days')}</small></strong></div></div>
 <p className="folderGentleNote">{tx('沒有留下紀錄的日子，先在休息站歇一歇。總水量只計入實際紀錄；未來的日期留待出發。','Unrecorded days are a place to rest. Totals include recorded water only; future dates are a journey ahead.')}</p>
 </>}
 <details className="folderDetails" key={'water-'+period+anchor}><summary>{tx('飲水明細','Water details')} · {format(stats.times)} {tx('筆','entries')}</summary><div className="folderDailyTotals">{stats.daily.map(d=><DrinkDay key={d.day} day={d.day} entries={trip.drinks.filter(e=>e.day===d.day)}/>)}</div></details>
 </section>
 <section className="folderMushrooms" aria-label={tx('蘑菇收成結算','Mushroom harvest settlement')}>
 {currentReport?<>
 <div className="folderWeekBrand"><span>THE LITTLE HARVEST</span><h4>{period==='day'?tx('今日收成結算','Daily harvest settlement'):period==='week'?tx('本週收成結算','Weekly harvest settlement'):tx('收成回顧','Harvest review')}</h4></div>
 <div className="folderHarvestStats"><div><span>{tx('累積做事時間','Time spent')}</span><strong><DurationValue seconds={currentReport.seconds}/></strong></div><div><span>{tx('採收的蘑菇','Mushrooms harvested')}</span><strong>{format(currentReport.count)}<small>{tx('朵','')}</small></strong></div><div><span>{tx('留下的紀錄','Records kept')}</span><strong>{format(currentReport.sessionsCount)}<small>{tx('次','')}</small></strong></div></div>
 <WeeklyMushrooms/>
 {period==='month'&&<div className="folderMushCalendar"><HarvestStampCalendar points={activityDays} mode="activity" onDay={day=>{if(!busy){setAnchor(day);setPeriod('day');}}}/></div>}
 {period!=='day'&&<div className="folderMushDate"><PeriodNavigation/></div>}
 <details className={'folderCollectionBlock '+(period==='month'?'folderMonthlyCollection':'')} open={period!=='month'||undefined}><summary className="folderCollectionSummary">{tx('這次採收到的小菇','Mushrooms collected')}</summary><h4 className="folderCollectionTitle">{tx('這次採收到的小菇','Mushrooms collected')}</h4>
 {groups.length?<><div className="folderCollection">{groups[safeCollection].map(g=><div key={g.id}><img src={'./mushrooms/'+g.src} alt={g.label} loading="lazy" decoding="async"/><b>× {format(g.count)}</b><span>{g.label}</span></div>)}</div><Pager index={safeCollection} total={groups.length} onChange={setCollectionPage} label={tx('小菇收藏翻頁','Mushroom collection pages')}/></>:<p className="folderEmpty">{tx('目前尚未有採收紀錄。','No mushrooms harvested yet.')}</p>}
 </details><details className="folderDetails" key={'activities-'+period+anchor}><summary>{tx('做事明細','Activity details')} · {format(currentReport.sessionsCount)} {tx('筆紀錄','records')}</summary>{activities.length?<><div className="folderActivities">{activities[safeActivity].map((a,i)=><div key={i}><img src={'./mushrooms/'+a.src} alt=""/><div><b>{a.name}</b><small>{a.times} {tx('次記錄','records')} · {a.mushrooms} {tx('朵','mushrooms')}</small></div><strong>{minutes(a.seconds)}</strong></div>)}</div><Pager index={safeActivity} total={activities.length} onChange={setActivityPage} label={tx('做事明細翻頁','Activity detail pages')}/></>:<p className="folderEmpty">{tx('目前尚未有紀錄。','No records yet.')}</p>}</details>
 <p className="folderTimingNote">{tx('時間依記錄日期，蘑菇依採收日期結算。','Time follows the recorded date; mushrooms follow the harvest date.')}</p>
 </>:<p role="status" className="folderEmpty">{tx('正在讀取原有收成紀錄…','Loading your existing harvest records…')}</p>}
 </section>
 </div>
 <details className="folderExportMenu"><summary>{tx('匯出結算圖片','Export settlement images')}</summary><footer className="folderExport"><button disabled={busy||!currentReport} onClick={()=>{setBusy(true);setMessage('');send('review-export');}}>{tx('匯出蘑菇結算','Export mushroom receipt')}</button><button disabled={busy} onClick={()=>void exportWater()}>{tx('匯出飲水結算','Export water settlement')}</button></footer></details>
 </article>
 {message&&<p className="folderExportStatus" role="status">{message}</p>}
 </section>;
}
