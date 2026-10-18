import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTranslator} from '../src/i18n-core.js';
const catalog=JSON.parse(readFileSync(new URL('../src/locales/en.json',import.meta.url),'utf8'));
import {drawReceiptSummary,drawHarvestTile} from '../public/mushrooms/receipt-canvas.js';
const source=readFileSync(new URL('../public/mushrooms/app.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('async function exportReceipt()'),source.indexOf("\n$('finishHarvest')"));
for(const language of ['zh-Hant','en'])for(const period of ['day','month'])for(const empty of [false,true]){
 const t=createTranslator(catalog,language);
 const fills=[],texts=[],downloads=[],ctx={fillStyle:'',fillRect(...args){fills.push({color:this.fillStyle,args})},fillText(text){texts.push(text)},strokeRect(){},drawImage(){},setLineDash(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){fills.push({color:this.fillStyle,hexagon:true})},stroke(){},save(){},restore(){},measureText:s=>({width:s.length*10})};
 const canvas={getContext:()=>ctx,toDataURL:()=> 'data:image/png;base64,test'},receipt={querySelector:s=>({kind:s})},b={title:language==='en'?'Harvest test':'結算測試',seconds:empty?0:3600,count:empty?0:2,sessions:empty?[]:[{}],batches:empty?[]:[{}],begin:'2026-10-16'};
 class Image{set src(v){this.onload()}}
 const run=new Function('bookData','activityRows','state','mushroomGroups','Image','MUSHROOMS','document','$','mins','getComputedStyle','drawReceiptSummary','drawHarvestTile','uiText','receiptLogo',fn+';return exportReceipt()');
 await run(()=>b,()=>empty?[]:[{name:language==='en'?'Drawing':'畫圖',seconds:3600,times:1,mushrooms:2,icon:'test'}],{sessions:[]},()=>empty?[]:[{plant:{src:'test'},count:2}],Image,[{id:'test',src:'test'}],{createElement:t=>t==='canvas'?canvas:{click(){downloads.push(this.download)}}},id=>id==='period'?{value:period}:receipt,s=>s+(language==='en'?' sec':' 秒'),(el,pseudo)=>({getPropertyValue:()=> '#fffef5',backgroundColor:pseudo?'#e9dfbd':'#f7f5df'}),drawReceiptSummary,drawHarvestTile,t,period=>'assets/receipt-'+(period==='month'?'month':'day')+(language==='en'?'-en':'')+'.png');
 assert(fills.some(x=>x.color==='#fffef5'));assert(fills.some(x=>x.color==='#f7f5df'&&x.args[1]===284));if(!empty){assert(fills.some(x=>x.color==='#e9dfbd'&&x.hexagon));assert(texts.includes(language==='en'?'Drawing':'畫圖'))}else{assert(texts.includes(t('目前尚未有紀錄。')));assert(!texts.some(t=>t.includes('小票')))}assert.equal(downloads[0],t(period==='month'?'本月收成':'本日收成')+'-2026-10-16.png');
 if(language==='en')assert(!/\p{Script=Han}/u.test(texts.join(' ')),'English receipt export must contain no Chinese');
}
console.log('PASS: Chinese/English day/month receipt exports include paper, summary and mushroom tile backgrounds with localized text');
