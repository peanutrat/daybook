import {t as uiText} from "./i18n.ts";
import {colorContrast,readableTaskInk} from './task-colors.ts';
export type ThemeColors={page:string;paper:string;ink:string;accent:string;soft:string;notice:string};
export type CustomTheme={id:string;name:string;colors:ThemeColors};
export const themeFields=[['page',uiText("頁面底色")],['paper',uiText("卡片底色")],['ink',uiText("文字顏色")],['accent',uiText("主題重點色")],['soft',uiText("日期與選取底色")],['notice',uiText("公告底色")]] as const;
export const baseThemes:Record<string,ThemeColors>={
sage:{page:'#f5f3ed',paper:'#fdfdfa',ink:'#3d4942',accent:'#6e886d',soft:'#e8ede3',notice:'#dfeef0'},
rose:{page:'#f8f0f1',paper:'#fffbfc',ink:'#5a424a',accent:'#aa7585',soft:'#f1e1e6',notice:'#f4e5dd'},
blue:{page:'#edf3f7',paper:'#fbfdff',ink:'#394f60',accent:'#648ba6',soft:'#e0ebf2',notice:'#e1eeec'},
lavender:{page:'#f3eff8',paper:'#fdfbff',ink:'#514663',accent:'#8c79a9',soft:'#eae2f2',notice:'#e5eaf4'},
sand:{page:'#f5efe6',paper:'#fffdf8',ink:'#5b4f40',accent:'#a38b6b',soft:'#eee4d4',notice:'#ebe9dc'}};
export function cleanColors(value:Partial<ThemeColors>|undefined):ThemeColors{const out={...baseThemes.sage};for(const [key] of themeFields)if(/^#[\da-f]{6}$/i.test(value?.[key]??''))out[key]=value![key]!.toLowerCase();return out}
export function mix(a:string,b:string,weight:number){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*weight+parseInt(b.slice(i,i+2),16)*(1-weight)).toString(16).padStart(2,'0')).join('')}
export function themeVars(input:ThemeColors,night:boolean){const c=cleanColors(input);const v:Record<string,string>=night?{page:mix(c.accent,'#191e24',.08),paper:mix(c.accent,'#262d35',.09),ink:'#e6e8ec',accent:mix(c.accent,'#ffffff',.7),soft:mix(c.accent,'#343e49',.13),notice:mix(c.notice,'#303b43',.12)}:{...c};if(colorContrast(v.ink,v.paper)<4.5)v.ink=readableTaskInk(v.paper);for(const key of ['page','soft','notice']){for(let i=0;i<12&&colorContrast(v.ink,v[key])<4.5;i++)v[key]=mix(v[key],v.paper,.7)}v.edge=mix(v.ink,v.paper,.18);v["accent-ink"]=readableTaskInk(v.accent);return Object.fromEntries(Object.entries(v).map(([k,v])=>['--'+k,v]))}
