export const SEGMENT_LENGTH=80;
export const SEGMENT_COUNT=4;
export const SPAWN={x:0,y:1.7,z:8};
export const ENTRY_TERMINAL=Object.freeze({x:-3,z:3,screenY:1.65,screenZ:2.835});
export const HANGAR_Z=SPAWN.z-SEGMENT_COUNT*SEGMENT_LENGTH+14;
const THEMES=[['terminal','CITIZEN TERMINAL',9,6],['warehouse','FREIGHT DOGLEG',15,9],['reactor','REACTOR ARC',15,12],['hangar','ASCENSION HANGAR',20,16]];
export const SEGMENTS=THEMES.map((t,index)=>({id:'sector-'+String(index+1).padStart(2,'0'),letter:String.fromCharCode(65+index),index,startZ:SPAWN.z-index*SEGMENT_LENGTH,endZ:SPAWN.z-(index+1)*SEGMENT_LENGTH,name:t[1],halfWidth:t[2],height:t[3],kind:t[0]}));
export const segmentAt=z=>Math.min(SEGMENT_COUNT-1,Math.max(0,Math.floor((SPAWN.z-z)/SEGMENT_LENGTH)));

// Seed belongs to the run: stream reload and checkpoint retry share one blueprint.
export function createCampaignLayout(seed=731){
 let state=Number(seed)>>>0;const random=()=>((state=Math.imul(state,1664525)+1013904223>>>0)/4294967296);
 const profiles=SEGMENTS.map(s=>{const sign=random()<.5?-1:1,scale=.85+random()*.25,spread=.9+random()*.3;
  const knots=s.index===0?[[0,0],[10,0],[27,sign*3.6*scale],[48,-sign*3.2*scale],[65,-sign*2*scale],[80,0]]:s.index===1?[[0,0],[16,-sign*5.4*scale],[30,-sign*5.4*scale],[50,sign*5.4*scale],[64,sign*5.4*scale],[80,0]]:s.index===2?[[0,0],[18,sign*3.3*scale],[39,sign*6*scale],[59,sign*3.7*scale],[80,0]]:[[0,0],[16,-sign*4*scale],[30,sign*3*scale],[48,0],[80,0]];
  return {knots,spread,sign,cover:Array.from({length:5},()=>({side:random()<.5?-1:1,offset:(random()-.5)*5}))};
 });
 function centerAt(index,depth){const knots=profiles[index].knots,d=Math.max(0,Math.min(80,depth));for(let i=1;i<knots.length;i++)if(d<=knots[i][0]){const a=knots[i-1],b=knots[i],t=(d-a[0])/(b[0]-a[0]),f=t*t*(3-2*t);return a[1]+(b[1]-a[1])*f;}return 0;}
 function widthAt(index,depth){const p=profiles[index];return index===0?(depth<10?8:3.5*p.spread):index===1?4.6*p.spread:index===2?(5.2+2*Math.sin(depth*Math.PI/80))*p.spread:depth<38?6:19.8;}
 const route=[[0,8]];for(const s of SEGMENTS){const end=s.kind==='hangar'?66:80;for(let depth=4;depth<=end;depth+=4)route.push([centerAt(s.index,depth),s.startZ-depth]);if(end%4)route.push([centerAt(s.index,end),s.startZ-end]);}
 const lengths=[0];for(let i=1;i<route.length;i++)lengths.push(lengths[i-1]+Math.hypot(route[i][0]-route[i-1][0],route[i][1]-route[i-1][1]));
 function routeDistanceAt(z){for(let i=1;i<route.length;i++)if(z>=route[i][1]){const a=route[i-1],b=route[i],t=Math.max(0,Math.min(1,(a[1]-z)/(a[1]-b[1])));return lengths[i-1]+(lengths[i]-lengths[i-1])*t;}return lengths.at(-1);}
 const cache=new Map();
 function segmentLayout(index){index=Math.min(3,Math.max(0,index|0));if(cache.has(index))return cache.get(index);
  const s=SEGMENTS[index],hw=s.halfWidth,H=s.height,staticBoxes=[],destructibles=[],entries=[],guide=[];
  const box=(id,x,z,w,d,h=H,minY=0)=>{if(w<=.02)return;const b={id:s.id+'-'+id,tag:id,segment:index,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY,maxY:minY+h,height:h,enabled:true,protected:true};staticBoxes.push(b);return b;};
  const prop=(type,k,x,z,w,d,h)=>{for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.25);for(let n=0;n<=steps;n++){const t=n/steps,dx=Math.max(0,Math.abs(a[0]+(b[0]-a[0])*t-x)-w/2),dz=Math.max(0,Math.abs(a[1]+(b[1]-a[1])*t-z)-d/2);if(dx*dx+dz*dz<1.21)return;}}const id='env-'+index+'-'+type+'-'+k,c={id,tag:type,segment:index,destructibleId:id,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:0,maxY:h,height:h,enabled:true};destructibles.push({id,type,segment:index,position:{x,y:h/2,z},size:{x:w,y:h,z:d},collider:c});};
  box('outer-left',-hw-.35,(s.startZ+s.endZ)/2,.7,80);box('outer-right',hw+.35,(s.startZ+s.endZ)/2,.7,80);
  if(index===0){box('homepage-terminal-desk',ENTRY_TERMINAL.x,ENTRY_TERMINAL.z,3.1,1.3,.96);box('homepage-terminal-monitor',ENTRY_TERMINAL.x,2.75,1.7,.14,1,1.15);box('start-bulkhead',0,s.startZ+6,hw*2+1,1,H);for(const side of[-1,1])box('start-vestibule-'+side,side*(hw+.35),s.startZ+3,.7,6);}
  else{const extent=Math.max(hw,SEGMENTS[index-1].halfWidth),gap=6;for(const side of[-1,1])box('transfer-wing-'+side,side*(gap+(extent-gap)/2),s.startZ,extent-gap,1);box('transfer-lintel',0,s.startZ,gap*2,1,H-4.8,4.8);}
  for(let depth=2;depth<80;depth+=4){const x=centerAt(index,depth),w=Math.min(widthAt(index,depth),hw-Math.abs(x)),z=s.startZ-depth;guide.push({x,z,width:w});
   if(index===0&&depth<10||index===3&&depth>=38)continue;
   const left=x-w,right=x+w;box('curve-baffle-left-'+depth,(-hw+left)/2,z,left+hw,4,H);box('curve-baffle-right-'+depth,(right+hw)/2,z,hw-right,4,H);
  }
  for(const [n,depth]of [20,40,60,72].entries()){const x=centerAt(index,depth),w=widthAt(index,depth),side=n%2?-1:1;entries.push({id:s.id+'-bay-'+n,segment:index,side,portalX:x+side*(Math.min(w,hw-Math.abs(x))-.7),x:centerAt(index,depth+1.5)+side*Math.min(w-2.8,2.4),z:s.startZ-depth});}
  const types=index===0?['panel','barrier','generator','cargo','panel']:index===1?['cargo','cargo','wall','cargo','generator']:index===2?['generator','panel','generator','barrier','panel']:['cargo','barrier','cargo','panel','cargo'];
  for(let n=0;n<5;n++){const p=profiles[index].cover[n],depth=(index===1?[13,44,28,68,76]:[13,29,47,57,76])[n]+p.offset,w=widthAt(index,depth),x=centerAt(index,depth)+p.side*(Math.min(w,hw-Math.abs(centerAt(index,depth)))-1.3),z=s.startZ-depth;if(entries.some(e=>Math.hypot(e.x-x,e.z-1.5-z)<4.5))continue;prop(types[n],n,x,z,1.6,1.6,n%2?2.4:1.8);}
  if(index===2)for(const side of[-1,1]){const x=centerAt(index,39)+side*5.2;box('reactor-foot-'+side,x,s.startZ-39,1.4,3.8,3.8);}
  if(index===1)for(const side of[-1,1])box('rack-'+side,centerAt(index,52)+side*(widthAt(index,52)-.7),s.startZ-52,1.3,9,5);
  if(index===3){box('hangar-end',0,s.endZ-.4,hw*2+1,.8);for(const side of[-1,1])for(const offset of[40,65])box('hangar-pier-'+side,side*15,s.startZ-offset,1.5,1.5);}
  const result={s,staticBoxes,destructibles,entries,guide};cache.set(index,result);return result;
 }
 return {seed:Number(seed)>>>0,segments:SEGMENTS,route,routeLength:lengths.at(-1),segmentLayout,centerAt,widthAt,routeDistanceAt};
}
const defaultLayout=createCampaignLayout();
export const ROUTE=defaultLayout.route;
export const ROUTE_LENGTH=defaultLayout.routeLength;
export const routeDistanceAt=defaultLayout.routeDistanceAt;
export const segmentLayout=defaultLayout.segmentLayout;
