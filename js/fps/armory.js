import * as THREE from '../../vendor/three.module.js';
import {createRailgun} from './weapon.js';
import {createCompactWeapon} from './compact-weapons.js';
import {weaponDefinition} from './weapon-defs.js';

// Render facade only: gameplay state and progression remain in the controller.
export function createWeaponModel(level=1,{quality='high'}={}){
 const definition=weaponDefinition(level),model=definition.level<3?createCompactWeapon(definition.level,{quality}):createRailgun({quality});
 const evolution=definition.level>3?createEvolution(model.root,definition.level,quality):null;
 const forwarded={time:0,speed:0,sprinting:false,charge:0,energy:100,reload:-1,reducedMotion:false,deploy:1,grounded:true},number=(v,f)=>Number.isFinite(v)?v:f;let disposed=false;
 return{root:model.root,muzzle:model.muzzle,
  prepare(){if(!disposed)model.prepare?.();},
  fire(power=1){if(disposed)return;model.fire(power);evolution?.fire(power);},
  update(dt,state={}){if(disposed)return;state=state||{};dt=Math.max(0,number(dt,0));forwarded.time=number(state.time,0);forwarded.speed=number(state.speed,0);forwarded.sprinting=!!state.sprinting;forwarded.charge=definition.charge?Math.max(0,Math.min(1,number(state.charge,0))):0;forwarded.energy=definition.level<3?Math.max(0,Math.min(definition.capacity,number(state.energy,definition.capacity))):Math.max(0,Math.min(100,number(state.energy,definition.capacity)/definition.capacity*100));forwarded.reload=number(state.reload,-1);forwarded.reducedMotion=!!state.reducedMotion;forwarded.deploy=Math.max(0,Math.min(1,number(state.deploy,1)));forwarded.grounded=state.grounded!==false;model.update(dt,forwarded);evolution?.update(dt,forwarded);},
  inspect(){return{...model.inspect(),level:definition.level,id:definition.id,capacity:definition.capacity,evolution:evolution?.inspect()??null};},
  dispose(){if(disposed)return;disposed=true;evolution?.dispose();model.dispose();},
 };
}

function createEvolution(root,level,quality){
 const rig=root.getObjectByName('recoil cradle')||root,high=quality==='high',omega=level===5,geometries=new Set(),materials=new Set(),instances=[],rings=[],panels=[],mounted=new THREE.Group();mounted.name=omega?'OMEGA / triple phase accelerator':'EX / dual reactor accelerator';rig.add(mounted);
 const originalReactor=root.getObjectByName('exposed blue reactor and radiating energy streams');if(originalReactor&&omega)originalReactor.scale.setScalar(1.12);
 const G=g=>(geometries.add(g),g),M=m=>(materials.add(m),m),steel=M(new THREE.MeshStandardMaterial({color:0x536775,metalness:.85,roughness:.42})),dark=M(new THREE.MeshStandardMaterial({color:0x10202d,metalness:.78,roughness:.64})),glow=M(new THREE.MeshBasicMaterial({color:new THREE.Color(.035,.45,1.15),toneMapped:false})),white=M(new THREE.MeshBasicMaterial({color:new THREE.Color(.18,.74,1.35),toneMapped:false}));
 const mesh=(g,m,p,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);p.add(o);return o;};
 const cube=G(new THREE.BoxGeometry(1,1,1)),outerG=G(new THREE.TorusGeometry(.124,.018,5,high?24:12)),innerG=G(new THREE.TorusGeometry(.095,.009,5,high?22:12,Math.PI*1.55)),coreG=G(new THREE.IcosahedronGeometry(.039,1)),sleeveG=G(new THREE.CylinderGeometry(.09,.09,.09,high?12:8));
 const auxCount=omega?2:1;
 for(let i=0;i<auxCount;i++){
  const reactor=new THREE.Group();reactor.name='auxiliary phase reactor '+(i+2);reactor.position.set(-.31,.205,-.43-i*.52);mounted.add(reactor);reactor.rotation.y=-Math.PI/2;
  mesh(sleeveG,dark,reactor,0,0,-.025,Math.PI/2);mesh(outerG,steel,reactor);const a=mesh(innerG,glow,reactor,0,0,.022,.24),b=mesh(innerG,white,reactor,0,0,.039,-.32,0,.8);b.scale.setScalar(.71);mesh(coreG,white,reactor,0,0,.040);rings.push({a,b,reactor});
  for(let k=0;k<4;k++){const f=mesh(cube,dark,reactor,Math.cos(k*Math.PI/2)*.125,Math.sin(k*Math.PI/2)*.125,-.015,0,0,k*Math.PI/2);f.scale.set(.055,.035,.075);}
 }
 // Additional accelerator hardware has a dark structural shell and emissive inset.
 const collarG=G(new THREE.TorusGeometry(.285,.013,4,high?16:10,Math.PI*.43)),limiterCount=omega?12:6,limiters=new THREE.InstancedMesh(collarG,glow,limiterCount);limiters.name='evolved instanced phase limiters';limiters.instanceMatrix.setUsage(THREE.DynamicDrawUsage);limiters.frustumCulled=false;mounted.add(limiters);instances.push(limiters);const dummy=new THREE.Object3D();
 const points=[[-.09,-.02],[.08,-.035],[.13,.02],[.07,.07],[-.08,.075]],shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const panelG=G(new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:1,curveSegments:1}));panelG.translate(0,0,-.0225);
 for(const sign of[-1,1])for(let i=0;i<(omega?3:2);i++){const hinge=new THREE.Group();hinge.name='evolved expanding armor '+sign+'/'+i;hinge.position.set(sign*.19,.115,-.14-i*.25);mounted.add(hinge);mesh(panelG,dark,hinge,sign*.06,0,0,0,Math.PI/2);const l=mesh(cube,glow,hinge,sign*.085,.057,-.01);l.scale.set(.012,.014,.14);panels.push({hinge,sign,i});}
 // A larger open muzzle assembly only on Ω; it never fills the central bore.
 if(omega)for(let i=0;i<4;i++){const prong=new THREE.Group();prong.position.z=-1.97;prong.rotation.z=Math.PI/4+i*Math.PI/2;mounted.add(prong);const a=mesh(cube,steel,prong,0,.20,-.035,.18);a.scale.set(.07,.095,.30);const b=mesh(cube,white,prong,0,.151,-.09);b.scale.set(.034,.015,.25);}
 const streams=omega?8:4,steps=high?7:4,segments=streams*steps,positions=new Float32Array(segments*12),uv=new Float32Array(segments*8),index=new Uint16Array(segments*6);
 for(let i=0;i<segments;i++){const k=i*4,j=i%steps;uv.set([0,j/steps,1,j/steps,0,(j+1)/steps,1,(j+1)/steps],i*8);index.set([k,k+1,k+2,k+1,k+3,k+2],i*6);}
 const streamG=G(new THREE.BufferGeometry());streamG.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));streamG.setAttribute('uv',new THREE.BufferAttribute(uv,2));streamG.setIndex(new THREE.BufferAttribute(index,1));
 const uniform={time:{value:0},charge:{value:0},heat:{value:0},strength:{value:1}},streamM=M(new THREE.ShaderMaterial({uniforms:uniform,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float time,charge,heat,strength;void main(){float edge=pow(max(0.,1.-abs(v.x*2.-1.)),1.7);float wave=pow(.5+.5*sin(v.y*65.-time*(8.+charge*15.)),7.);float a=edge*(.12+wave*.4+charge*.26+heat*.4)*sin(v.y*3.14159)*strength;gl_FragColor=vec4(.04,.42+charge*.25,1.25+heat*.5,a);}'}));const streamMesh=new THREE.Mesh(streamG,streamM);streamMesh.frustumCulled=false;streamMesh.name='whole weapon evolved energy streams';mounted.add(streamMesh);
 // Only fixed siblings are combined: the two gyro rings and articulated shutters stay separate.
 const animated=new Set(rings.flatMap(r=>[r.a,r.b]));animated.add(limiters);animated.add(streamMesh);
 function batch(parent){for(const child of [...parent.children])if(child.isGroup)batch(child);const bins=new Map();for(const o of parent.children)if(o.isMesh&&!animated.has(o)){if(!bins.has(o.material))bins.set(o.material,[]);bins.get(o.material).push(o);}for(const[m,list]of bins){if(list.length<2)continue;const arrays={position:[],normal:[],uv:[]};for(const o of list){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);for(const k in arrays){const a=g.getAttribute(k);if(a)for(const v of a.array)arrays[k].push(v);}g.dispose();parent.remove(o);}const g=G(new THREE.BufferGeometry());for(const k in arrays)g.setAttribute(k,new THREE.Float32BufferAttribute(arrays[k],k==='uv'?2:3));mesh(g,m,parent);}}
 batch(mounted);
 let heat=0,dead=false,lastCharge=0,lastTime=0;
 function fire(power=1){if(dead)return;heat=Math.min(1.4,.5+(Number.isFinite(power)?power:1)*.15);}
 function update(dt,s){if(dead)return;dt=Number.isFinite(dt)?Math.max(0,dt):0;heat*=Math.exp(-dt*8);const t=s.reducedMotion?0:(Number.isFinite(s.time)?s.time:0),ch=Math.max(0,Math.min(1,s.charge||0)),rp=s.reload??-1,power=rp>=0?.12:Math.max(.30,(s.energy??100)/100);lastTime=t;lastCharge=ch;
  for(let i=0;i<rings.length;i++){const r=rings[i];r.a.rotation.z=t*(.8+ch*5)*(i%2?-1:1);r.b.rotation.z=-t*(1.2+ch*7);r.reactor.position.y=.205+Math.sin(t*1.4+i)*.006;}
  for(let i=0;i<limiterCount;i++){const row=Math.floor(i/3),part=i%3;dummy.position.set(0,0,-.64-row*(omega?.29:.45)-ch*.055+Math.sin(t*2+row)*.025);dummy.rotation.set(0,0,part*Math.PI*2/3+t*(.22+ch*1.9)*(row%2?-1:1));dummy.scale.setScalar(1-(row%3)*.035+ch*.03);dummy.updateMatrix();limiters.setMatrixAt(i,dummy.matrix);}limiters.instanceMatrix.needsUpdate=true;
  for(const p of panels)p.hinge.rotation.z=p.sign*(.04+ch*(omega?.65:.42)+heat*.18+Math.sin(t*2+p.i)*.008);
  glow.color.setRGB(.025,(.35+ch*.25+heat*.2)*power,(1.0+ch*.5+heat*.35)*power);white.color.setRGB(.16*power,(.62+ch*.15)*power,(1.3+ch*.4+heat*.25)*power);
  uniform.time.value=t;uniform.charge.value=ch;uniform.heat.value=heat;uniform.strength.value=power;
  let n=0;for(let i=0;i<streams;i++){const phase=i*2.399963;for(let j=0;j<steps;j++){for(let end=0;end<2;end++){const u=(j+end)/steps,a=phase+u*2.7+t*(.35+ch*.6),x=-.225+Math.cos(a)*(.045+ch*.025),y=.105+Math.sin(a)*(.095+ch*.03),z=.27-u*2.23,offset=.0035+ch*.003+heat*.003;positions[n++]=x;positions[n++]=y-offset;positions[n++]=z;positions[n++]=x;positions[n++]=y+offset;positions[n++]=z;}}}streamG.attributes.position.needsUpdate=true;
 }
 function dispose(){if(dead)return;dead=true;mounted.removeFromParent();instances.forEach(o=>o.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());mounted.clear();}
 const initial={time:0,charge:0,energy:100,reload:-1,reducedMotion:false};update(0,initial);
 return{update,fire,dispose,inspect:()=>({level,auxReactors:auxCount,totalReactors:auxCount+1,limiterInstances:limiterCount,expandingPanels:panels.length,streams,segments,heat,charge:lastCharge,motionTime:lastTime,disposed:dead})};
}
