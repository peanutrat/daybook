import {language,locale} from './i18n';
type Point={day:string;kind:'recorded'|'rest'|'planned';ml?:number;seconds?:number};
const tx=(zh:string,en:string)=>language==='en'?en:zh;
export default function HarvestStampCalendar({points,onDay,mode='water'}:{points:Point[];onDay:(day:string)=>void;mode?:'water'|'activity'}){
 const offset=(new Date(points[0].day+'T12:00:00').getDay()+6)%7;
 const weekdays=language==='en'?['M','T','W','T','F','S','S']:['一','二','三','四','五','六','日'];
 const amount=(p:Point)=>mode==='water'?(p.ml??0).toLocaleString(locale)+' mL':((p.seconds??0)>0&&(p.seconds??0)<60?'<1':Math.floor((p.seconds??0)/60).toLocaleString(locale))+tx(' 分鐘',' min');
 return <div className="stampCalendar" role="group" aria-label={mode==='water'?tx('每月飲水旅行集章卡','Monthly water travel stamp card'):tx('每月做事時間集章卡','Monthly activity stamp card')}>
  <div className="stampCalendarWeekdays" aria-hidden="true">{weekdays.map((d,i)=><span key={i}>{d}</span>)}</div>
  <div className="stampCalendarDays">
   {Array.from({length:offset},(_,i)=><span className="stampCalendarBlank" key={'blank'+i} aria-hidden="true"/>)}
   {points.map(p=><button key={p.day} className={'stampCalendarDay '+p.kind} onClick={()=>onDay(p.day)} aria-label={p.day+' · '+amount(p)+(p.kind==='rest'?tx(' · 森林休息日',' · Forest rest day'):p.kind==='planned'?tx(' · 尚未出發',' · Journey ahead'):'')}>
    <time dateTime={p.day}>{Number(p.day.slice(-2))}</time>
    {p.kind!=='planned'?<svg className={'stampCalendarRecorded '+(p.kind==='rest'?'forestStamp':'')} viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="24" strokeDasharray="2 2"/>{p.kind==='rest'?<><path d="m18 25-6 9h3l-5 8h16l-5-8h3Zm14-12-8 13h4l-7 12h22l-7-12h4Zm14 13-5 8h3l-5 8h16l-5-8h3ZM18 42v6m14-10v10m14-6v6M14 50h36"/></>:mode==='activity'?<><path d="M13 34c0-12 8-20 19-20s19 8 19 20c-10 5-28 5-38 0Zm15 4-2 13h12l-2-13M18 44l-3 6m30-6 4 6"/><circle cx="25" cy="26" r="2"/><circle cx="38" cy="23" r="2"/><circle cx="40" cy="32" r="1.5"/><path d="M20 53h25"/></>:<><path d="m12 39 13-20 9 13 7-9 13 18H12Zm7-10 6-10 7 10-7-3-6 3ZM17 46h30M25 51h14"/><path d="M41 14h4m-2-2v4"/></>}</svg>:<span className="stampCalendarAhead" aria-hidden="true"/>}
    <small>{p.kind==='planned'?'—':amount(p)}</small>
   </button>)}
  </div>
 </div>;
}
