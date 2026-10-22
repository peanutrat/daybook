import {t as uiText} from './i18n.ts';
import {roadStops} from './road-route';
const labels:Record<typeof roadStops[number],{code:string;name:()=>string;place:()=>string;weather:()=>string;icon:string}>={
 finland:{code:'FI',name:()=>uiText('芬蘭'),place:()=>uiText('極光公路・午夜森林'),weather:()=>uiText('極光夜色'),icon:'✦'},
 norway:{code:'NO',name:()=>uiText('挪威'),place:()=>uiText('挪威峽灣・拱橋晨景'),weather:()=>uiText('晴朗'),icon:'☀'},
 germany:{code:'DE',name:()=>uiText('德國'),place:()=>uiText('阿爾卑斯・山湖公路'),weather:()=>uiText('晴朗'),icon:'☀'},
 italy:{code:'IT',name:()=>uiText('義大利'),place:()=>uiText('托斯卡納・田園小路'),weather:()=>uiText('暖陽'),icon:'☀'},
 japan:{code:'JP',name:()=>uiText('日本'),place:()=>uiText('富士山・櫻花海灣'),weather:()=>uiText('春日晴空'),icon:'☀'},
 iceland:{code:'IS',name:()=>uiText('冰島'),place:()=>uiText('冰川瀑布・綠色牧野'),weather:()=>uiText('薄雲'),icon:'☁'},
 scotland:{code:'GB',name:()=>uiText('蘇格蘭'),place:()=>uiText('高地湖畔・蜿蜒山路'),weather:()=>uiText('多雲'),icon:'☁'},
 usa:{code:'US',name:()=>uiText('美國'),place:()=>uiText('紅岩荒漠・仙人掌公路'),weather:()=>uiText('乾燥晴空'),icon:'☀'},
 harvest:{code:'IT',name:()=>uiText('金色田野'),place:()=>uiText('豐收季節・金色田野'),weather:()=>uiText('秋日暖陽'),icon:'☀'},
 australia:{code:'AU',name:()=>uiText('澳洲'),place:()=>uiText('海岸公路・十二門徒岩'),weather:()=>uiText('晴朗'),icon:'☀'},
 canada:{code:'CA',name:()=>uiText('山湖公路'),place:()=>uiText('雪山湖泊・松林遠行'),weather:()=>uiText('晴朗'),icon:'☀'},
 mediterranean:{code:'MED',name:()=>uiText('地中海'),place:()=>uiText('地中海・海岸小鎮'),weather:()=>uiText('海風晴日'),icon:'☀'},
 coast:{code:'SEA',name:()=>uiText('海岸公路'),place:()=>uiText('海岸公路・海風慢行'),weather:()=>uiText('晴朗'),icon:'☀'}
};
export const roadScenes=roadStops.map(id=>({id,...labels[id],src:`./trip/scenery/${id}.webp`,thumb:`./trip/scenery/${id}-thumb.webp`}));
