import * as THREE from '../../vendor/three.module.js';
const HIT={head:2,core:2.2,armor:1,limb:.8};
export function createRobot(type,{seed=1,quality='high'}={}){
  const hi=quality==='high',root=new THREE.Group(),hit=[],geos=new Map(),mats=[],sens=[],plates=[],spin=[];
  let s=(seed>>>0)||1,dead=false,k=0,aim=0,hurt=0,spd=5;
  const rnd=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
  const ph0=rnd()*6.28;let ph=ph0;
  const mat=(c,mt,r,e)=>{const x=new THREE.MeshStandardMaterial({color:c,metalness:mt,roughness:r});if(e){x.emissive.setHex(e);x.emissiveIntensity=2;sens.push(x)}mats.push(x);return x};
  const blk=mat(0x15171a,.85,.45),ti=mat(0x465563,.86,.4),dk=mat(0x2b2f34,.75,.6),ch=mat(0xa0b3c3,.9,.24);
  const red=mat(0x200000,.2,.4,0xff001b),hot=mat(0x300000,.2,.4,0xff1731);
  ti.color.offsetHSL(0,0,(rnd()-.5)*.05);
  const g=(K,...a)=>{const q=K+a;if(!geos.has(q))geos.set(q,new THREE[K+'Geometry'](...a));return geos.get(q)};
  const B=(w,h,d)=>{if(Math.min(w,h)<.12||d<.07)return g('Box',w,h,d);const key='plate'+[w,h,d];if(!geos.has(key)){const r=Math.min(w,h)*.14,shape=new THREE.Shape(),points=[[-w/2+r,-h/2],[w/2-r,-h/2],[w/2,-h/2+r],[w/2,h/2-r],[w/2-r,h/2],[-w/2+r,h/2],[-w/2,h/2-r],[-w/2,-h/2+r]];points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const ge=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:1});ge.translate(0,0,-d/2);geos.set(key,ge);}return geos.get(key);},C=(a,b,h,n=8)=>g('Cylinder',a,b,h,n);
  const grp=(p,x=0,y=0,z=0)=>{const o=new THREE.Group();o.position.set(x,y,z);p.add(o);return o};
  const m=(p,ge,mt,x,y,z,part=0,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(ge,mt);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);p.add(o);if(part){o.userData.part=part;o.userData.multiplier=HIT[part];hit.push(o)}return o};
  const bolt=(p,x,y,z)=>{if(hi)m(p,C(.02,.02,.025,5),ch,x,y,z,0,Math.PI/2)};
  // hinged armour plate: sd=hinge side(+1 right), dir=open direction, ax=hinge axis
  const flap=(p,x,y,z,sd,dir,w,h,d,mt,part,ax='y')=>{const gp=grp(p,x,y,z);m(gp,B(w,h,d),mt,-sd*w/2,0,0,part,0,0,sd*.06);plates.push({gp,ax,s:sd*dir});return gp};
  const leg=(p,x,y,L,w)=>{const h=grp(p,x,y,0),kn=grp(h,0,-L,0),f=w*.5,sg=Math.sign(x);
    m(h,B(w,L,w*1.1),dk,0,-L/2,0,'limb');
    m(h,B(w*1.15,L*.4,w*.35),ti,0,-L*.3,w*.62,'armor',.12);
    m(h,C(w*.08,w*.08,L*.7,6),ch,sg*w*.62,-L*.45,w*.2);
    m(kn,g('Sphere',w*.48,8,6),ch,0,0,0,'limb');
    m(kn,B(w*1.1,w*.8,w*.7),ti,0,0,w*.5,'armor',-.2);
    m(kn,B(w*.85,L,w),dk,0,-L/2,0,'limb');
    m(kn,B(w*.8,L*.55,w*.3),ti,0,-L*.4,w*.58,'armor',-.12);
    m(kn,B(w*1.05,f,w*2.1),blk,0,-L,w*.45,'limb');
    return[h,kn]};
  const arm=(p,x,y,a)=>{const sh=grp(p,x,y,0),el=grp(sh,0,-.42*a,0);
    m(sh,B(.12*a,.42*a,.12*a),dk,0,-.21*a,0,'limb');
    m(el,B(.11*a,.4*a,.14*a),blk,0,-.2*a,.01,'limb');
    m(el,C(.016*a,.016*a,.34*a,6),ch,Math.sign(x)*.075*a,-.2*a,.06*a);
    m(el,B(.12*a,.14*a,.1*a),ti,0,-.47*a,0,'limb');
    return[sh,el]};
  const walk=(legs,arms,a,b)=>{for(let i=0;i<2;i++){const o=i*Math.PI,sn=Math.sin(ph+o),c=Math.cos(ph+o);
    legs[i][0].rotation.x=sn*a*k;legs[i][1].rotation.x=.14+Math.max(0,-c)*b*k;
    arms[i][0].rotation.x=-sn*a*.8*k-.1;arms[i][1].rotation.x=-.35-Math.max(0,c)*.2*k}};

  function soldier(){
    const pel=grp(root,0,1.05,0),tor=grp(pel,0,.1,0),hd=grp(tor,0,1.1,0);
    // head: angular mask, deep sockets, slanted red eyes
    m(hd,B(.31,.35,.29),ti,0,0,0,'head');
    m(hd,B(.34,.08,.10),blk,0,.1,.12,'head',.25);
    for(const sd of[-1,1]){m(hd,B(.075,.06,.06),blk,sd*.078,.045,.15);m(hd,B(.062,.014,.02),red,sd*.078,.045,.187,0,0,0,-sd*.25)}
    m(hd,B(.15,.09,.17),dk,0,-.19,.02,'head');
    m(hd,B(.19,.10,.06),blk,0,-.08,.165);for(const sd of [-1,1])m(hd,B(.05,.16,.07),ch,sd*.10,-.08,.17,0,0,0,sd*.22);
    // chest: split overlapping plates (hinged), small vertical core between
    m(tor,B(.05,.32,.05),hot,0,.52,.1,'core');
    for(const sd of[1,-1]){
      const f=flap(tor,sd*.36,.52,.08,sd,1,.33,.5,.14,ti,'armor');
      m(f,B(.3,.2,.06),blk,-sd*.15,-.1,.09,'armor',0,0,sd*.08);
      bolt(f,-sd*.28,.2,.075);
      m(tor,B(.42,.07,.2),ti,sd*.27,.75,0,'armor',0,0,-sd*.38);
    }
    // neck spine, exposed abdomen (spine, ribs, pistons), back pack
    for(let i=0;i<3;i++)m(tor,C(.045,.05,.05,6),i%2?ti:ch,0,.8+i*.065,-.02);
    m(tor,C(.04,.045,.3,6),ch,0,.12,-.05);
    if(hi)for(let i=0;i<3;i++)m(tor,B(.34-i*.04,.025,.2),ch,0,.04+i*.07,0);
    for(const sd of[-1,1])m(tor,C(.022,.022,.26,6),ch,sd*.13,.12,.07);
    m(tor,B(.62,.5,.1),blk,0,.52,-.16,'armor');
    m(tor,B(.26,.3,.1),dk,0,.5,-.25,'armor');
    if(hi){for(const sd of[-1,1])m(tor,C(.014,.014,.45,5),ti,sd*.1,.62,-.24,0,0,0,sd*.18);
      for(let i=0;i<3;i++)m(tor,B(.2,.02,.02),hot,0,.4+i*.05,-.305)}
    for(const sd of [-1,1]){const curve=new THREE.CatmullRomCurve3([[sd*.23,.75,-.22],[sd*.43,.45,-.29],[sd*.25,.10,-.15]].map(p=>new THREE.Vector3(...p))),ge=new THREE.TubeGeometry(curve,12,.018,5,false);geos.set('cable'+geos.size,ge);m(tor,ge,blk,0,0,0);}
    // pelvis + legs
    m(pel,B(.5,.18,.3),blk,0,0,0,'armor');
    m(pel,B(.2,.22,.1),ti,0,-.06,.17,'armor');
    const legs=[1,-1].map(sd=>leg(pel,sd*.17,0,.5,.2));
    // arms: right = forearm bolt cannon, left = claw
    const arms=[1,-1].map(sd=>{const a=arm(tor,sd*.5,.7,1);
      m(a[0],B(.34,.23,.36),ti,sd*.04,.03,0,'armor',0,0,-sd*.23);
      m(a[0],B(.20,.29,.19),blk,0,-.23,.045,'armor',0,0,-sd*.10);m(a[1],g('Sphere',.095,8,6),ch,0,0,0,'limb');
      m(a[1],B(.19,.25,.20),ti,0,-.20,.065,'armor');for(let i=0;i<3;i++)m(a[0],B(.19,.018,.025),blk,sd*.04,.03+i*.042,.19);return a});
    m(arms[0][1],C(.03,.04,.4,6),blk,0,-.72,0,'limb');
    m(arms[0][1],C(.045,.03,.05,6),red,0,-.94,0);
    if(hi)for(let i=0;i<3;i++)m(arms[1][1],B(.025,.14,.03),ti,(i-1)*.04,-.6,.02);
    return()=>{
      walk(legs,arms,.55,.7);
      const sn=Math.sin(ph);
      pel.position.y=1.03+Math.cos(ph*2)*.02*k;
      tor.rotation.set(.05*k-hurt*.3,sn*.1*k,0);
      hd.rotation.set(hurt*.25,-sn*.15*k,0);
      arms[0][0].rotation.x=THREE.MathUtils.lerp(arms[0][0].rotation.x,-1.35,aim);
      arms[0][1].rotation.x*=1-aim*.8;
    };
  }

  function heavy(){
    spd=2.6;
    const pel=grp(root,0,1.705,0),tor=grp(pel,0,.25,0),hd=grp(tor,0,1.12,.14);
    tor.rotation.x=.08;
    m(hd,B(.3,.26,.3),dk,0,0,0,'head');
    m(hd,B(.36,.07,.34),blk,0,.15,0,'head');
    m(hd,B(.24,.04,.02),red,0,.01,.155);
    m(tor,B(.04,.5,.04),hot,0,.55,.39,'core');
    m(tor,C(.18,.18,.62,8),hot,0,.55,-.58,'core');
    m(tor,B(1.1,.9,.75),blk,0,.5,0,'armor');
    for(const sd of[1,-1]){
      const f=flap(tor,sd*.5,.55,.42,sd,1,.48,.7,.12,ti,'armor');
      m(f,B(.4,.2,.08),blk,-sd*.2,-.2,.08,'armor');
      bolt(f,-sd*.4,.28,.065);
      flap(tor,sd*.3,.55,-.8,sd,-1,.27,.7,.06,dk,'armor');   // reactor cover flaps
      m(tor,C(.07,.09,.6,8),blk,sd*.32,.95,-.45,'armor');    // exhaust stacks
      m(pel,B(.2,.5,.6),ti,sd*.7,-.1,0,'armor');
    }
    for(const y of[.2,.9])m(tor,C(.3,.3,.1,10),dk,0,y,-.58);
    if(hi)for(const sd of[1,-1])m(tor,C(.04,.04,.5,6),ch,sd*.2,.5,-.42,0,0,0,sd*.4);
    m(tor,B(.14,1.0,.8),ti,-.95,1.05,.05,'armor',0,0,.1);   // big shoulder shield
    m(tor,B(.1,.7,.7),blk,-1.05,.98,.1,'armor',0,0,.18);
    m(tor,B(.5,.26,.5),blk,.85,.9,0,'armor',0,0,-.15);
    m(pel,B(1.2,.3,.8),blk,0,0,0,'armor');
    const legs=[1,-1].map(sd=>leg(pel,sd*.45,0,.8,.42));
    const arms=[1,-1].map(sd=>arm(tor,sd*.85,.8,1.8));
    const el=arms[0][1],bg=grp(el,0,-.9,0);
    m(el,C(.22,.26,.55,8),dk,0,-.5,0,'limb');
    for(let i=0;i<6;i++){const a=i*Math.PI/3;m(bg,C(.04,.04,.9,6),blk,Math.cos(a)*.13,-.4,Math.sin(a)*.13)}
    m(bg,C(.2,.2,.08,10),ti,0,-.15,0);
    m(bg,C(.2,.2,.08,10),ti,0,-.6,0);
    return(dt)=>{
      walk(legs,arms,.38,.55);
      const sn=Math.sin(ph);
      pel.position.y=1.675+Math.cos(ph*2)*.03*k;
      tor.rotation.set(.08-hurt*.3,sn*.07*k,sn*.03*k);
      hd.rotation.set(hurt*.3,-sn*.1*k,0);
      arms[0][0].rotation.x=THREE.MathUtils.lerp(arms[0][0].rotation.x,-1.45,aim);
      arms[0][1].rotation.x*=1-aim;
      arms[1][0].rotation.x=THREE.MathUtils.lerp(arms[1][0].rotation.x,-.5,aim);
      bg.rotation.y+=dt*(2+aim*30);
    };
  }

  function drone(){
    const bd=grp(root,0,1.65,0);
    m(bd,g('Cylinder',.5,.58,.14,6),blk,0,0,0,'armor').scale.x=1.35;
    m(bd,g('Cylinder',.3,.46,.1,6),dk,0,-.11,0,'armor').scale.x=1.35;
    for(const sd of[1,-1])flap(bd,sd*.5,.1,0,sd,-1,.46,.05,.7,ti,'armor','z');
    m(bd,g('Cylinder',.17,.17,.06,12),blk,0,.02,.48,0,Math.PI/2);
    m(bd,g('Sphere',.13,12,8),red,0,.02,.53,'core').scale.y=.7;
    for(const[x,z]of[[.8,.45],[-.8,.45],[.8,-.45],[-.8,-.45]]){
      m(bd,B(.06,.04,Math.hypot(x,z)),dk,x/2,0,z/2,0,0,Math.atan2(x,z));
      const t=grp(bd,x,.02,z);
      m(t,C(.13,.1,.22,10),ti,0,0,0,'limb');
      m(t,C(.2,.2,.03,10),blk,0,.12,0);
      m(t,C(.09,.09,.02,8),hot,0,-.12,0);
      spin.push(m(t,B(.34,.012,.04),ch,0,.13,0));
    }
    const gm=grp(bd,0,-.14,.4);   // exposed gimbal gun
    for(const sd of[1,-1]){m(gm,B(.03,.16,.1),dk,sd*.1,-.02,0,'limb');m(gm,C(.018,.018,.34,6),ch,sd*.04,-.04,.25,0,Math.PI/2)}
    m(gm,C(.07,.07,.24,8),blk,0,-.04,.04,'limb',Math.PI/2);
    m(gm,B(.16,.1,.16),ti,0,.06,-.02,'armor');
    return(dt,t)=>{
      bd.position.y=1.65+Math.sin(t*2.2+ph0)*.06;
      bd.rotation.set(.2*k-hurt*.35,0,Math.sin(t*1.6+ph0)*.05+hurt*.2);
      gm.rotation.set(Math.sin(t*1.3)*.1*(1-aim),Math.sin(t*.8+ph0)*.5*(1-aim),0);
      spin.forEach((r,i)=>{r.rotation.y+=dt*(40+k*20)*(i%2?-1:1)});
    };
  }

  const tick=({drone,soldier,heavy}[type]||soldier)();
  // Batch only static siblings, retaining animated joints and damage-part metadata.
  function batch(parent){for(const c of [...parent.children])if(c.isGroup)batch(c);const bins=new Map();for(const o of parent.children)if(o.isMesh){const key=mats.indexOf(o.material)+':'+(o.userData.part||'');const list=bins.get(key)||[];list.push(o);bins.set(key,list);}for(const list of bins.values()){if(list.length<2||list.some(o=>spin.includes(o)))continue;const arrays={position:[],normal:[],uv:[]};for(const o of list){o.updateMatrix();const ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();ge.applyMatrix4(o.matrix);for(const key of Object.keys(arrays))arrays[key].push(...ge.attributes[key].array);ge.dispose();parent.remove(o);const i=hit.indexOf(o);if(i>=0)hit.splice(i,1);}const ge=new THREE.BufferGeometry();for(const key of Object.keys(arrays))ge.setAttribute(key,new THREE.Float32BufferAttribute(arrays[key],key==='uv'?2:3));geos.set('batch'+geos.size,ge);const o=new THREE.Mesh(ge,list[0].material);o.userData={...list[0].userData};parent.add(o);if(o.userData.part)hit.push(o);}}
  batch(root);
  hit.sort((a,b)=>['armor','head','core','limb'].indexOf(a.userData.part)-['armor','head','core','limb'].indexOf(b.userData.part));
  root.name=type==='soldier'?'Execution Soldier':type==='heavy'?'Heavy Enforcer':'Sentry Drone';
  return{root,hitMeshes:hit,
    update(dt,t,st){
      if(dead)return;st=st||{};
      const e=(a,b)=>a+(b-a)*Math.min(1,dt*8);
      k=e(k,st.moving?1:0);aim=e(aim,st.state==='ATTACK'?1:0);hurt=e(hurt,st.state==='STAGGER'?1:0);
      ph+=dt*spd*(.35+k);
      const pul=.5+.5*Math.sin(t*4.5+ph0);
      sens.forEach(x=>{x.emissiveIntensity=1.5+pul*1.3+hurt*2.5+aim*.8});
      const open=.05+.06*pul+hurt*.55+aim*.15;
      plates.forEach(q=>{q.gp.rotation[q.ax]=q.s*open});
      tick(dt,t);
    },
    dispose(){
      if(dead)return;dead=true;
      root.removeFromParent();
      geos.forEach(x=>x.dispose());
      mats.forEach(x=>{if(x.map)x.map.dispose();x.dispose()});
    }};
}
