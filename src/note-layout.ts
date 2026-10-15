import {noteBlocks,blocksSyntax,type NoteLine} from './note-format';
export type ParagraphAction='quote'|'quoteAll'|'indent'|'outdent'|'left'|'right'|'center'|'justify';
export function paragraphNote(text:string,start:number,end:number,action:ParagraphAction,index?:number){
 const blocks=noteBlocks(text);let cursor=0;const lines:NoteLine[]=[];
 for(const [i,b] of blocks.entries()){const length=b.type==='line'?b.line.tokens.reduce((n,t)=>n+t.text.length,0):b.rows.flat(2).reduce((n,t)=>n+t.text.length,0);if(b.type==='line'&&(action==='quoteAll'?i>=(index??0):start===end&&index!==undefined?i===index:start===end?cursor<=start&&start<=cursor+length:cursor<end&&cursor+length>start))lines.push(b.line);cursor+=length}
 const remove=lines.every(l=>l.quote);
 for(const l of lines){if(action==='quote'||action==='quoteAll')l.quote=!remove;else if(action==='indent'||action==='outdent')l.indent=Math.max(0,Math.min(6,(l.indent||0)+(action==='indent'?1:-1)));else l.align=action}
 return blocksSyntax(blocks);
}
export type TableAction='row'|'column'|'removeRow'|'removeColumn'|'widths'|'heights';
export function tableNote(text:string,index:number,action:TableAction,row=0,column=0){
 const blocks=noteBlocks(text),b=blocks[index];if(!b||b.type!=='table')return text;const cols=b.rows[0]?.length||1;
 if(action==='row'&&b.rows.length<50){b.rows.splice(row+1,0,Array.from({length:cols},()=>[]));b.heights?.splice(row+1,0,40)}
 if(action==='column'&&cols<20){b.rows.forEach(r=>r.splice(column+1,0,[]));delete b.widths}
 if(action==='removeRow'&&b.rows.length>1){b.rows.splice(row,1);b.heights?.splice(row,1)}
 if(action==='removeColumn'&&cols>1){b.rows.forEach(r=>r.splice(column,1));delete b.widths}
 if(action==='widths')b.widths=Array(cols).fill(100/cols);
 if(action==='heights')b.heights=Array(b.rows.length).fill(40);
 return blocksSyntax(blocks);
}
