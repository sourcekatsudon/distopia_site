import * as THREE from '../../vendor/three.module.js';

// +Z breech, -Z muzzle. Named groups are independent mechanical assemblies.
export function createRailgun({quality='high'}={}) {
 const high=quality==='high',N=high?20:10,R=Math.PI/2,root=new THREE.Group();root.name='ARC-RG7 / BLUE REQUIEM';
 const geometries=new Set(),materials=new Set(),textures=new Set();
 const geo=g=>(geometries.add(g),g),mat=p=>{const m=new THREE.MeshStandardMaterial(p);materials.add(m);return m;};
 const metal=mat({color:0x25333f,metalness:.85,roughness:.32}),black=mat({color:0x090f17,metalness:.72,roughness:.42}),titanium=mat({color:0x7d96a5,metalness:.9,roughness:.28}),ceramic=mat({color:0x152533,metalness:.35,roughness:.65}),rubber=mat({color:0x202a34,metalness:.1,roughness:.85}),copper=mat({color:0x8a7860,metalness:.9,roughness:.36});
 const blue=mat({color:0x063761,emissive:0x006dff,emissiveIntensity:1.6,metalness:.35,roughness:.25}),core=mat({color:0x1d8ac5,emissive:0x00adff,emissiveIntensity:1.3,metalness:.2,roughness:.2});
 const group=(name,p=root)=>{const g=new THREE.Group();g.name=name;p.add(g);return g;};
 const rig=group('recoil cradle'),receiver=group('faceted receiver',rig),slide=group('reciprocating breech',rig),rails=group('split rail assembly',rig),cell=group('capacitor cartridge',receiver),collars=[],leaves=[],carriers=[];
 const mesh=(g,m,p,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);p.add(o);return o;};
 const boxG=geo(new THREE.BoxGeometry(1,1,1)),cylG=geo(new THREE.CylinderGeometry(1,1,1,N)),boltG=geo(new THREE.CylinderGeometry(1,1,1,6));
 const box=(w,h,d,m,p,x,y,z,rz=0)=>{const o=mesh(boxG,m,p,x,y,z,0,0,rz);o.scale.set(w,h,d);return o;};
 const cylinder=(r,l,m,p,x,y,z)=>{const o=mesh(cylG,m,p,x,y,z,R);o.scale.set(r,l,r);return o;};
 const bolt=(p,x,y,z)=>{const o=mesh(boltG,titanium,p,x,y,z,0,0,R);o.scale.set(.014,.012,.014);};
 function profile(points,w,m,p,x=0,y=0,z=0){const shape=new THREE.Shape();points.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();const g=geo(new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:1,steps:1}));g.translate(0,0,-w/2);g.rotateY(R);return mesh(g,m,p,x,y,z);}
 function tube(points,r,m,p){return mesh(geo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),high?24:12,r,6,false)),m,p);}
 function rod(a,b,r,m,p){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),o=mesh(cylG,m,p);o.position.copy(av).add(bv).multiplyScalar(.5);o.scale.set(r,av.distanceTo(bv),r);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return o;}
 // Stepped spine and overlapping chamfered shells; no uninterrupted rectangular receiver.
 profile([[-.64,-.14],[-.47,.16],[-.12,.22],[.22,.1],[.36,-.06],[.1,-.17]],.23,black,receiver);
 for(const sx of [-1,1])profile([[-.53,.04],[-.36,.20],[-.03,.21],[.17,.12],[.02,.07]],.075,metal,receiver,sx*.115,.02);
 cylinder(.065,.41,black,receiver,0,.19,.12);
 for(let i=0;i<6;i++){cylinder(.074,.018,titanium,receiver,0,.19,.30-i*.07);cylinder(.060,.035,blue,receiver,0,.19,.28-i*.07);}

 for(const sx of [-1,1]){
  profile([[-.54,-.07],[-.33,.11],[.02,.11],[.21,-.02],[.07,-.16],[-.26,-.17]],.027,titanium,receiver,sx*.153);
  profile([[-.47,-.03],[-.29,.075],[0,.075],[.12,-.015],[.025,-.1],[-.22,-.11]],.032,black,receiver,sx*.174);
  for(const z of [.35,.05,-.12])bolt(receiver,sx*.198,.025,z);
  rod([sx*.16,-.12,.38],[sx*.16,-.12,-.44],.024,metal,receiver);
  rod([sx*.16,-.12,-.18],[sx*.16,-.12,-.63],.012,titanium,slide);
 }
 profile([[-.34,.12],[-.2,.25],[.09,.23],[.27,.12]],.14,metal,slide,0,.055,-.08);
 for(let i=0;i<7;i++)box(.19,.025,.026,black,slide,0,.32,.26-i*.06);
 // Open magnetic throat: two rails, ceramic insulators and an empty central channel.
 for(const sx of [-1,1]){
  const c=group(sx<0?'port electromagnetic rail':'starboard electromagnetic rail',rails);c.position.x=sx*.116;carriers.push([c,sx]);
  profile([[-.02,-.08],[.12,.06],[1.52,.05],[1.64,-.02],[1.49,-.10],[.16,-.11]],.066,metal,c,0,.01,-.20);
  box(.027,.026,1.48,core,c,-sx*.023,.052,-1.02);box(.018,.018,1.45,blue,c,sx*.036,-.047,-1.02);
  for(let i=0;i<9;i++){const z=-.39-i*.15;box(.098,.11,.028,ceramic,c,0,-.005,z);box(.09,.017,.033,titanium,c,0,.059,z);bolt(c,sx*.055,-.012,z);}
 }
 const fieldMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false,uniforms:{time:{value:0},charge:{value:0},flash:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time,charge,flash;void main(){float edge=pow(max(0.,1.-abs(vUv.x*2.-1.)),2.);float stream=pow(.5+.5*sin(vUv.y*65.-time*(14.+charge*40.)),8.);float a=edge*sin(vUv.y*3.14159)*(.10+.2*stream+charge*.20+flash*.3);gl_FragColor=vec4(.015,.28+.30*stream,.95,a);}'});materials.add(fieldMat);
 const fieldG=geo(new THREE.PlaneGeometry(.19,1.43));mesh(fieldG,fieldMat,rails,0,.014,-1.04,-R);mesh(fieldG,fieldMat,rails,0,.014,-1.04,R,R);
 // Segmented magnetic collars have visible copper windings and dark structural gaps.
 const arcG=geo(new THREE.TorusGeometry(.21,.028,6,high?16:8,Math.PI*.24));
 for(let i=0;i<3;i++){
  const collar=group('accelerator collar '+(i+1),rails);collar.position.z=-.58-i*.48;collar.scale.setScalar(1-i*.11);collars.push(collar);
  for(let j=0;j<6;j++){const seg=group('magnetic segment '+j,collar);seg.rotation.z=j*Math.PI/3;
   box(.115,.057,.16,black,seg,0,.205,0);box(.083,.022,.12,titanium,seg,0,.241,0);box(.073,.018,.11,blue,seg,0,.169,0);box(.068,.006,.05,blue,seg,0,.257,0);
   for(let k=0;k<3;k++)mesh(arcG,copper,seg,0,0,-.045+k*.044,0,0,Math.PI*.38);
  }
 }
 const accelerator=group('terminal accelerator',rails);accelerator.position.z=-1.88;
 for(let i=0;i<4;i++){const g=group('muzzle prong '+i,accelerator);g.rotation.z=Math.PI/4+i*R;profile([[-.07,-.035],[.12,-.035],[.22,.01],[.12,.065],[-.07,.065]],.075,titanium,g,0,.12);box(.04,.018,.21,core,g,0,.10,-.07);}
 const muzzle=new THREE.Object3D();muzzle.name='ballistic muzzle';muzzle.position.set(0,0,-2.15);rails.add(muzzle);
 // Camera-facing cartridge, cable loops and hydraulic rods anchor the gun's physical scale.
 const cellGlow=blue.clone();materials.add(cellGlow);cell.position.set(-.265,-.075,.12);cylinder(.066,.34,cellGlow,cell,0,0,0);
 for(let j=0;j<6;j++){const a=j*Math.PI/3;box(.018,.018,.32,titanium,cell,Math.cos(a)*.077,Math.sin(a)*.077,0);}
 for(const z of [-.22,-.15,.15,.22])cylinder(.092,.033,metal,cell,0,0,z);
 for(const z of [-.235,.235])cylinder(.053,.018,core,cell,0,0,z);
 tube([[-.29,-.06,.35],[-.37,-.02,.45],[-.37,.14,.20],[-.23,.16,-.15]],.018,rubber,receiver);
 tube([[-.30,-.08,-.10],[-.38,-.08,-.24],[-.30,-.02,-.46],[-.13,0,-.6]],.015,copper,receiver);
 tube([[-.31,-.08,-.10],[-.40,-.035,-.29],[-.28,.04,-.48],[-.13,.02,-.62]],.007,blue,receiver);
 for(const sx of [-1,1])for(let i=0;i<5;i++){
  const leaf=group('hinged coolant leaf '+sx+'/'+i,receiver);leaf.position.set(sx*.14,.16,.20-i*.105);leaves.push([leaf,sx]);
  box(.11,.016,.068,metal,leaf,sx*.045,0,0,-sx*.28);box(.082,.008,.04,titanium,leaf,sx*.055,.012,0,-sx*.28);box(.015,.025,.055,blue,receiver,sx*.14,.14,.20-i*.105);
 }
 profile([[-.41,-.13],[-.21,-.12],[-.15,-.24],[-.26,-.50],[-.40,-.46]],.12,rubber,receiver);
 for(let i=0;i<5;i++)box(.14,.018,.09,metal,receiver,0,-.27-i*.034,.30+i*.017);
 tube([[0,-.13,.12],[0,-.29,.08],[0,-.32,.22],[0,-.2,.29]],.014,titanium,receiver);
 const hand=group('armored firing hand',rig);profile([[-.38,-.2],[-.25,-.19],[-.18,-.3],[-.26,-.42],[-.4,-.38]],.17,rubber,hand,.02);
 for(let i=0;i<4;i++)box(.10,.042,.058,ceramic,hand,-.075,-.235-i*.043,.265+i*.015,-.15);
 rod([.045,-.38,.39],[.24,-.59,.94],.075,rubber,rig);rod([.08,-.39,.43],[.29,-.60,.94],.045,metal,rig);
 profile([[-.71,-.52],[-.48,-.4],[-.30,-.42],[-.48,-.60]],.22,metal,rig,.17);
 const roughCanvas=document.createElement('canvas');roughCanvas.width=256;roughCanvas.height=256;const rc=roughCanvas.getContext('2d');rc.fillStyle='#999';rc.fillRect(0,0,256,256);let seed=731;for(let i=0;i<1400;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%256;seed=(seed*1664525+1013904223)>>>0;const y=seed%256;rc.fillStyle=i%3?'#919191':'#b0b0b0';rc.fillRect(x,y,1+i%13,1);}const roughTex=new THREE.CanvasTexture(roughCanvas);roughTex.wrapS=roughTex.wrapT=THREE.RepeatWrapping;textures.add(roughTex);for(const m of [metal,black,titanium]){m.roughnessMap=roughTex;m.bumpMap=roughTex;m.bumpScale=.0015;}
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#101b25';ctx.fillRect(0,0,512,256);ctx.fillStyle='#aac4d2';ctx.font='bold 52px monospace';ctx.fillText('ARC-RG7',24,64);ctx.font='21px monospace';ctx.fillStyle='#48bfff';ctx.fillText('BLUE REQUIEM',26,102);ctx.fillStyle='#657d8c';ctx.font='14px monospace';ctx.fillText('MAGNETIC ACCELERATOR // 07',26,143);ctx.fillText('CAUTION : ACTIVE FIELD',26,167);ctx.fillStyle='#b8a16d';for(let i=0;i<15;i++)ctx.fillRect(26+i*15,195,7,17);ctx.fillStyle='#628094';ctx.font='12px monospace';ctx.fillText('CH / EXPERIMENTAL DIVISION',26,240);
 const labelTex=new THREE.CanvasTexture(canvas);labelTex.colorSpace=THREE.SRGBColorSpace;textures.add(labelTex);mesh(geo(new THREE.PlaneGeometry(.28,.14)),mat({map:labelTex,roughness:.55,metalness:.35}),receiver,-.202,-.015,.16,0,-R);
 mesh(geo(new THREE.PlaneGeometry(.105,.23)),mat({map:labelTex,roughness:.4,metalness:.2}),receiver,-.115,.256,.02,-R);
 // Eight original angular glyphs: physical emissive strokes, never a numeric counter.
 const meter=group('glyph energy annunciator',receiver);meter.position.set(-.19,.25,.18);meter.rotation.z=.45;
 box(.18,.018,.32,black,meter,0,0,0);box(.185,.004,.326,titanium,meter,0,-.01,0);
 const glyphs=[],strokes=[[-.024,-.016,-.024,.016],[-.024,-.016,.022,-.016],[-.024,0,.022,0],[.022,-.016,.022,.016],[-.024,.016,.022,.016],[-.024,-.016,.022,.016],[-.024,.016,.022,-.016]];
 for(let i=0;i<8;i++){
  const glyph=group('energy glyph '+i,meter),gx=(i%2?1:-1)*.043,gz=(Math.floor(i/2)-1.5)*.068;glyphs.push(glyph);
  for(let j=0;j<strokes.length;j++)if(((i*13+37)>>(j%6))&1||j===0){const [x1,z1,x2,z2]=strokes[j],length=Math.hypot(x2-x1,z2-z1),x=gx+(x1+x2)/2,z=gz+(z1+z2)/2;const unlit=box(.004,.003,length,ceramic,meter,x,.012,z);unlit.rotation.y=Math.atan2(x2-x1,z2-z1);const lit=box(.003,.003,length,core,glyph,x,.015,z);lit.rotation.y=unlit.rotation.y;}
 }
 const support=group('left support hand',rig),supportArm=group('left armored forearm',rig);
 profile([[-.09,-.055],[.09,-.055],[.12,.015],[.06,.075],[-.07,.065]],.15,rubber,support);
 const fingerGeo=geo(new THREE.CapsuleGeometry(.025,.055,3,8));
 for(let i=0;i<4;i++){mesh(fingerGeo,rubber,support,.015+i*.032,.045,-.065,R,0,R);box(.028,.024,.048,ceramic,support,.012+i*.032,.061,-.043);}
 box(.17,.10,.09,ceramic,support,0,-.045,.10);
 mesh(fingerGeo,rubber,hand,-.11,-.20,.30,.2,0,-.4);
 const thumb=mesh(fingerGeo,rubber,support,-.095,.06,.015,.35,0,-.35);thumb.scale.y=1.3;
 // Forearm pivots with the support hand. Its lower end stays below the viewport.
 cylinder(.058,1,rubber,supportArm,0,0,.5);profile([[-.34,-.045],[.03,-.045],[.06,.025],[-.16,.085],[-.30,.065]],.14,metal,supportArm,0,0,.06);
 box(.025,.01,.14,blue,supportArm,-.05,.075,.2);
 // Local, depth-tested optical halos, not a screen-wide exposure boost.
 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const gc=glowCanvas.getContext('2d'),grad=gc.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(30,140,255,.6)');grad.addColorStop(.25,'rgba(0,85,255,.22)');grad.addColorStop(1,'rgba(0,40,255,0)');gc.fillStyle=grad;gc.fillRect(0,0,128,128);const glowTex=new THREE.CanvasTexture(glowCanvas);textures.add(glowTex);
 const spriteMat=opacity=>{const m=new THREE.SpriteMaterial({map:glowTex,color:0x3baaff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,opacity});materials.add(m);return m;};
 const haloMat=spriteMat(.28),halo=new THREE.Sprite(haloMat);halo.scale.set(.75,.75,1);halo.position.set(0,0,-1.2);rails.add(halo);
 const flashMat=spriteMat(0),flashSprite=new THREE.Sprite(flashMat);muzzle.add(flashSprite);
 const flashCoreMat=new THREE.MeshBasicMaterial({color:0xb0eaff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});materials.add(flashCoreMat);const flashCore=mesh(geo(new THREE.ConeGeometry(.13,.55,6,1,true)),flashCoreMat,muzzle,0,0,-.23,-R);
 const keyLight=new THREE.PointLight(0xb8d9ff,4.5,4,2);keyLight.position.set(-.65,.7,.25);rig.add(keyLight);
 const light=new THREE.PointLight(0x168cff,0,3,2);light.position.set(-.2,.2,-.8);rig.add(light);
 // Merge only static siblings. Moving groups keep their own transforms and hierarchy.
 function batch(parent){for(const c of [...parent.children])if(c.isGroup)batch(c);const bins=new Map();for(const o of parent.children)if(o.isMesh){const list=bins.get(o.material)||[];list.push(o);bins.set(o.material,list);}for(const [m,list]of bins){if(list.length<2)continue;const arrays={position:[],normal:[],uv:[]};for(const o of list){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);for(const key of Object.keys(arrays))arrays[key].push(...g.getAttribute(key).array);g.dispose();}const g=geo(new THREE.BufferGeometry());for(const key of Object.keys(arrays))g.setAttribute(key,new THREE.Float32BufferAttribute(arrays[key],key==='uv'?2:3));mesh(g,m,parent).name='batched '+parent.name;list.forEach(o=>parent.remove(o));}}
 for(const c of collars)for(const seg of [...c.children]){seg.updateMatrix();for(const o of [...seg.children]){o.updateMatrix();o.applyMatrix4(seg.matrix);c.add(o);}c.remove(seg);}
 batch(rig);
 let recoil=0,heat=0,flash=0,power=1,spin=0,focus=0,disposed=false;
 function fire(p=1){power=Math.min(4,Math.max(1,p));recoil=1;heat=Math.min(1,heat+.40+power*.12);flash=1;}
 function update(dt,s={}){const t=s.time||0,ch=Math.max(s.charge||0,focus>0?.4:0),dep=s.deploy??1;focus=Math.max(0,focus-dt);recoil*=Math.exp(-dt*12);heat*=Math.exp(-dt*1.65);flash*=Math.exp(-dt*24);spin+=dt*(.12+ch*2.8+flash*4);
  blue.emissiveIntensity=1.15+Math.sin(t*3)*.12+ch*1.7+flash*2;core.emissiveIntensity=1.05+ch*1.2+flash*2.3;fieldMat.uniforms.time.value=t;fieldMat.uniforms.charge.value=ch;fieldMat.uniforms.flash.value=flash;
  collars.forEach((g,i)=>{g.rotation.z=(i%2?-1:1)*spin*.20;g.position.z=-.58-i*.48+recoil*.035*(3-i);});carriers.forEach(([g,sx])=>{g.position.x=sx*(.116+ch*.025+recoil*.015);g.rotation.z=sx*(ch*.018+Math.sin(t*1.7)*.002);});leaves.forEach(([g,sx],i)=>g.rotation.z=sx*(heat*.6+ch*.12+Math.sin(t*2+i)*.012));slide.position.z=recoil*.13-ch*.035;cell.rotation.z=Math.sin(t*1.4)*.006;
  const rp=s.reload??-1,reloading=rp>=0;
  const smooth=x=>{const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);};
  const hold=reloading?smooth(rp/.15)*(1-smooth((rp-.85)/.15)):0;
  const pull=reloading?(rp<.52?smooth((rp-.23)/.24):1-smooth((rp-.58)/.24)):0;
  cell.position.set(-.265-pull*.18,-.075-pull*.64,.12+pull*.18);cell.rotation.z=-pull*.28;cell.visible=!(reloading&&rp>.48&&rp<.58);
  cellGlow.emissiveIntensity=(reloading&&rp<.58?.15:1.1)+ch*1.3+flash*1.5;
  const visibleEnergy=reloading?(rp>.83?smooth((rp-.83)/.14)*100:0):(s.energy??100),lit=Math.ceil(Math.max(0,visibleEnergy)/12.5);glyphs.forEach((g,i)=>g.visible=i<lit);
  const reach=reloading?smooth((rp-.08)/.13)*(1-smooth((rp-.83)/.13)):0;
  support.position.set(-.26+(-.005-pull*.18)*reach,-.10+(.025-pull*.64)*reach,-.42+(.54+pull*.18)*reach);support.rotation.set(-.1-reach*.2,reach*.25,reach*.35);
  const wrist=new THREE.Vector3().copy(support.position).add(new THREE.Vector3(-.015,-.09,.04)),elbow=new THREE.Vector3(-.52,-.67,.72);const armLength=wrist.distanceTo(elbow);supportArm.position.copy(wrist);supportArm.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),elbow.sub(wrist).normalize());supportArm.scale.z=armLength;
  const breath=s.reducedMotion?0:Math.sin(t*(s.sprinting?2.5:1.65)),breathSide=s.reducedMotion?0:Math.sin(t*.825);
  const movement=Math.min((s.speed||0)/6,1)*(s.grounded===false?.15:1),bob=Math.sin(t*8)*movement;rig.position.set(bob*.009+breathSide*.003,-(1-dep)*.8-Math.abs(bob)*.009+breath*.006-hold*.08,recoil*.11+hold*.09);rig.rotation.set(recoil*.055+(1-dep)*.55+(s.sprinting?.12:0)+hold*.10+breath*.003,bob*.01-hold*.10,bob*.012-recoil*.012+hold*.24+breathSide*.002);
  haloMat.opacity=.20+ch*.23+flash*.25;halo.scale.setScalar(.55+ch*.22+flash*.25);flashMat.opacity=flash*.85;flashSprite.scale.setScalar((.65+power*.23)*Math.sqrt(flash));flashCoreMat.opacity=flash*.85;flashCore.scale.set(1+power*.15,1+power*.20,1+power*.15);light.intensity=ch*.65+flash*6;
 }
 function dispose(){if(disposed)return;disposed=true;root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());root.clear();}
 return {root,muzzle,update,fire,inspect:()=>({glyphs:glyphs.filter(g=>g.visible).length,cellVisible:cell.visible,cellOffset:cell.position.toArray(),breathPosition:rig.position.toArray(),supportHand:support.position.toArray(),flash}),prepare:()=>{focus=.095;},dispose};
}
