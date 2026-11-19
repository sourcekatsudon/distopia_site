import * as THREE from '../../vendor/three.module.js';
import {seededRandom} from './simulation.js';
let skin=null,skinRefs=0;
function skinTexture(){if(!skin){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d'),random=seededRandom(181);c.fillStyle='#9aa4a9';c.fillRect(0,0,128,128);for(let i=0;i<1600;i++){c.fillStyle=random()>.5?'#111b2430':'#6c3e2a55';c.fillRect(random()*128,random()*128,random()*7+1,random()*2+1);}c.strokeStyle='#15222c';c.lineWidth=3;c.strokeRect(5,5,118,118);for(let i=0;i<5;i++){c.fillStyle='#29333b';c.fillRect(80,35+i*8,32,3);}skin=new THREE.CanvasTexture(canvas);skin.colorSpace=THREE.SRGBColorSpace;skin.wrapS=skin.wrapT=THREE.RepeatWrapping;}skinRefs++;return skin;}
function factory(quality){const metalTexture=skinTexture();let disposed=false;const geos=new Map(),mats=[];const geo=(key,make)=>{if(!geos.has(key))geos.set(key,make());return geos.get(key);};const mat=(color,metalness=.7,roughness=.4,emissive=0)=>{const m=new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,map:emissive?null:metalTexture,emissiveIntensity:emissive?1.8:0});mats.push(m);return m;};
 const dark=mat(0x17232e),metal=mat(0x5b6d79),edge=mat(0x9faeb8),red=mat(0x7b1f2b,.5,.35,0xf9233b),black=mat(0x070d15,.45,.6);
 const mesh=(parent,shape,size,pos,material=dark)=>{const geometry=shape==='sphere'?geo('sphere',()=>new THREE.SphereGeometry(1,12,8)):shape==='cylinder'?geo('cylinder',()=>new THREE.CylinderGeometry(1,1,1,quality==='low'?8:12)):shape==='ring'?geo('ring',()=>new THREE.TorusGeometry(1,.12,6,quality==='low'?12:20)):shape==='plate'?geo('plate',()=>{const s=new THREE.Shape();s.moveTo(-.38,-.5);s.lineTo(.38,-.5);s.lineTo(.5,-.35);s.lineTo(.5,.35);s.lineTo(.35,.5);s.lineTo(-.35,.5);s.lineTo(-.5,.35);s.lineTo(-.5,-.35);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:1,steps:1});g.center();return g;}):geo('box',()=>new THREE.BoxGeometry(1,1,1));const m=new THREE.Mesh(geometry,material);m.scale.set(...size);m.position.set(...pos);parent.add(m);return m;};
 const cable=(parent,points,r=.04,material=black)=>{const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),g=new THREE.TubeGeometry(curve,12,r,5,false);geos.set('cable'+geos.size,g);const m=new THREE.Mesh(g,material);parent.add(m);return m;};
 return {mesh,cable,dark,metal,edge,red,black,mat,geos,mats,dispose(){if(disposed)return;disposed=true;geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());if(--skinRefs===0){skin.dispose();skin=null;}}};
}
export function createRobot(type,{seed=1,quality='high'}={}){
 const k=factory(quality),root=new THREE.Group(),body=new THREE.Group();root.add(body);const hitMeshes=[],joints=[],fans=[],rand=seededRandom(seed);const add=(shape,size,pos,mat,part='armor',multi=1,parent=body)=>{const m=k.mesh(parent,shape,size,pos,mat);m.userData.part=part;m.userData.multiplier=multi;hitMeshes.push(m);return m;};
 if(type==='drone'){
  body.position.y=1.65;add('sphere',[.7,.38,.54],[0,0,0],k.dark);add('plate',[.85,.4,.2],[0,.08,.37],k.metal);add('sphere',[.21,.16,.16],[0,.03,.56],k.red,'head',1.7);add('ring',[.25,.25,.25],[0,.03,.57],k.edge);
  for(const x of [-1,1])for(const z of [-1,1]){add('plate',[.5,.17,.35],[x*.62,-.1,z*.34],k.metal);const nozzle=add('cylinder',[.23,.25,.23],[x*.7,-.24,z*.35],k.dark);add('sphere',[.16,.08,.16],[x*.7,-.39,z*.35],k.red);const fan=k.mesh(body,'ring',[.14,.14,.14],[x*.7,-.41,z*.35],k.edge);fan.rotation.x=Math.PI/2;fans.push(fan);}
  for(const x of [-.33,.33]){const gun=add('cylinder',[.07,.6,.07],[x,-.2,.6],k.edge,'limb',.8);gun.rotation.x=Math.PI/2;}
 }else{
  const heavy=type==='heavy',scale=heavy?1.5:1;body.scale.setScalar(scale);
  add('plate',[heavy?1.55:1.05,.85,.55],[0,1.6,0],k.dark);add('plate',[heavy?1.4:.87,.6,.14],[0,1.65,.35],k.metal);add('cylinder',[.26,.4,.26],[0,1.05,0],k.edge,'core',1.8);add('sphere',[heavy?.28:.19,heavy?.28:.19,.14],[0,1.62,.48],k.red,'core',2.2);add('ring',[.29,.29,.29],[0,1.62,.49],k.black);
  add('plate',[.58,.45,.49],[0,2.24,.03],k.black,'head',2);add('plate',[.5,.08,.12],[0,2.25,.3],k.red,'head',2.3);add('plate',[.22,.15,.13],[0,2.06,.32],k.edge,'head',1.5);
  for(const sign of [-1,1]){
   const leg=new THREE.Group();leg.position.set(sign*.32,.98,0);body.add(leg);joints.push({joint:leg,sign,kind:'leg'});add('sphere',[.16,.16,.16],[0,0,0],k.edge,'limb',.8,leg);add('cylinder',[heavy?.21:.13,.44,heavy?.21:.13],[0,-.26,0],k.dark,'limb',.8,leg);add('sphere',[.17,.17,.17],[0,-.51,0],k.metal,'limb',.8,leg);add('plate',[heavy?.4:.26,.4,.26],[0,-.74,.08],k.metal,'limb',.8,leg);add('plate',[.36,.16,.55],[0,-.93,.18],k.dark,'limb',.8,leg);
   const arm=new THREE.Group();arm.position.set(sign*(heavy?.9:.68),1.9,0);body.add(arm);joints.push({joint:arm,sign:-sign,kind:'arm'});add('plate',[heavy?.65:.42,.52,.6],[0,0,0],k.metal,'armor',.7,arm);add('cylinder',[.13,.48,.13],[0,-.4,0],k.edge,'limb',.8,arm);add('sphere',[.15,.15,.15],[0,-.65,0],k.dark,'limb',.8,arm);add('plate',[.26,.45,.26],[0,-.86,.1],k.dark,'limb',.8,arm);add('sphere',[.17,.15,.17],[0,-1.1,.13],k.edge,'limb',.8,arm);
   k.cable(body,[[sign*.45,1.9,-.2],[sign*.75,1.6,-.36],[sign*.6,1.1,-.2]],.04);
  }
  const gun=add('cylinder',[heavy?.21:.1,heavy?1.1:.75,heavy?.21:.1],[heavy?.98:.65,1.2,.6],k.metal,'armor',.6);gun.rotation.x=Math.PI/2;const muzzle=add('ring',[heavy?.2:.1,heavy?.2:.1,heavy?.2:.1],[heavy?.98:.65,1.2,heavy?1.19:1.02],k.red,'armor',.6);
  if(heavy){for(const sign of [-1,1]){add('plate',[.65,.9,.22],[sign*.95,1.65,-.32],k.dark);add('plate',[.2,1.25,.2],[sign*.58,1.73,-.47],k.edge);}add('plate',[.9,.3,.3],[0,2.54,-.08],k.metal);}
 }
 function update(dt,t,state={}){const moving=state.moving?1:0,walk=t*(type==='heavy'?3.5:7);for(const j of joints)j.joint.rotation.x=Math.sin(walk)*.35*j.sign*moving;body.position.y=type==='drone'?1.65+Math.sin(t*2+seed)*.13:Math.abs(Math.sin(walk))*.025*moving;body.rotation.z=state.state==='STAGGER'?Math.sin(t*45)*.08:0;for(const fan of fans)fan.rotation.z+=dt*9;k.red.emissiveIntensity=state.state==='ATTACK'?2.5:1.4+Math.sin(t*2)*.2;}
 return {root,hitMeshes,update,dispose:k.dispose};
}
export function createRuler({quality='high'}={}){
 const k=factory(quality),root=new THREE.Group(),rand=seededRandom(91),fingers=[],cloth=[];
 const b=(shape,size,pos,mat=k.dark,parent=root)=>k.mesh(parent,shape,size,pos,mat);
 b('plate',[5.5,.6,4],[0,.3,-.2],k.black);b('plate',[3.4,6,.55],[0,3.3,-1.2],k.dark);b('plate',[2.9,5.4,.2],[0,3.3,-.85],k.metal);
 for(const sign of [-1,1]){b('plate',[.55,4.5,1.5],[sign*2.1,2.5,-.55]);b('plate',[1.4,.5,2.6],[sign*1.7,2.3,.3],k.metal);for(let i=0;i<4;i++)b('plate',[.1,4.5,.08],[sign*(1.5+i*.15),3.5,-.46],i%2?k.black:k.red);}
 b('plate',[2.8,1.8,1],[0,3.9,0]);b('plate',[2.1,1.45,.25],[0,3.95,.63],k.metal);b('sphere',[.35,.35,.2],[0,3.7,.84],k.red);b('ring',[.5,.5,.5],[0,3.7,.84],k.black);
 b('plate',[.9,1.1,.75],[0,5.25,.17],k.black);b('plate',[.84,.6,.18],[0,5.35,.6],k.metal);for(const sign of [-1,1])b('plate',[.22,.06,.07],[sign*.24,5.43,.73],k.red);
 for(let i=0;i<7;i++){const spike=b('cylinder',[.045,.6+rand()*.55,.045],[(i-3)*.18,6+rand()*.12,.02],k.edge);spike.rotation.z=(i-3)*-.07;}
 for(let i=0;i<5;i++){const rib=b('plate',[1.5-i*.12,.1,.23],[0,4.3-i*.2,.78],k.edge);rib.rotation.z=(i%2?.04:-.04);}for(const sign of [-1,1]){for(let i=0;i<3;i++){const shoulder=b('plate',[1.12,.24,.85],[sign*(1.45+i*.16),4.72-i*.2,.32],i%2?k.dark:k.metal);shoulder.rotation.z=sign*-.17;}for(let i=0;i<4;i++){const cheek=b('plate',[.16,.13,.12],[sign*.34,5.28-i*.14,.69],k.edge);cheek.rotation.z=sign*.18;}k.cable(root,[[sign*.3,5,.4],[sign*.5,4.9,.85],[sign*.72,4.3,.65]],.055,k.black);}b('ring',[.17,.17,.17],[0,4.97,.65],k.edge);b('cylinder',[.12,.2,.12],[0,4.95,.65],k.dark).rotation.x=Math.PI/2;for(let i=0;i<6;i++)b('plate',[.025,.18,.04],[(i-2.5)*.05,5.05,.78],k.black);
 for(const sign of [-1,1]){
  b('plate',[1.3,.8,1.2],[sign*1.65,4.5,0],k.metal);const arm=b('cylinder',[.22,1.7,.22],[sign*1.75,3.4,.4],k.edge);arm.rotation.z=sign*.18;b('sphere',[.34,.27,.4],[sign*1.9,2.65,.9],k.dark);
  for(let i=0;i<5;i++){const finger=new THREE.Group();finger.position.set(sign*(1.7+i*.12),2.54,1.08);root.add(finger);b('cylinder',[.045,.42,.045],[0,-.15,.08],k.edge,finger);b('sphere',[.055,.055,.055],[0,-.36,.08],k.black,finger);b('cylinder',[.035,.35,.035],[0,-.46,.16],k.metal,finger);fingers.push(finger);}
  const thigh=b('plate',[.9,1.7,.8],[sign*.65,1.5,.5],k.dark);thigh.rotation.x=-.3;b('plate',[.7,.3,1.1],[sign*.65,.46,1.1],k.metal);
  for(let i=0;i<6;i++)k.cable(root,[[sign*(.3+i*.16),4.8,-.3],[sign*(1.4+i*.15),3.5,-.7],[sign*(1.7+i*.12),.5,-.2]],.03+(i%2)*.02,k.black);
 }
 b('box',[28,.15,26],[0,-.1,0],k.dark);b('plate',[28,14,.6],[0,6,-6],k.black);for(const sign of [-1,1]){for(let i=0;i<5;i++){b('plate',[.3,12,.6],[sign*(4+i*1.5),6,-5.5],k.metal);b('plate',[.06,7,.08],[sign*(4+i*1.5),4.7,-5.1],k.red);}k.cable(root,[[sign*6,0,-3],[sign*6,8,-3],[sign*3,10,-4],[0,10.5,-5]],.18,k.dark);}const throneLight=new THREE.PointLight(0xff354b,36,17,2);throneLight.position.set(-4,5,4);root.add(throneLight);
 const clothMat=k.mat(0x151b21,.05,.95);
 for(const sign of [-1,1]){const positions=[],uvs=[],indices=[],cols=12,rows=18;for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){const u=x/cols,v=y/rows;positions.push(sign*(.2+u*(1.9+v*.65)),4.7-v*(4.3+rand()*.18),-.1+Math.sin(u*9)*.14+v*.22);uvs.push(u,v);}for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=y*(cols+1)+x;indices.push(i,i+1,i+cols+1,i+1,i+cols+2,i+cols+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();k.geos.set('cloth'+sign,g);const mat=clothMat;mat.side=THREE.DoubleSide;const m=new THREE.Mesh(g,mat);root.add(m);cloth.push({geometry:g,base:positions});}
 for(let i=0;i<8;i++){const p=b('plate',[.45,2+rand()*3,.3],[(i-3.5)*.95,2,-2.6],k.black);p.rotation.z=(i-3.5)*.03;}
 function update(dt,t){fingers.forEach((f,i)=>f.rotation.x=Math.sin(t*.8+i)*.035);cloth.forEach(({geometry,base})=>{const p=geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,base[i*3+2]+Math.sin(t*.65+base[i*3]*2+base[i*3+1])*.035);p.needsUpdate=true;});k.red.emissiveIntensity=1.3+Math.sin(t*.7)*.3;}
 return {root,update,dispose:k.dispose};
}
