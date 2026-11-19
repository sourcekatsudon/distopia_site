export const LEVEL_THRESHOLDS=Object.freeze([0,12,48,100,160]);
export const ENCOUNTER_COUNTS=Object.freeze([16,16,18,18,18,20,20,20,22,22,22,22,22,24,24]);
export const CAMPAIGN_CONFIG=Object.freeze({maxLevel:5,checkpointDistance:160,shieldMax:75,shieldDelay:5,shieldRate:12,dropChance:1,enemyCount:304});
// Every enemy is now a guaranteed source; no unrelated relay accelerates growth.
export const GUARANTEED_REWARDS=Object.freeze([]);
export const ENVIRONMENT_HP=Object.freeze({cargo:160,barrier:420,generator:120,panel:70,wall:220});
export function damageState(hp,max){return hp<=0?'DESTROYED':hp/max<=.30?'CRITICAL':hp/max<=.72?'DAMAGED':'INTACT';}
export function createCampaign(){return {level:1,modules:0,collected:new Set(),rewarded:new Set(),defeated:new Set(),loot:new Map(),frontier:0,destroyed:new Map(),supplies:new Set(),encounters:new Set(),checkpoint:{index:0,x:0,z:8,level:1,modules:0},distance:0,elapsed:0,deaths:0,kills:0,levelTimes:[],stats:{shots:0,chargedShots:0,ammoSpent:0,reloads:0,hits:0,weakHits:0,damageTaken:0,receivedHits:0,coverPlayer:0,coverEnemy:0,modules:0,enemySpawns:[],enemyTTK:[],deathLog:[]}};}
export function moduleProgress(state){const next=LEVEL_THRESHOLDS[state.level]??null;return {total:state.modules,next,remaining:next===null?0:Math.max(0,next-state.modules)};}
export function collectModule(state,id){if(!id||state.collected.has(id))return false;state.collected.add(id);state.modules++;state.stats.modules++;let next=1;while(next<5&&state.modules>=LEVEL_THRESHOLDS[next])next++;if(next>state.level){state.level=next;state.levelTimes.push({level:next,time:state.elapsed,distance:state.distance});}state.checkpoint.level=state.level;state.checkpoint.modules=state.modules;return true;}
export function saveCheckpoint(state,index,position){if(index<=state.checkpoint.index)return false;state.checkpoint={index,x:position.x,z:position.z,level:state.level,modules:state.modules};return true;}
export function respawnSnapshot(state){return {...state.checkpoint,level:state.level,modules:state.modules};}
export function encounterFor(index){const count=ENCOUNTER_COUNTS[index]||0,table=index<2?['drone','soldier','soldier','drone']:index<4?['soldier','drone','assassin','soldier']:index<6?['soldier','sniper','drone','turret']:index<9?['guardian','soldier','assassin','sniper']:['heavy','guardian','assassin','sniper','turret','drone'],enemies=Array.from({length:count},(_,i)=>table[i%table.length]);if(count){enemies[3]='turret';enemies[Math.floor(count/2)+2]='turret';}return {id:'enc-'+index,index,distance:index*80+14,rear:false,enemies};}
export function rewardForEnemy(){return true;}
