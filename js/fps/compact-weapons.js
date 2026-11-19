import * as THREE from '../../vendor/three.module.js';
import {createSurfaceKit} from './material-kit.js';
import {weaponDefinition} from './weapon-defs.js';

// Two independent compact weapons, +Z breech / -Z muzzle. They share a hand rig,
// not the silhouette or geometry of the existing RG7.
export function createCompactWeapon(level,{quality='high'}={}){
 const definition=weaponDefinition(level===2?2:1),laser=definition.level===2,high=quality==='high';
 const root=new THREE.Group();root.name=definition.id+' / '+definition.name;
 const geometries=new Set(),materials=new Set(),textures=new Set(),surface=createSurfaceKit({quality});let disposed=false;
 const G=g=>(geometries.add(g),g),M=m=>(materials.add(m),m),copy=key=>M(surface[key].clone());
 const armor=copy('anodized'),steel=copy('titanium'),metal=copy('gunmetal'),rubber=copy('rubber'),ceramic=copy('ceramic');
 for(const m of [armor,steel,metal]){m.normalMap=null;m.roughnessMap=null;m.metalnessMap=null;m.roughness=m===steel?.45:.62;m.clearcoat=0;}
 armor.color.setHex(0x141f2b);metal.color.setHex(0x3d4b59);
 const energy=M(new THREE.MeshStandardMaterial({color:0x07304d,emissive:0x108bff,emissiveIntensity:1.3,metalness:.15,roughness:.25}));
 const copper=M(new THREE.MeshStandardMaterial({color:0x76624a,metalness:.85,roughness:.48}));
 const group=(name,parent=root)=>{const g=new THREE.Group();g.name=name;parent.add(g);return g;};
 const rig=group('compact recoil cradle'),receiver=group('dedicated '+(laser?'laser':'pistol')+' receiver',rig),slide=group('short stroke action',rig),cartridge=group(laser?'side laser cartridge':'pistol power magazine',receiver),support=group('left support hand',rig),rightHand=group('right firing hand',rig);
 const cube=G(new THREE.BoxGeometry(1,1,1)),cylinderG=G(new THREE.CylinderGeometry(1,1,1,high?16:8)),fingerG=G(new THREE.CapsuleGeometry(.024,.05,2,high?8:5));
 const mesh=(g,m,p,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);p.add(o);return o;};
 const box=(p,m,x,y,z,w,h,d)=>{const o=mesh(cube,m,p,x,y,z);o.scale.set(w,h,d);return o;};
 const rod=(p,m,a,b,r)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),o=mesh(cylinderG,m,p);o.position.copy(av).add(bv).multiplyScalar(.5);o.scale.set(r,v.length(),r);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
 const tube=(p,m,r,length,x,y,z)=>{const o=mesh(cylinderG,m,p,x,y,z,Math.PI/2);o.scale.set(r,length,r);return o;};
 function side(points,width,m,p,x=0,y=0,z=0){const s=new THREE.Shape();points.forEach(([zz,yy],i)=>i?s.lineTo(-zz,yy):s.moveTo(-zz,yy));s.closePath();const g=G(new THREE.ExtrudeGeometry(s,{depth:width,bevelEnabled:true,bevelSize:.009,bevelThickness:.006,bevelSegments:1,curveSegments:1}));g.translate(0,0,-width/2);g.rotateY(Math.PI/2);return mesh(g,m,p,x,y,z);}
 function loft(stations,m,p){const n=high?16:8,positions=[],uv=[],indices=[];for(let j=0;j<stations.length;j++){const[z,w,h,y=0]=stations[j];for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);positions.push(Math.sign(c)*Math.pow(Math.abs(c),.5)*w,y+Math.sign(s)*Math.pow(Math.abs(s),.5)*h,z);uv.push(i/n,j/(stations.length-1));}}
  for(let j=0;j<stations.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;indices.push(a,c,b,b,c,d);}for(let j=1;j<n-1;j++){indices.push(0,j,j+1);const a=(stations.length-1)*n;indices.push(a,a+j+1,a+j);}const g=G(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return mesh(g,m,p);
 }
 const coils=[],vents=[];
 if(!laser){
  loft([[.32,.07,.06,.015],[.22,.135,.10,.025],[-.18,.125,.095,.025],[-.44,.10,.065,.035],[-.61,.075,.055,.04]],armor,receiver);
  loft([[.25,.105,.04,.16],[-.35,.10,.035,.16],[-.57,.075,.035,.11]],metal,slide);
  for(const s of[-1,1]){side([[.22,.08],[-.24,.11],[-.43,.05],[-.25,-.05],[.20,-.06]],.015,steel,receiver,s*.137);side([[.17,.055],[-.21,.07],[-.32,.03],[-.18,-.025],[.15,-.035]],.018,armor,receiver,s*.150);box(receiver,energy,s*.153,.005,-.14,.008,.012,.29);for(let i=0;i<3;i++)box(slide,rubber,s*.11,.16,-.30-i*.055,.013,.032,.018);}
  tube(receiver,metal,.071,.12,0,.04,-.63);tube(receiver,rubber,.047,.13,0,.04,-.65);tube(receiver,energy,.025,.015,0,.04,-.72);
  box(slide,steel,0,.212,.17,.075,.025,.06);box(slide,energy,0,.227,.17,.025,.008,.015);box(receiver,steel,0,.17,-.5,.025,.035,.025);
  cartridge.position.set(-.015,-.29,.18);side([[.08,.07],[-.05,.07],[-.10,-.15],[.035,-.16]],.10,metal,cartridge);box(cartridge,energy,-.061,-.06,-.015,.008,.13,.075);box(cartridge,armor,0,-.17,-.01,.13,.035,.12);
 }else{
  loft([[.43,.10,.075,.01],[.25,.18,.125,.015],[-.27,.17,.11,.02],[-.52,.12,.075,.025]],armor,receiver);
  loft([[.30,.115,.045,.17],[-.28,.12,.035,.16],[-.54,.075,.035,.095]],metal,slide);
  for(const s of[-1,1]){side([[.27,.09],[-.30,.11],[-.49,.015],[-.27,-.075],[.24,-.06]],.018,steel,receiver,s*.18);side([[.21,.055],[-.25,.065],[-.35,.01],[-.18,-.04],[.17,-.035]],.020,armor,receiver,s*.194);const rail=group('laser energy rail '+s,receiver);rail.position.x=s*.12;loft([[-.45,.047,.045,.045],[-.75,.051,.05,.045],[-1.18,.038,.035,.045],[-1.42,.022,.025,.045]],metal,rail);box(rail,energy,-s*.022,.095,-.94,.017,.016,.88);for(let i=0;i<4;i++){const v=box(rail,ceramic,s*.016,.012,-.58-i*.21,.065,.075,.036);vents.push(v);}rod(receiver,steel,[s*.13,-.10,.2],[s*.13,-.09,-.48],.013);}
  const torus=G(new THREE.TorusGeometry(.128,.014,5,high?24:14,Math.PI*1.55));for(let i=0;i<3;i++){const g=group('laser induction coil '+i,receiver);g.position.set(0,.045,-.69-i*.26);coils.push(g);mesh(torus,i%2?energy:copper,g);}
  tube(receiver,armor,.136,.10,0,.045,-1.47);tube(receiver,steel,.102,.12,0,.045,-1.48);tube(receiver,rubber,.080,.13,0,.045,-1.49);tube(receiver,energy,.046,.016,0,.045,-1.57);
  cartridge.position.set(-.245,.015,.04);box(cartridge,metal,0,0,0,.09,.13,.39);box(cartridge,energy,-.049,0,0,.009,.077,.28);for(const z of[-.18,.18])box(cartridge,armor,-.004,0,z,.12,.17,.055);box(receiver,ceramic,.02,.19,.10,.14,.045,.29);box(receiver,rubber,.02,.22,.10,.105,.018,.22);
 }
 const gripZ=laser?.28:.23;
 side([[gripZ+.09,-.075],[gripZ-.07,-.085],[gripZ-.12,-.36],[gripZ+.02,-.42],[gripZ+.15,-.36]],.13,rubber,receiver);
 for(let i=0;i<4;i++)box(receiver,ceramic,-.073,-.18-i*.045,gripZ+.035+i*.01,.018,.025,.12);
 rod(receiver,steel,[-.08,-.12,gripZ-.075],[-.08,-.25,gripZ-.14],.012);rod(receiver,steel,[-.08,-.25,gripZ-.14],[-.08,-.28,gripZ+.025],.012);
 // Gloved hands remain distinct from the moving power cell.
 rightHand.position.set(.015,-.24,gripZ+.035);box(rightHand,rubber,0,0,0,.18,.16,.17);for(let i=0;i<4;i++){const f=mesh(fingerG,rubber,rightHand,-.09,-.075+i*.043,-.055,0,0,Math.PI/2);f.scale.z=.9;box(rightHand,ceramic,-.107,-.075+i*.043,-.04,.025,.026,.052);}
 mesh(fingerG,rubber,rightHand,-.055,.10,-.01,.3,0,-.6);rod(rig,rubber,[.03,-.34,gripZ+.11],[.29,-.62,1.0],.075);side([[.35,-.39],[.60,-.44],[.91,-.61],[.73,-.70],[.42,-.57]],.20,metal,rig,.18);
 support.position.set(laser?-.16:-.11,laser?-.11:-.27,laser?-.62:gripZ-.03);box(support,rubber,0,0,0,.16,.12,.15);for(let i=0;i<4;i++)mesh(fingerG,rubber,support,-.055+i*.036,.055,-.035,Math.PI/2,0,Math.PI/2);box(support,ceramic,0,-.045,.09,.17,.05,.09);
 const leftArm=rod(rig,rubber,[laser?-.17:-.12,laser?-.17:-.31,laser?-.56:gripZ],[ -.55,-.65,.80],.06);leftArm.name='compact support forearm';
 const armStart=new THREE.Vector3(),armElbow=new THREE.Vector3(-.55,-.65,.80),armDirection=new THREE.Vector3(),armAxis=new THREE.Vector3(0,1,0),armOffset=new THREE.Vector3(-.015,-.055,.045);
 const ammunition=[],meter=group('compact physical cell gauge',receiver),capacity=definition.capacity;
 const gauges=laser?12:6;for(let i=0;i<gauges;i++){const g=group('cell gauge '+i,meter);g.position.set(-.158-(laser?.055:0),.085,.22-i*(laser?.031:.05));box(g,energy,0,0,0,.010,.027,.018);ammunition.push(g);}
 const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=128;const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#122130';ctx.fillRect(0,0,256,128);ctx.fillStyle='#bfdae8';ctx.font='bold 36px monospace';ctx.fillText(definition.id,16,48);ctx.font='14px monospace';ctx.fillStyle='#4ac9ff';ctx.fillText(laser?'HIGH FREQUENCY EMITTER':'STANDARD SERVICE CELL',16,82);ctx.fillStyle='#8394a1';ctx.font='11px monospace';ctx.fillText(laser?'24 / RECHARGE VIA CELL SWAP':'12 / CELL SWAP REQUIRED',16,109);const label=new THREE.CanvasTexture(labelCanvas);label.colorSpace=THREE.SRGBColorSpace;textures.add(label);const labelMat=M(new THREE.MeshStandardMaterial({map:label,roughness:.7,metalness:.25}));mesh(G(new THREE.PlaneGeometry(laser?.26:.20,.10)),labelMat,receiver,laser?-.207:-.158,-.035,.08,0,-Math.PI/2);
 const muzzle=new THREE.Object3D();muzzle.name='ballistic muzzle';muzzle.position.set(0,laser?.045:.04,laser?-1.60:-.74);receiver.add(muzzle);
 const flashMaterial=M(new THREE.MeshBasicMaterial({color:0x8addff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));const flashMesh=mesh(G(new THREE.ConeGeometry(laser?.055:.035,laser?.22:.13,6,1,true)),flashMaterial,muzzle,0,0,-.05,-Math.PI/2);
 // Batch static siblings by material; animated cell/slide/hand/gauge parents survive.
 function batch(parent){for(const c of [...parent.children])if(c.isGroup)batch(c);const bins=new Map();for(const o of parent.children)if(o.isMesh&&o!==leftArm){if(!bins.has(o.material))bins.set(o.material,[]);bins.get(o.material).push(o);}for(const[m,list]of bins){if(list.length<2)continue;const arrays={position:[],normal:[],uv:[]};for(const o of list){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);for(const key in arrays){const a=g.getAttribute(key);if(a)for(const n of a.array)arrays[key].push(n);}g.dispose();parent.remove(o);}const g=G(new THREE.BufferGeometry());for(const key in arrays)g.setAttribute(key,new THREE.Float32BufferAttribute(arrays[key],key==='uv'?2:3));mesh(g,m,parent);}}
 batch(rig);
 let recoil=0,flash=0,heat=0,focus=0,state='IDLE';const supportBase=support.position.clone(),cellBase=cartridge.position.clone();
 const smooth=x=>{const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);};
 function prepare(){if(!disposed)focus=.06;}
 function fire(power=1){if(disposed)return;recoil=1;flash=1;heat=Math.min(1,heat+.4);}
 function update(dt,s={}){if(disposed)return;dt=Number.isFinite(dt)?Math.max(0,dt):0;const t=Number.isFinite(s.time)?s.time:0,motion=s.reducedMotion?0:t,dep=s.deploy??1,rp=s.reload??-1,reloading=rp>=0;
  recoil*=Math.exp(-dt*(laser?17:13));flash*=Math.exp(-dt*30);heat*=Math.exp(-dt*2.8);focus=Math.max(0,focus-dt);const hold=reloading?smooth(rp/.16)*(1-smooth((rp-.86)/.14)):0,pull=reloading?(rp<.5?smooth((rp-.18)/.25):1-smooth((rp-.60)/.25)):0;
  if(laser){cartridge.position.set(cellBase.x-pull*.32,cellBase.y-pull*.12,cellBase.z+pull*.10);cartridge.rotation.z=-pull*.25;}else{cartridge.position.set(cellBase.x,cellBase.y-pull*.43,cellBase.z+pull*.10);cartridge.rotation.z=pull*.12;}
  cartridge.visible=!(reloading&&rp>.44&&rp<.59);slide.position.z=recoil*(laser?.055:.085);slide.rotation.x=-recoil*.016;
  const remaining=reloading?(rp>.86?capacity*smooth((rp-.86)/.13):0):(s.energy??capacity),lit=Math.ceil(Math.max(0,Math.min(capacity,remaining))/capacity*ammunition.length);for(let i=0;i<ammunition.length;i++)ammunition[i].visible=i<lit;
  support.position.copy(supportBase);support.position.x+=hold*(laser?-.15:.07)-pull*(laser?.24:0);support.position.y-=pull*(laser?.12:.34);support.position.z+=hold*(laser?.45:.11);support.rotation.z=hold*(laser?.35:-.2);
  armStart.copy(support.position).add(armOffset);armDirection.subVectors(armElbow,armStart);const armLength=armDirection.length();leftArm.position.copy(armStart).add(armElbow).multiplyScalar(.5);leftArm.quaternion.setFromUnitVectors(armAxis,armDirection.normalize());leftArm.scale.set(.06,armLength,.06);
  const breath=Math.sin(motion*(s.sprinting?2.5:1.65)),sideBreath=Math.sin(motion*.825),speed=s.reducedMotion?0:Math.min((s.speed||0)/6,1),bob=Math.sin(motion*8)*speed;
  rig.position.set(sideBreath*.015+bob*.009,breath*.030-(1-dep)*.8-hold*.07-Math.abs(bob)*.009,recoil*(laser?.065:.075));rig.rotation.set(breath*.015+recoil*(laser?.035:.065)+hold*.15,hold*-.13,bob*.012+sideBreath*.010+hold*.27);
  for(let i=0;i<coils.length;i++){coils[i].rotation.z=(i%2?-1:1)*(motion*.8+heat*.8);coils[i].position.z=-.69-i*.26+recoil*.02;}
  energy.emissiveIntensity=(reloading?.25:1.05)+flash*.8+focus*.7+Math.sin(motion*3)*.08;flashMaterial.opacity=flash*.8;flashMesh.scale.setScalar(.5+flash*.6);state=reloading?'RELOADING':flash>.25?'FIRING':recoil>.07?'RECOIL':heat>.1?'COOLING':focus>0?'PRECHARGE':'IDLE';
 }
 function dispose(){if(disposed)return;disposed=true;root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());surface.dispose();root.clear();}
 return{root,muzzle,prepare,fire,update,dispose,inspect:()=>({level:definition.level,id:definition.id,state,glyphs:ammunition.filter(o=>o.visible).length,cellVisible:cartridge.visible,cellOffset:cartridge.position.toArray(),breathPosition:rig.position.toArray(),supportHand:support.position.toArray(),flash,capacity,energyFX:null})};
}
