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
    {p.kind==='rest'?<span className="stampCalendarArtwork stampCalendarRestInk" aria-hidden="true" style={{maskImage:`url('./trip/month-stamps/${mode}-rest.png')`,WebkitMaskImage:`url('./trip/month-stamps/${mode}-rest.png')`}}/>:p.kind==='recorded'?<img className="stampCalendarArtwork" src={'./trip/month-stamps/'+mode+'-recorded.png'} alt="" aria-hidden="true" decoding="async" width="52" height="52"/>:<span className="stampCalendarAhead" aria-hidden="true"/>}
    <small>{p.kind==='planned'?'—':amount(p)}</small>
   </button>)}
  </div>
 </div>;
}
