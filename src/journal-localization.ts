import {t} from './i18n.ts';
import catalog from './locales/en.json' with {type:'json'};
// Translate unchanged starter labels by their stable IDs. Renamed items and all
// authored note content are preserved. No matching against arbitrary user text.
const stampDefaults:Record<string,string>={off:'休假',am:'早班',pm:'晚班',clean:'打掃',meet:'約定'};
const taskDefaults:Record<string,string>={brush:'刷牙',shower:'洗澡'};
const dictionary:Record<string,string>=catalog;
function label(value:string,key:string|undefined){return key&&(value===key||value===dictionary[key])?t(key):value;}
export function localizeJournalDefaults<T extends {stamps:{id:string;name:string}[];tasks:{id:string;text:string}[]}>(data:T):T{
 return {...data,stamps:data.stamps.map(s=>({...s,name:label(s.name,stampDefaults[s.id])})),tasks:data.tasks.map(task=>({...task,text:label(task.text,taskDefaults[task.id])}))};
}
