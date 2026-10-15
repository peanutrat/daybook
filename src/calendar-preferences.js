export function calendarLayout(year,month,weekStart=1){const start=weekStart===0?0:1,first=(new Date(year,month,1).getDay()-start+7)%7,count=new Date(year,month+1,0).getDate();return {first,count,cells:Math.ceil((first+count)/7)*7,weekdays:Array.from({length:7},(_,i)=>(start+i)%7)}}
export function isWeekend(day){return day===0||day===6}
// Keep the theme's hue, but make weekend labels stronger than muted UI accents.
export function weekendColor(enabled,custom,accent,night=false,background){
 if(!enabled)return undefined;
 if(/^#[\da-f]{6}$/i.test(custom||''))return custom;
 const hex=/^#[\da-f]{6}$/i.test(accent||'')?accent:'#6e886d';
 const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min;
 let hue=0;if(delta){const [r,g,b]=rgb;hue=max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;hue=((hue*60)%360+360)%360}
 const originalLight=(max+min)/2,saturation=Math.max(.62,delta?delta/(1-Math.abs(2*originalLight-1)):0);
 let light=night?Math.max(.72,Math.min(.8,originalLight)):Math.max(.26,Math.min(.36,originalLight*.72));
 const color=()=>{const chroma=(1-Math.abs(2*light-1))*saturation,x=chroma*(1-Math.abs((hue/60)%2-1)),m=light-chroma/2;const parts=hue<60?[chroma,x,0]:hue<120?[x,chroma,0]:hue<180?[0,chroma,x]:hue<240?[0,x,chroma]:hue<300?[x,0,chroma]:[chroma,0,x];return '#'+parts.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('')};
 const luminance=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
 const bg=/^#[\da-f]{6}$/i.test(background||'')?background:night?'#343e49':'#e8ede3';
 let result=color();for(let i=0;i<35;i++){const a=luminance(result),b=luminance(bg);if((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5)break;light=Math.max(.02,Math.min(.98,light+(b>.179?-.025:.025)));result=color()}
 return result;
}
