import {t as uiText} from "./i18n.js";
export const LOGS=[{id:'plain',label:uiText("原木"),src:'assets/log-plain.png'},{id:'moss',label:uiText("苔蘚"),src:'assets/log-moss.png'},{id:'flower',label:uiText("小花"),src:'assets/log-flower.png'},{id:'snow',label:uiText("積雪"),src:'assets/log-snow.png'}];
export const STUMP_SLOTS=[...[26,34,42,50,58,66,74,82,90].map((x,i)=>({x,y:[25,23,26,24,25,23,26,24,25][i],row:0})),...[37,47,57,67,77,87].map((x,i)=>({x,y:[40,42,39,42,40,42][i],row:1}))];
