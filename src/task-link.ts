export type LinkedTask={id:string;text:string;kind:string;date:string;done:string[];deleted?:boolean};
export function completeLinkedTask(tasks:LinkedTask[],id:string,day:string){return tasks.map(t=>t.id===id&&!t.deleted?{...t,done:Array.from(new Set([...t.done,t.kind==='daily'?day:'done']))}:t);}
