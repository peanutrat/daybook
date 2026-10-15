import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {isWeekend,weekendColor} from '../src/calendar-preferences.js';
const source=readFileSync(new URL('../src/Book.tsx',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('async function exportCalendar(){'),source.indexOf('const taskHistory='));
for(const [count,first,cells] of [[31,3,35],[31,6,42],[28,0,28]])for(const start of [0,1]){
 const drawn=[],downloads=[],flags=[];const ctx={font:'',fillText(text,x,y){drawn.push({text,x,y,font:this.font})},measureText(s){return {width:s.length*20}},scale(){},fillRect(){},strokeRect(){},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}};
 const canvas={width:0,height:0,getContext:()=>ctx,toBlob:cb=>cb(new Blob(['png']))};
 const day='2026-10-01',data={weekendHighlight:true,weekendColor:'#bb5566',stamps:[{id:'rest',name:'休假',icon:'',type:'sticker'}],days:{[day]:['rest']},tasks:[{text:'看牙醫',kind:'once',date:day,done:[]},{text:'刷牙',kind:'daily',date:day,done:[]}]};
 const context=vm.createContext({document:{fonts:{ready:Promise.resolve()},querySelector:()=>({}),createElement:tag=>tag==='canvas'?canvas:{click(){downloads.push(this.download)}}},getComputedStyle:()=>({getPropertyValue:()=>''}),exporting:false,setExporting:v=>flags.push(v),month:new Date(2026,9,1),count,first,cells,data,isWeekend,weekendColor,weekdays:Array.from({length:7},(_,i)=>(i+start)%7),weekdayNames:['日','一','二','三','四','五','六'],key:d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,stampText:()=> '#3d4942',stampColor:()=> '#e8ede3',Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout:()=>0,alert:()=>assert.fail('export should not fail')});
 vm.runInContext(ts.transpile(fn,{target:ts.ScriptTarget.ES2022}),context);await context.exportCalendar();
 assert(!drawn.some(x=>x.text.includes('日日手帳')));assert(drawn.some(x=>x.text==='2026'&&x.font.startsWith('26px')));assert(drawn.some(x=>x.text==='10'&&x.font.startsWith('68px')));assert(drawn.some(x=>x.text===(start===0?'日':'一')&&x.y===163));assert(drawn.some(x=>x.text==='休假'));assert(drawn.some(x=>x.text.includes('看牙醫')));assert(!drawn.some(x=>x.text.includes('刷牙')));assert.equal(downloads[0],'日日手帳-2026-10.png');assert.deepEqual(flags,[true,false]);assert.equal(canvas.width,3080);assert(drawn.every(x=>x.y<canvas.height/2));
}
assert(source.includes('className="brand"'));console.log('PASS: calendar PNG has enlarged month, no visible branding, preserved stamps/tasks, four-to-six-row layouts and unchanged website branding.');
