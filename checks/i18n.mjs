import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
import ts from 'typescript';import {createRequire} from 'node:module';
import {detectLanguage,createTranslator} from '../src/i18n-core.js';
import {prepareLocales} from '../scripts/prepare-locales.mjs';
const require=createRequire(import.meta.url),root=path.resolve('src'),catalog=JSON.parse(fs.readFileSync('src/locales/en.json','utf8')),han=/\p{Script=Han}/u;
const en=createTranslator(catalog,'en'),zh=createTranslator(catalog,'zh-Hant');
assert.equal(detectLanguage({getItem:()=>null}),'zh-Hant');
assert.equal(detectLanguage({getItem:()=> 'en'}),'en');
assert.equal(detectLanguage({getItem:()=> 'en'},'?lang=zh-Hant'),'zh-Hant');
assert.equal(detectLanguage({getItem(){throw Error()}},'?lang=en'),'en');
assert.equal(detectLanguage({getItem:()=> 'invalid'}),'zh-Hant');
for(const [key,value]of Object.entries(catalog)){assert(value?.trim(),'Empty translation: '+key);assert(!han.test(value),'Chinese in English translation: '+key);assert.equal(zh(key),key);}
assert.equal(en('我自己寫的筆記'),'我自己寫的筆記','User text must be preserved');
// Every translated UI call must resolve, including strings used by canvas exports.
let count=0;
for(const dir of ['src','public/mushrooms'])for(const relative of fs.readdirSync(dir,{recursive:true})){
 if(!/\.(tsx?|js)$/.test(relative)||relative.includes('i18n')||relative==='locale-en.js')continue;
 const file=path.join(dir,relative),source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,relative.endsWith('.tsx')?ts.ScriptKind.TSX:relative.endsWith('.ts')?ts.ScriptKind.TS:ts.ScriptKind.JS);
 const visit=n=>{if(ts.isCallExpression(n)&&n.expression.getText(ast)==='uiText'){const value=n.arguments[0];if(ts.isStringLiteral(value)){assert(Object.hasOwn(catalog,value.text),file+': '+value.text);count++;}}ts.forEachChild(n,visit)};visit(ast);
}
prepareLocales();
const timerHTML=fs.readFileSync('public/mushrooms/index-en.html','utf8');
assert(!han.test(timerHTML),'English timer HTML must contain no Chinese');
assert(timerHTML.includes('lang="en"'));assert(timerHTML.includes('receipt-day-en.png'));
const db=new Map(),storage={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v),removeItem:k=>db.delete(k)};
const assigned=[],cache=new Map();let states=[],cursor=0,effects=[];
const react={...require("react"),useState(v){const i=cursor++;if(!(i in states))states[i]=typeof v==='function'?v():v;return[states[i],v=>states[i]=typeof v==='function'?v(states[i]):v]},useRef(v){const i=cursor++;return states[i]??(states[i]={current:v})},useEffect(fn,deps){const i=cursor++,old=states[i];if(!old||deps?.some((v,j)=>v!==old[j])){effects.push(fn);states[i]=deps}}};
const noop=()=>{},location={search:'?lang=en',href:'https://example.test/daybook/?lang=en',origin:'https://example.test',assign:url=>assigned.push(url)},window={location,localStorage:storage,matchMedia:()=>({matches:false,addEventListener:noop,removeEventListener:noop}),addEventListener:noop,removeEventListener:noop};
function load(file){
 if(file.endsWith('.css'))return {};
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(cache.has(file))return cache.get(file).exports;
 const module={exports:{}};cache.set(file,module);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,window,location,URL,URLSearchParams,localStorage:storage,sessionStorage:storage,crypto:globalThis.crypto,document:{querySelectorAll:()=>[],querySelector:()=>null},setTimeout:()=>0,clearTimeout:noop,requestAnimationFrame:f=>{f();return 1},cancelAnimationFrame:noop,require:name=>{if(name==='react')return react;if(!name.startsWith('.'))return require(name);const base=path.resolve(path.dirname(file),name);return load([base,base+'.ts',base+'.tsx',base+'.js'].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile()))}});
 return module.exports;
}
function nodes(tree){if(Array.isArray(tree))return tree.flatMap(nodes);if(!tree||typeof tree!=='object')return [];const children=tree.props?.children;return[tree,...(Array.isArray(children)?children:[children]).flatMap(nodes)];}
function visibleStrings(tree){if(Array.isArray(tree))return tree.flatMap(visibleStrings);if(typeof tree==='string')return[tree];if(!tree||typeof tree!=='object')return[];const p=tree.props??{},children=p.children;return[...['aria-label','title','placeholder'].map(k=>p[k]).filter(x=>typeof x==='string'),...(Array.isArray(children)?children:[children]).flatMap(visibleStrings)];}
function checkEnglish(tree,label){assert(!han.test(visibleStrings(tree).join(' ')),label+': '+visibleStrings(tree).filter(s=>han.test(s)));}
const Book=load(root+'/Book.tsx').default;
function render(){cursor=0;let tree=Book();const fns=effects.splice(0);for(const f of fns)f();cursor=0;tree=Book();return tree;}
let tree=render();checkEnglish(tree,'Calendar');
const select=nodes(tree).find(n=>n.type==='select'&&n.props['aria-label']==='Interface language');assert(select);assert.equal(select.props.value,'en');
const waterEntry=nodes(tree).find(n=>n.props?.className==='timerOpen quiet calendarWaterOpen');assert(waterEntry,'Water entry beside mushroom timer');waterEntry.props.onClick();tree=render();checkEnglish(tree,'Water log');
const waterComponent=nodes(tree).find(n=>typeof n.type==='function'&&n.type.name==='WaterTripDemo');assert(waterComponent);waterComponent.props.onChange({version:1,drinks:[],settledDays:[],cupPresets:[330,600]});tree=render();nodes(tree).find(n=>n.props?.className==='timerOpen quiet calendarWaterOpen').props.onClick();tree=render();assert.equal(nodes(tree).find(n=>n.props?.id==='daybook-water-panel').props.hidden,true);const quick=nodes(tree).find(n=>n.props?.['aria-label']==='Log water 600 mL');assert(quick,'Configured amounts appear when collapsed');quick.props.onClick();quick.props.onClick();tree=render();const logged=nodes(tree).find(n=>typeof n.type==='function'&&n.type.name==='WaterTripDemo').props.value;assert.equal(logged.drinks.length,1,'Rapid duplicate clicks are guarded');assert.equal(logged.drinks[0].ml,600);assert.equal(nodes(tree).find(n=>n.props?.id==='daybook-water-panel').props.hidden,true,'Quick recording keeps panel collapsed');

for(const tab of ['▤ Notes','✎ Drawing','▤ Harvest review']){nodes(tree).find(n=>n.type==='button'&&n.props.children===tab).props.onClick();tree=render();checkEnglish(tree,tab);}
// Notes use a stable Inbox identifier, with an English display label.
nodes(tree).find(n=>n.type==='button'&&n.props.children==='▤ Notes').props.onClick();tree=render();assert(visibleStrings(tree).includes('Inbox'));
const defaults=load(root+'/journal-localization.ts').localizeJournalDefaults({stamps:[{id:'off',name:'休假'},{id:'am',name:'我的早班'}],tasks:[{id:'brush',text:'刷牙'},{id:'custom',text:'刷牙'}],notes:[{text:'中文筆記'}]});
assert.equal(defaults.stamps[0].name,'Day off');assert.equal(defaults.stamps[1].name,'我的早班');assert.equal(defaults.tasks[0].text,'Brush teeth');assert.equal(defaults.tasks[1].text,'刷牙');assert.equal(defaults.notes[0].text,'中文筆記');
const draftEditor=nodes(tree).find(n=>n.props?.draft&&n.props?.onChange);draftEditor.props.onChange('尚未送出的草稿');tree=render();
nodes(tree).find(n=>n.type==='select'&&n.props['aria-label']==='Interface language').props.onChange({target:{value:'zh-Hant'}});
await new Promise(setImmediate);
assert.equal(db.get('daybook-language'),'zh-Hant');assert(assigned.at(-1).includes('lang=zh-Hant'));
assert.equal(JSON.parse(db.get('daybook-language-draft')).text,'尚未送出的草稿');assert(JSON.parse(db.get('daybook-local-v1')).stamps.length);
const localeModule=load(root+'/i18n.ts');assert.equal(localeModule.layerLabel('圖層 2'),'Layer 2');assert.equal(localeModule.layerLabel('我的圖層'),'我的圖層');
for(const mobile of [false,true]){states=[];cursor=0;effects=[];const Help=load(root+'/CanvasHelp.tsx').default;checkEnglish(Help({mobile}),'Drawing guide');}
states=[];cursor=0;effects=[];
const Gallery=load(root+'/CanvasGallery.tsx').default;checkEnglish(Gallery({items:[],onChange:noop}),'Drawing gallery');
const settings=load(root+'/workspace-config.ts').defaultConfiguration();
states=[];cursor=0;effects=[];
checkEnglish(load(root+'/CanvasSettings.tsx').default({value:{...settings,workspaces:[]},onChange:noop,onClose:noop}),'Drawing settings');
console.log(`PASS: ${count} catalog lookups; language detection/persistence; English calendar, notes, gallery, review, drawing settings/help and timer HTML; authored content preserved.`);
const TicketReview=load(root+'/WaterTicketReview.tsx').default;
states=[];cursor=0;effects=[];
const waterTickets=TicketReview({value:{version:1,settledDays:[],drinks:[{id:'a',day:'2026-10-21',at:'2026-10-21T10:00:00Z',ml:330},{id:'b',day:'2026-10-21',at:'2026-10-21T11:00:00Z',ml:600},{id:'c',day:'2026-10-22',at:'2026-10-22T10:00:00Z',ml:250}]}});
checkEnglish(waterTickets,'Water ticket review');const summaries=nodes(waterTickets).filter(n=>n.props?.className==='waterTicketReading');assert.equal(summaries.length,2);assert(visibleStrings(summaries[0]).includes('250'));assert(visibleStrings(summaries[1]).includes('930'));assert(!visibleStrings(summaries).some(s=>['Finland','Norway','Germany','Italy'].includes(s)),'Ticket labels contain amounts, not locations');assert.equal(nodes(waterTickets).filter(n=>n.props?.className==='waterTicketEntries').length,2);console.log('PASS: daily water tickets aggregate amounts, newest first, with entry details and no location labels.');
