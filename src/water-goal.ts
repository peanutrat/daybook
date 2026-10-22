// User-selected tracking formulas. No goal exists until an explicit calculation is saved.
export const waterMethods=['weight','height-weight'] as const;
export const waterMultipliers=[30,40,50] as const;
export type HydrationProfile={weightKg:number;method:typeof waterMethods[number];multiplier:typeof waterMultipliers[number];heightCm?:number};
export function normalizeHydration(value:unknown):HydrationProfile|undefined{if(!value||typeof value!=='object')return;const v=value as Partial<HydrationProfile>;if(!Number.isFinite(v.weightKg)||v.weightKg!<10||v.weightKg!>350)return;const method=v.method??'weight',multiplier=v.multiplier??30;if(!waterMethods.includes(method)||!waterMultipliers.includes(multiplier))return;if(method==='height-weight'&&(!Number.isFinite(v.heightCm)||v.heightCm!<50||v.heightCm!>250))return;return{weightKg:v.weightKg!,method,multiplier,...(method==='height-weight'?{heightCm:v.heightCm}:{})};}
export function calculateWaterGoal(value:unknown):number|undefined{const p=normalizeHydration(value);return p?Math.round(p.method==='height-weight'?(p.heightCm!+p.weightKg)*10:p.weightKg*p.multiplier):undefined;}
