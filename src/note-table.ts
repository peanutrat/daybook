import type {NoteBlock,NoteToken} from './note-format';
export type NoteTable=Extract<NoteBlock,{type:'table'}>;
export type TableCellMeta={rowSpan?:number;colSpan?:number;align?:'left'|'center'|'right'};
export type TableCell={r:number;c:number;rs:number;cs:number;tokens:NoteToken[];align?:TableCellMeta['align']};
export function tableCells(b:NoteTable):TableCell[]{const out:TableCell[]=[],used=new Set<string>(),rows=b.rows.length,cols=b.rows[0]?.length||1;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(used.has(r+','+c))continue;const m=b.cells?.[r+','+c],rs=Math.max(1,Math.min(rows-r,Math.floor(m?.rowSpan||1))),cs=Math.max(1,Math.min(cols-c,Math.floor(m?.colSpan||1)));let overlap=false;for(let y=r;y<r+rs;y++)for(let x=c;x<c+cs;x++)if(used.has(y+','+x))overlap=true;const cell={r,c,rs:overlap?1:rs,cs:overlap?1:cs,tokens:b.rows[r][c]||[],align:m?.align};out.push(cell);for(let y=r;y<r+cell.rs;y++)for(let x=c;x<c+cell.cs;x++)used.add(y+','+x)}return out;
}
function put(b:NoteTable,cells:TableCell[],rows=b.rows.length,cols=b.rows[0].length){b.rows=Array.from({length:rows},()=>Array.from({length:cols},()=>[] as NoteToken[]));b.cells={};for(const cell of cells){b.rows[cell.r][cell.c]=cell.tokens;if(cell.rs>1||cell.cs>1||cell.align)b.cells[cell.r+','+cell.c]={...(cell.rs>1?{rowSpan:cell.rs}:{}),...(cell.cs>1?{colSpan:cell.cs}:{}),...(cell.align?{align:cell.align}:{})}}}
export function mergeTableCells(b:NoteTable,a:TableCell,z:TableCell){const cells=tableCells(b),first=cells.find(x=>x.r===a.r&&x.c===a.c),second=cells.find(x=>x.r===z.r&&x.c===z.c);if(!first||!second||first===second)return false;
 const horizontal=first.r===second.r&&first.rs===second.rs&&(first.c+first.cs===second.c||second.c+second.cs===first.c),vertical=first.c===second.c&&first.cs===second.cs&&(first.r+first.rs===second.r||second.r+second.rs===first.r);if(!horizontal&&!vertical)return false;
 const sorted=[first,second].sort((x,y)=>x.r-y.r||x.c-y.c),merged={...sorted[0],r:Math.min(first.r,second.r),c:Math.min(first.c,second.c),rs:vertical?first.rs+second.rs:first.rs,cs:horizontal?first.cs+second.cs:first.cs,tokens:[...sorted[0].tokens,...(sorted.every(x=>x.tokens.length)?[{text:' '}]:[]),...sorted[1].tokens]};put(b,[...cells.filter(x=>x!==first&&x!==second),merged]);return true;
}
export function splitTableCell(b:NoteTable,r:number,c:number,axis:'column'|'row',ratio=.5){let cells=tableCells(b),cell=cells.find(x=>x.r===r&&x.c===c);if(!cell)return false;const vertical=axis==='column',start=vertical?'c':'r',span=vertical?'cs':'rs',size=vertical?b.rows[0].length:b.rows.length;ratio=Math.max(.1,Math.min(.9,ratio));let at:number;
 if(cell[span]===1){if(size>=(vertical?20:50))return false;at=cell[start]+1;for(const x of cells){if(x[start]>=at)x[start]++;else if(x[start]+x[span]>=at)x[span]++}
  if(vertical){const widths=b.widths?.slice()||Array(size).fill(100/size),w=widths[at-1];widths.splice(at-1,1,w*ratio,w*(1-ratio));b.widths=widths}else{const heights=b.heights?.slice()||Array(size).fill(64),h=heights[at-1];heights.splice(at-1,1,Math.max(32,h*ratio),Math.max(32,h*(1-ratio)));b.heights=heights}
 }else at=cell[start]+Math.max(1,Math.min(cell[span]-1,Math.round(cell[span]*ratio)));
 const tail={...cell,tokens:[] as NoteToken[]};tail[start]=at;tail[span]=cell[start]+cell[span]-at;cell[span]=at-cell[start];cells.push(tail);put(b,cells,b.rows.length+(!vertical&&size===b.rows.length&&cells.some(x=>x.r+x.rs>size)?1:0),b.rows[0].length+(vertical&&cells.some(x=>x.c+x.cs>size)?1:0));return true;
}
export function editTableAxis(b:NoteTable,axis:'row'|'column',at:number,remove=false){const vertical=axis==='column',start=vertical?'c':'r',span=vertical?'cs':'rs',size=vertical?b.rows[0].length:b.rows.length;if(remove?size<=1:size>=(vertical?20:50))return;
 const cells=tableCells(b).filter(x=>{if(remove){if(x[start]===at&&x[span]===1)return false;if(x[start]>at)x[start]--;else if(x[start]+x[span]>at)x[span]--}else{if(x[start]>=at)x[start]++;else if(x[start]+x[span]>at)x[span]++}return true});
 if(vertical){delete b.widths}else if(b.heights)remove?b.heights.splice(at,1):b.heights.splice(at,0,40);
 put(b,cells,b.rows.length+(vertical?0:remove?-1:1),b.rows[0].length+(vertical?remove?-1:1:0));
}
