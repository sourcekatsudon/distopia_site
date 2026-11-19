export class InputController {
 constructor(canvas,{active,onPause,onRelease,onLook,onLockChange,freeAim=()=>false}){
  this.canvas=canvas;this.active=active;this.keys=new Set();this.pressed=new Set();this.left=false;this.right=false;this.fallback=false;this.aimX=this.aimY=0;this.listeners=[];
  const listen=(target,type,fn,options)=>{target.addEventListener(type,fn,options);this.listeners.push(()=>target.removeEventListener(type,fn,options));};
  const cursor=e=>{const r=canvas.getBoundingClientRect();if(r.width>0&&r.height>0&&Number.isFinite(e.clientX)&&Number.isFinite(e.clientY)){this.aimX=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));this.aimY=Math.max(-1,Math.min(1,1-(e.clientY-r.top)/r.height*2));}};
  listen(document,'keydown',e=>{if(!active())return;if(e.code==='Escape'){onPause();return;}if(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyE','KeyR','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();if(!this.keys.has(e.code))this.pressed.add(e.code);this.keys.add(e.code);}});
  listen(document,'keyup',e=>this.keys.delete(e.code));
  listen(canvas,'mousedown',e=>{if(!active())return;if(freeAim())cursor(e);if(e.button===0)this.left=true;if(e.button===2)this.right=true;});
  listen(document,'mouseup',e=>{if(e.button===0)this.left=false;if(e.button===2){if(this.right&&active())onRelease();this.right=false;}});
  listen(document,'mousemove',e=>{if(!active())return;if(freeAim()){cursor(e);return;}if(document.pointerLockElement===canvas||(this.fallback&&e.buttons===1))onLook(e.movementX,e.movementY);});
  listen(canvas,'contextmenu',e=>{if(active())e.preventDefault();});
  listen(document,'pointerlockchange',()=>onLockChange(document.pointerLockElement===canvas));
  listen(window,'blur',()=>{this.clear();if(active())onPause();});
  listen(document,'visibilitychange',()=>{if(document.hidden){this.clear();if(active())onPause();}});
 }
 clear(){this.keys.clear();this.pressed.clear();this.left=false;this.right=false;this.aimX=this.aimY=0;}
 take(key){const has=this.pressed.has(key);this.pressed.delete(key);return has;}
 dispose(){this.clear();this.listeners.forEach(fn=>fn());this.listeners=[];}
}
