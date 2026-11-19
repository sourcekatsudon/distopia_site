// Gameplay data. The renderer never decides ammunition, damage or unlock state.
const definition=(value)=>Object.freeze(value);
export const WEAPON_LEVELS=Object.freeze([null,
 definition({level:1,id:'ARC-P1',name:'SERVICE PISTOL',capacity:12,damage:20,cost:1,cooldown:.35,reloadSeconds:1.5,charge:false,chargeSeconds:0,chargeCost:0,chargeDamage:0,armorMultiplier:1,pierce:1,chain:0,chainRange:0,fx:'pistol',power:.65}),
 definition({level:2,id:'ARC-L2',name:'RAPID LASER',capacity:24,damage:10,cost:1,cooldown:.125,reloadSeconds:1.8,charge:false,chargeSeconds:0,chargeCost:0,chargeDamage:0,armorMultiplier:1,pierce:1,chain:0,chainRange:0,fx:'laser',power:.85}),
 definition({level:3,id:'ARC-RG7',name:'BLUE REQUIEM',capacity:100,damage:35,cost:5,cooldown:.23,reloadSeconds:1.8,charge:true,chargeSeconds:.9,chargeCost:35,chargeDamage:170,armorMultiplier:3,pierce:3,chain:0,chainRange:0,fx:'rail',power:1}),
 definition({level:4,id:'ARC-RG7 EX',name:'BLUE REQUIEM EX',capacity:100,damage:48,cost:5,cooldown:.21,reloadSeconds:1.9,charge:true,chargeSeconds:.9,chargeCost:38,chargeDamage:240,armorMultiplier:3.6,pierce:4,chain:2,chainRange:4.5,fx:'rail-ex',power:1.2}),
 definition({level:5,id:'ARC-RG7 Ω',name:'BLUE REQUIEM Ω',capacity:120,damage:65,cost:6,cooldown:.19,reloadSeconds:2,charge:true,chargeSeconds:.85,chargeCost:42,chargeDamage:340,armorMultiplier:4.5,pierce:6,chain:4,chainRange:5.5,fx:'rail-omega',power:1.4}),
]);
export function weaponDefinition(level=1){const n=Number.isFinite(level)?Math.max(1,Math.min(5,Math.floor(level))):1;return WEAPON_LEVELS[n];}
export function shotFor(level,charge=0){const d=weaponDefinition(level),c=d.charge&&Number.isFinite(charge)?Math.max(0,Math.min(1,charge)):0,charged=c>.15;
 return {damage:charged?d.damage+(d.chargeDamage-d.damage)*c:d.damage,cost:charged?Math.ceil(d.cost+(d.chargeCost-d.cost)*c):d.cost,cooldown:charged?.72:d.cooldown,power:d.power*(charged?1+c*2:1),pierce:charged?d.pierce:1,armorMultiplier:charged?d.armorMultiplier:1,chain:charged?d.chain:Math.min(d.chain,1),chainRange:d.chainRange,fx:d.fx};
}
