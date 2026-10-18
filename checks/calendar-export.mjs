import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
import {isWeekend,weekendColor} from '../src/calendar-preferences.js';
const source=readFileSync(new URL('../src/Book.tsx',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('async function exportCalendar(){'),source.indexOf('const taskHistory='));
for(const height of [440,560,730])for(const gridWidth of [350,735])for(const start of [0,1]){
 const drawn=[],downloads=[],flags=[],snapshots=[];const ctx={font:'',fillText(text,x,y){drawn.push({text,x,y,font:this.font})},scale(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}};
 const canvas={width:0,height:0,getContext:()=>ctx,toBlob:cb=>cb(new Blob(['png']))},grid={getBoundingClientRect:()=>({width:gridWidth,height})};
 const context=vm.createContext({uiText:value=>value,document:{fonts:{ready:Promise.resolve()},querySelector:()=>({querySelector:()=>grid}),createElement:tag=>tag==='canvas'?canvas:{click(){downloads.push(this.download)}}},paintCalendarSnapshot:async(...args)=>snapshots.push(args),getComputedStyle:()=>({getPropertyValue:()=>''}),exporting:false,setExporting:v=>flags.push(v),month:new Date(2026,9,1),data:{weekendHighlight:true,weekendColor:'#bb5566'},isWeekend,weekendColor,weekdays:Array.from({length:7},(_,i)=>(i+start)%7),weekdayNames:['日','一','二','三','四','五','六'],Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout:()=>0,alert:()=>assert.fail('export should not fail')});
 vm.runInContext(ts.transpile(fn,{target:ts.ScriptTarget.ES2022}),context);await context.exportCalendar();
 assert(drawn.some(x=>x.text==='2026'));assert(drawn.some(x=>x.text===(start===0?'日':'一')&&x.y===163));assert.equal(downloads[0],'日日手帳-2026-10.png');assert.deepEqual(flags,[true,false]);assert.equal(canvas.width,3080);assert.equal(canvas.height,Math.ceil((225+height*1470/gridWidth)*2));assert.equal(snapshots[0][1],grid);assert.deepEqual(snapshots[0].slice(2),[35,190,1470]);
}
const module={exports:{}};const rect=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
const css={display:'block',visibility:'visible',opacity:'1',backgroundColor:'transparent',borderRadius:'0',overflowX:'visible',overflowY:'visible',fontStyle:'normal',fontWeight:'400',fontSize:'12px',fontFamily:'sans-serif',color:'#333',textDecorationLine:'none',getPropertyValue:()=> '0'};
const text=(s,x,y)=>({nodeType:3,textContent:s,rect:rect(x,y,s.length*12,14)}),elm=(children,r,styles={})=>({nodeType:1,tagName:'DIV',childNodes:children,getBoundingClientRect:()=>r,matches:()=>false,styles:{...css,...styles},querySelectorAll:()=>[]});
const calls=[];const ctx=new Proxy({globalAlpha:1,measureText:()=>({}),fillText:(s,x,y)=>calls.push({s,x,y})},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
const context={uiText:value=>value,require:()=>({t:value=>value}),module,exports:module.exports,Intl,HTMLImageElement:class{},getComputedStyle:el=>el.styles,document:{createRange:()=>({setStart(node,i){this.node=node;this.i=i},setEnd(){},getBoundingClientRect(){return {...this.node.rect,left:this.node.rect.left+this.i*12,width:12}},detach(){}})}};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/calendar-snapshot.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,context);
// Header labels share a row, another wraps, body labels share a row: retain all actual positions.
const grid=elm([elm([text('18',10,20),text('休假',45,20)],rect(0,0,210,40)),elm([text('打掃',10,60),text('生日',80,60),text('換被單',10,95)],rect(0,40,210,120)),elm([text('不可見',0,200)],rect(0,200,50,20),{display:'none'})],rect(0,0,210,160));
assert.equal(await module.exports.paintCalendarSnapshot(ctx,grid,35,190,1470),1120);
assert.equal(calls.find(c=>c.s==='休').y,calls.find(c=>c.s==='1').y);assert.equal(calls.find(c=>c.s==='打').y,calls.find(c=>c.s==='生').y);assert(calls.find(c=>c.s==='換').y>calls.find(c=>c.s==='打').y);assert(!calls.some(c=>c.s==='不'));
console.log('PASS: calendar export uses measured preview geometry, inline/wrapped stamps, hidden content, aspect ratio and adaptive height across narrow/wide layouts.');
