export function migrateNoteGroups<T extends {groups?:string[];notes:{box:string}[];folders?:{group:string}[];noteGroupsVersion?:number}>(data:T):T{
 if((data.noteGroupsVersion||0)>=1)return data;
 const occupied=new Set([...data.notes.map(n=>n.box),...(data.folders??[]).map(f=>f.group)]),presets=new Set(['待更新規則','長期筆記']);
 const groups=(data.groups??['暫存']).filter(g=>!presets.has(g)||occupied.has(g));
 if(!groups.length)groups.push('暫存');
 return {...data,groups,noteGroupsVersion:1};
}
