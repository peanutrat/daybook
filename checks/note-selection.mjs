import assert from 'node:assert/strict';
import {editorSelection} from '../src/rich-note-selection.ts';
const text={name:'note text'},other={name:'another note'},wrapper={name:'styled text'},host={contains:n=>n===text||n===wrapper};
function range(start,end,node=text){return {startContainer:node,endContainer:node,collapsed:start===end,startOffset:start,endOffset:end,cloneRange(){return range(start,end,node)}}}
const selection=r=>({rangeCount:1,getRangeAt:()=>r});
// Drag/keyboard selection has changed since the last input cached a caret.
const oldCaret=range(4,4),live=range(1,3);let chosen=editorSelection(host,selection(live),oldCaret,true);
assert.equal(chosen.startOffset,1);assert.equal(chosen.endOffset,3);assert.notEqual(chosen,live);
// Choosing backwards exposes an already normalized Range and must preserve it.
chosen=editorSelection(host,{...selection(live),anchorNode:text,focusNode:text,anchorOffset:3,focusOffset:1},oldCaret,true);assert.equal(chosen.endOffset,3);
// Font/color controls, keyboard toolbar focus and a link prompt may hide the selection.
for(const current of [null,selection(range(0,0)),selection(range(0,2,other))]){chosen=editorSelection(host,current,live,false);assert.equal(chosen.startOffset,1);assert.equal(chosen.endOffset,3)}
// A deliberate caret move inside the editor must not keep formatting an old word.
chosen=editorSelection(host,selection(range(4,4)),live,true);assert(chosen.collapsed);assert.equal(chosen.startOffset,4);
assert.equal(editorSelection(host,null,range(0,2,other),false),null);
chosen=editorSelection(host,selection(range(0,2,wrapper)),oldCaret,true);assert.equal(chosen.startContainer,wrapper);
console.log('PASS: current/reversed selections override stale caret, toolbar focus retains selection, other notes and stale ranges are excluded.');
