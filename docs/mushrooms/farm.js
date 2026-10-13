export const LEGACY_PLANTS=[
 {name:'蜂蜜金盞花',short:'金盞花',goal:10,color:'#dfaa49',shadow:'#a96637',light:'#ffe5a0',pot:0},
 {name:'霧紫薰衣草',short:'薰衣草',goal:20,color:'#a48bb8',shadow:'#685276',light:'#dac8e7',pot:1},
 {name:'紅寶石番茄',short:'番茄',goal:15,color:'#d55d4a',shadow:'#893b35',light:'#ffb07c',pot:2},
 {name:'奶油小雛菊',short:'雛菊',goal:12,color:'#f7eace',shadow:'#baa690',light:'#fffaf1',pot:0},
 {name:'晨露繡球花',short:'繡球花',goal:25,color:'#809cae',shadow:'#526d88',light:'#d0e4e5',pot:1},
 {name:'蜜桃小草莓',short:'草莓',goal:15,color:'#d77980',shadow:'#92484e',light:'#ffc2ad',pot:2}
];
export const PLANTS=LEGACY_PLANTS;
export function growth(seconds){let used=0,index=0;seconds=Math.max(0,seconds);while(index<10000){let p=LEGACY_PLANTS[index%LEGACY_PLANTS.length],goal=p.goal*60;if(seconds-used<goal)return{index,plant:p,seconds:seconds-used,ratio:(seconds-used)/goal,completed:index,stage:Math.min(3,Math.floor((seconds-used)/goal*4)),used};used+=goal;index++;}return {index,plant:LEGACY_PLANTS[0],seconds:0,ratio:0,completed:index,stage:0,used};}
export function elapsed(active,now=Date.now()){return active?Math.max(0,active.seconds+(active.since===null?0:(now-active.since)/1000)):0;}
export function total(state,now=Date.now()){return state.sessions.reduce((n,s)=>n+s.seconds,0)+elapsed(state.active,now);}
export function localDay(d=new Date()){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
export function completeTask(tasks,active){if(!active?.taskId)return tasks;return tasks.map(t=>t.id===active.taskId?{...t,done:Array.from(new Set([...t.done,t.kind==='daily'?active.day:'done']))}:t);}
export function clock(sec){sec=Math.floor(sec);return String(Math.floor(sec/3600)).padStart(2,'0')+':'+String(Math.floor(sec/60)%60).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
export function plantFor(index){const base=LEGACY_PLANTS[index%LEGACY_PLANTS.length],cycle=Math.floor(index/LEGACY_PLANTS.length);return {...base,pot:(base.pot+cycle)%3,variant:cycle%3,name:base.name+(cycle?' · '+['條紋盆','點點盆','素陶盆'][cycle%3]:'')};}
