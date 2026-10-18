import catalog from './locale-en.js';
import {createTranslator,readLanguage} from './i18n-core.js';
export const language=readLanguage();
export const locale=language==='en'?'en-US':'zh-TW';
export const t=createTranslator(catalog,language);
export const receiptLogo=period=>'assets/receipt-'+(period==='month'?'month':'day')+(language==='en'?'-en':'')+'.png';
