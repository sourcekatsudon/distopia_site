import * as THREE from '../../vendor/three.module.js';
import {createSurfaceKit} from './material-kit.js';

// A seated industrial sovereign, framed by a deep power cathedral rather than neon rings.
export function createRuler({quality='high'}={}){
 const surfaces=createSurfaceKit({quality});const high=quality==='high',root=new THREE.Group();root.name='SOVEREIGN / execution cathedral';
 const geos=new Set(),mats=new Set(),textures=new Set(),fingers=[];let disposed=false,seed=913;
 const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const G=g=>(geos.add(g),g),M=p=>{const m=new THREE.MeshStandardMaterial(p);mats.add(m);return m;};
 const roughCanvas=document.createElement('canvas');roughCanvas.width=roughCanvas.height=256;const rc=roughCanvas.getContext('2d');rc.fillStyle='#9b9b9b';rc.fillRect(0,0,256,256);for(let i=0;i<2500;i++){const v=90+Math.floor(random()*90);rc.fillStyle=`rgb(${v},${v},${v})`;rc.fillRect(random()*256,random()*256,1+random()*12,.6);}const rough=new THREE.CanvasTexture(roughCanvas);textures.add(rough);
 const steel=M({color:0x48515b,metalness:.88,roughness:.42,roughnessMap:rough,bumpMap:rough,bumpScale:.002}),edge=M({color:0x84919b,metalness:.88,roughness:.3,roughnessMap:rough}),black=M({color:0x10151b,metalness:.72,roughness:.48,roughnessMap:rough}),rubber=M({color:0x070a0e,roughness:.85,metalness:.05}),red=M({color:0x3c0711,emissive:0xff102e,emissiveIntensity:2.2,metalness:.25,roughness:.35}),eye=M({color:0x710414,emissive:0xff1538,emissiveIntensity:4.5,roughness:.2}),bronze=M({color:0x51473c,metalness:.85,roughness:.5});
 steel.roughnessMap=surfaces.gunmetal.roughnessMap;black.roughnessMap=surfaces.anodized.roughnessMap;edge.roughnessMap=surfaces.titanium.roughnessMap;
 const group=(name,p=root)=>{const g=new THREE.Group();g.name=name;p.add(g);return g;};
 const mesh=(g,m,p,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);p.add(o);return o;};
 const cube=G(new THREE.BoxGeometry(1,1,1)),cyl=G(new THREE.CylinderGeometry(1,1,1,high?16:8)),joint=G(new THREE.IcosahedronGeometry(1,1));
 const shape=new THREE.Shape();[[-.38,-.5],[.37,-.5],[.5,-.34],[.5,.24],[.30,.5],[-.32,.5],[-.5,.28],[-.5,-.35]].forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const plate=G(new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:1}));plate.center();
 const box=(p,m,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>{const o=mesh(cube,m,p,x,y,z,rx,ry,rz);o.scale.set(w,h,d);return o;};
 const armor=(p,m,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>{const o=mesh(plate,m,p,x,y,z,rx,ry,rz);o.scale.set(w,h,d);return o;};
 const rod=(p,a,b,r,m)=>{const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),o=mesh(cyl,m,p);o.position.copy(v).add(w).multiplyScalar(.5);o.scale.set(r,v.distanceTo(w),r);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),w.sub(v).normalize());return o;};
 const sphere=(p,m,x,y,z,r)=>{const o=mesh(joint,m,p,x,y,z);o.scale.setScalar(r);return o;};
 const cable=(p,points,r=.05,m=rubber)=>mesh(G(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),high?28:14,r,6,false)),m,p);
 const king=group('sovereign chassis'),head=group('expressionless armored mask',king);head.position.set(0,5.53,.22);
 // Tapered central mask, inset eye sockets and split sloping mandibles. No smiling mouth aperture.
 armor(head,black,0,0,0,.89,1.04,.64,0,0,0);
 armor(head,steel,0,.20,.34,.71,.47,.12,.08,0,0);
 for(const s of [-1,1]){
  armor(head,rubber,s*.22,.10,.416,.35,.15,.05,0,0,s*.1);
  box(head,eye,s*.225,.115,.452,.245,.037,.022,0,0,-s*.13);
  armor(head,steel,s*.28,-.22,.32,.20,.54,.16,0,s*.20,s*.30);
  rod(head,[s*.40,-.42,.16],[s*.44,-.15,.02],.045,edge);
  for(let i=0;i<4;i++)box(head,rubber,s*.28,-.08-i*.075,.421,.13,.018,.025,0,0,s*.25);
 }
 armor(head,black,0,-.25,.42,.20,.44,.08);box(head,bronze,0,.47,-.04,.36,.15,.42);
 // Uneven industrial crown: thick broken radiator blades, braces and tiny red status marks.
 for(let i=0;i<9;i++){const x=(i-4)*.16,h=[.7,.95,.55,1.2,1.45,.85,1.1,.48,.8][i];armor(head,i%3?black:steel,x,.56+h/2,-.15,.10,h,.20,0,0,-x*.22);box(head,red,x,.59+h*.56,-.035,.025,h*.23,.025);}
 for(const s of [-1,1])cable(king,[[s*.28,5.15,.10],[s*.64,5,.05],[s*.8,4.65,-.28]],.065);
 // Readable clavicles and immense asymmetric layered shoulders.
 armor(king,black,0,4.03,.0,2.35,1.68,1.0);
 for(const s of [-1,1]){
  rod(king,[s*.13,4.85,.12],[s*1.22,4.43,.12],.105,edge);
  for(let i=0;i<4;i++){const x=s*(1.20+i*.22),y=4.72-i*.22,z=.10+i*.035;armor(king,i%2?steel:black,x,y,z,1.40-i*.12,.43+i*.03,1.05-i*.07,-.08,s*.08,-s*(.17+i*.02));box(king,rubber,x,y-.06,z+.50,.74,.04,.025,0,0,-s*.16);}
  for(let i=0;i<5;i++)armor(king,black,s*(1.6+i*.13),4.97+i*.05,-.16,.13,.9+i*.11,.36,0,0,-s*.43);
  // Broad split breastplate with a physically recessed vertical reactor stack.
  armor(king,steel,s*.54,4.00,.53,.88,1.10,.23,.08,s*-.13,s*-.09);
  armor(king,black,s*.46,3.60,.62,.71,.38,.14,.1,0,s*.08);
  for(let i=0;i<4;i++)box(king,bronze,s*.39,4.27-i*.12,.69,.52,.026,.04,0,0,-s*.13);
  for(let i=0;i<5;i++)rod(king,[s*.17,3.35-i*.13,.36],[s*(.65-i*.05),3.27-i*.13,.26],.055,edge);
 }
 box(king,rubber,0,4.00,.69,.22,1.22,.16);for(let i=0;i<7;i++){box(king,red,0,4.46-i*.14,.792,.07,.087,.024);box(king,edge,0,4.51-i*.14,.81,.20,.017,.03);}
 rod(king,[0,2.30,-.05],[0,3.36,-.05],.16,black);for(let i=0;i<7;i++){sphere(king,bronze,0,2.35+i*.12,.02,.13);}
 // Long articulated arms, exposed twin pistons, mechanical wrists and separate hooked fingers.
 for(const s of [-1,1]){
  sphere(king,steel,s*1.64,4.20,.08,.31);
  rod(king,[s*1.65,4.13,.08],[s*1.94,3.12,.42],.14,black);
  rod(king,[s*1.53,4.12,.21],[s*1.83,3.13,.55],.045,edge);
  sphere(king,black,s*1.94,3.10,.42,.24);
  rod(king,[s*1.94,3.10,.42],[s*1.96,2.75,1.25],.15,steel);
  rod(king,[s*1.80,3.14,.47],[s*1.82,2.79,1.20],.04,edge);
  armor(king,black,s*1.96,2.80,1.08,.43,.27,.85,.30);
  armor(king,steel,s*1.96,2.64,1.47,.48,.21,.54,.1,0,s*.05);
  for(let j=0;j<5;j++){const f=group('articulated claw '+s+'/'+j,king);f.position.set(s*(1.68+j*.12),2.60,1.62);fingers.push(f);rod(f,[0,0,0],[0,-.17,.20],.032,edge);sphere(f,black,0,-.17,.20,.048);rod(f,[0,-.17,.20],[0,-.40,.26],.027,steel);rod(f,[0,-.40,.26],[0,-.47,.15],.018,edge);}
  armor(king,black,s*.63,2.03,.50,.80,1.37,.77,-.40);sphere(king,steel,s*.72,1.50,.99,.29);armor(king,steel,s*.77,.98,1.05,.65,1.0,.72,.12);armor(king,black,s*.78,.48,1.37,.72,.26,1.06);
  for(let i=0;i<6;i++)cable(king,[[s*(.25+i*.12),4.83,-.41],[s*(1+i*.25),4.1,-.93],[s*(2.8+i*.13),1.20,-.8],[s*(3.2+i*.2),.15,1.45]],.025+(i%3)*.015);
 }
 // Heavy pleated insulating mantle: a draped surface, cut below the long machine arms.
 const mantle=surfaces.carbon.clone();mantle.color.setHex(0x28232b);mantle.side=THREE.DoubleSide;mantle.clearcoat=0;mantle.roughness=.91;mats.add(mantle);
 for(const side of [-1,1]){const positions=[],uvs=[],indices=[],cols=high?20:10,rows=high?28:14;for(let j=0;j<=rows;j++){const t=j/rows;for(let i=0;i<=cols;i++){const u=i/cols,x=side*(.90+u*(1.25+t*.75)+t*.18),fold=Math.cos(u*Math.PI*6+Math.sin(t*3)*.25);positions.push(x,4.73-t*4.38+(t>.88?Math.sin(i*2.7)*.09*(t-.88)/.12:0),-.13+t*.63+fold*(.13+t*.20));uvs.push(u,t*2);}}for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}const g=G(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();mesh(g,mantle,king);}
 // An enormous forked power throne. Recesses and asymmetry provide scale without luminous outlines.
 armor(root,black,0,.20,.10,6.8,.45,5.2);armor(root,steel,0,.44,.5,4.5,.12,3.9);
 armor(root,black,0,4.3,-1.05,3.6,7.7,.60);armor(root,steel,0,4.5,-.68,2.9,6.8,.14);
 for(let i=0;i<11;i++){const x=(i-5)*.28,h=6.9+Math.abs(i-5)*.35;box(root,black,x,h/2,-.40,.20,h,.30);for(let j=0;j<7;j++)box(root,bronze,x,1.1+j*.75,-.22,.11,.045,.035);if(i%3===0)box(root,red,x,6.6,-.20,.025,1.0,.02);}
 for(const s of [-1,1]){armor(root,black,s*2.12,1.7,.6,.77,3.3,2.4);armor(root,steel,s*2.12,2.48,.80,1.14,.23,2.4);box(root,rubber,s*2.12,2.61,1.04,.85,.04,1.73);}
 // Floor machinery at camera edges, deep segmented buttresses and a distant industrial nave.
 box(root,black,0,-.12,-2,30,.2,35);
 for(let z=6;z> -18;z-=2){box(root,steel,0,.005,z,2.0,.015,.025);for(const s of [-1,1])box(root,black,s*4,.015,z,1.8,.025,1.9);}
 for(let layer=0;layer<6;layer++){const z=-3-layer*2.5,w=4.5+layer*.8;for(const s of [-1,1]){
  armor(root,black,s*w,4.3,z,.90,8.6,1.0,0,0,-s*.12);rod(root,[s*w,7.3,z],[s*(w-2.4),10.6,z],.22,steel);box(root,red,s*(w-.46),5.3,z+.55,.06,2.1,.05);
  for(let n=0;n<6;n++){box(root,steel,s*w,1+n*1.2,z+.6,1.1,.10,.24);}
 }}
 for(const s of [-1,1]){
  armor(root,black,s*4.75,1.30,4.4,2.5,2.6,3.1,0,s*.15);armor(root,steel,s*4.75,2.65,4.1,2.6,.14,2.8,.1,s*.15);
  for(let i=0;i<8;i++){box(root,rubber,s*4.75,1.0+i*.15,5.99,1.7,.045,.04);if(i<3)box(root,red,s*(4.0+i*.18),2.35,5.95,.045,.11,.04);}
  cable(root,[[s*4.4,.1,6.2],[s*3.3,.3,4],[s*3.1,.2,2.5]],.10);
  for(let i=0;i<5;i++)cable(root,[[s*(5+i*.28),9,-4],[s*(3+i*.3),8.0,-2],[s*(2.8+i*.2),6.3,-1.6],[s*(1.2+i*.15),5,-.9]],.035+(i%2)*.035);
 }
 // Small distant telemetry slots, not a wall-sized high contrast billboard.
 for(const s of [-1,1])for(let i=0;i<6;i++){const x=s*(6+i*.75);box(root,black,x,4,-14, .55,8,.6);for(let j=0;j<12;j++){box(root,steel,x,.7+j*.6,-13.65,.42,.035,.05);if(j%3===0)box(root,red,x,.8+j*.6,-13.60,.11,.035,.025);}}
 const hazeCanvas=document.createElement('canvas');hazeCanvas.width=256;hazeCanvas.height=256;const hc=hazeCanvas.getContext('2d'),hg=hc.createRadialGradient(128,115,10,128,128,170);hg.addColorStop(0,'#38232f');hg.addColorStop(.5,'#1c1922');hg.addColorStop(1,'#07090f');hc.fillStyle=hg;hc.fillRect(0,0,256,256);const hazeTex=new THREE.CanvasTexture(hazeCanvas);hazeTex.colorSpace=THREE.SRGBColorSpace;textures.add(hazeTex);const hazeMat=new THREE.MeshBasicMaterial({map:hazeTex,depthWrite:false});mats.add(hazeMat);mesh(G(new THREE.PlaneGeometry(40,25)),hazeMat,root,0,6,-20);
 const lights=[[0xff1234,75,-3.8,6,-.9,12],[0xff1832,40,3.3,3,-1.5,10],[0xb5cada,15,-2.4,6.6,4,11],[0x38516c,18,4.7,5.8,2.4,12],[0xff1024,2.5,0,4,.95,3]];
 for(const [color,intensity,x,y,z,distance]of lights){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);root.add(l);}
 // Combine fixed siblings by material. Head and finger transforms remain independent.
 function batch(parent){for(const child of [...parent.children])if(child.isGroup)batch(child);const bins=new Map();for(const o of parent.children)if(o.isMesh){const a=bins.get(o.material)||[];a.push(o);bins.set(o.material,a);}for(const [material,list]of bins){if(list.length<2)continue;const arrays={position:[],normal:[],uv:[]};for(const o of list){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);for(const key in arrays){const attribute=g.getAttribute(key);if(attribute)for(const v of attribute.array)arrays[key].push(v);}g.dispose();parent.remove(o);}const g=G(new THREE.BufferGeometry());for(const key in arrays)if(arrays[key].length)g.setAttribute(key,new THREE.Float32BufferAttribute(arrays[key],key==='uv'?2:3));mesh(g,material,parent);}}
 batch(root);
 function update(dt,time){head.rotation.y=Math.sin(time*.23)*.025;head.rotation.z=Math.sin(time*.15)*.009;head.position.y=5.53+Math.sin(time*.7)*.008;fingers.forEach((f,i)=>f.rotation.x=Math.sin(time*.65+i*.8)*.025);red.emissiveIntensity=1.65+Math.sin(time*.8)*.12;eye.emissiveIntensity=3.8+Math.sin(time*1.3)*.25;}
 function dispose(){if(disposed)return;disposed=true;root.removeFromParent();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());surfaces.dispose();root.clear();}
 return {root,update,dispose};
}
