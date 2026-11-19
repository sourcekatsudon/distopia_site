export function deviceProfile({coarse=false,touchPoints=0,width=1280,cores=8,memory=8,requested=''}={}){
 const mobile=coarse||(touchPoints>0&&width<1000),valid=['low','medium','high'].includes(requested);
 let quality=valid?requested:mobile?'low':cores<=4||memory<=4?'medium':'high';if(mobile&&quality==='high')quality='medium';
 return {mobile,quality,maxDpr:quality==='high'?1.5:quality==='medium'?1.25:1,shadows:quality==='high'&&!mobile,post:quality!=='low',maxEnemies:mobile?6:quality==='low'?8:12,particles:quality==='low'?120:quality==='medium'?360:640};
}
