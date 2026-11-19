import * as THREE from '../../vendor/three.module.js';
import { createSurfaceKit } from './material-kit.js';

// +Z is the threat-facing side. All shells use genuine cross-section lofts;
// broad, dark armour surrounds exposed steel load paths and recessed red optics.
const HIT={head:2,core:2.2,armor:1,limb:.8};
export function createRobot(type,{seed=1,quality='high'}={}){
  const hi=quality==='high',detail=quality!=='low',root=new THREE.Group(),hit=[],geos=new Map(),mats=[],sensors=[],flaps=[],spinners=[];
  const surfaces=createSurfaceKit({quality});
  let dead=false,state=(seed>>>0)||1,k=0,aim=0,hurt=0,phase=0,speed=5;
  const rnd=()=>(state=(state*1664525+1013904223)>>>0)/4294967296;
  const offset=rnd()*Math.PI*2; phase=offset;
  function surface(key,color,roughness){const a=surfaces[key].clone();a.color.setHex(color);a.roughness=roughness;a.normalMap=null;mats.push(a);return a;}
  const armor=surface('anodized',0x35414d,.58),dark=surface('anodized',0x0b1119,.66),steel=surface('titanium',0x657580,.42),frame=surface('skeleton',0x242e38,.65),rubber=surface('rubber',0x0a1015,.95);
  armor.color.setHex(0x27333f);armor.roughnessMap=null;armor.roughness=.76;armor.metalness=.70;armor.clearcoat=0;armor.envMapIntensity=.75;armor.color.offsetHSL(0,0,(rnd()-.5)*.025);
  function emission(color,power){const a=new THREE.MeshStandardMaterial({color:0x310208,emissive:color,emissiveIntensity:power,roughness:.3,metalness:.2});mats.push(a);sensors.push({m:a,power});return a;}
  const red=emission(0xff0015,3.3),hot=emission(0xff1530,2.2);
  const geometry=(key,make)=>{if(!geos.has(key))geos.set(key,make());return geos.get(key);};
  const box=(w,h,d)=>geometry('b'+[w,h,d],()=>new THREE.BoxGeometry(w,h,d));
  const cyl=(r,r2,h,n=8)=>geometry('c'+[r,r2,h,n],()=>new THREE.CylinderGeometry(r,r2,h,n));
  const ball=r=>geometry('s'+r,()=>new THREE.SphereGeometry(r,detail?12:8,6));
  // stations=[height,width,depth,depthOffset]. A flattened octagon makes broad
  // planes, chamfer highlights, a narrowing wrist/ankle and no cuboid corners.
  function loft(stations,n=8){const key='l'+JSON.stringify(stations)+n;return geometry(key,()=>{
    const pos=[],uv=[],indices=[];
    for(let j=0;j<stations.length;j++){const [y,w,d,z=0]=stations[j];for(let i=0;i<n;i++){
      const a=(i+.5)/n*Math.PI*2,s=Math.sin(a),c=Math.cos(a);
      pos.push(Math.sign(s)*Math.pow(Math.abs(s),.64)*w/2,y,z+Math.sign(c)*Math.pow(Math.abs(c),.64)*d/2);uv.push(i/n,j/(stations.length-1));
    }}
    for(let j=0;j<stations.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;indices.push(a,b,c,b,d,c);}
    const last=(stations.length-1)*n;for(let i=1;i<n-1;i++){indices.push(0,i+1,i,last,last+i,last+i+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
  });}
  function plate(w,h,d,cut=.18){return geometry('p'+[w,h,d,cut],()=>{
    const x=w/2,y=h/2,c=Math.min(w,h)*cut,pts=[[-x+c,-y],[x-c,-y],[x,-y+c],[x,y-c],[x-c,y],[-x+c,y],[-x,y-c],[-x,-y+c]],s=new THREE.Shape();
    pts.forEach(([a,b],i)=>i?s.lineTo(a,b):s.moveTo(a,b));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:detail,bevelSize:.006,bevelThickness:.006,bevelSegments:1,curveSegments:1});g.translate(0,0,-d/2);return g;
  });}
  const group=(p,x=0,y=0,z=0)=>{const a=new THREE.Group();a.position.set(x,y,z);p.add(a);return a;};
  function mesh(p,g,m,x=0,y=0,z=0,part='',rx=0,ry=0,rz=0){const a=new THREE.Mesh(g,m);a.position.set(x,y,z);a.rotation.set(rx,ry,rz);p.add(a);if(part){a.userData={part,multiplier:HIT[part]};hit.push(a);}return a;}
  function rod(p,a,b,r,mat=steel,part=''){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va),m=mesh(p,cyl(r,r,delta.length(),6),mat,...va.add(vb).multiplyScalar(.5).toArray(),part);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
  function hinge(p,x,y,z,w,h,d,side,mat=armor){const hng=group(p,x,y,z);mesh(hng,plate(w,h,d),mat,-side*w*.5,0,0,'armor');flaps.push({g:hng,side});return hng;}
  function cable(p,points,r=.015){if(!detail)return;const c=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)));const g=new THREE.TubeGeometry(c,hi?12:8,r,5,false);geos.set('cable'+geos.size,g);mesh(p,g,rubber);}
  function joint(p,r,x=0,y=0,z=0){mesh(p,cyl(r,r,.13,detail?12:8),steel,x,y,z,'limb',0,0,Math.PI/2);if(hi)mesh(p,cyl(r*.52,r*.52,.145,8),dark,x,y,z,'limb',0,0,Math.PI/2);}
  function head(p,scale=1){const h=group(p);h.scale.setScalar(scale);
    // Swept helmet, pinched mandible and back-heavy crown, deliberately unlike a human skull.
    mesh(h,loft([[-.175,.19,.20,.015],[-.10,.28,.30,.005],[.035,.34,.32,-.025],[.17,.32,.30,-.05],[.235,.19,.23,-.06]]),armor,0,0,0,'head');
    mesh(h,plate(.36,.105,.08,.26),dark,0,.065,.155,'head',-.14);
    for(const side of [-1,1]){
      // Large scarlet paired optical wedges within deep black sockets. No cyan facial trim.
      mesh(h,plate(.128,.064,.028,.22),dark,side*.085,.006,.162,'head',0,0,-side*.12);
      mesh(h,plate(.101,.029,.018,.25),red,side*.085,.006,.183,'head',0,0,-side*.12);
      mesh(h,loft([[-.16,.075,.07,0],[-.07,.085,.12,.025],[.005,.055,.065,.025]]),dark,side*.13,-.005,.12,'head',0,0,-side*.17);
      if(detail){rod(h,[side*.12,-.13,.075],[side*.145,-.205,-.025],.017,steel,'head');mesh(h,cyl(.032,.032,.025,8),frame,side*.172,-.055,.005,'head',0,0,Math.PI/2);}
    }
    mesh(h,plate(.155,.09,.085,.24),frame,0,-.145,.10,'head',.23);
    if(hi)for(let i=-1;i<=1;i++)mesh(h,box(.018,.055,.012),dark,i*.035,-.14,.149,'head');
    return h;
  }
  function pelvis(p,width,height,depth){
    mesh(p,loft([[-height*.52,width*.64,depth*.7,.025],[-height*.05,width,depth,0],[height*.44,width*.82,depth*.78,-.025]]),dark,0,0,0,'armor');
    for(const side of [-1,1]){mesh(p,plate(width*.4,height*.82,depth*.22,.28),armor,side*width*.29,-height*.05,depth*.43,'armor',.1,side*.16,-side*.15);joint(p,width*.11,side*width*.45,-height*.12,0);}
    mesh(p,loft([[-height*.9,width*.19,depth*.28,.07],[-height*.12,width*.32,depth*.4,.10],[height*.18,width*.2,depth*.28,.08]]),armor,0,0,depth*.28,'armor');
  }
  function leg(p,side,x,y,L,w){const hip=group(p,side*x,y,0),knee=group(hip,0,-L,.025);
    // Side piston is part of the structural load path; armour tapers around it.
    mesh(hip,loft([[-L+.07,w*.66,w*.67,.015],[-L*.58,w*.89,w*.86,0],[-L*.18,w*1.16,w*1.15,-.015],[.035,w*.7,w*.72,0]]),armor,0,0,0,'armor');
    rod(hip,[side*w*.48,-.08,-.04],[side*w*.38,-L+.04,.015],w*.09,steel,'limb');
    if(detail){mesh(hip,plate(w*.64,L*.48,w*.12,.2),dark,0,-L*.37,w*.5,'armor',-.1);cable(hip,[[side*w*.38,-.06,-.10],[side*w*.56,-L*.4,-.14],[side*w*.30,-L+.04,-.07]],w*.06);}
    joint(knee,w*.40);mesh(knee,plate(w*1.14,w*.94,w*.35,.26),armor,0,-.005,w*.35,'armor',-.28);mesh(knee,plate(w*.74,w*.50,w*.08,.26),dark,0,-.018,w*.57,'armor',-.28);
    mesh(knee,loft([[-L+.08,w*.6,w*.72,-.015],[-L*.6,w*.73,w*.83,.035],[-L*.16,w*.98,w*.91,.01],[-.03,w*.76,w*.7,0]]),armor,0,0,0,'armor');
    rod(knee,[side*w*.38,-.1,-.01],[side*w*.25,-L+.10,-.045],w*.07,steel,'limb');
    mesh(knee,loft([[-.09,w*.95,w*1.92,w*.29],[-.015,w*1.18,w*2.1,w*.30],[.10,w*.76,w*1.45,w*.18]]),dark,0,-L+.09,0,'limb');
    if(detail){mesh(knee,plate(w*.68,L*.48,w*.15,.23),frame,0,-L*.41,w*.47,'armor',-.08);for(const s of[-1,1])mesh(knee,plate(w*.42,.055,w*.45),steel,s*w*.25,-L+.06,w*.94,'limb',.15);}
    return [hip,knee];
  }
  function claw(p,a){mesh(p,loft([[-.17*a,.17*a,.13*a,.02*a],[-.03*a,.23*a,.18*a,0],[.06*a,.13*a,.13*a,0]]),frame,0,-.45*a,.035*a,'limb');
    for(let i=-1;i<=1;i++){
      rod(p,[i*.065*a,-.56*a,.07*a],[i*.074*a,-.68*a,.085*a],.025*a,steel,'limb');
      rod(p,[i*.074*a,-.68*a,.085*a],[i*.058*a,-.735*a,.16*a],.019*a,steel,'limb');
    }
    rod(p,[-.12*a,-.48*a,.04*a],[-.19*a,-.60*a,.09*a],.029*a,steel,'limb');
    rod(p,[-.19*a,-.60*a,.09*a],[-.12*a,-.66*a,.16*a],.021*a,steel,'limb');
  }
  function arm(p,side,x,y,a,gun=false){const sh=group(p,side*x,y,0),el=group(sh,0,-.43*a,0);
    joint(sh,.105*a);
    mesh(sh,loft([[-.22*a,.22*a,.21*a,0],[-.04*a,.36*a,.34*a,-.025*a],[.13*a,.39*a,.29*a,-.04*a],[.20*a,.21*a,.21*a,-.045*a]]),armor,side*.045*a,.05*a,0,'armor',0,0,-side*.2);
    mesh(sh,loft([[-.40*a,.14*a,.16*a,0],[-.27*a,.21*a,.21*a,0],[-.09*a,.17*a,.19*a,0]]),armor,0,0,0,'armor');
    if(detail){rod(sh,[side*.12*a,-.11*a,-.02*a],[side*.105*a,-.37*a,0],.025*a,steel,'limb');mesh(sh,plate(.23*a,.045*a,.065*a),dark,side*.05*a,.14*a,.15*a,'armor',0,0,-side*.17);}
    joint(el,.092*a);
    mesh(el,loft([[-.42*a,.16*a,.17*a,.02*a],[-.27*a,.25*a,.26*a,.015*a],[-.08*a,.24*a,.23*a,0],[-.025*a,.13*a,.14*a,0]]),armor,0,0,0,'armor');
    rod(el,[side*.1*a,-.05*a,.03*a],[side*.08*a,-.37*a,.07*a],.017*a,steel,'limb');
    if(gun){mesh(el,loft([[-.72*a,.13*a,.15*a,.035*a],[-.59*a,.21*a,.22*a,.035*a],[-.19*a,.24*a,.25*a,.035*a]]),dark,0,0,.07*a,'armor');mesh(el,cyl(.048*a,.065*a,.25*a,8),steel,0,-.69*a,.10*a,'limb');mesh(el,cyl(.034*a,.034*a,.013*a,8),red,0,-.824*a,.10*a);if(hi)for(let i=0;i<3;i++)mesh(el,plate(.19*a,.025*a,.04*a),frame,0,(-.3-i*.09)*a,.22*a,'armor');}
    else claw(el,a);
    return [sh,el];
  }
  function walk(legs,arms,a,b){for(let i=0;i<2;i++){const v=phase+i*Math.PI,sn=Math.sin(v),c=Math.cos(v);legs[i][0].rotation.x=sn*a*k;legs[i][1].rotation.x=.035+Math.max(0,-c)*b*k;arms[i][0].rotation.x=-sn*a*.6*k-.10;arms[i][0].rotation.z=(i===0?-1:1)*.08;arms[i][1].rotation.x=-.18-Math.max(0,c)*.15*k;}}
  function soldier(){
    const pel=group(root,0,1.10,0),tor=group(pel,0,.12,0),neck=group(tor,0,.87,0),hd=head(neck);hd.position.y=.115;
    pelvis(pel,.73,.28,.36);
    // Upper body is a shallow inverted wedge, floating above a visible articulated waist.
    mesh(tor,loft([[.26,.42,.32,0],[.57,.72,.39,-.02],[.77,.66,.31,-.025],[.82,.36,.24,-.035]]),dark,0,0,0,'armor');
    for(const side of[-1,1]){
      const f=hinge(tor,side*.375,.575,.18,.345,.43,.12,side);mesh(f,plate(.25,.31,.024,.25),dark,-side*.17,.012,.075,'armor',0,0,side*.06);mesh(f,plate(.19,.10,.028,.24),frame,-side*.16,-.125,.099,'armor',.13,0,side*.15);if(detail)for(let i=0;i<3;i++)mesh(f,plate(.15,.018,.035,.2),steel,-side*.16,.06+i*.06,.1,'armor',0,0,side*.08);
      rod(tor,[side*.14,.02,.02],[side*.22,.35,.045],.047,steel,'limb');
      rod(tor,[side*.16,.79,-.015],[side*.42,.70,0],.052,armor,'armor');
      cable(tor,[[side*.23,.76,-.17],[side*.42,.51,-.27],[side*.20,.16,-.13]],.02);
      if(detail)for(let i=0;i<3;i++)mesh(tor,plate(.16-i*.025,.045,.14),frame,side*.135,.20+i*.07,.035,'limb',0,0,side*.28);
    }
    for(let j=0;j<3;j++)mesh(tor,cyl(.09,.09,.042,8),frame,0,.08+j*.07,.045,'limb');
    mesh(tor,plate(.105,.29,.04,.30),hot,0,.56,.20,'core');mesh(tor,cyl(.052,.055,.35,8),steel,0,.17,-.035,'limb');
    mesh(tor,loft([[.35,.36,.12,0],[.67,.44,.18,-.035],[.77,.31,.13,-.02]]),frame,0,0,-.24,'armor');
    for(let i=0;i<(detail?3:1);i++)mesh(neck,cyl(.061,.068,.045,8),steel,0,-.11+i*.052,-.035,'limb');
    const legs=[1,-1].map(s=>leg(pel,s,.24,-.10,.5,.245)),arms=[1,-1].map(s=>arm(tor,s,.51,.70,1,s===1));
    return()=>{walk(legs,arms,.48,.64);pel.position.y=1.10+Math.cos(phase*2)*.014*k;tor.rotation.set(.035*k-hurt*.25,Math.sin(phase)*.075*k,0);neck.rotation.set(hurt*.22,-Math.sin(phase)*.16*k,0);arms[0][0].rotation.x=THREE.MathUtils.lerp(arms[0][0].rotation.x,-1.43,aim);arms[0][1].rotation.x*=1-aim*.9;};
  }
  function heavy(){speed=2.65;
    const pel=group(root,0,1.61,0),tor=group(pel,0,.23,0),neck=group(tor,0,1.24,.04),hd=head(neck,1.12);hd.position.y=.09;
    pelvis(pel,1.22,.40,.7);
    mesh(tor,loft([[.18,.77,.65,-.02],[.62,1.20,.78,-.09],[1.04,1.03,.68,-.08],[1.13,.62,.46,-.03]]),dark,0,0,0,'armor');
    for(const side of[-1,1]){
      const f=hinge(tor,side*.60,.70,.34,.55,.72,.16,side);mesh(f,plate(.43,.54,.035,.22),dark,-side*.27,.015,.104,'armor',0,0,side*.04);mesh(f,plate(.35,.18,.045),frame,-side*.26,-.22,.14,'armor',.1,0,side*.16);for(let i=0;i<(detail?5:3);i++)mesh(f,plate(.30,.027,.06,.22),steel,-side*.27,.20-i*.08,.145,'armor',0,0,side*.10);rod(f,[-side*.43,-.24,.12],[-side*.43,.25,.12],.023,frame,'limb');
      rod(tor,[side*.24,.04,.03],[side*.34,.40,.07],.055,steel,'limb');
      mesh(tor,loft([[.70,.22,.24,0],[1.20,.30,.35,-.03],[1.40,.19,.20,-.06]]),frame,side*.38,0,-.51,'armor');
      mesh(tor,cyl(.075,.075,.035,8),hot,side*.38,1.40,-.57);
      mesh(pel,plate(.30,.55,.26,.22),armor,side*.60,-.05,0,'armor',0,side*.12,-side*.17);
      cable(tor,[[side*.35,1.06,-.42],[side*.65,.70,-.52],[side*.30,.21,-.39]],.035);
    }
    mesh(tor,plate(.13,.52,.05,.24),hot,0,.71,.405,'core');
    mesh(tor,cyl(.23,.23,.79,12),frame,0,.70,-.55,'armor');mesh(tor,cyl(.17,.17,.51,12),red,0,.70,-.57,'core');
    // Tall asymmetrical shield breaks the infantry/mannequin outline.
    mesh(tor,loft([[.48,.25,.43,0],[.72,.34,.71,0],[1.36,.38,.70,-.02],[1.54,.19,.43,-.04]]),armor,-.96,0,.02,'armor',0,0,.10);
    mesh(tor,plate(.12,.52,.055),dark,-1.10,1.04,.385,'armor',0,0,.10);
    const legs=[1,-1].map(s=>leg(pel,s,.43,-.13,.74,.40)),arms=[1,-1].map(s=>arm(tor,s,.90,1.0,1.38,false));
    // Gatling assembly points down at rest, raised mechanically when firing.
    const cannon=group(arms[0][1],0,-.58,.13);for(let i=0;i<6;i++){const a=i*Math.PI/3;mesh(cannon,cyl(.039,.047,.72,6),steel,Math.cos(a)*.13,-.30,Math.sin(a)*.13,'limb');}
    for(const y of[-.07,-.54])mesh(cannon,cyl(.205,.205,.075,12),dark,0,y,0,'armor');mesh(cannon,cyl(.075,.075,.035,8),red,0,-.67,0);
    return dt=>{walk(legs,arms,.30,.48);pel.position.y=1.61+Math.cos(phase*2)*.022*k;tor.rotation.set(.07-hurt*.22,Math.sin(phase)*.05*k,Math.sin(phase)*.02*k);neck.rotation.y=-Math.sin(phase)*.10*k;arms[0][0].rotation.x=THREE.MathUtils.lerp(arms[0][0].rotation.x,-1.47,aim);arms[0][1].rotation.x*=1-aim;cannon.rotation.y+=dt*(2+aim*25);};
  }
  function drone(){const body=group(root,0,1.65,0);
    mesh(body,loft([[-.19,.60,.47,0],[-.06,1.04,.68,-.02],[.12,.94,.54,-.045],[.22,.52,.38,-.04]]),dark,0,0,0,'armor');
    for(const side of[-1,1])hinge(body,side*.56,.085,.005,.44,.19,.50,side);
    mesh(body,cyl(.20,.20,.08,12),frame,0,.01,.34,'armor',Math.PI/2);mesh(body,ball(.135),red,0,.01,.40,'core').scale.set(1,.74,.5);
    for(const side of[-1,1])for(const fore of[-1,1]){const x=side*.75,z=fore*.36;
      rod(body,[side*.30,0,fore*.14],[x,0,z],.035,frame,'limb');const fan=group(body,x,.005,z);
      mesh(fan,cyl(.17,.13,.23,detail?12:8),armor,0,0,0,'limb');mesh(fan,cyl(.21,.21,.055,12),dark,0,.12,0,'armor');mesh(fan,cyl(.105,.13,.035,10),hot,0,-.13,0);
      const rotor=mesh(fan,box(.32,.014,.04),steel,0,.15,0);spinners.push(rotor);if(hi)mesh(fan,cyl(.06,.06,.05,8),frame,0,.15,0);
    }
    const gun=group(body,0,-.18,.20);mesh(gun,loft([[-.13,.26,.26,0],[.02,.32,.29,0],[.09,.18,.17,0]]),frame,0,0,0,'armor');
    for(const side of[-1,1]){rod(gun,[side*.12,.04,0],[side*.12,-.10,.18],.025,steel,'limb');mesh(gun,cyl(.03,.045,.36,8),dark,side*.065,-.09,.29,'limb',Math.PI/2);mesh(gun,cyl(.022,.022,.025,8),red,side*.065,-.09,.48,0,Math.PI/2);}
    return(dt,t)=>{body.position.y=1.65+Math.sin(t*2.2+offset)*.06;body.rotation.set(.17*k-hurt*.3,0,Math.sin(t*1.6+offset)*.045+hurt*.17);gun.rotation.set(Math.sin(t*1.3)*.08*(1-aim),Math.sin(t*.8+offset)*.4*(1-aim),0);for(let i=0;i<spinners.length;i++)spinners[i].rotation.y+=dt*(40+k*20)*(i%2?-1:1);};
  }
  const tick=({soldier,heavy,drone}[type]||soldier)();
  // One batch per material AND damage region, beneath each animated parent.
  // This keeps shutters, knees, elbows and rotor blades independently operable.
  function batch(parent){for(const c of [...parent.children])if(c.isGroup)batch(c);const bins=new Map();for(const o of parent.children)if(o.isMesh&&!spinners.includes(o)){const key=mats.indexOf(o.material)+':'+(o.userData.part||'');if(!bins.has(key))bins.set(key,[]);bins.get(key).push(o);}
    for(const list of bins.values()){if(list.length<2)continue;const arrays={position:[],normal:[],uv:[]};for(const o of list){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);for(const key of Object.keys(arrays)){const a=g.getAttribute(key);if(a)for(const n of a.array)arrays[key].push(n);}g.dispose();parent.remove(o);const i=hit.indexOf(o);if(i>=0)hit.splice(i,1);}
      const g=new THREE.BufferGeometry();for(const key of Object.keys(arrays))g.setAttribute(key,new THREE.Float32BufferAttribute(arrays[key],key==='uv'?2:3));geos.set('batch'+geos.size,g);const o=new THREE.Mesh(g,list[0].material);o.userData={...list[0].userData};parent.add(o);if(o.userData.part)hit.push(o);
    }
  }
  batch(root);hit.sort((a,b)=>['armor','head','core','limb'].indexOf(a.userData.part)-['armor','head','core','limb'].indexOf(b.userData.part));
  root.name=type==='drone'?'Sentry Drone':type==='heavy'?'Heavy Enforcer':'Execution Soldier';
  return {root,hitMeshes:hit,
    update(dt,t,st={}){if(dead)return;st=st||{};const a=Math.min(1,dt*8);k+=(Number(!!st.moving)-k)*a;aim+=((st.state==='ATTACK'?1:0)-aim)*a;hurt+=((st.state==='STAGGER'?1:0)-hurt)*a;phase+=dt*speed*(.35+k);const pulse=.5+.5*Math.sin(t*4.5+offset);for(const s of sensors)s.m.emissiveIntensity=s.power*(.88+pulse*.18)+hurt*1.8+aim*.55;for(const f of flaps)f.g.rotation.y=f.side*(.18+pulse*.025+hurt*.48+aim*.09);tick(dt,t);},
    dispose(){if(dead)return;dead=true;root.removeFromParent();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());surfaces.dispose();}
  };
}
