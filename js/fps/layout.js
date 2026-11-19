// Physical freight obstacles and an authored escape route; coordinates are shared with QA.
export const FREIGHT=[
 [-1.3,-16,7.4,1.2,4.8,'security elbow A'],[1.3,-23,7.4,1.2,4.8,'security elbow B'],[-1.3,-29,7.4,1.2,4.8,'security elbow C'],
 [0,-47,8,4,3.8,'reactor condenser'],[-3,-100,28,1.8,4,'freight wall A'],[3,-110,28,1.8,4,'freight wall B'],
 [-3.6,-4.2,2.1,1.8,2.7,'terminal freight'],[3.9,-9,1.4,1.4,2.5,'terminal crate'],
 [-14.2,-42,2.2,2.6,2.7,'reactor cover'],[14.2,-54,2.2,2.6,2.7,'reactor cover'],[-9,-85,2.6,2.6,2.9,'lockdown freight']
];
export const FACILITY_ROUTE=[[3.5,8],[3.5,-8],[0,-8],[0,-13],[3.7,-14],[3.7,-18],[-3.7,-20],[-3.7,-25],[3.7,-27],[3.7,-31],[0,-35],[0,-36],[12.5,-36],[12.5,-40],[12.5,-50],[12.5,-57],[12.5,-62],[0,-62],[0,-68],[6,-68],[6,-76],[-6,-77],[-6,-84],[0,-88],[0,-94],[12.5,-94],[12.5,-107],[-12.5,-107],[-12.5,-116],[0,-116],[0,-123]];
export const ENTRIES=[
 [[-4,-7],[4,-7],[-4,5],[4,6]],
 [[-3.7,-26],[3.7,-31],[3.7,-13],[-3.7,-19]],
 [[-12.5,-58],[12.5,-44],[-12.5,-36],[12.5,-62]],
 [[-6,-87.5],[7,-77],[7,-67],[-7,-89]],
 [[-12.5,-115],[12.5,-104],[12.5,-95],[-12.5,-106]]
];
export function selectEntry(stage,serial,player,blocked,sight,occupied=[]){
 const candidates=ENTRIES[stage].map(([x,z],index)=>({x,z,index,d:Math.hypot(x-player.x,z-player.z),rear:z>player.z+4})).filter(p=>p.d>5&&!blocked(p)&&!occupied.some(e=>Math.hypot(e.x-p.x,e.z-p.z)<1.4));
 const hidden=candidates.filter(p=>!sight(p)),rear=hidden.filter(p=>p.rear),pool=serial%4>=2&&rear.length?rear:hidden.length?hidden:candidates;
 return pool.length?pool[serial%pool.length]:null;
}
