import * as THREE from '../../vendor/three.module.js';

// Parked version of the ASCENSION craft. Local ground contact is y=0; nose is-Z.
export function createDockedShip({quality='high',level=3}={}){
 const low=quality==='low',root=new THREE.Group();root.name='AURORA / docked escape fighter';
 const gs=new Set(),ms=new Set(),wings=[],nozzles=[];let dead=false;
 const G=g=>(gs.add(g),g),M=m=>(ms.add(m),m),material=(color,roughness=.5,metalness=.85)=>M(new THREE.MeshStandardMaterial({color,roughness,metalness,side:THREE.DoubleSide}));
 const hull=material(0x263744,.46),black=material(0x0a111b,.66),steel=material(0x758994,.35),glass=material(0x0a283b,.16,.6),rubber=material(0x06090e,.94,.05),energy=M(new THREE.MeshBasicMaterial({color:new THREE.Color(.04,.63,1.65),toneMapped:false})),core=M(new THREE.MeshBasicMaterial({color:new THREE.Color(.45,1.05,1.6),toneMapped:false}));
 const cube=G(new THREE.BoxGeometry(1,1,1)),cylinder=G(new THREE.CylinderGeometry(1,1,1,low?8:14)),sphere=G(new THREE.SphereGeometry(1,low?8:14,low?5:9)),ring=G(new THREE.TorusGeometry(1,.055,5,low?18:28));
 const mesh=(p,g,m,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 const group=(name,p=root,x=0,y=0,z=0)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);p.add(g);return g;};
 function loft(stations){const n=low?8:16,p=[],uv=[],ids=[];for(let j=0;j<stations.length;j++){const[z,w,h,cy=0]=stations[j];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);p.push(Math.sign(c)*Math.abs(c)**.6*w,cy+Math.sign(s)*Math.abs(s)**.6*h,z);uv.push(i/n,j/(stations.length-1));}}for(let j=0;j<stations.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;ids.push(a,b,c,b,d,c);}for(const[j,flip]of[[0,true],[stations.length-1,false]]){const center=p.length/3;p.push(0,stations[j][3]||0,stations[j][0]);uv.push(.5,.5);for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n;ids.push(center,flip?b:a,flip?a:b);}}const g=G(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();return g;}
 function wingGeo(side){const sh=new THREE.Shape(),points=[[.62,-1.5],[1.4,-1.15],[3.65,.4],[3.1,1.6],[.64,.82]];points.forEach(([x,z],i)=>i?sh.lineTo(x*side,z):sh.moveTo(x*side,z));sh.closePath();const g=G(new THREE.ExtrudeGeometry(sh,{depth:.18,bevelEnabled:true,bevelSize:.06,bevelThickness:.04,bevelSegments:1,curveSegments:1}));g.rotateX(Math.PI/2);g.translate(0,.06,0);return g;}
 const ship=group('raised flight chassis',root,0,1.52,0);
 mesh(ship,loft([[-3.7,.025,.025],[-2.9,.24,.11],[-1.2,.70,.30],[.3,.85,.40],[1.3,.61,.34],[1.85,.33,.22]]),hull);
 mesh(ship,loft([[-2.7,.04,.05,.20],[-1.5,.38,.23,.24],[-.3,.42,.25,.26],[.6,.26,.16,.24]]),glass);
 mesh(ship,cube,steel,0,.08,-2.36,.09,.06,1.55);mesh(ship,cube,energy,0,.13,-2.5,.028,.018,1.50);
 for(const side of[-1,1]){
  const wing=group('folded swept wing '+side,ship);wing.rotation.z=side*.36;wings.push({g:wing,side});mesh(wing,wingGeo(side),hull);
  const spar=mesh(wing,cube,steel,side*1.84,-.05,.12,2.30,.07,.13);spar.rotation.y=-side*.38;
  const conduit=mesh(wing,cube,energy,side*2.0,.06,.27,2.15,.023,.045);conduit.rotation.y=-side*.38;
  const cannon=group('paired rail cannon '+side,wing,side*2.5,-.04,-.16);mesh(cannon,loft([[-1.3,.05,.06],[-.9,.14,.13],[.6,.16,.15],[.94,.11,.11]]),black);mesh(cannon,cube,energy,0,.145,-.17,.055,.026,1.35);const emitter=mesh(cannon,cylinder,core,0,0,-1.26,.080,.045,.080);emitter.rotation.x=Math.PI/2;
  mesh(ship,loft([[-.8,.12,.12],[.2,.36,.36],[1.9,.40,.40],[2.2,.28,.28]]),black,side*.70,-.13,.15);
  mesh(ship,ring,steel,side*.70,-.13,2.28,.31,.31,.31);const nozzle=group('idle reactor exhaust '+side,ship,side*.70,-.13,2.31);nozzles.push(nozzle);mesh(nozzle,sphere,energy,0,0,0,.225,.225,.08);mesh(nozzle,sphere,core,0,0,.06,.13,.13,.04);
  const fin=mesh(ship,cube,black,side*.77,.62,1.0,.11,.9,.72);fin.rotation.z=-side*.26;mesh(ship,cube,energy,side*.77,.99,1,.035,.04,.54);
 }
 // Landing braces and pads establish an actual weight-bearing contact at y=0.
 for(const[x,z]of[[-1.0,.72],[1.0,.72],[0,-2.12]]){const leg=group('extended landing assembly',root,x,0,z);mesh(leg,cube,rubber,0,.075,0,.50,.15,.72);mesh(leg,cube,steel,0,.19,0,.38,.08,.55);mesh(leg,cylinder,steel,0,.73,0,.055,1.05,.055);mesh(leg,cylinder,black,.10,.95,0,.080,.75,.080);mesh(leg,cube,hull,0,1.28,0,.35,.13,.28);mesh(leg,cube,energy,-.17,.22,0,.025,.035,.30);}
 const tier=Math.max(1,Math.min(5,Math.floor(Number.isFinite(level)?level:3)));
 for(let i=0;i<tier-1;i++)for(const side of[-1,1]){const p=group('weapon-level hull module '+i,ship,side*(1.0+i*.40),.03,-.25-i*.24);mesh(p,cube,black,0,0,0,.12,.12,.60);mesh(p,cube,energy,0,.076,-.10,.04,.025,.43);}
 // Keep articulated groups independent, combine fixed siblings by material.
 function batch(p){for(const c of [...p.children])if(c.isGroup)batch(c);const bins=new Map();for(const o of p.children)if(o.isMesh){if(!bins.has(o.material))bins.set(o.material,[]);bins.get(o.material).push(o);}for(const[m,list]of bins){if(list.length<2)continue;const pos=[],normal=[];for(const o of list){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);for(const x of g.attributes.position.array)pos.push(x);for(const x of g.attributes.normal.array)normal.push(x);g.dispose();p.remove(o);}const g=G(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normal,3));mesh(p,g,m);}}
 batch(root);
 function update(dt,time,{reducedMotion=false}={}){if(dead)return;const t=reducedMotion||!Number.isFinite(time)?0:time;for(const w of wings)w.g.rotation.z=w.side*(.36+Math.sin(t*.45)*.008);for(let i=0;i<nozzles.length;i++){const p=nozzles[i];const pulse=reducedMotion?1:1+Math.sin(t*2.1+i*.8)*.025;p.scale.setScalar(pulse);}energy.color.setRGB(.035,.50+tier*.025,.95+tier*.09);}
 function dispose(){if(dead)return;dead=true;root.removeFromParent();gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());root.clear();}
 update(0,0);return{root,update,dispose};
}
