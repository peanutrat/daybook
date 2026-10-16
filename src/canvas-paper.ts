import type {Doodle} from './doodle';
export type PaperStyle='dots'|'grid'|'white'|'custom';
export const paperNames:Record<PaperStyle,string>={dots:'點點紙',grid:'方格紙',white:'白紙',custom:'自訂底色'};
export function paperStyle(d:Doodle):PaperStyle{return d.paper==='grid'||d.paper==='white'||d.paper==='custom'?d.paper:'dots'}
export function paperShown(d:Doodle){return d.paperVisible??d.paper!=='transparent'}
export function exportPaper(d:Doodle):Doodle{return {...d,paper:paperStyle(d),paperVisible:d.paperExport??paperShown(d)}}
export function resizedDocument(d:Doodle,size:{width:number;height:number;dpi:number}):Doodle{return {...d,...size,layers:d.layers?.map(l=>({...l,width:size.width,height:size.height}))}}
