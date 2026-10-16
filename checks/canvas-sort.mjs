import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';
let hooks=[],cursor=0,hit=null,inside=true;
const fakeReact={useRef(value){const i=cursor++;return hooks[i]??(hooks[i]={current:value})},useState(initial){const i=cursor++;if(!(i in hooks))hooks[i]=initial;return [hooks[i],value=>hooks[i]=value]}};
const module={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/useCanvasSort.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:()=>fakeReact,document:{elementFromPoint:()=>hit?{closest:()=>({dataset:{sortId:hit}})}:null}});
const {default:useSort,moveById}=module.exports;
let items=[{id:'a',art:{n:1}},{id:'b',art:{n:2}},{id:'c',art:{n:3}}],sort,moves=0;
const original=items.slice();
const root={getBoundingClientRect:()=>({left:0,right:200,top:0,bottom:200}),contains:()=>inside,scrollHeight:400,clientHeight:200,scrollTop:0};
function render(){cursor=0;sort=useSort(items.map(x=>x.id),(from,to)=>{items=moveById(items,from,to);moves++});sort.list.current=root}
let captured=false;const button={focus(){},setPointerCapture(){captured=true},hasPointerCapture(){return captured},releasePointerCapture(){captured=false}};
const event=(extra={})=>({button:0,pointerId:1,pointerType:'touch',clientX:90,clientY:100,currentTarget:button,preventDefault(){},stopPropagation(){},...extra});
render();let handle=sort.handle('a');handle.onPointerDown(event());render();assert.equal(sort.row('a')['data-dragging'],true);hit='c';handle.onPointerMove(event());render();assert.equal(sort.row('c')['data-drop'],'after');assert.equal(items[0].id,'a','no data writes while hovering');handle.onPointerUp(event());render();assert.equal(items.map(x=>x.id).join(','),'b,c,a');assert.equal(items[2],original[0]);assert.equal(original.map(x=>x.id).join(','),'a,b,c');assert.equal(captured,false);
for(const ending of ['onPointerCancel','onLostPointerCapture']){handle=sort.handle('a');handle.onPointerDown(event());hit='b';handle.onPointerMove(event());handle[ending](event());render();assert.equal(moves,1);assert.equal(sort.row('a')['data-dragging'],undefined)}
// Dragging outside this list or onto another list must not reorder it.
for(const invalid of ['outside','unknown']){handle=sort.handle('a');handle.onPointerDown(event());hit=invalid==='unknown'?'other':'b';inside=invalid!=='outside';handle.onPointerMove(event());handle.onPointerUp(event());render();assert.equal(moves,1)}inside=true;
handle=sort.handle('a');handle.onPointerDown(event());hit='b';handle.onPointerMove(event({clientY:195}));assert(root.scrollTop>0);handle.onKeyDown({key:'Escape',stopPropagation(){}});handle.onPointerUp(event());render();assert.equal(moves,1);
sort.handle('a').onKeyDown({key:'ArrowUp',preventDefault(){},stopPropagation(){}});render();assert.equal(items.map(x=>x.id).join(','),'b,a,c');sort.handle('b').onKeyDown({key:'ArrowUp',preventDefault(){},stopPropagation(){}});assert.equal(moves,2);assert.equal(moveById(items,'missing','a'),items);assert.equal(moveById(items,'a','a'),items);
console.log('PASS: touch pointer reorder, drop indication, identity preservation, cancelled/outside-list drops, edge scrolling and keyboard sorting.');
