import {ElfAvatar} from './ElfAvatar';
import type {ElfAvatar as Appearance} from './elf-avatar';
export const carChoices=[['forest','森林墨綠'],['cranberry','聖誕酒紅'],['cream','奶油松綠'],['navy','午夜深藍']] as const;
export type CarStyle=typeof carChoices[number][0];
// Lossless WebP preserves the supplied transparent car artwork.
export function CarSprite({style='forest',avatar}:{style?:CarStyle;avatar?:Appearance}){
 const src='./trip/cars/'+style+'.webp?v=20261022-opt1';
 return <div className="tripCarSprite" role="img" aria-label={style+' Christmas travel car'} data-car-style={style}><div className="tripCarSource"><img src={src} className="tripCarArt" alt="" draggable={false} decoding="async" width={1448} height={1086}/><div className="tripCarPortrait"><ElfAvatar avatar={avatar} portrait carPose/></div></div></div>;
}
