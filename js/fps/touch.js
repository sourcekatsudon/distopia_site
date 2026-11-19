export class TouchController {
 constructor(host,input,{active,onRelease,onCancel=()=>{},onPause}){
  this.input=input;this.active=active;this.listeners=[];this.pointers=new Map();input.touchMove={x:0,y:0};input.touchLook={x:0,y:0};
  const root=document.createElement('div');root.className='gp-touch';root.innerHTML='<div class="gp-stick gp-move-stick" role="button" aria-label="移動スティック"><i></i><span>MOVE</span></div><div class="gp-stick gp-look-stick" role="button" aria-label="照準スティック"><i></i><span>AIM</span></div><button class="gp-touch-charge" aria-label="チャージ射撃">CHARGE</button><button class="gp-touch-use" aria-label="操作">E</button><button class="gp-touch-reload" aria-label="セル交換">↻</button><button class="gp-touch-pause" aria-label="ポーズ">Ⅱ</button><span class="gp-touch-auto">AUTO / 敵に照準で射撃</span><span class="gp-touch-tip">左で移動 · 右で照準 · 射撃は自動</span>';host.append(root);this.root=root;
  const listen=(el,event,fn)=>{el.addEventListener(event,fn,{passive:false});this.listeners.push(()=>el.removeEventListener(event,fn));},capture=(el,e)=>{try{el.setPointerCapture(e.pointerId);}catch{}};
  this.axes={move:{value:input.touchMove,knob:root.querySelector('.gp-move-stick i')},look:{value:input.touchLook,knob:root.querySelector('.gp-look-stick i')}};
  const steer=(e,p)=>{const a=this.axes[p.kind];let x=(e.clientX-p.x)/42,y=(e.clientY-p.y)/42,length=Math.hypot(x,y);const amount=Math.min(1,Math.max(0,(length-.14)/.86));if(length>.14){x=x/length*amount;y=y/length*amount;}else x=y=0;a.value.x=x;a.value.y=y;a.knob.style.transform='translate('+x*36+'px,'+y*36+'px)';};
  for(const[kind,selector]of [['move','.gp-move-stick'],['look','.gp-look-stick']]){const el=root.querySelector(selector);listen(el,'pointerdown',e=>{if(!active()||[...this.pointers.values()].some(p=>p.kind===kind))return;e.preventDefault();capture(el,e);const r=el.getBoundingClientRect(),p={kind,x:r.x+r.width/2,y:r.y+r.height/2};this.pointers.set(e.pointerId,p);steer(e,p);});}
  listen(root,'pointermove',e=>{const p=this.pointers.get(e.pointerId);if(!p||!active()||!this.axes[p.kind])return;e.preventDefault();steer(e,p);});
  const release=(e,cancelled)=>{const p=this.pointers.get(e.pointerId);if(!p)return;e.preventDefault();this.pointers.delete(e.pointerId);if(this.axes[p.kind]){const a=this.axes[p.kind];a.value.x=a.value.y=0;a.knob.style.transform='';}else if(p.kind==='charge'){const held=input.right;input.right=false;if(cancelled)onCancel();else if(held&&active())onRelease();}};
  listen(root,'pointerup',e=>release(e,false));listen(root,'pointercancel',e=>release(e,true));listen(root,'lostpointercapture',e=>release(e,true));
  const charge=root.querySelector('.gp-touch-charge');listen(charge,'pointerdown',e=>{if(!active()||[...this.pointers.values()].some(p=>p.kind==='charge'))return;e.preventDefault();capture(charge,e);this.pointers.set(e.pointerId,{kind:'charge'});input.right=true;});
  for(const[selector,key]of [['.gp-touch-use','KeyE'],['.gp-touch-reload','KeyR']])listen(root.querySelector(selector),'pointerdown',e=>{if(active()){e.preventDefault();input.pressed.add(key);}});
  listen(root.querySelector('.gp-touch-pause'),'pointerdown',e=>{e.preventDefault();if(active())onPause();});
  this.originalClear=input.clear;input.clear=()=>{this.originalClear.call(input);this.reset();};
 }
 setTarget(locked){this.root.classList.toggle('gp-target-lock',locked);}
 reset(){this.pointers.clear();for(const a of Object.values(this.axes)){a.value.x=a.value.y=0;a.knob.style.transform='';}}
 dispose(){this.reset();this.input.clear=this.originalClear;delete this.input.touchMove;delete this.input.touchLook;this.listeners.forEach(fn=>fn());this.root.remove();}
}
