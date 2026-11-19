export const SEGMENT_LENGTH=80;
export const SEGMENT_COUNT=16;
export const SPAWN={x:0,y:1.7,z:8};
export const HANGAR_Z=SPAWN.z-SEGMENT_COUNT*SEGMENT_LENGTH+14;
const THEMES=[['terminal','CITIZEN TERMINAL',7,6],['corridor','TRANSFER CONDUIT',7,6],['warehouse','FREIGHT PROCESSING',12,10],['machine','THERMAL EXCHANGE',10,8],['security','SECURITY NEXUS',8,7],['reactor','REACTOR SPINE',14,13]];
export const SEGMENTS=Array.from({length:SEGMENT_COUNT},(_,index)=>{const t=index===SEGMENT_COUNT-1?['hangar','ASCENSION HANGAR',20,16]:THEMES[index%THEMES.length];return{id:'sector-'+String(index+1).padStart(2,'0'),index,startZ:SPAWN.z-index*SEGMENT_LENGTH,endZ:SPAWN.z-(index+1)*SEGMENT_LENGTH,name:t[1],halfWidth:t[2],height:t[3],kind:t[0]};});
export const segmentAt=z=>Math.min(SEGMENT_COUNT-1,Math.max(0,Math.floor((SPAWN.z-z)/SEGMENT_LENGTH)));
export const ROUTE=[[SPAWN.x,SPAWN.z]];
for(const s of SEGMENTS){if(s.kind==='hangar'){ROUTE.push([0,s.endZ+14]);continue;}ROUTE.push([4.5,s.startZ-20],[4.5,s.startZ-32],[-4.5,s.startZ-46],[-4.5,s.startZ-58],[0,s.endZ]);}
const routeLengths=[0];for(let i=1;i<ROUTE.length;i++)routeLengths.push(routeLengths[i-1]+Math.hypot(ROUTE[i][0]-ROUTE[i-1][0],ROUTE[i][1]-ROUTE[i-1][1]));
export const ROUTE_LENGTH=routeLengths.at(-1);
export function routeDistanceAt(z){for(let i=1;i<ROUTE.length;i++)if(z>=ROUTE[i][1]){const a=ROUTE[i-1],b=ROUTE[i],t=Math.max(0,Math.min(1,(a[1]-z)/(a[1]-b[1])));return routeLengths[i-1]+(routeLengths[i]-routeLengths[i-1])*t;}return routeLengths.at(-1);}
export function segmentLayout(index){
 const s=SEGMENTS[Math.min(SEGMENT_COUNT-1,Math.max(0,index|0))],hw=s.halfWidth,H=s.height,staticBoxes=[],destructibles=[],entries=[];
 const box=(id,x,z,w,d,h=H,minY=0)=>{const b={id:s.id+'-'+id,tag:id,segment:s.index,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY,maxY:minY+h,height:h,enabled:true,protected:true};staticBoxes.push(b);return b;};
 const prop=(type,k,x,z,w,d,h)=>{const id='env-'+s.index+'-'+type+'-'+k,c={id,tag:type,segment:s.index,destructibleId:id,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:0,maxY:h,height:h,enabled:true};destructibles.push({id,type,segment:s.index,position:{x,y:h/2,z},size:{x:w,y:h,z:d},collider:c});};
 box('outer-left',-hw-.35,(s.startZ+s.endZ)/2,.7,80,H);box('outer-right',hw+.35,(s.startZ+s.endZ)/2,.7,80,H);
 if(s.index===0){box('start-bulkhead',0,s.startZ+6,hw*2+1,1,H);for(const side of[-1,1])box('start-vestibule-'+side,side*(hw+.35),s.startZ+3,.7,6,H);for(const side of[-1,1])box('terminal-kiosk-'+side,side*5.9,s.startZ-5,1.2,1.2,2.1);}
 else{const extent=Math.max(hw,SEGMENTS[s.index-1].halfWidth),gap=s.kind==='hangar'?8:5.5;for(const side of[-1,1])box('transfer-wing-'+side,side*(gap+(extent-gap)/2),s.startZ,extent-gap,1,Math.max(H,SEGMENTS[s.index-1].height));box('transfer-lintel',0,s.startZ,gap*2,1,Math.max(H,SEGMENTS[s.index-1].height)-4.8,4.8);}
 if(s.kind!=='hangar'){
  const z=s.startZ-26;
  box('left-baffle',(-hw-3)/2,z,hw-3,1.2,4.8);box('right-baffle',.65,z,2.3,1.2,4.8);box('break-door-lintel',-1.75,z,2.5,1.2,H-3.8,3.8);
  box('return-baffle',(hw-1.8)/2,s.startZ-52,hw+1.8,1.2,4.8);
  prop('wall',0,-1.75,z,2.5,1.2,3.8);
  prop('cargo',0,-hw+2,s.startZ-12,2,2,2);prop('barrier',0,hw-2,s.startZ-39,2.4,1.2,2.6);prop('generator',0,-hw+2,s.startZ-66,1.8,1.8,2.6);prop('panel',0,hw-.5,s.startZ-16,.7,1.6,2.2);
  for(const [n,x,offset]of [[0,-hw+1.4,18],[1,hw-1.4,62]])entries.push({id:s.id+'-bay-'+n,segment:s.index,x,z:s.startZ-offset});
  if(s.kind==='reactor')for(const side of[-1,1]){box('reactor-foot-'+side,side*(hw-3.0),s.startZ-47,2.6,5.5,3.8);}
  if(s.kind==='machine')for(const side of[-1,1])box('thermal-column-'+side,side*(hw-1.6),s.startZ-46,2.2,2.2,3.6);
  if(s.kind==='warehouse')for(const side of[-1,1])box('rack-'+side,side*(hw-.7),s.startZ-47,1.3,9,5);
 }else{
  box('hangar-end',0,s.endZ-.4,hw*2+1,.8,H);
  for(const side of[-1,1])for(const offset of[15,40,65])box('hangar-pier-'+side,side*15,s.startZ-offset,1.5,1.5,H);
  for(const[side,k]of[[-1,0],[1,1]])prop('cargo',k,side*9,s.startZ-24,3,3,2.6);
  prop('panel',0,-8,s.startZ-54,1.1,1.5,2.2);
  for(const[n,x]of[[0,-12],[1,12]])entries.push({id:s.id+'-bay-'+n,segment:s.index,x,z:s.startZ-32});
 }
 return{s,staticBoxes,destructibles,entries};
}
