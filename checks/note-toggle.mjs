import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {noteLines,plainNote} from '../src/note-format.ts';
const source=(await readFile(new URL('../src/toggle-note-format.ts',import.meta.url),'utf8')).replace("from './note-format'","from '"+new URL('../src/note-format.ts',import.meta.url).href+"'");const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const {toggleNoteFormat:toggle}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const chars=s=>noteLines(s).flatMap(l=>l.tokens.flatMap(t=>Array.from(t.text).map(c=>({...t,text:c}))));
for(const kind of ['bold','italic','strike','spoiler']){const applied=toggle('前中後',1,2,kind);assert(chars(applied)[1][kind]);assert.equal(toggle(applied,1,2,kind),'前中後');const removed=toggle(toggle('前中後',0,3,kind),1,2,kind),c=chars(removed);assert(c[0][kind]&&!c[1][kind]&&c[2][kind]);assert.equal(plainNote(removed),'前中後')}
let value=toggle('**前中後**',1,2,'italic');value=toggle(value,1,2,'bold');let c=chars(value);assert(c[0].bold&&!c[1].bold&&c[1].italic&&c[2].bold);
for(const [kind,v] of [['color','#123456'],['size','20'],['small',undefined],['heading',undefined],['link','https://example.com/']]){let text=toggle('文字',0,2,kind,v,'#708269');text=toggle(text,0,2,kind,v,'#708269');assert.equal(plainNote(text),'文字');const token=chars(text)[0];assert(!token.color&&!token.size&&!token.href&&!token.bold)}
assert.equal(toggle('**第一行**\n**第二行**',0,6,'bold'),'第一行\n第二行');assert.equal(toggle('**第一行**\n\n**第二行**',0,6,'bold'),'第一行\n\n第二行');
value=toggle('**甲**乙',0,2,'bold');assert(chars(value).every(t=>t.bold));value=toggle(value,0,2,'bold');assert.equal(value,'甲乙');
value=toggle('## 標題\n內文',0,2,'heading');assert(!chars(value)[0].size&&!chars(value)[0].bold);assert.equal(plainNote(value),'標題\n內文');
console.log('PASS: repeated format clicks remove selected effects, partial removal preserves neighbors and other styles, mixed selections and multiline notes remain intact.');
