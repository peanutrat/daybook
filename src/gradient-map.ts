export type GradientStop={at:number;color:string};
export type GradientMap={stops:GradientStop[];amount:number;reverse:boolean};
export const referenceStops:GradientStop[]=[{"at": 0, "color": "#6950d0"}, {"at": 0.1136, "color": "#ab35c2"}, {"at": 0.2167, "color": "#d85296"}, {"at": 0.3172, "color": "#7a85ff"}, {"at": 0.3825, "color": "#d273c2"}, {"at": 0.5509, "color": "#f59c76"}, {"at": 0.6305, "color": "#7bcbd4"}, {"at": 0.7376, "color": "#91ffbf"}, {"at": 0.7728, "color": "#fff3bb"}, {"at": 0.9073, "color": "#6afff3"}, {"at": 1, "color": "#ffffff"}];
export const defaultGradient=():GradientMap=>({stops:referenceStops.map(s=>({...s})),amount:100,reverse:false});
export function sortedStops(stops:GradientStop[]){return stops.filter(s=>Number.isFinite(s.at)&&/^#[\da-f]{6}$/i.test(s.color)).map(s=>({...s,at:Math.max(0,Math.min(1,s.at))})).sort((a,b)=>a.at-b.at)}
export function gradientRGB(stops:GradientStop[],position:number):number[]{const list=sortedStops(stops);if(!list.length)return [0,0,0];const right=list.findIndex(s=>s.at>=position),a=right<0?list.at(-1)!:list[Math.max(0,right-1)],b=right<0?list.at(-1)!:list[right],t=a===b||b.at===a.at?0:Math.max(0,Math.min(1,(position-a.at)/(b.at-a.at)));return [1,3,5].map(i=>parseInt(a.color.slice(i,i+2),16)*(1-t)+parseInt(b.color.slice(i,i+2),16)*t)}
export function gradientCSS(stops:GradientStop[]){return 'linear-gradient(90deg,'+sortedStops(stops).map(s=>s.color+' '+s.at*100+'%').join(',')+')'}
export function gradientLookup(g:GradientMap){return Array.from({length:256},(_,i)=>gradientRGB(g.stops,g.reverse?1-i/255:i/255))}
