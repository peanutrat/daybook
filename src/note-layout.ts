import {editTableAxis} from './note-table';
import {noteBlocks,blocksSyntax,type NoteLine} from './note-format';
export type ParagraphAction='quote'|'indent'|'outdent'|'left'|'right'|'center';
export function paragraphNote(text:string,start:number,end:number,action:ParagraphAction,index?:number){
 const blocks=noteBlocks(text);let cursor=0;const lines:NoteLine[]=[];
 for(const [i,b] of blocks.entries()){const length=b.type==='line'?b.line.tokens.reduce((n,t)=>n+t.text.length,0):b.rows.flat(2).reduce((n,t)=>n+t.text.length,0);if(b.type==='line'&&(start===end&&index!==undefined?i===index:start===end?cursor<=start&&start<=cursor+length:cursor<end&&cursor+length>start))lines.push(b.line);cursor+=length}
 const remove=lines.every(l=>l.quote);
 for(const l of lines){if(action==='quote')l.quote=!remove;else if(action==='indent'||action==='outdent')l.indent=Math.max(0,Math.min(6,(l.indent||0)+(action==='indent'?1:-1)));else l.align=action}
 return blocksSyntax(blocks);
}
export type TableAction='row'|'column'|'removeRow'|'removeColumn'|'widths'|'heights';
export function tableNote(text:string,index:number,action:TableAction,row=0,column=0){
 const blocks=noteBlocks(text),b=blocks[index];if(!b||b.type!=='table')return text;const cols=b.rows[0]?.length||1;
 if(action==='row'||action==='column')editTableAxis(b,action==='row'?'row':'column',(action==='row'?row:column)+1);
 if(action==='removeRow'||action==='removeColumn')editTableAxis(b,action==='removeRow'?'row':'column',action==='removeRow'?row:column,true);
 if(action==='widths')b.widths=Array(cols).fill(100/cols);
 if(action==='heights')b.heights=Array(b.rows.length).fill(40);
 return blocksSyntax(blocks);
}

export function moveNoteLines(text:string,index:number,last:number,direction:-1|1){const blocks=noteBlocks(text);index=Math.max(0,Math.min(blocks.length-1,index));last=Math.max(index,Math.min(blocks.length-1,last));if(direction===-1&&index===0||direction===1&&last===blocks.length-1)return {text,index,last};const moved=blocks.splice(index,last-index+1);blocks.splice(index+direction,0,...moved);return {text:blocksSyntax(blocks),index:index+direction,last:last+direction}}
