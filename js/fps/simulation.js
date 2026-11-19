export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function seededRandom(seed=731){let n=seed>>>0;return ()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};}
export const ZONES=[{id:'terminal',name:'TERMINAL ROOM',edge:-11},{id:'corridor',name:'SECURITY CORRIDOR',edge:-33},{id:'reactor',name:'REACTOR HALL',edge:-64},{id:'lockdown',name:'LOCKDOWN',edge:-92},{id:'escape',name:'ESCAPE GATE',edge:-130}];
export function zoneAt(z){for(let i=0;i<ZONES.length;i++)if(z>ZONES[i].edge)return i;return 4;}
export function createPlayer(){return {x:0,y:1.7,z:8,vy:0,hp:100,shield:150,energy:100,charge:0,cooldown:0,hurtTime:0,kills:0,grounded:true};}
export function applyDamage(player,damage){const absorbed=Math.min(player.shield,Math.max(0,damage));player.shield-=absorbed;player.hp=Math.max(0,player.hp-(damage-absorbed));player.hurtTime=5;}
export function weaponShot(charge=0){const c=clamp(charge,0,1);return {damage:c>.15?110+310*c:55,cost:c>.15?14+22*c:5,cooldown:c>.15?.72:.23,pierce:c>.15,power:c>.15?1+c*2:1};}
export function createProgress(){return {stage:0,escaped:false,gatePowered:false,elapsed:0,stages:[6,14,22,26,28].map(total=>({total,spawned:0,kills:0,timer:0,started:false,cleared:false}))};}
export function gateReady(progress,index){const s=progress.stages[index];return !!s&&s.spawned>=s.total&&s.kills>=s.total;}
export function circleBlocked(x,z,y,boxes,r=.4){return boxes.some(b=>{if(b.enabled===false||y-1.7>=(b.maxY??4)||y+.15<(b.minY??0))return false;const cx=clamp(x,b.minX,b.maxX),cz=clamp(z,b.minZ,b.maxZ);return (x-cx)**2+(z-cz)**2<r*r;});}
export function movePlayer(p,dx,dz,boxes,r=.4){const out={...p},steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.18));for(let i=0;i<steps;i++){if(!circleBlocked(out.x+dx/steps,out.z,out.y,boxes,r))out.x+=dx/steps;if(!circleBlocked(out.x,out.z+dz/steps,out.y,boxes,r))out.z+=dz/steps;}return out;}
export function rayBoxDistance(origin,direction,b,max=200){
 if(b.enabled===false)return Infinity;let lo=0,hi=max;
 for(const [axis,min,maxKey] of [['x','minX','maxX'],['y','minY','maxY'],['z','minZ','maxZ']]){
  const d=direction[axis],o=origin[axis],lower=b[min]??0,upper=b[maxKey]??4;
  if(Math.abs(d)<1e-8){if(o<lower||o>upper)return Infinity;}else{let a=(lower-o)/d,c=(upper-o)/d;if(a>c)[a,c]=[c,a];lo=Math.max(lo,a);hi=Math.min(hi,c);if(lo>hi)return Infinity;}
 }
 return lo;
}
export function hasSight(a,b,boxes){const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(!len)return true;const origin={x:a.x,y:a.y??1.5,z:a.z},dir={x:dx/len,y:0,z:dz/len};return !boxes.some(box=>rayBoxDistance(origin,dir,box,len)<len-.2);}
export function nearestNode(nodes,p){let best=-1,d=Infinity;nodes.forEach((n,i)=>{const v=(n.x-p.x)**2+(n.z-p.z)**2;if(v<d){d=v;best=i;}});return best;}
export function findPath(nodes,start,end){if(start<0||end<0||!nodes[start]||!nodes[end])return [];const queue=[start],seen=new Map([[start,-1]]);for(let h=0;h<queue.length;h++){const i=queue[h];if(i===end){const path=[];for(let n=end;n!==-1;n=seen.get(n))path.push(n);return path.reverse();}for(const j of nodes[i].links||[])if(nodes[j]&&!seen.has(j)){seen.set(j,i);queue.push(j);}}return [];}
export function stepEnemy(e,p,dt,{colliders=[],nodes=[],time=0}={}){
 const events=[];e.age=(e.age||0)+dt;e.cooldown=Math.max(0,(e.cooldown||0)-dt);e.stagger=Math.max(0,(e.stagger||0)-dt);
 if(e.hp<=0){e.state='DESTROYED';return events;}if(e.stagger>0){e.state='STAGGER';return events;}
 let dx=p.x-e.x,dz=p.z-e.z,dist=Math.hypot(dx,dz);const clear=hasSight(e,p,colliders),ideal=e.type==='heavy'?12:e.type==='drone'?9:8;
 let vx=0,vz=0;const speed=e.type==='heavy'?1.25:e.type==='drone'?3:2.1;
 if(dist>38){e.state='PATROL';vx=Math.cos(time*.7+e.phase)*.4;vz=Math.sin(time*.5+e.phase)*.4;}
 else if(!e.alerted){e.state='ALERT';e.alerted=e.age>.7;}
 else if(!clear||dist>ideal+3){
  e.state='CHASE';let target=p;
  if(!clear&&nodes.length){e.pathTimer=(e.pathTimer||0)-dt;if(e.pathTimer<=0){e.path=findPath(nodes,nearestNode(nodes,e),nearestNode(nodes,p));e.pathTimer=.8;}const n=e.path?.[1];if(nodes[n])target=nodes[n];}
  dx=target.x-e.x;dz=target.z-e.z;const l=Math.hypot(dx,dz)||1;vx=dx/l*speed;vz=dz/l*speed;
 }else{
  const l=dist||1,sign=Math.sin(time*.48+e.phase)>0?1:-1;e.state=e.cooldown<.35?'ATTACK':'STRAFE';
  vx=-dz/l*speed*.65*sign;vz=dx/l*speed*.65*sign;
  if(dist<ideal-2){vx-=dx/l*speed*.5;vz-=dz/l*speed*.5;}
  if(e.cooldown<=0&&clear){events.push({type:'shoot',enemy:e});e.cooldown=e.type==='heavy'?2.4:e.type==='drone'?2.3:1.8;}
 }
 const moved=movePlayer({x:e.x,z:e.z,y:e.y??(e.type==='drone'?2:1.7)},vx*dt,vz*dt,colliders,e.type==='heavy'?.85:.45);e.moving=Math.hypot(moved.x-e.x,moved.z-e.z)>.004;e.x=moved.x;e.z=moved.z;e.facing=Math.atan2(p.x-e.x,p.z-e.z);return events;
}

export function groundHeight(x,z){if(x< -16||x> -12)return 0;if(z<=-34&&z>=-40)return (-34-z)/6*2;if(z< -40&&z>=-60)return 2;if(z< -60&&z>=-64)return (z+64)/4*2;return 0;}
