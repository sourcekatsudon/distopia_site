import * as THREE from '../../vendor/three.module.js';
import { createMaterials } from './materials.js';
export function createWorld({scene,seed=731,quality='high'}={}){
const hi=quality==='high',root=new THREE.Group(),materials=createMaterials(seed,quality),M=materials,PI=Math.PI;root.name='ChickenHouseWorld';
let st=seed>>>0;const rnd=()=>{st=(st+0x6D2B79F5)>>>0;let t=st;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
const geos=[],ims=[],colliders=[],doors=[],navNodes=[],I={},gy=[],steam=[],V=(x,y,z)=>new THREE.Vector3(x,y,z),G=g=>(geos.push(g),g);
const bx=G(new THREE.BoxGeometry(1,1,1)),cyl=G(new THREE.CylinderGeometry(1,1,1,hi?14:8)),tr=G(new THREE.TorusGeometry(1,.05,6,hi?36:20)),sp=G(new THREE.SphereGeometry(1,hi?10:6,hi?8:5)),tr2=G(new THREE.TorusGeometry(1,.1,8,hi?40:24)),exG=G(new THREE.TorusGeometry(1.9,.16,10,hi?56:32));
const mk=(k,g,m)=>{const a=[];I[k]={a,g,m,add:(...v)=>a.push(v)}};
[['m',bx,M.metal],['dk',bx,M.dark],['ed',bx,M.edge],['cy',bx,M.cyan],['rd',bx,M.red],['hz',bx,M.hazard],['cn',bx,M.concrete],['sc',bx,M.screen],['ctl',bx,M.control],['sign',bx,M.sign],['cm',cyl,M.metal],['cd',cyl,M.dark],['cr',cyl,M.red],['tm',tr,M.edge],['tc',tr,M.cyan],['sd',sp,M.dark]].forEach(a=>mk(...a));
const col=(x0,x1,z0,z1,tag,h=4)=>{const c={minX:x0,maxX:x1,minZ:z0,maxZ:z1,minY:0,maxY:h,height:h,enabled:true,tag};colliders.push(c);return c};
const part=(g,m,x,y,z,sx,sy,sz,p)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o};
const wall=(x0,x1,z0,z1,H,tag='wall',k='rd')=>{const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2,ax=w>d,t=Math.min(w,d),L=Math.max(w,d);
I.m.add(cx,H/2,cz,w,H,d);col(x0,x1,z0,z1,tag);
for(let u=4;u<L-1;u+=4)for(const s of[-1,1]){const o=t/2+.12,c=(ax?x0:z0)+u;ax?I.dk.add(c,H/2,cz+s*o,.5,H,.24):I.dk.add(cx+s*o,H/2,c,.24,H,.5)}
for(const s of[-1,1]){const o=t/2+.03;if(ax){I[k].add(cx,1.1,cz+s*o,L-1,.08,.06);I.ed.add(cx,H-.4,cz+s*o,L,.5,.1)}else{I[k].add(cx+s*o,1.1,cz,.06,.08,L-1);I.ed.add(cx+s*o,H-.4,cz,.1,.5,L)}}};
const cross=(z,hw,H,gap)=>{if(!gap){wall(-hw,hw,z-.5,z+.5,H);return}
wall(-hw,-gap,z-.5,z+.5,H);wall(gap,hw,z-.5,z+.5,H);I.dk.add(0,(4.7+H)/2,z,gap*2,H-4.7,1);
for(const s of[-1,1]){I.ed.add(s*(gap+.15),2.35,z,.3,4.7,1.2);I.hz.add(0,.05,z+s*1.3,gap*2,.04,.5);I.cy.add(0,4.6,z+s*.52,gap*2,.08,.05)}};
const cab=(x,z,d)=>{I.m.add(x,1.1,z,.9,2.2,1.5);col(x-.45,x+.45,z-.75,z+.75,'cabinet',2.2);I[z<-30?'ctl':'sc'].add(x+d*.47,1.5,z,.04,.8,1.2);I.cy.add(x+d*.47,.5,z,.04,.12,1.2);I.dk.add(x,2.25,z,1,.1,1.6);for(let i=0;i<3;i++)I.ed.add(x+d*.47,.9+i*.1,z,.03,.04,1.2)};
const R=[['terminal',7,-11,12,6],['corridor',5,-33,-11,5],['reactor',17,-64,-33,12],['lockdown',11,-92,-64,7],['escape',17,-130,-92,10]];
const zones=R.map(([id,,a,b])=>({id,name:id[0].toUpperCase()+id.slice(1),minZ:a,maxZ:b,center:V(0,1.7,(a+b)/2)}));
R.forEach(([id,hw,a,b,H])=>{const len=b-a,cz=(a+b)/2,nx=Math.round(hw/2),nz=Math.round(len/4),cw=hw*2/nx,cd=len/nz;
I.dk.add(0,-.1,cz,hw*2,.2,len);I.dk.add(0,H+.1,cz,hw*2+2,.3,len);
for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)I.m.add(-hw+cw*(i+.5),.03,a+cd*(j+.5),cw-.3,.06,cd-.3);
for(let z=a+3;z<b;z+=6)I.m.add(0,H-.3,z,hw*2,.5,.6);
for(const s of[-1,1]){I.rd.add(s*3,H-.6,cz,.12,.05,len-2);I.cy.add(s*3.6,.08,cz,.1,.03,len-2);
const xd=s*(hw-1.6),xp=s*(hw-.55);
I.cm.add(xd,H-1.4,cz,.5,len-1,.5,PI/2);I.sd.add(xd,H-1.4,a+.55,.55,.55,.55);I.sd.add(xd,H-1.4,b-.55,.55,.55,.55);
for(let z=a+3;z<b-1;z+=5)I.cm.add(xd,H-1.4,z,.6,.3,.6,PI/2);
for(const y of[2.6,3.3]){I.cd.add(xp,y,cz,.14,len-2,.14,PI/2);for(let z=a+3;z<b-1;z+=5)I.cm.add(xp,y,z,.2,.12,.2,PI/2)}
const rz=a+3+rnd()*(len-6);I.cd.add(xp,(2.6+H-1.4)/2,rz,.14,H-4,.14);I.sd.add(xp,2.6,rz,.24,.24,.24);I.sd.add(xp,H-1.4,rz,.24,.24,.24);
for(let q=0;q<3;q++)I.cd.add(s*(hw-2.6)+(q-1)*.12,H-2+(q%2)*.1,cz,.04,len-1,.04,PI/2);
wall(s>0?hw:-hw-1,s>0?hw+1:-hw,a-.5,b+.5,H)}});
cross(12,8,6,0);cross(-11,8,6,3);cross(-33,18,12,3);cross(-64,18,12,3);cross(-92,18,10,3);cross(-118,18,10,3);cross(-130,18,10,0);
for(const s of[-1,1]){for(const z of[-8,-5,-2,6,10])cab(s*6.5,z,-s);for(const z of[-68,-76,-88])cab(s*10.5,z,-s)}
for(let z=-14;z>-32;z-=4){for(const s of[-1,1])I.ed.add(s*4.85,2.4,z,.3,4.8,.5);I.ed.add(0,4.75,z,10,.3,.5);I.rd.add(0,4.58,z,8,.06,.1)}
const tz=-48.5;
[-1,1].forEach(s=>{const x=s*7.5;
[[1.2,2.4,3],[4.6,1.6,2.6],[8,2.2,2.6],[10.7,.8,2.4]].forEach(([y,h,r])=>I.cd.add(x,y,tz,r,h,r));
I.cr.add(x,5.8,tz,1.8,11.6,1.8);I.ed.add(x,11.2,tz,3.2,.3,3.2);I.tc.add(x,.07,tz,3.6,3.6,3.6,PI/2);
col(x-3,x+3,tz-3,tz+3,'reactor-core');
[3,6.4,9.2].forEach((y,i)=>{const g=new THREE.Group();g.position.set(x,y,tz);part(tr2,M.edge,0,0,0,3.8,3.8,3.8,g).rotation.x=1.1;root.add(g);gy.push([g,(i%2?-1:1)*(.6+i*.3)])});
I.m.add(x,10.9,tz,.5,.4,34);
for(const z of[-41,-56]){I.cn.add(x,.55,z,3,1.1,.8);I.hz.add(x,1.12,z,3.02,.08,.82);col(x-1.5,x+1.5,z-.4,z+.4,'cover',1.1)}
const rx=s*10.8;for(let z=-41;z>=-56;z-=2.5)I.ed.add(rx,.55,z,.1,1.1,.1);I.ed.add(rx,1.05,-48.5,.08,.08,15);I.ed.add(rx,.6,-48.5,.08,.08,15);col(rx-.1,rx+.1,-56,-41,'railing',1.1);
for(const z of[-43,-48.5,-54]){const hx=s*15.7;I.cd.add(hx,1.2,z,1.1,2.4,1.1);I.tm.add(hx,1.9,z,1.3,1.3,1.3,PI/2);I.ed.add(hx,2.5,z,1.5,.2,1.5);I.rd.add(hx,.5,z,1.15,.1,1.15);col(hx-1.1,hx+1.1,z-1.1,z+1.1,'turbine')}
for(const z of[-39,-58]){const px=s*3.4;I.cn.add(px,6,z,1.2,12,1.2);I.ed.add(px,.5,z,1.4,1,1.4);I.cy.add(px,2,z,1.25,.1,1.25);col(px-.7,px+.7,z-.7,z+.7,'pillar')}});
I.tc.add(0,7.2,tz,4,4,4);I.m.add(0,11.4,tz,36,.5,.9);
wall(-11,2,-72.5,-71.5,7,'baffle','rd');wall(-2,11,-80.5,-79.5,7,'baffle','rd');I.hz.add(1.7,3.5,-72,.4,7,1.1);I.hz.add(-1.7,3.5,-80,.4,7,1.1);
for(const z of[-68,-76,-84,-90])I.rd.add(0,6.6,z,10,.1,.2);
for(const s of[-1,1])for(const z of[-97,-105,-113]){const px=s*9;I.cn.add(px,5,z,1.4,10,1.4);I.ed.add(px,.5,z,1.6,1,1.6);I.cy.add(px,2.2,z,1.45,.1,1.45);col(px-.8,px+.8,z-.8,z+.8,'pillar')}
I.cy.add(0,.08,-111,.2,.03,26);I.hz.add(0,5.2,-117.4,6.6,.6,.1);I.dk.add(0,.15,-125,5,.3,2.4);
const ramp=(za,zb,ya,yb)=>{const g=G(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute([-16,ya,za,-12,ya,za,-12,yb,zb,-16,ya,za,-12,yb,zb,-16,yb,zb],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));g.computeVertexNormals();root.add(new THREE.Mesh(g,M.metal));};ramp(-34,-40,.06,2.06);ramp(-40,-60,2.06,2.06);ramp(-60,-64,2.06,.06);for(let z=-40;z>=-60;z-=3){I.ed.add(-16,2.6,z,.1,1.2,.1);I.cy.add(-16,3.15,z,.08,.06,3);}I.hz.add(-14,2.08,-40,4,.04,.3);I.hz.add(-14,2.08,-60,4,.04,.3);
const T=new THREE.Group();T.position.set(0,0,3);T.name='terminal';root.add(T);
part(bx,M.metal,0,.45,0,3,.9,1.2,T);part(bx,M.dark,0,.92,.1,3.1,.06,1.3,T);part(bx,M.cyan,0,.96,.74,2.8,.02,.04,T);part(cyl,M.dark,0,1.15,-.2,.12,.5,.12,T);
part(bx,M.dark,0,1.65,-.25,1.7,1,.12,T);part(bx,M.screen,0,1.65,-.185,1.55,.85,.02,T);part(bx,M.cyan,0,1.1,-.19,1.5,.03,.02,T);part(bx,M.edge,0,.97,.4,.9,.04,.3,T);
for(const s of[-1,1]){part(bx,M.metal,s*2.1,1,-.2,.7,2,.8,T);part(bx,M.screen,s*2.1,1.5,.21,.5,.4,.02,T);part(bx,M.cyan,s*2.1,.5,.21,.5,.06,.02,T)}
col(-1.55,1.55,2.35,3.65,'terminal-desk',.96);const monitor=col(-.87,.87,2.68,2.88,'terminal-monitor',2.2);monitor.minY=1.15;for(const s of [-1,1])col(s*2.1-.36,s*2.1+.36,2.4,3.25,'terminal-side',2);
const mkDoor=(id,z)=>{const mesh=new THREE.Group(),leaves=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*1.5,0,0);part(bx,M.metal,0,2.3,0,3,4.6,.5,g);part(bx,M.hazard,0,.55,0,3,.5,.54,g);part(bx,M.cyan,-s*1.4,2.3,0,.1,3.8,.56,g);part(bx,M.dark,0,3.6,0,2.6,.12,.56,g);mesh.add(g);return g});
mesh.position.set(0,0,z);root.add(mesh);doors.push({id,position:V(0,0,z),collider:col(-3,3,z-.4,z+.4,'door'),open:false,locked:false,mesh,leaves,t:0})};
mkDoor('corridor-door',-11);mkDoor('lockdown-gate',-64);mkDoor('escape-gate',-118);
const exitRing=new THREE.Mesh(exG,M.cyan),inner=new THREE.Mesh(exG,M.cyan);exitRing.position.set(0,2,-125);inner.position.set(0,2,-125);inner.scale.setScalar(.65);root.add(exitRing,inner);
part(cyl,M.cyan,0,6.3,-125,.12,12,.12,root);
const cv=document.createElement('canvas');cv.width=cv.height=64;const cx=cv.getContext('2d'),gr=cx.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(200,215,225,.55)');gr.addColorStop(1,'rgba(200,215,225,0)');cx.fillStyle=gr;cx.fillRect(0,0,64,64);
const tex=new THREE.CanvasTexture(cv),smat=new THREE.SpriteMaterial({map:tex,transparent:true,opacity:.2,depthWrite:false,color:0x8a9aa6});
for(let i=0;i<(hi?8:3);i++){const s=new THREE.Sprite(smat);s.position.set((rnd()<.5?-1:1)*(12+rnd()*3),rnd()*6,-38-rnd()*22);root.add(s);steam.push(s)}
[[0xa8f6ff,28,0,4.6,3,24],[0xff2a3a,60,0,9,-48.5,45],[0xff3030,30,0,5,-78,26],[0x58f0ff,50,0,7,-112,40]].forEach(([c,i,x,y,z,d])=>{const l=new THREE.PointLight(c,i,d,2);l.position.set(x,y,z);root.add(l)});
// Architectural layers use existing instanced batches: ducts, braces, grates and monitoring devices.
R.forEach(([id,hw,a,b,H])=>{for(let z=a+2;z<b-1;z+=4){for(const s of [-1,1]){
 const x=s*(hw-.13);I.ed.add(x,1.95,z,.09,1.7,2.9);I.dk.add(x-s*.09,1.95,z,.08,1.5,2.65);I.ctl.add(x-s*.15,2.05,z,.035,.65,.85);
 I.m.add(s*(hw-.6),H-1.4,z,.10,2.2,.20,0,0,s*.40);I.rd.add(x-s*.15,3.35,z-.9,.04,.06,.26);
 I.dk.add(s*(hw-1.2),H-.42,z,.7,.5,2.9);for(let j=0;j<6;j++)I.ed.add(s*(hw-1.2),H-.69,z-.8+j*.3,.48,.025,.05);
 if(z<a+7){I.m.add(s*(hw-.65),H-1.3,z,.5,.15,.2);I.dk.add(s*(hw-.9),H-1.45,z,.22,.22,.40,.32);I.rd.add(s*(hw-.9),H-1.50,z+.21,.12,.045,.02);}
 }for(let j=0;j<5;j++)I.dk.add(0,.075,z+j*.16,1.8,.025,.055);}
 I.sign.add(0,H-.95,a+1,2.2,.72,.035);});
const dustGeometry=G(new THREE.BufferGeometry()),dustPositions=[];for(let i=0;i<(hi?200:60);i++)dustPositions.push((rnd()-.5)*24,.3+rnd()*7,-130+rnd()*142);dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dustPositions,3));
const dustMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'uniform float time;varying float fade;void main(){vec3 p=position;p.x+=sin(time*.12+position.z)*.15;p.y+=sin(time*.18+position.x)*.2;vec4 v=modelViewMatrix*vec4(p,1.);fade=clamp(1.-length(v.xyz)/45.,0.,1.)*.23;gl_Position=projectionMatrix*v;gl_PointSize=2.;}',fragmentShader:'varying float fade;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(.4,.56,.65,fade*(1.-smoothstep(.1,.5,d)));}'});root.add(new THREE.Points(dustGeometry,dustMaterial));
const dm=new THREE.Object3D();
Object.values(I).forEach(o=>{if(!o.a.length)return;const im=new THREE.InstancedMesh(o.g,o.m,o.a.length);o.a.forEach((v,i)=>{dm.position.set(v[0],v[1],v[2]);dm.scale.set(v[3],v[4],v[5]);dm.rotation.set(v[6]||0,v[7]||0,v[8]||0);dm.updateMatrix();im.setMatrixAt(i,dm.matrix)});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;root.add(im);ims.push(im)});
const nav=(x,z)=>navNodes.push({x,z,links:[]})-1,lk=(a,b)=>{navNodes[a].links.push(b);navNodes[b].links.push(a)};
const main=[[0,8],[3.5,4],[3.5,-1],[0,-8],[0,-11],[0,-22],[0,-33],[0,-35],[0,-48.5],[0,-62],[0,-64],[0,-67],[6.5,-68],[6.5,-72],[6.5,-76],[-6.5,-77],[-6.5,-80],[-6.5,-84],[0,-88],[0,-92],[0,-98],[0,-110],[0,-118],[0,-122]].map(([x,z])=>nav(x,z));
for(let i=1;i<main.length;i++)lk(main[i-1],main[i]);
[-1,1].forEach(s=>{const a=nav(s*12.5,-36),b=nav(s*13,-48.5),c=nav(s*12.5,-62);lk(main[7],a);lk(a,b);lk(b,c);lk(c,main[9])});
const spawn=V(0,1.7,8),exit=V(0,1.7,-122);
return{root:(scene&&scene.add(root),root),materials,colliders,doors,zones,navNodes,spawn,exit,terminal:T,
setDoorOpen(id,open){const d=doors.find(q=>q.id===id);if(!d)return;d.open=!!open;d.collider.enabled=!d.open},
update(dt,time){dustMaterial.uniforms.time.value=time;for(const d of doors){const g=d.open?1:0;d.t+=(g-d.t)*Math.min(1,dt*5);if(Math.abs(g-d.t)<.005)d.t=g;d.leaves[0].position.x=-(1.5+3*d.t);d.leaves[1].position.x=1.5+3*d.t}
for(const[g,v]of gy)g.rotation.y=time*v;for(const s of steam){s.position.y+=dt*.5;if(s.position.y>7)s.position.y=0;s.scale.setScalar(2+s.position.y*.6)}
exitRing.rotation.z=time*.5;inner.rotation.z=-time*.9},
dispose(){scene&&scene.remove(root);ims.forEach(i=>i.dispose());geos.forEach(g=>g.dispose());smat.dispose();tex.dispose();dustMaterial.dispose();materials.dispose&&materials.dispose()}};
}
