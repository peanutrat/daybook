export const LANGUAGE_KEY='daybook-language';
export function detectLanguage(storage,search=''){
 const requested=new URLSearchParams(search).get('lang');
 if(requested==='en'||requested==='zh-Hant')return requested;
 try{return storage?.getItem(LANGUAGE_KEY)==='en'?'en':'zh-Hant'}catch{return 'zh-Hant'}
}
export function createTranslator(catalog,language){
 return text=>language==='en'?(catalog[text]??text):text;
}
export function readLanguage(){
 if(typeof window==='undefined')return 'zh-Hant';
 // Access to localStorage itself may throw in privacy-restricted browsers.
 let storage;try{storage=window.localStorage}catch{}
 return detectLanguage(storage,window.location?.search??'');
}
