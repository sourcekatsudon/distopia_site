import * as THREE from '../../vendor/three.module.js';
import {createMaterials} from './materials.js';
import {circleBlocked} from './simulation.js';
import {SEGMENTS,SPAWN,HANGAR_Z,ENTRY_TERMINAL,SEGMENT_COUNT,segmentAt,segmentLayout} from './campaign-layout.js';

// Bounded, deterministic near-field stream. The far facility is never resident.
export function createCampaignWorld({scene,quality='high',seed=731}={}){
 const high=quality==='high',low=quality==='low',root=new THREE.Group();root.name='ASCENSION / streamed industrial spine';scene?.add(root);
 const M=createMaterials(seed,quality),geometries=new Set(),textures=new Set(),ownedMaterials=new Set(),loaded=new Map(),layouts=new Map();
 const colliders=[],navNodes=[],destructibles=[],entries=[],segments=SEGMENTS;
 let dead=false,current=-1,builds=0,unloads=0,navVersion=0,playerZ=8;
 const ownGeo=g=>(geometries.add(g),g),ownMat=m=>(ownedMaterials.add(m),m),box=ownGeo(new THREE.BoxGeometry(1,1,1)),cylinder=ownGeo(new THREE.CylinderGeometry(1,1,1,high?16:8)),torus=ownGeo(new THREE.TorusGeometry(1,.035,5,high?40:20)),sphere=ownGeo(new THREE.SphereGeometry(1,high?12:6,high?8:4));
 const panelShape=new THREE.Shape();[[-.44,-.5],[.44,-.5],[.5,-.38],[.5,.38],[.39,.5],[-.39,.5],[-.5,.38],[-.5,-.38]].forEach(([x,y],i)=>i?panelShape.lineTo(x,y):panelShape.moveTo(x,y));panelShape.closePath();
 const panel=ownGeo(new THREE.ExtrudeGeometry(panelShape,{depth:1,bevelEnabled:!low,bevelSize:.015,bevelThickness:.01,bevelSegments:1}));panel.translate(0,0,-.5);
 const windowMaterial=ownMat(new THREE.ShaderMaterial({toneMapped:false,uniforms:{time:{value:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float time;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 p=v*vec2(90.,40.),cell=floor(p);float star=step(.984,hash(cell))*(1.-smoothstep(.03,.11,length(fract(p)-.5)));float nebula=.014+.016*sin(v.y*8.+v.x*4.);vec3 c=vec3(.012,.024,.040)+vec3(.08,.14,.23)*nebula+vec3(.55,.75,1.)*star*(.65+.15*sin(time*.3+hash(cell)*15.));gl_FragColor=vec4(c,1.);}'}));
 const windowGeo=ownGeo(new THREE.PlaneGeometry(1,1));
 const steamCanvas=document.createElement('canvas');steamCanvas.width=steamCanvas.height=64;const sg=steamCanvas.getContext('2d'),grad=sg.createRadialGradient(32,32,1,32,32,32);grad.addColorStop(0,'rgba(143,159,173,.34)');grad.addColorStop(1,'rgba(143,159,173,0)');sg.fillStyle=grad;sg.fillRect(0,0,64,64);const steamTexture=new THREE.CanvasTexture(steamCanvas);textures.add(steamTexture);
 const steamMaterial=ownMat(new THREE.SpriteMaterial({map:steamTexture,color:0x8292a2,transparent:true,opacity:.12,depthWrite:false}));
 const dustMaterial=ownMat(new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'uniform float time;varying float f;void main(){vec3 p=position;p.y+=sin(time*.2+position.x)*.16;p.x+=sin(time*.13+position.z)*.18;vec4 c=modelViewMatrix*vec4(p,1.);f=clamp(1.-length(c.xyz)/65.,0.,1.)*.18;gl_PointSize=1.5;gl_Position=projectionMatrix*c;}',fragmentShader:'varying float f;void main(){gl_FragColor=vec4(.45,.59,.68,f*(1.-smoothstep(.1,.5,length(gl_PointCoord-.5))));}'}));
 const practicals=Array.from({length:low?1:2},(_,i)=>{const l=new THREE.PointLight(i?0x6aa3c0:0xff1e36,i?8:12,24,2);root.add(l);return l;});
 const dummy=new THREE.Object3D(),entryDummy=new THREE.Object3D();
 function layout(index){if(!layouts.has(index))layouts.set(index,segmentLayout(index));return layouts.get(index);}
 function addMesh(parent,g,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(rx,ry,rz);parent.add(mesh);return mesh;}
 function build(index){
  const data=layout(index),s=data.s,group=new THREE.Group();group.name=s.id+' / '+s.name;root.add(group);
  const bins=new Map(),instances=[],localGeos=[],localMats=[],localTextures=[],bays=[],rotors=[],steam=[];
  const add=(g,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{const key=g.uuid+':'+m.uuid;if(!bins.has(key))bins.set(key,{g,m,list:[]});bins.get(key).list.push([x,y,z,sx,sy,sz,rx,ry,rz]);};
  const hw=s.halfWidth,H=s.height,mid=(s.startZ+s.endZ)/2;
  add(box,M.dark,0,-.16,mid,hw*2,.3,80);add(box,M.dark,0,H+.14,mid,hw*2+.8,.28,80);if(index===0){add(box,M.metal,0,-.01,s.startZ+3,hw*2,.05,6);add(box,M.dark,0,H+.14,s.startZ+3,hw*2+.8,.28,6);}
  // Slotted metallic floor slabs with black seams and protected overhead gantries.
  const cols=Math.ceil(hw*2/3),tileWidth=hw*2/cols;
  for(let z=s.startZ-2;z>s.endZ;z-=4)for(let x=0;x<cols;x++)add(box,M.metal,-hw+(x+.5)*tileWidth,.015,z,tileWidth-.12,.05,3.82);
  for(let z=s.startZ-4;z>s.endZ;z-=10){add(box,M.edge,0,H-.30,z,hw*2,.32,.45);for(const side of[-1,1]){add(box,M.dark,side*(hw-.40),H*.5,z,.60,H,.64);add(box,M.red,side*(hw-.73),H*.58,z+.34,.045,H*.36,.04);}}
  for(const b of data.staticBoxes){const x=(b.minX+b.maxX)/2,z=(b.minZ+b.maxZ)/2,w=b.maxX-b.minX,d=b.maxZ-b.minZ,h=b.maxY-b.minY,y=b.minY+h/2;
   add(box,M.dark,x,y,z,w,h,d);
   if(b.tag.startsWith('outer')){for(let zz=s.startZ-2;zz>s.endZ;zz-=4){const side=x<0?-1:1;add(panel,M.metal,side*(hw-.008),Math.min(H*.43,3.1),zz,3.75,Math.min(H*.70,5.5),.065,0,side*Math.PI/2);add(box,M.edge,side*(hw-.12),H-.8,zz,.15,.15,3.70);add(box,M.red,side*(hw-.06),.85,zz,.04,.05,.8);}}
   else if(b.tag.includes('baffle')){for(const sign of[-1,1]){add(box,M.metal,x,y,z+sign*(d/2+.025),Math.max(.1,w-.12),Math.max(.1,h-.13),.05);for(let u=-w/2+.22;u<w/2;u+=.75)add(box,M.edge,x+u,y,z+sign*(d/2+.065),.04,h-.25,.055);add(box,M.hazard,x,.30,z+sign*(d/2+.075),w,.32,.035);add(box,M.red,x,Math.min(h-.3,3.7),z+sign*(d/2+.08),Math.min(w,1.5),.055,.035);}}
   else if(b.tag.startsWith('transfer')){add(box,M.edge,x,b.minY+.12,z+.56,w,.24,.10);if(b.minY===0){add(box,M.red,x-w/2+.10,2.1,z+.56,.06,4,.07);add(box,M.red,x+w/2-.10,2.1,z+.56,.06,4,.07);}}
   else if(b.tag==='homepage-terminal-desk'){add(box,M.edge,x,.97,z+.03,3.2,.07,1.38);add(box,M.cyan,x,1.015,z+.72,2.8,.025,.035);add(box,M.dark,x,1.03,z+.35,1,.025,.35);for(const side of[-1,1])add(box,M.edge,x+side*1.35,.44,z,.09,.86,.9);add(cylinder,M.edge,x,1.10,z-.25,.07,.30,.07);}else if(b.tag==='homepage-terminal-monitor'){add(box,M.screen,x,ENTRY_TERMINAL.screenY,ENTRY_TERMINAL.screenZ,1.55,.85,.02);add(box,M.cyan,x,1.14,z+.09,1.48,.025,.025);}else if(b.tag.startsWith('terminal-kiosk')){add(box,M.screen,x,1.52,z+.615,.99,.70,.035);add(box,M.cyan,x,.94,z+.63,1.0,.04,.04);add(box,M.edge,x,2.12,z,1.30,.09,1.25);}
  }
  for(const side of[-1,1]){
   // Long trunks, radiator flanges, exposed cable trays and duct throats.
   add(cylinder,M.metal,side*(hw-1.20),H-1.05,mid,.40,79,.40,Math.PI/2);
   add(box,M.dark,side*(hw-2.15),H-.65,mid,.75,.70,79);
   for(let z=s.startZ-5;z>s.endZ;z-=8){add(torus,M.edge,side*(hw-1.20),H-1.05,z,.47,.47,.47);for(let k=0;k<4;k++)add(box,M.edge,side*(hw-2.15),H-1.025,z-.45+k*.23,.62,.028,.045);}
   for(let k=0;k<3;k++)add(cylinder,M.dark,side*(hw-.17),2.8+k*.18,mid,.045,79,.045,Math.PI/2);
   add(box,M.edge,side*(hw-.28),.18,mid,.12,.14,79);
   for(let z=s.startZ-4;z>s.endZ;z-=6)add(box,side<0?M.cyan:M.red,side*(hw-.35),.26,z,.04,.035,1.9);
   for(let z=s.startZ-10;z>s.endZ;z-=20){add(box,M.dark,side*(hw-.5),3.6,z,.45,.26,.6,0,0,side*.15);add(box,M.red,side*(hw-.72),3.58,z+.3,.09,.04,.035);}
  }
  // Bay shutters stand clear of the gameplay spawn anchor and open on signal.
  for(const e of data.entries){add(box,M.dark,e.x,2.1,e.z-.88,2.75,4.2,.18);add(box,M.edge,e.x,4.25,e.z-.62,2.9,.15,.38);for(const side of[-1,1]){add(box,M.edge,e.x+side*1.35,2.1,e.z-.58,.14,4.2,.35);add(box,M.red,e.x+side*1.24,2.1,e.z-.36,.04,3.8,.04);}bays.push({...e,life:0,open:0});}
  let doorInstances=null;
  if(bays.length){doorInstances=new THREE.InstancedMesh(box,M.metal,bays.length*2);doorInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);doorInstances.frustumCulled=false;doorInstances.castShadow=true;doorInstances.receiveShadow=true;group.add(doorInstances);instances.push(doorInstances);}
  function updateBays(dt){if(!doorInstances)return;for(let i=0;i<bays.length;i++){const e=bays[i];e.life=Math.max(0,e.life-dt);e.open+=((e.life>0?1:0)-e.open)*Math.min(1,dt*5);for(let j=0;j<2;j++){entryDummy.position.set(e.x+(j?1:-1)*(.60+e.open*1.3),2.04,e.z-.70);entryDummy.scale.set(1.15,4.0,.16);entryDummy.rotation.set(0,0,0);entryDummy.updateMatrix();doorInstances.setMatrixAt(i*2+j,entryDummy.matrix);}}doorInstances.instanceMatrix.needsUpdate=true;}
  updateBays(0);
  if(s.kind==='terminal'){
   for(const side of[-1,1])for(let z=s.startZ-18;z>s.endZ+8;z-=24){add(box,M.dark,side*(hw-.72),1.35,z,.85,2.7,1.4);add(box,M.screen,side*(hw-.72),1.66,z+.72,.68,.82,.03);add(box,M.cyan,side*(hw-.72),.52,z+.73,.55,.06,.03);}
  }
  if(s.kind==='machine'||s.kind==='reactor'){
   for(const side of[-1,1]){const x=side*(hw-(s.kind==='reactor'?3:1.6)),z=s.startZ-47;
    if(s.kind==='reactor'){add(cylinder,M.dark,x,H*.44,z,1.4,H*.86,1.4);add(cylinder,M.reactor,x,H*.44,z,1.05,H*.83,1.05);for(let y=1;y<H-1;y+=2){add(torus,M.edge,x,y,z,1.75,1.75,1.75,Math.PI/2);add(box,M.edge,x,y,z,3.5,.10,3.5);}const rotor=addMesh(group,torus,M.edge,x,H*.58,z,2.05,2.05,2.05,.45,0,.1);rotors.push(rotor);}
    else{add(cylinder,M.dark,x,1.8,z,1.2,3.6,1.2);add(cylinder,M.metal,x,2,z,1.26,.18,1.26);add(torus,M.red,x,2.5,z,1.1,1.1,1.1,Math.PI/2);for(let n=0;n<8;n++){const a=n*Math.PI/4;add(box,M.edge,x+Math.cos(a)*1.1,1.8,z+Math.sin(a)*1.1,.11,2.8,.11,0,-a);}}
   }
   add(box,M.dark,0,H-1.1,s.startZ-47,hw*2,.55,.75);add(torus,M.edge,0,H-2.6,s.startZ-47,3,3,3);
   const w=addMesh(group,windowGeo,windowMaterial,hw-.025,H*.55,s.startZ-66,17,Math.min(5,H*.46),1,0,-Math.PI/2);w.name='observation / exterior void';
   for(const z of[s.startZ-57.5,s.startZ-74.5])add(box,M.edge,hw-.13,H*.55,z,.16,Math.min(5,H*.46)+.25,.15);
  }
  if(s.kind==='warehouse')for(const side of[-1,1]){const x=side*(hw-.7);for(const z of[s.startZ-43,s.startZ-47,s.startZ-51])add(box,M.edge,x,2.6,z,1.4,5.2,.12);for(const y of[.1,1.8,3.5,5.1])add(box,M.metal,x,y,s.startZ-47,1.5,.12,9.2);for(let n=0;n<6;n++)add(box,M.dark,x,1.0+(n%2)*1.8,s.startZ-44-Math.floor(n/2)*3,.95,1.45,2.55);}
  if(s.kind==='security')for(const side of[-1,1]){const x=side*(hw-.6);for(let n=0;n<4;n++){const z=s.startZ-7-n*16;add(box,M.dark,x,1.9,z,.70,3.8,1.3);add(box,M.control,x-side*.37,1.9,z,.035,1.1,1.0);add(box,M.red,x-side*.39,.5,z,.04,.08,.85);}}
  if(s.kind==='hangar'){
   // Flat docking deck: heightAt stays0 and player traversal cannot hit phantom steps.
   add(box,M.metal,0,.06,HANGAR_Z,16,.10,18);add(torus,M.cyan,0,.13,HANGAR_Z,8,8,8,Math.PI/2);add(torus,M.edge,0,.12,HANGAR_Z,9,9,9,Math.PI/2);
   for(const side of[-1,1]){for(const z of[s.startZ-15,s.startZ-40,s.startZ-65]){add(box,M.edge,side*15,.7,z,2,1.4,2);add(box,M.cyan,side*15,4,z,1.56,.09,1.56);add(box,M.dark,side*15,8,z,2,1,2);}add(box,M.cyan,side*6.8,.14,HANGAR_Z,.16,.04,18);add(box,M.hazard,side*8.3,.14,HANGAR_Z,.7,.04,18);add(box,M.edge,side*7.5,2.5,HANGAR_Z-3,.45,5,.5);add(box,M.cyan,side*7.25,2.5,HANGAR_Z-3,.04,3.8,.52);}
   addMesh(group,windowGeo,windowMaterial,0,8,s.endZ+.03,37,13,1);
   add(box,M.edge,0,14.8,s.endZ+.15,40,.55,.25);for(const side of[-1,1])add(box,M.edge,side*18.6,8,s.endZ+.18,.50,13.5,.25);
   for(let z=s.startZ-5;z>s.endZ;z-=10){add(box,M.edge,0,H-.6,z,38,.50,.70);add(box,M.cyan,0,H-.9,z,7,.035,.12);}
  }
  // One legible distance/sector plate per segment; disposed with its stream chunk.
  const c=document.createElement('canvas');c.width=low?256:512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#09131c';ctx.fillRect(0,0,c.width,128);ctx.fillStyle=s.kind==='hangar'?'#71d5ed':'#c24d5b';ctx.fillRect(0,0,c.width,6);ctx.font='bold '+(low?21:32)+'px monospace';ctx.fillStyle='#b5d0db';ctx.fillText(String(index+1).padStart(2,'0')+' / '+s.name,12,47);ctx.font=(low?15:22)+'px monospace';ctx.fillStyle='#7797a9';ctx.fillText(String(Math.max(0,Math.round(8-s.startZ))).padStart(4,'0')+' m  >  ASCENSION / '+(SEGMENT_COUNT*80)+' m',12,86);ctx.fillStyle='#567785';ctx.fillRect(12,104,c.width-24,2);
  const signTexture=new THREE.CanvasTexture(c);signTexture.colorSpace=THREE.SRGBColorSpace;localTextures.push(signTexture);const signMaterial=new THREE.MeshStandardMaterial({map:signTexture,emissiveMap:signTexture,emissive:0xffffff,emissiveIntensity:.32,roughness:.65});localMats.push(signMaterial);addMesh(group,windowGeo,signMaterial,0,Math.min(H-1,4.1),s.startZ-1.3,4.8,1.2,1);
  // Only the chunk's local dust/steam buffers are resident. No light per device.
  let rand=(seed+index*2917)>>>0;const random=()=>((rand=Math.imul(rand,1664525)+1013904223>>>0)/4294967296),dust=[];
  for(let n=0;n<(high?110:36);n++)dust.push((random()-.5)*hw*2,.4+random()*(H-1),s.endZ+random()*80);
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(dust,3));localGeos.push(dustGeo);group.add(new THREE.Points(dustGeo,dustMaterial));
  for(let n=0;n<(low?1:3);n++){const sprite=new THREE.Sprite(steamMaterial);sprite.position.set((n%2?-1:1)*(hw-2.5),1+n*.5,s.startZ-35-n*12);sprite.scale.set(2.4,1.8,1);group.add(sprite);steam.push({sprite,baseY:sprite.position.y,phase:n*.7});}
  for(const {g,m,list}of bins.values()){const im=new THREE.InstancedMesh(g,m,list.length);for(let i=0;i<list.length;i++){const p=list[i];dummy.position.set(p[0],p[1],p[2]);dummy.scale.set(p[3],p[4],p[5]);dummy.rotation.set(p[6],p[7],p[8]);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);}im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();im.castShadow=m!==M.red&&m!==M.cyan&&m!==M.screen&&m!==M.control&&m!==M.reactor;im.receiveShadow=true;group.add(im);instances.push(im);}
  const chunk={index,group,data,bays,instances,localGeos,localMats,localTextures,update(dt,time){updateBays(dt);for(let i=0;i<rotors.length;i++)rotors[i].rotation.z=time*(i%2?-.22:.22);for(const e of steam){e.sprite.position.y=e.baseY+Math.sin(time*.3+e.phase)*.3;e.sprite.position.x+=(Math.sin(time*.7+e.phase)*dt*.015);}},dispose(){group.removeFromParent();for(const im of instances)im.dispose();localGeos.forEach(g=>g.dispose());localMats.forEach(m=>m.dispose());localTextures.forEach(t=>t.dispose());group.clear();}};
  loaded.set(index,chunk);builds++;return chunk;
 }
 function refreshArrays(){colliders.length=destructibles.length=entries.length=0;for(const chunk of loaded.values()){colliders.push(...chunk.data.staticBoxes);destructibles.push(...chunk.data.destructibles);for(const d of chunk.data.destructibles)colliders.push(d.collider);entries.push(...chunk.data.entries);}}
 function refreshNavigation(){
  navNodes.length=0;if(dead)return;const rows=[];
  for(const index of [...loaded.keys()].sort((a,b)=>a-b)){const s=SEGMENTS[index],xs=[-4.5,-1.75,0,4.5];for(let x=-s.halfWidth+1;x<s.halfWidth;x+=3)xs.push(Math.round(x*100)/100);const sorted=[...new Set(xs)].sort((a,b)=>a-b);for(let z=s.startZ-2;z>s.endZ;z-=4){const row=[];for(const x of sorted){if(circleBlocked(x,z,1.7,colliders,.86))continue;const n={x,z,links:[],index:navNodes.length};navNodes.push(n);row.push(n);}rows.push(row);}}
  const clear=(a,b)=>{for(let k=1;k<7;k++){const t=k/7;if(circleBlocked(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,1.7,colliders,.86))return false;}return true;};
  for(let r=0;r<rows.length;r++){const here=rows[r],near=rows[r+1]||[];for(let i=0;i<here.length;i++){const a=here[i];for(const b of here.slice(i+1)){if(b.x-a.x>4)break;if(clear(a,b)){a.links.push(b.index);b.links.push(a.index);}}for(const b of near)if(Math.abs(b.x-a.x)<=3.6&&Math.abs(b.z-a.z)<=4.1&&clear(a,b)){a.links.push(b.index);b.links.push(a.index);}}}
  navVersion++;
 }
 function ensureAt(z){if(dead)return false;playerZ=Number.isFinite(z)?z:8;const index=segmentAt(playerZ);if(index===current)return false;const want=new Set();for(let i=index-1;i<=index+(low?1:2);i++)if(i>=0&&i<SEGMENTS.length)want.add(i);let changed=false;for(const [i,c]of loaded)if(!want.has(i)){c.dispose();loaded.delete(i);unloads++;changed=true;}for(const i of want)if(!loaded.has(i)){build(i);changed=true;}current=index;if(changed){refreshArrays();refreshNavigation();}return changed;}
 function signalEntry(x,z){let nearest=null,best=4;for(const chunk of loaded.values())for(const bay of chunk.bays){const d=Math.hypot(bay.x-x,bay.z-z);if(d<best){best=d;nearest=bay;}}if(nearest)nearest.life=3.2;return !!nearest;}
 function update(dt,time){if(dead)return;M.update?.(time);windowMaterial.uniforms.time.value=time;dustMaterial.uniforms.time.value=time;for(const chunk of loaded.values())chunk.update(dt,time);practicals[0].position.set(-3,4.8,playerZ-16);if(practicals[1])practicals[1].position.set(3,3.8,playerZ+3);}
 function dispose(){if(dead)return;dead=true;for(const c of loaded.values())c.dispose();loaded.clear();colliders.length=navNodes.length=destructibles.length=entries.length=0;root.removeFromParent();geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());ownedMaterials.forEach(m=>m.dispose());M.dispose();root.clear();layouts.clear();}
 ensureAt(SPAWN.z);
 return{root,spawn:new THREE.Vector3(SPAWN.x,SPAWN.y,SPAWN.z),exit:new THREE.Vector3(0,1.7,HANGAR_Z),colliders,navNodes,destructibles,entries,segments,ensureAt,refreshNavigation,signalEntry,update,dispose,heightAt:()=>0,stats:()=>({current,loadedSegments:[...loaded.keys()].sort((a,b)=>a-b),segmentCount:loaded.size,builds,unloads,navVersion,nodes:navNodes.length,colliders:colliders.length,destructibles:destructibles.length,instancedMeshes:[...loaded.values()].reduce((n,c)=>n+c.instances.length,0),quality,terminal:!!loaded.get(0)})};
}
