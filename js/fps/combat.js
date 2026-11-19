import {movePlayer,hasSight,nearestNode,findPath,rayBoxDistance} from './simulation.js';
export const ENEMY_DEFS=Object.freeze({
 drone:{name:'SCOUT DRONE',hp:45,speed:3.4,damage:1.2,interval:.95,burst:3,burstGap:.12,bulletSpeed:22,spread:1.1,windup:.40,range:34,ideal:17,radius:.48},
 soldier:{name:'EXECUTION SOLDIER',hp:80,speed:2.2,damage:1.5,interval:.90,burst:3,burstGap:.10,bulletSpeed:20,spread:1.15,windup:.45,range:38,ideal:15,radius:.46},
 assassin:{name:'RUSH ASSASSIN',hp:65,speed:6,damage:19,interval:1.25,bulletSpeed:0,spread:0,windup:.85,range:2.1,ideal:1.5,radius:.4},
 sniper:{name:'SNIPER UNIT',hp:65,speed:1.1,damage:5,interval:2.0,burst:3,burstGap:.14,bulletSpeed:68,spread:.10,windup:1.05,range:65,ideal:32,radius:.46},
 guardian:{name:'SHIELD GUARDIAN',hp:135,speed:1.7,damage:2,interval:1.05,burst:3,burstGap:.12,bulletSpeed:19,spread:.95,windup:.55,range:35,ideal:13,radius:.65,shieldHP:90},
 heavy:{name:'HEAVY ENFORCER',hp:280,speed:1.2,damage:3,interval:1.25,burstGap:.10,bulletSpeed:16,spread:1.0,windup:.70,range:42,ideal:19,radius:.85,burst:3},
 turret:{name:'SUPPRESSION TURRET',hp:110,speed:0,damage:1.5,interval:.85,burstGap:.10,bulletSpeed:25,spread:1.1,windup:.45,range:48,ideal:24,radius:.7,burst:3}
});
export function createCombatPlayer({x=0,z=8,capacity=12,reloadSeconds=1.5}={}){return {x,y:1.7,z,vy:0,hp:100,shield:75,energy:capacity,capacity,reloadSeconds,charge:0,reload:0,cooldown:0,hurtTime:0,kills:0,grounded:true,lastSource:'',lastDamage:0};}
export function takeCombatDamage(p,amount,source='UNKNOWN'){amount=Number.isFinite(amount)?Math.max(0,amount):0;const before=p.hp+p.shield,absorbed=Math.min(p.shield,amount);p.shield-=absorbed;p.hp=Math.max(0,p.hp-(amount-absorbed));p.hurtTime=5;p.lastSource=source;p.lastDamage=amount;return before-p.hp-p.shield;}
export function tickVitals(p,dt){const wait=p.hurtTime||0;p.hurtTime=Math.max(0,wait-dt);p.shield=Math.min(75,p.shield+Math.max(0,dt-wait)*12);}
export function createEnemyState(type,{id,x=0,z=-10,encounter=0,arrival=0}={}){const d=ENEMY_DEFS[type]||ENEMY_DEFS.soldier;return {id,type,x,z,y:1.7,hp:d.hp,maxHP:d.hp,shieldHP:d.shieldHP||0,encounter,arrival,state:'ALERT',phase:encounter*.43,age:0,cooldown:1.3,burstLeft:0,burstClock:0,burstIndex:0,telegraph:0,stagger:0,deadAt:0,facing:0,moving:false,aimX:x,aimY:1.7,aimZ:z+10};}
export function guardianAbsorption(e,origin,damage,armorMultiplier=1){if(e.type!=='guardian'||e.shieldHP<=0)return {absorbed:0,shieldDamage:0};const dx=origin.x-e.x,dz=origin.z-e.z,l=Math.hypot(dx,dz)||1,dot=dx/l*Math.sin(e.facing||0)+dz/l*Math.cos(e.facing||0);if(dot<.38)return {absorbed:0,shieldDamage:0};const shieldDamage=Math.min(e.shieldHP,damage*armorMultiplier);return {shieldDamage,absorbed:Math.min(damage,shieldDamage/Math.max(1,armorMultiplier))};}
// Distance to the first sphere entry along a normalized ray, including inside starts.
export function raySphereEntry(origin,direction,center,radius){const x=origin.x-center.x,y=origin.y-center.y,z=origin.z-center.z,c=x*x+y*y+z*z-radius*radius;if(c<=0)return 0;const b=x*direction.x+y*direction.y+z*direction.z,d=b*b-c;if(d<0)return Infinity;const t=-b-Math.sqrt(d);return t>=0?t:Infinity;}
export function stepCombatEnemy(e,p,dt,{colliders=[],nodes=[],time=0}={}){
 const d=ENEMY_DEFS[e.type]||ENEMY_DEFS.soldier,out=[];e.age+=dt;e.cooldown=Math.max(0,e.cooldown-dt);e.stagger=Math.max(0,(e.stagger||0)-dt);e.moving=false;
 if(e.hp<=0){e.state='DESTROYED';return out;}if(e.arrival>0)return out;if(e.stagger>0){e.state='STAGGER';e.burstLeft=0;e.burstClock=0;e.telegraph=0;e.cooldown=Math.max(e.cooldown,.2);return out;}
 const dx=p.x-e.x,dz=p.z-e.z,dist=Math.hypot(dx,dz);e.facing=Math.atan2(dx,dz);
 const shot=()=>({type:'shoot',aimX:e.aimX,aimY:e.aimY,aimZ:e.aimZ,round:e.burstIndex++});
 if(e.burstLeft>0){e.state='ATTACK';e.burstClock-=dt;if(e.burstClock<=1e-7){out.push(shot());e.burstLeft--;if(e.burstLeft>0)e.burstClock+=d.burstGap;else e.cooldown=d.interval;}return out;}
 if(e.telegraph>0){e.state='TELEGRAPH';e.telegraph=Math.max(0,e.telegraph-dt);if(e.telegraph===0){if(e.type==='assassin'){out.push({type:'melee',aimX:e.aimX,aimY:e.aimY,aimZ:e.aimZ});e.cooldown=d.interval;}else{e.burstIndex=0;out.push(shot());e.burstLeft=d.burst-1;e.burstClock=d.burstGap;e.state='ATTACK';}}return out;}
 const sight=hasSight({x:e.x,z:e.z,y:1.65},{x:p.x,z:p.z,y:p.y},colliders);let cover=false;
 if(!sight&&dist<d.range&&e.type!=='assassin'){const origin={x:e.x,y:1.65,z:e.z},direction={x:dx/(dist||1),y:0,z:dz/(dist||1)};let nearest=dist,first=null;for(const b of colliders){const t=rayBoxDistance(origin,direction,b,dist);if(t<nearest){nearest=t;first=b;}}cover=!!first?.destructibleId;}
 if(dist<=d.range&&(sight||cover)&&e.cooldown<=0){e.telegraph=d.windup;e.aimX=p.x;e.aimY=p.y;e.aimZ=p.z;e.state='TELEGRAPH';out.push({type:'warn'});return out;}
 let vx=0,vz=0;
 if(d.speed>0){if(!sight||dist>d.ideal+3||e.type==='assassin'){
  let tx=p.x,tz=p.z;if(!sight&&nodes.length){e.pathTimer=(e.pathTimer||0)-dt;if(e.pathTimer<=0){e.path=findPath(nodes,nearestNode(nodes,e),nearestNode(nodes,p));e.pathTimer=.65;}const node=nodes[e.path?.[1]];if(node){tx=node.x;tz=node.z;}}
  const l=Math.hypot(tx-e.x,tz-e.z)||1;vx=(tx-e.x)/l*d.speed;vz=(tz-e.z)/l*d.speed;e.state='CHASE';
 }else{const sign=Math.sin(time*.52+e.phase)>0?1:-1;vx=-dz/(dist||1)*d.speed*.55*sign;vz=dx/(dist||1)*d.speed*.55*sign;if(dist<d.ideal-4){vx-=dx/(dist||1)*d.speed*.65;vz-=dz/(dist||1)*d.speed*.65;}e.state='STRAFE';}
 const m=movePlayer({x:e.x,y:1.7,z:e.z},vx*dt,vz*dt,colliders,d.radius);e.moving=Math.hypot(m.x-e.x,m.z-e.z)>.002;e.x=m.x;e.z=m.z;
 }else e.state='TRACK';return out;
}
