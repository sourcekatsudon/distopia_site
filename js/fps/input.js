export class InputController {
 constructor(canvas,{active,onPause,onRelease,onLook,onLockChange}){
  this.canvas=canvas;this.active=active;this.keys=new Set();this.pressed=new Set();this.left=false;this.right=false;this.fallback=false;this.listeners=[];
  const listen=(target,type,fn,options)=>{target.addEventListener(type,fn,options);this.listeners.push(()=>target.removeEventListener(type,fn,options));};
  listen(document,'keydown',e=>{if(!active())return;if(e.code==='Escape'){onPause();return;}if(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyE','KeyR','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();if(!this.keys.has(e.code))this.pressed.add(e.code);this.keys.add(e.code);}});
  listen(document,'keyup',e=>this.keys.delete(e.code));
  listen(canvas,'mousedown',e=>{if(!active())return;if(e.button===0)this.left=true;if(e.button===2)this.right=true;});
  listen(document,'mouseup',e=>{if(e.button===0)this.left=false;if(e.button===2){if(this.right&&active())onRelease();this.right=false;}});
  listen(document,'mousemove',e=>{if(active()&&(document.pointerLockElement===canvas||(this.fallback&&e.buttons===1)))onLook(e.movementX,e.movementY);});
  listen(canvas,'contextmenu',e=>{if(active())e.preventDefault();});
  listen(document,'pointerlockchange',()=>onLockChange(document.pointerLockElement===canvas));
  listen(window,'blur',()=>{this.clear();if(active())onPause();});
  listen(document,'visibilitychange',()=>{if(document.hidden){this.clear();if(active())onPause();}});
 }
 clear(){this.keys.clear();this.pressed.clear();this.left=false;this.right=false;}
 take(key){const has=this.pressed.has(key);this.pressed.delete(key);return has;}
 dispose(){this.clear();this.listeners.forEach(fn=>fn());this.listeners=[];}
}
