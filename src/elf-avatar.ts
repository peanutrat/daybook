import data from './elf-parts.json' with {type:'json'};
export const partGroups=data.groups;
export const partsFor=(key:string)=>partGroups.find(g=>g.key===key)!.parts;
export type ElfAvatar={artVersion:'parts32';partColors?:Record<string,string>;frontHair:string;backHair:string;sideHair:string;ears:string;eyes:string;mouth:string;headwear:string;headwears?:string[];clothes:string;decorativeHair:boolean;skin:string;hairColor:string;eyeColor?:string;mouthColor?:string;blushColor?:string;clothesColor?:string;accessoryColor?:string};
export const defaultAvatar:ElfAvatar={artVersion:'parts32',frontHair:'frontHair-1',backHair:'backHair-1',sideHair:'sideHair-1',ears:'ears-1',eyes:'eyes-1',mouth:'mouth-3',headwear:'none',clothes:'clothes-1',decorativeHair:true,skin:'#fee6d6',hairColor:'#7e7e7e'};
export function normalizeAvatar(value:unknown):ElfAvatar{const v=value as Partial<ElfAvatar>|undefined;if(v?.artVersion!=='parts32')return {...defaultAvatar};const a={...defaultAvatar};for(const key of ['frontHair','backHair','sideHair','ears','eyes','mouth','headwear','clothes'] as const){const id=v[key];if(partsFor(key).some(p=>p.id===id)||id==='none'&&['frontHair','backHair','sideHair','headwear'].includes(key))a[key]=id!;}if(a.clothes==='clothes-4')a.clothes='clothes-2';if(Array.isArray(v.headwears))a.headwears=[...new Set(v.headwears.filter(id=>partsFor('headwear').some(p=>p.id===id)))];if(v.partColors&&typeof v.partColors==='object')a.partColors=Object.fromEntries(Object.entries(v.partColors).filter(([id,color])=>partGroups.some(g=>g.parts.some(p=>p.id===id))&&typeof color==='string'&&(color==='source'||/^#[\da-f]{6}$/i.test(color))));a.decorativeHair=v.decorativeHair!==false;for(const key of ['skin','hairColor','eyeColor','mouthColor','blushColor','clothesColor','accessoryColor'] as const)if(typeof v[key]==='string'&&/^#[\da-f]{6}$/i.test(v[key]!))a[key]=v[key]!;return a;}
export const avatarColorDefaults={skin:'#fee6d6',hairColor:'#7e7e7e',eyeColor:'#959595',mouthColor:'#e3999c',blushColor:'#fdac9b',clothesColor:'#ff0024',accessoryColor:'#b17a52'};
export function restoreAvatarColors(a:ElfAvatar):ElfAvatar{const {eyeColor,mouthColor,blushColor,clothesColor,accessoryColor,...rest}=a;return {...rest,skin:defaultAvatar.skin,hairColor:defaultAvatar.hairColor};}
export const avatarColorPalettes={
 skin:['#fff3e7','#f6d8bd','#e2b18d','#ca946c','#a76e4f','#79503d','#503b32'],
 hairColor:['#29282e','#49372f','#8b5439','#bd7841','#e3c17e','#e8e1d5','#aa7288','#6b8380'],
 eyeColor:['#9a765f','#496e95','#63836b','#a97584','#8574a1','#708b93','#4f4a55','#b39b64'],
 mouthColor:['#b96f69','#d8978a','#b6535c','#87424c','#a76b53','#70483f','#d8a09a','#9d719b'],
 blushColor:['#ffc1ae','#f3a3a1','#de8f87','#c58475','#edbac5','#ca9ca2','#b47c67','#d6a477'],
 clothesColor:['#45624e','#7f4544','#4c607d','#bd9c62','#e1d8c6','#b38292','#79717c','#3c3e46'],
 accessoryColor:['#b17a52','#c3a35e','#8f4f55','#e2d5b5','#637b60','#5c718d','#a97791','#423c3d']
};

export function restorePartColor(a:ElfAvatar,id:string):ElfAvatar{return {...a,partColors:{...a.partColors,[id]:'source'}};}
export function partColorControls(a:ElfAvatar,tab:string){
 const result:{id:string;label:string;palette:keyof typeof avatarColorPalettes;native:string;legacy?:string}[]=[];
 const add=(id:string,label:string,palette:keyof typeof avatarColorPalettes,legacy?:string)=>{const p=partGroups.flatMap(g=>g.parts).find(p=>p.id===id);if(p)result.push({id,label,palette,native:p.base??avatarColorDefaults[palette],legacy});};
 if(['frontHair','backHair','sideHair'].includes(tab))add(a[tab as 'frontHair'],'髮色','hairColor',a.hairColor);
 if(tab==='frontHair'&&a.decorativeHair)add('decoration-1','裝飾髮顏色','hairColor',a.hairColor);
 if(tab==='body'){add('body-2','膚色','skin',a.skin);add('body-1','身體顏色','skin',a.skin);add(a.ears,'耳朵顏色','skin',a.skin);add(a.eyes,'眼睛顏色','eyeColor',a.eyeColor);add(a.mouth,'嘴巴顏色','mouthColor',a.mouthColor);add('blush-1','腮紅顏色','blushColor',a.blushColor);add('hands-1','手部顏色','skin');}
 if(tab==='clothes'){add(a.clothes,'衣服顏色','clothesColor',a.clothesColor);if(['clothes-2','clothes-3'].includes(a.clothes))add('clothes-4','襯衫內襯顏色','clothesColor');}
 if(tab==='headwear')for(const id of a.headwears??(a.headwear==='none'?[]:[a.headwear])){const p=partsFor('headwear').find(p=>p.id===id);if(p)add(id,p.name,'accessoryColor',a.accessoryColor);}
 return result;
}
