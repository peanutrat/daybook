import catalog from './locales/en.json' with {type:'json'};
import {createTranslator,readLanguage,LANGUAGE_KEY} from './i18n-core.js';
export type Language='zh-Hant'|'en';
export const language:Language=readLanguage();
export const locale=language==='en'?'en-US':'zh-TW';
export const t=createTranslator(catalog,language);
export function changeLanguage(next:Language){
 try{localStorage.setItem(LANGUAGE_KEY,next)}catch{}
 const url=new URL(location.href);url.searchParams.set('lang',next);location.assign(url.href);
}
export function initializeLanguage(){
 document.documentElement.lang=language;
 document.title=language==='en'?'Daybook — Calendar, Notes & Drawing':'日日手帳';
 const description=document.querySelector('meta[name="description"]');
 if(description&&language==='en')description.setAttribute('content','A calm journal for your calendar, notes, drawings and mushroom harvests.');
}

export function layerLabel(name:string){return language==='en'?name.replace(/^圖層 (\d+)$/,'Layer $1'):name.replace(/^Layer (\d+)$/,'圖層 $1');}
