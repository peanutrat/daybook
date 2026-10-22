import {t as uiText,locale} from './i18n.ts';
import type {ticketForDay} from './water-trip';
export async function waterTicketImage(ticket:NonNullable<ReturnType<typeof ticketForDay>>,src:string){
 const image=new Image();image.src=src;await image.decode();
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=900;const c=canvas.getContext('2d');if(!c)throw Error('Canvas unavailable');
 c.fillStyle='#ead9b5';c.fillRect(0,0,1200,900);c.imageSmoothingEnabled=false;
 const scale=Math.max(1200/image.width,500/image.height),w=image.width*scale,h=image.height*scale;c.save();c.beginPath();c.rect(0,0,1200,500);c.clip();c.drawImage(image,(1200-w)/2,(500-h)/2,w,h);c.restore();
 c.fillStyle='#f5e9cb';c.font='bold 24px Georgia';c.fillText('SANTA’S ROAD TRIP',44,55);c.fillStyle='#55492f';c.font='26px Georgia';c.fillText(ticket.day.replaceAll('-',' / '),48,568);c.fillText(uiText('今日水量'),48,626);c.font='bold 86px Georgia';c.fillText(ticket.ml.toLocaleString(locale)+' mL',48,738);c.font='24px Georgia';c.fillText(ticket.times+' '+uiText('次補給'),48,804);c.strokeStyle='#ad956b';c.setLineDash([10,8]);c.beginPath();c.moveTo(48,830);c.lineTo(1152,830);c.stroke();c.font='18px monospace';c.fillText(ticket.number,48,867);
 return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG export failed')),'image/png'));
}
