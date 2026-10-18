import {t as uiText} from "./i18n.ts";
import type {Doodle} from './doodle';import {hasDoodle} from './doodle-layers';
export type CanvasEntry={id:string;name:string;date:string;doodle:Doodle;deleted?:boolean};
export function migrateCanvases<T extends {notes:{id:string;date:string;text:string;doodle?:Doodle;deleted?:boolean}[];canvases?:CanvasEntry[];canvasMigration?:number}>(data:T):T{
 if(data.canvasMigration===1)return data;
 const canvases=[...(data.canvases??[])],ids=new Set(canvases.map(c=>c.id));for(const note of data.notes){const id='note-canvas-'+note.id;if(hasDoodle(note.doodle)&&!ids.has(id)){canvases.push({id,name:note.text.trim().slice(0,24)||uiText("筆記塗鴉"),date:note.date,doodle:note.doodle!,deleted:note.deleted});ids.add(id)}}return {...data,canvases,canvasMigration:1};
}
