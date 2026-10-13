// Original pixel sprites drawn on a 48 × 64 grid. No external artwork.
export function drawPlant(ctx,p,stage=4,variant=0){
ctx.clearRect(0,0,48,64);const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)},dot=(x,y,c)=>r(x,y,1,1,c);
const oval=(x,y,rx,ry,c)=>{for(let yy=-ry;yy<=ry;yy++){const ww=Math.floor(rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry))));r(x-ww,y+yy,ww*2+1,1,c)}};
const leaf=(x,y,left=false,size=1)=>{const d=left?-1:1;for(let i=0;i<7*size;i++){const w=Math.max(1,Math.floor(Math.sin(i/(7*size)*Math.PI)*3*size));r(x+d*i-(left?w:0),y-i/2|0,w,2,'#405443');r(x+d*i-(left?w-1:0),(y-i/2|0),Math.max(1,w-1),1,'#789362')}dot(x+d*3,y-2,'#b3bd7b')};
oval(24,59,17,2,'#dcd0bb');
const pots=[['#765640','#b7855d','#dbaa7e','#ecc79c'],['#526d71','#7d9695','#b8c5b6','#dae0cc'],['#83605e','#b98783','#dcb1a0','#f1d5b8']],pot=pots[p.pot||0];
r(12,44,24,4,pot[0]);r(14,48,20,9,pot[0]);r(16,57,16,2,pot[0]);r(14,45,20,3,pot[1]);r(16,48,16,8,pot[1]);r(17,49,4,6,pot[2]);r(21,50,10,4,pot[2]);r(16,45,15,1,pot[3]);r(17,57,13,1,pot[1]);r(14,43,20,2,'#5e4b38');r(17,43,13,1,'#8b6c4b');
if(variant===1){r(23,50,5,3,pot[3]);r(24,49,3,5,pot[3])}else if(variant===2){for(let x=20;x<32;x+=4)r(x,50,2,2,pot[3])}
if(stage===0){r(21,40,5,3,'#72553a');r(22,40,2,1,'#c29b68');dot(30,42,'#cba475');return}
const base=43,top=[0,34,27,22,17][stage];r(23,top,2,base-top,'#405443');r(24,top,1,base-top,'#8ca66a');leaf(24,stage===1?37:34,true);leaf(24,stage===1?35:30,false);
if(stage>=2){leaf(24,39,false);leaf(23,32,true);r(18,29,1,13,'#536b4a');r(29,27,1,15,'#536b4a');leaf(18,34,true);leaf(29,34,false)}
if(stage<3)return;
const head=(x,y,bloom=true)=>{if(!bloom){oval(x,y,2,3,p.shadow);r(x-1,y-2,2,2,p.light);r(x-2,y+3,4,1,'#56744b');return}
if(p.short==='番茄'||p.short==='草莓'){oval(x,y,4,p.short==='草莓'?5:4,p.shadow);oval(x-1,y-1,3,3,p.color);r(x-2,y-2,2,2,p.light);r(x-3,y-5,6,2,'#56744b');r(x,y-6,2,3,'#8c9b5c');if(p.short==='草莓'){dot(x+1,y,p.light);dot(x-2,y+2,p.light)}}
else if(p.short==='薰衣草'){r(x-1,y-7,2,14,'#50694c');for(let j=0;j<5;j++){r(x-3+(j%2),y-7+j*2,5,2,p.shadow);r(x-2,y-7+j*2,3,1,p.color);dot(x-1,y-7+j*2,p.light)}}
else if(p.short==='繡球花'){oval(x,y,7,6,p.shadow);for(const [a,b] of [[-4,-2],[0,-4],[4,-1],[-2,2],[3,3]]){r(x+a-2,y+b-1,4,3,p.color);r(x+a-1,y+b-2,2,5,p.color);dot(x+a,y+b,p.light)}}
else{for(const [a,b] of [[-4,0],[4,0],[0,-4],[0,4],[-3,-3],[3,-3],[-3,3],[3,3]]){r(x+a-2,y+b-2,4,4,p.shadow);r(x+a-1,y+b-2,3,3,p.color);dot(x+a,y+b-2,p.light)}oval(x,y,3,3,'#8b6136');r(x-1,y-1,3,3,'#d9ad55');dot(x-1,y-1,'#ffe3a2')}
};
head(24,top,stage===4);head(18,top+10,stage===4);head(30,top+7,stage===4);leaf(25,25,false);leaf(20,34,true);
}
export function sprite(p,stage=4,variant=0){const c=document.createElement('canvas');c.width=48;c.height=64;drawPlant(c.getContext('2d'),p,stage,variant);return c.toDataURL();}
