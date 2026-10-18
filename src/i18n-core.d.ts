export const LANGUAGE_KEY:string;
export function detectLanguage(storage:{getItem(key:string):string|null}|undefined,search?:string):'en'|'zh-Hant';
export function createTranslator(catalog:Record<string,string>,language:string):(text:string)=>string;
export function readLanguage():'en'|'zh-Hant';
