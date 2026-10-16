export function desktopRailPositions(tools:{id:string;x:number;y:number}[],width:number,height:number){
 const panelWidth=Math.min(320,Math.max(180,width-64)),gap=6,rows:{id:string;x:number;y:number;width:number}[]=[];
 for(const id of ['brush','eraser','smudge']){const tool=tools.find(t=>t.id===id);if(!tool)continue;let x=tool.x+44+gap;if(x+panelWidth>width-8)x=tool.x-panelWidth-gap;x=Math.max(8,Math.min(x,width-panelWidth-8));let y=Math.max(8,Math.min(tool.y,height-50));
 const overlap=(test:number)=>rows.some(r=>Math.abs(r.x-x)<panelWidth+4&&Math.abs(r.y-test)<46);
 if(overlap(y)){const candidates=Array.from({length:Math.max(1,Math.floor((height-16)/46))},(_,i)=>8+i*46).filter(v=>!overlap(v));if(candidates.length)y=candidates.sort((a,b)=>Math.abs(a-y)-Math.abs(b-y))[0]}
 rows.push({id,x,y,width:panelWidth})
 }return rows;
}
