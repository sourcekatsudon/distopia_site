import * as THREE from '../../vendor/three.module.js';
import {createRobot} from './robots.js';
import {createSurfaceKit} from './material-kit.js';

const MULTIPLIER={head:2,core:2.2,armor:1,limb:.8};
const NAMES={drone:'SCOUT DRONE',soldier:'EXECUTION SOLDIER',assassin:'RUSH ASSASSIN',sniper:'SNIPER UNIT',guardian:'SHIELD GUARDIAN',heavy:'HEAVY ENFORCER',turret:'SUPPRESSION TURRET'};
export function createCombatRobot(type,{seed=1,quality='high'}={}){
 if(!NAMES[type])type='soldier';const high=quality==='high',base=type==='turret'?null:createRobot(type==='drone'?'drone':type==='heavy'?'heavy':'soldier',{seed,quality});
 const root=base?base.root:new THREE.Group();root.name=NAMES[type];
 if(type==='drone'||type==='soldier'||type==='heavy'){
  const original=base.hitMeshes.slice(),hitMeshes=original.slice(),visible=new Map(),state={state:'IDLE',moving:false,stagger:0};let dead=false;root.traverse(o=>visible.set(o,o.visible));
  return{root,hitMeshes,update(dt,time,s={}){if(dead)return;s=s||{};state.state=s.state==='STAGGER'?'STAGGER':s.state==='TELEGRAPH'||s.state==='ATTACK'||(s.telegraph||0)>0?'ATTACK':s.state||'IDLE';state.moving=!!s.moving;state.stagger=s.stagger||0;base.update(Number.isFinite(dt)?Math.max(0,dt):0,Number.isFinite(time)?time:0,state);},reset(){if(dead)return;for(const[o,v]of visible)o.visible=v;root.visible=true;root.rotation.set(0,0,0);hitMeshes.splice(0,hitMeshes.length,...original);base.update(1,0,{moving:false,state:'IDLE'});},dispose(){if(dead)return;dead=true;base.dispose();}};
 }
 const hitMeshes=base?base.hitMeshes.slice():[],geometries=new Set(),materials=new Set(),shieldMeshes=new Set(),surface=type==='turret'?createSurfaceKit({quality}):null;let disposed=false;
 const G=g=>(geometries.add(g),g),M=m=>(materials.add(m),m),clone=key=>M(surface[key].clone());
 // Existing roles use the established model with no duplicate embellishment.
 const extra=new THREE.Group();extra.name=type+' role equipment';root.add(extra);
 const armor=surface?clone('anodized'):M(new THREE.MeshStandardMaterial({color:0x26333e,metalness:.72,roughness:.64})),steel=surface?clone('titanium'):M(new THREE.MeshStandardMaterial({color:0x697a87,metalness:.86,roughness:.43})),dark=surface?clone('skeleton'):M(new THREE.MeshStandardMaterial({color:0x0b131d,metalness:.65,roughness:.68}));
 for(const m of[armor,steel,dark]){m.normalMap=null;m.roughnessMap=null;m.metalnessMap=null;m.clearcoat=0;}
 const red=M(new THREE.MeshStandardMaterial({color:0x370308,emissive:0xff112b,emissiveIntensity:2.4,roughness:.3,metalness:.2}));
 const cube=G(new THREE.BoxGeometry(1,1,1)),cyl=G(new THREE.CylinderGeometry(1,1,1,high?14:8)),ball=G(new THREE.IcosahedronGeometry(1,1));
 const group=(name,parent=extra,x=0,y=0,z=0)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;};
 function mesh(g,m,p,x=0,y=0,z=0,part='',rx=0,ry=0,rz=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);p.add(o);if(part){o.userData={part,multiplier:MULTIPLIER[part]};hitMeshes.push(o);}return o;}
 const box=(p,m,x,y,z,w,h,d,part='',rx=0,ry=0,rz=0)=>{const o=mesh(cube,m,p,x,y,z,part,rx,ry,rz);o.scale.set(w,h,d);return o;};
 const tube=(p,m,x,y,z,r,length,part='',axis='z')=>{const o=mesh(cyl,m,p,x,y,z,part,axis==='z'?Math.PI/2:0,0,axis==='x'?Math.PI/2:0);o.scale.set(r,length,r);return o;};
 function rod(p,m,a,b,r,part='limb'){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av),o=mesh(cyl,m,p,0,0,0,part);o.position.copy(av).add(bv).multiplyScalar(.5);o.scale.set(r,delta.length(),r);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;}
 function plate(points,depth,m,p,x=0,y=0,z=0,part='armor'){const s=new THREE.Shape();points.forEach(([a,b],i)=>i?s.lineTo(a,b):s.moveTo(a,b));s.closePath();const g=G(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:high,bevelSize:.012,bevelThickness:.009,bevelSegments:1,curveSegments:1}));g.translate(0,0,-depth/2);return mesh(g,m,p,x,y,z,part);}
 const blades=[],spinners=[];let rifle=null,shield=null,shieldMaterial=null,headPivot=null,shieldActive=true;
 if(type==='assassin'){
  root.scale.set(.74,1.12,.78);
  for(const sign of[-1,1]){const b=group('exposed actuator and red blade '+sign,extra,sign*.48,1.43,.25);rod(b,steel,[0,.25,-.08],[0,-.28,.04],.036);tube(b,steel,0,-.08,.06,.065,.26,'limb','y');
   plate([[-.026,-.29],[.030,-.30],[.057,-.87],[0,-1.12],[-.047,-.78]],.025,red,b,0,0,.10,'limb');plate([[-.055,.14],[.06,.12],[.035,-.43],[-.038,-.53]],.04,steel,b,0,0,.02,'limb');blades.push({g:b,sign});
   plate([[0,0],[.09,.17],[.18,.51],[.05,.41],[-.02,.20]],.055,dark,extra,sign*.43,1.92,-.16,'armor').rotation.z=-sign*.46;
   rod(extra,steel,[sign*.19,1.11,-.16],[sign*.23,1.89,-.22],.035);box(extra,red,sign*.19,1.82,-.245,.026,.27,.035,'core');
  }
  const crest=plate([[-.035,0],[.035,0],[.025,.30],[0,.47],[-.025,.30]],.035,dark,extra,0,2.39,-.05,'armor');crest.rotation.x=-.25;
 }else if(type==='sniper'){
  root.scale.set(.88,1.03,.95);
  // Suppress the infantry's paired red lenses; the independent elevated monocular is the weak point.
  for(let i=hitMeshes.length-1;i>=0;i--){const m=hitMeshes[i];if(m.userData.part==='head'&&(m.material.emissive?.r||0)>.8){m.visible=false;hitMeshes.splice(i,1);}}
  rifle=group('long precision rifle',extra,.35,1.62,.12);
  box(rifle,dark,0,0,.25,.20,.17,.63,'limb');box(rifle,steel,0,.06,.52,.14,.045,.29,'limb');
  for(const sign of[-1,1]){box(rifle,armor,sign*.095,.01,.83,.055,.095,.85,'limb');box(rifle,red,sign*.10,.055,.92,.015,.012,.62,'limb');rod(extra,steel,[sign*.30,1.82,.06],[.35+sign*.10,1.57,.35],.035);}
  tube(rifle,steel,0,.01,1.38,.068,.39,'limb');tube(rifle,dark,0,.01,1.57,.046,.12,'limb');tube(rifle,red,0,.01,1.64,.027,.024,'limb');
  tube(rifle,dark,0,.17,.29,.075,.31,'limb');tube(rifle,red,0,.17,.47,.047,.016,'core');
  const optic=group('single targeting optic',extra,-.04,2.25,.28);tube(optic,dark,0,0,0,.105,.12,'head');tube(optic,red,0,0,.091,.057,.021,'head');
  rod(extra,dark,[-.38,1.93,-.19],[-.48,2.85,-.21],.016);box(extra,red,-.48,2.84,-.21,.045,.065,.045,'head');for(const o of [...optic.children]){o.position.add(optic.position);extra.add(o);}extra.remove(optic);
 }else if(type==='guardian'){
  root.scale.set(1.20,1.02,1.08);shield=group('front guardian energy shield',extra,-.05,1.29,.60);
  const outline=[[-.58,-.67],[-.69,-.40],[-.69,.48],[-.48,.70],[.48,.70],[.69,.48],[.69,-.40],[.58,-.67]];
  const frame=plate(outline,.09,dark,shield,0,0,0,'armor');frame.scale.set(1.05,1.05,1);shieldMeshes.add(frame);
  const faceShape=new THREE.Shape();outline.forEach(([x,y],i)=>i?faceShape.lineTo(x*.90,y*.90):faceShape.moveTo(x*.90,y*.90));faceShape.closePath();const faceG=G(new THREE.ShapeGeometry(faceShape));
  shieldMaterial=M(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,uniforms:{time:{value:0},strength:{value:1}},vertexShader:'varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 p;uniform float time,strength;void main(){vec2 v=p*vec2(11.,11.);vec2 period=vec2(1.73205,3.);vec2 a=mod(v,period)-period*.5,b=mod(v-vec2(.866025,1.5),period)-period*.5;vec2 h=dot(a,a)<dot(b,b)?a:b;vec2 q=abs(h);float d=max(q.x,dot(q,vec2(.5,.866025)));float edge=1.-smoothstep(.015,.065,abs(d-.866025));float pulse=.88+.12*sin(time*7.);gl_FragColor=vec4(1.30,.018,.07,(.10+edge*.44)*(.45+strength*.55)*pulse);}'}));
  const face=mesh(faceG,shieldMaterial,shield,0,0,.056,'armor');shieldMeshes.add(face);
  for(const sign of[-1,1]){const rail=box(shield,steel,sign*.61,.01,.065,.045,1.17,.05,'armor');shieldMeshes.add(rail);const light=box(shield,red,sign*.58,.02,.095,.019,.90,.02,'armor');shieldMeshes.add(light);rod(extra,steel,[sign*.37,1.70,.20],[sign*.36,1.25,.56],.045);}
  // The helmet and separate elevated optical port stay above the shield's top edge.
  tube(extra,dark,0,2.25,.27,.094,.12,'head');tube(extra,red,0,2.25,.345,.061,.026,'head');
 }else if(type==='turret'){
  const baseGroup=group('fixed tripod and lift mast');
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3,x=Math.sin(a),z=Math.cos(a);rod(baseGroup,steel,[x*.22,.72,z*.22],[x*.54,.31,z*.54],.055);rod(baseGroup,dark,[x*.54,.31,z*.54],[x*.76,.085,z*.76],.072);box(baseGroup,armor,x*.76,.055,z*.76,.31,.11,.40,'limb',0,a);const j=mesh(ball,steel,baseGroup,x*.54,.31,z*.54,'limb');j.scale.setScalar(.10);}
  tube(baseGroup,armor,0,.63,0,.40,.28,'armor','y');tube(baseGroup,steel,0,.88,0,.23,.31,'limb','y');tube(baseGroup,dark,0,1.08,0,.29,.14,'armor','y');
  headPivot=group('gimballed suppression head',extra,0,1.30,0);
  plate([[-.49,-.15],[-.39,.20],[-.14,.35],[.35,.32],[.51,.05],[.38,-.21],[-.31,-.25]],.55,armor,headPivot,0,0,0,'armor');
  box(headPivot,dark,0,.01,.31,.64,.24,.075,'armor');tube(headPivot,steel,0,.19,.34,.12,.09,'head');tube(headPivot,red,0,.19,.405,.074,.025,'head');
  tube(headPivot,dark,0,-.20,.14,.14,.14,'core');tube(headPivot,red,0,-.20,.225,.089,.025,'core');
  for(const sign of[-1,1]){const gun=group('rotating barrel cluster '+sign,headPivot,sign*.34,-.025,.44);for(let j=0;j<4;j++){const a=j*Math.PI/2;tube(gun,steel,Math.cos(a)*.067,Math.sin(a)*.067,.33,.027,.64,'limb');}for(const z of[.10,.57])tube(gun,dark,0,0,z,.115,.055,'armor');tube(gun,red,0,0,.68,.048,.025,'limb');spinners.push(gun);}
  for(const sign of[-1,1]){box(headPivot,dark,sign*.48,.09,-.05,.12,.30,.51,'armor');box(headPivot,red,sign*.548,.15,-.09,.018,.055,.26,'armor');}
 }
 // Only new equipment is batched. The existing robot's independently animated meshes are untouched.
 function batch(parent){for(const child of [...parent.children])if(child.isGroup)batch(child);const bins=new Map();for(const o of parent.children)if(o.isMesh){const key=o.material.uuid+':'+(o.userData.part||'');if(!bins.has(key))bins.set(key,[]);bins.get(key).push(o);}for(const list of bins.values()){if(list.length<2)continue;const arrays={position:[],normal:[],uv:[]};let isShield=false;for(const o of list){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);for(const key in arrays){const a=g.getAttribute(key);if(a)for(const v of a.array)arrays[key].push(v);}g.dispose();parent.remove(o);const i=hitMeshes.indexOf(o);if(i>=0)hitMeshes.splice(i,1);if(shieldMeshes.delete(o))isShield=true;}const g=G(new THREE.BufferGeometry());for(const key in arrays)if(arrays[key].length)g.setAttribute(key,new THREE.Float32BufferAttribute(arrays[key],key==='uv'?2:3));const o=new THREE.Mesh(g,list[0].material);o.userData={...list[0].userData};parent.add(o);if(o.userData.part)hitMeshes.push(o);if(isShield)shieldMeshes.add(o);}}
 batch(extra);const initialHits=hitMeshes.slice(),initialVisibility=new Map();root.traverse(o=>initialVisibility.set(o,o.visible));
 const forwarded={state:'IDLE',moving:false,stagger:0};let aim=0,lastShieldHP=90;
 function setShield(on){if(!shield||on===shieldActive)return;shieldActive=on;shield.visible=on;for(const m of shieldMeshes){m.visible=on;const i=hitMeshes.indexOf(m);if(on&&i<0)hitMeshes.push(m);if(!on&&i>=0)hitMeshes.splice(i,1);}}
 function update(dt,time,state={}){if(disposed)return;state=state||{};dt=Number.isFinite(dt)?Math.max(0,dt):0;time=Number.isFinite(time)?time:0;const warn=state.state==='TELEGRAPH'||state.state==='ATTACK'||(state.telegraph||0)>0;aim+=(Number(warn)-aim)*Math.min(1,dt*9);forwarded.state=state.state==='STAGGER'?'STAGGER':warn?'ATTACK':state.state||'IDLE';forwarded.moving=!!state.moving;forwarded.stagger=state.stagger||0;base?.update(dt,time,forwarded);
  red.emissiveIntensity=2.1+aim*2.2+Math.sin(time*(warn?18:3)+seed)*.18;
  for(const b of blades){b.g.rotation.x=-.15-aim*.85;b.g.rotation.z=b.sign*(.08+Math.sin(time*8)*.025*(state.moving?1:0));}
  if(rifle)rifle.rotation.x=-.04-aim*.09;if(headPivot)headPivot.rotation.x=-aim*.10;for(let i=0;i<spinners.length;i++)spinners[i].rotation.z+=dt*(1.4+aim*22)*(i%2?-1:1);
  if(shield){lastShieldHP=Number.isFinite(state.shieldHP)?Math.max(0,state.shieldHP):90;setShield(lastShieldHP>0);shieldMaterial.uniforms.time.value=time;shieldMaterial.uniforms.strength.value=Math.min(1,lastShieldHP/90);}
 }
 function reset(){if(disposed)return;root.visible=true;root.rotation.set(0,0,0);for(const[o,v]of initialVisibility)o.visible=v;hitMeshes.splice(0,hitMeshes.length,...initialHits);shieldActive=true;if(shield)shield.visible=true;lastShieldHP=90;aim=0;base?.update(1,0,{moving:false,state:'IDLE'});update(0,0,{moving:false,state:'IDLE',shieldHP:90});}
 function dispose(){if(disposed)return;disposed=true;extra.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());surface?.dispose();base?.dispose();root.removeFromParent();root.clear();}
 return{root,hitMeshes,update,reset,dispose};
}
