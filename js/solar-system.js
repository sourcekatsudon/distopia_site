import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// All locations are fictional. Centralized data keeps map, buttons and detail panel in sync.
const branches = {
 sun:{name:"チキンハウス 太陽圏本部店",address:"太陽–地球系 L1・中央供給ステーション SUN-L1 / B区画 02階",access:"地球軌道港より定期シャトル SUN-L1 線",hours:"06:00–24:00",tel:"SUN-L1-CH-001"},
 earth:{name:"チキンハウス 地球・第1居住区店",address:"地球・旧日本列島 関東居住ブロック E-JP-07 / 4層北街区",access:"地球環状輸送線 E7、中央交通ターミナルから徒歩6分",hours:"07:00–23:00",tel:"EAR-EJP-CH-007"},
 mars:{name:"チキンハウス 火星・オリンポス店",address:"火星・オリンポス山麓 第3居住ドーム M-OLY-03 / 西区画",access:"火星赤道リニア M3、オリンポス山麓ドーム駅直結",hours:"06:00–22:00",tel:"MAR-OLY-CH-003"},
 callisto:{name:"チキンハウス カリスト・ヴァルハラ店",address:"木星第4衛星カリスト・ヴァルハラ居住区 C-VLH-12 / 地下2層",access:"木星圏周回シャトル C12、ヴァルハラ港より連絡トラム",hours:"08:00–22:00",tel:"JOV-CAL-CH-012"},
 saturn:{name:"チキンハウス 土星・タイタン港店",address:"土星第6衛星タイタン・クラーケン海航路港 T-KRK-04 / 第2気密棟",access:"土星圏連絡船、タイタン・クラーケン港着",hours:"07:00–21:00",tel:"SAT-TIT-CH-004"},
 neptune:{name:"チキンハウス 海王星・トリトン店",address:"海王星第1衛星トリトン・南極熱源基地 N-TRI-06 / 供給棟",access:"外惑星輸送航路 N6、トリトン極域港より加圧車両",hours:"09:00–20:00",tel:"NEP-TRI-CH-006"}
};
const selectButtons=[...document.querySelectorAll("[data-planet]")];
function selectBranch(id){
 const data=branches[id];if(!data)return;
 for(const [suffix,key] of [["name","name"],["address","address"],["access","access"],["hours","hours"],["tel","tel"]]){
   const el=document.getElementById("branch-"+suffix);if(el)el.textContent=data[key];
 }
 selectButtons.forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.planet===id)));
}
selectButtons.forEach(el=>el.addEventListener("click",()=>selectBranch(el.dataset.planet)));

const target=document.getElementById("solar-system");
if(target){
 try{initialize(target);}catch(error){console.error("Solar map could not be initialized:",error);displayFallback(target);}
}
function displayFallback(root){
 const message=root.querySelector(".solar-fallback");if(message)message.textContent="3Dマップを表示できません。上の天体ボタンから店舗情報をご覧ください。";
}
function initialize(root){
 const width=Math.max(root.clientWidth,300),height=Math.max(root.clientHeight,300);
 const scene=new THREE.Scene();scene.background=new THREE.Color("#0b1222");
 const camera=new THREE.PerspectiveCamera(43,width/height,.1,1000);
 camera.position.set(0,53,103);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"low-power"});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(width,height);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.28;
 root.querySelector(".solar-fallback")?.remove();
 root.insertBefore(renderer.domElement,root.firstChild);
 const controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.dampingFactor=.06;controls.minDistance=35;controls.maxDistance=220;
 controls.maxPolarAngle=Math.PI*.87;controls.target.set(0,0,0);
 scene.add(new THREE.AmbientLight(0xb3c7e8,1.1));
 const sunlight=new THREE.PointLight(0xfff1d4,1650,250,1.4);sunlight.position.set(0,0,0);scene.add(sunlight);
 const geometry=new THREE.SphereGeometry(1,48,32);
 const bodies=[];
 const planetData=[
  {id:"sun",size:5.1,orbit:0,angle:0,type:"sun",rotation:0},
  {id:"mercury",size:.75,orbit:11,angle:2.55,type:"rock",rotation:.1},
  {id:"venus",size:1.3,orbit:17,angle:-2.1,type:"venus",rotation:.1},
  {id:"earth",size:1.8,orbit:24,angle:.9,type:"earth",rotation:.35},
  {id:"mars",size:1.45,orbit:31,angle:-.55,type:"mars",rotation:.15},
  {id:"jupiter",size:4.15,orbit:42,angle:2.5,type:"jupiter",rotation:.2},
  {id:"callisto",size:.9,orbit:47,angle:2.63,type:"rock",rotation:.12},
  {id:"saturn",size:3.45,orbit:56,angle:-2.3,type:"saturn",rotation:0},
  {id:"uranus",size:2.3,orbit:67,angle:.65,type:"uranus",rotation:0},
  {id:"neptune",size:2.25,orbit:78,angle:-.9,type:"neptune",rotation:0}
 ];
 const source=new THREE.Vector3(0,0,0);
 for(const p of planetData){
  const texture=createTexture(p.type);
  const mat=p.id==="sun"?new THREE.MeshBasicMaterial({map:texture,color:0xffffff}):new THREE.MeshStandardMaterial({map:texture,roughness:1,metalness:0});
  const mesh=new THREE.Mesh(geometry,mat);
  mesh.scale.setScalar(p.size);mesh.position.set(Math.cos(p.angle)*p.orbit,0,Math.sin(p.angle)*p.orbit);mesh.rotation.y=p.rotation;mesh.userData.planet=p.id;
  scene.add(mesh);bodies.push(mesh);
  if(p.id==="saturn"||p.id==="uranus"){
   const ring=new THREE.Mesh(new THREE.RingGeometry(p.size*1.35,p.size*(p.id==="saturn"?2.14:1.63),128),new THREE.MeshBasicMaterial({color:p.id==="saturn"?0xbba27b:0xb3d6d7,side:THREE.DoubleSide,transparent:true,opacity:.74,depthWrite:false}));
   ring.rotation.x=-Math.PI/2.4;ring.rotation.y=.16;mesh.add(ring);ring.scale.setScalar(1/p.size);
  }
  if(p.orbit){
   const pts=[];for(let i=0;i<=192;i++){const a=i/192*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*p.orbit,0,Math.sin(a)*p.orbit));}
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x53617a,transparent:true,opacity:.3}));scene.add(line);
  }
 }
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:makeGlow(),color:0xffa44b,transparent:true,opacity:.42,depthWrite:false,blending:THREE.AdditiveBlending}));
 glow.scale.set(23,23,1);scene.add(glow);
 const points=new Float32Array(1700*3);for(let i=0;i<1700;i++){const a=Math.random()*Math.PI*2,z=Math.random()*2-1,r=Math.sqrt(1-z*z),d=180+Math.random()*140;points[i*3]=r*Math.cos(a)*d;points[i*3+1]=z*d;points[i*3+2]=r*Math.sin(a)*d;}
 const stars=new THREE.BufferGeometry();stars.setAttribute("position",new THREE.BufferAttribute(points,3));
 scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xcbdcfb,size:.7,sizeAttenuation:false,transparent:true,opacity:.9})));
 const raycaster=new THREE.Raycaster();const mouse=new THREE.Vector2();const cursorPoint=new THREE.Vector2();
 function pick(ev){const rect=renderer.domElement.getBoundingClientRect();mouse.set(((ev.clientX-rect.left)/rect.width)*2-1,-((ev.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(bodies);return hits.length?hits[0].object.userData.planet:null;}
 renderer.domElement.addEventListener("click",ev=>{const id=pick(ev);if(branches[id])selectBranch(id);});
 renderer.domElement.addEventListener("pointermove",ev=>{const id=pick(ev);renderer.domElement.style.cursor=branches[id]?"pointer":"grab";});
 const obs=new ResizeObserver(entries=>{const rect=entries[0].contentRect;if(rect.width<1||rect.height<1)return;camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.setSize(rect.width,rect.height);});obs.observe(root);
 let visible=true;const viewObserver=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;});viewObserver.observe(root);
 let last=0;
 function render(t){requestAnimationFrame(render);if(!visible||document.hidden)return;const dt=Math.min((t-last)/1000,.05)||.016;last=t;for(const mesh of bodies){if(mesh.userData.planet!=="sun")mesh.rotation.y+=dt*.033;}controls.update();renderer.render(scene,camera);}
 requestAnimationFrame(render);
}
function makeGlow(){const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d"),g=x.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,"rgba(255,210,110,.95)");g.addColorStop(.3,"rgba(255,150,55,.44)");g.addColorStop(1,"rgba(255,120,20,0)");x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
function createTexture(type){
 const canvas=document.createElement("canvas");const w=768,h=384;canvas.width=w;canvas.height=h;const ctx=canvas.getContext("2d");
 const palettes={
 sun:["#f08b18","#ffcc4f","#d74c0a","#ffd771"],
 rock:["#6c675e","#a29b8d","#55524c","#858077"],
 venus:["#ddc39b","#b3916b","#e6d0a9","#ad946f"],
 earth:["#143f7c","#175b9b","#205b88","#2574aa"],
 mars:["#b75e36","#d17a46","#8b422e","#dca06d"],
 jupiter:["#d3ba96","#987558","#e8d2b0","#b18b6c"],
 saturn:["#d5bb8e","#c7ad82","#f0d8ad","#aa9675"],
 uranus:["#a8d8da","#84bfc8","#c1e9e8","#79b5bc"],
 neptune:["#2456a1","#3068b4","#183a82","#447ccc"]
 };
 const colors=palettes[type]||palettes.rock;
 ctx.fillStyle=colors[0];ctx.fillRect(0,0,w,h);
 let seed=type.split("").reduce((a,c)=>a*31+c.charCodeAt(0),17)>>>0;
 function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
 if(["jupiter","saturn","uranus","neptune","venus","sun"].includes(type)){
  for(let y=0;y<h;){const band=3+rand()*29;ctx.fillStyle=colors[Math.floor(rand()*colors.length)];ctx.globalAlpha=type==="sun"?.5:.22+rand()*.28;ctx.fillRect(0,y,w,band);y+=band;}
  ctx.globalAlpha=1;
  for(let i=0;i<(type==="sun"?130:75);i++){const x=rand()*w,y=rand()*h;ctx.fillStyle=colors[Math.floor(rand()*colors.length)];ctx.globalAlpha=.15+rand()*.35;ctx.beginPath();ctx.ellipse(x,y,5+rand()*46,1+rand()*8,0,0,Math.PI*2);ctx.fill();}
  if(type==="jupiter"){ctx.globalAlpha=.75;ctx.fillStyle="#a55235";ctx.beginPath();ctx.ellipse(w*.64,h*.69,55,20,-.1,0,Math.PI*2);ctx.fill();}
  if(type==="neptune"){ctx.globalAlpha=.38;ctx.fillStyle="#95b9f1";ctx.fillRect(0,h*.38,w,8);}
 }else if(type==="earth"){
  // Ocean base with irregular continental landmasses and cloudy ice caps.
  for(let i=0;i<28;i++){const cx=rand()*w,cy=70+rand()*240,rx=20+rand()*65,ry=10+rand()*45;ctx.fillStyle=["#52754b","#668452","#887a4b","#426947"][Math.floor(rand()*4)];ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,rand()*.7,0,Math.PI*2);ctx.fill();}
  for(let i=0;i<140;i++){ctx.strokeStyle="rgba(239,246,247,.2)";ctx.lineWidth=1+rand()*5;ctx.beginPath();let x=rand()*w,y=rand()*h;ctx.ellipse(x,y,10+rand()*42,2+rand()*9,rand(),0,Math.PI*2);ctx.stroke();}
  ctx.fillStyle="#ddeaf2";ctx.fillRect(0,0,w,21);ctx.fillRect(0,h-24,w,24);
 }else{
  for(let i=0;i<500;i++){const x=rand()*w,y=rand()*h,r=1+rand()*20;ctx.fillStyle=colors[Math.floor(rand()*colors.length)];ctx.globalAlpha=.12+rand()*.22;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();}
  for(let i=0;i<48;i++){const x=rand()*w,y=rand()*h,r=3+rand()*14;ctx.strokeStyle=type==="mars"?"rgba(75,29,21,.3)":"rgba(38,36,35,.28)";ctx.lineWidth=1+rand()*2;ctx.beginPath();ctx.ellipse(x,y,r,r*.65,0,0,Math.PI*2);ctx.stroke();}
 }
 ctx.globalAlpha=1;
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=THREE.RepeatWrapping;tex.anisotropy=4;return tex;
}
