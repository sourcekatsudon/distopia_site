const assert=require('node:assert/strict'),fs=require('node:fs');

class Element extends EventTarget {
 constructor(){super();this.children=new Map();this.style={};this.removed=false;}
 querySelector(selector){if(!this.children.has(selector))this.children.set(selector,new Element());return this.children.get(selector);}
 append(child){this.child=child;}
 getBoundingClientRect(){return {x:10,y:20,width:112,height:112};}
 setPointerCapture(){}
 remove(){this.removed=true;}
}
function pointer(el,type,id,x=0,y=0){const e=new Event(type,{cancelable:true});Object.assign(e,{pointerId:id,clientX:x,clientY:y});el.dispatchEvent(e);}

(async()=>{
 global.document={createElement:()=>new Element()};
 const {TouchController}=await import('data:text/javascript;base64,'+fs.readFileSync(__dirname+'/../js/fps/touch.js').toString('base64'));
 const host=new Element(),input={left:false,right:false,pressed:new Set(),clear(){this.left=this.right=false;this.pressed.clear();}},originalClear=input.clear;
 let active=true,releases=0,cancels=0,pauses=0,charge=.8,look=[];
 const c=new TouchController(host,input,{active:()=>active,onLook:(x,y)=>look.push([x,y]),onRelease:()=>releases++,onCancel:()=>{cancels++;charge=0;},onPause:()=>pauses++});
 const root=c.root,fire=root.querySelector('.gp-touch-fire'),charging=root.querySelector('.gp-touch-charge'),stick=root.querySelector('.gp-stick'),view=root.querySelector('.gp-touch-look');
 pointer(fire,'pointerdown',1);pointer(fire,'pointerdown',2);pointer(root,'pointerup',2);
 assert.equal(input.left,true,'A second finger must not release the FIRE owner');
 pointer(root,'pointerup',1);assert.equal(input.left,false);
 pointer(charging,'pointerdown',3);pointer(charging,'pointerdown',4);pointer(root,'pointerup',4);
 assert.equal(input.right,true,'A second finger must not release the CHARGE owner');assert.equal(releases,0);
 pointer(root,'pointerup',3);assert.equal(input.right,false);assert.equal(releases,1,'Owner release fires exactly once');
 pointer(charging,'pointerdown',5);pointer(root,'pointercancel',5);
 assert.equal(input.right,false);assert.equal(releases,1,'Cancellation must never fire');assert.equal(cancels,1);assert.equal(charge,0,'Cancellation clears accumulated charge through callback');
 pointer(stick,'pointerdown',6,66,76);pointer(view,'pointerdown',7,200,150);pointer(root,'pointermove',6,108,34);pointer(root,'pointermove',7,215,140);
 assert(Math.hypot(input.touchMove.x,input.touchMove.y)<=1.00001,'Diagonal analog movement is capped');assert(input.touchMove.x>0&&input.touchMove.y<0);assert.deepEqual(look,[[24,-16]],'Independent look pointer remains active with movement');
 pointer(root,'pointercancel',6);assert.deepEqual(input.touchMove,{x:0,y:0});pointer(root,'pointerup',7);
 pointer(root.querySelector('.gp-touch-reload'),'pointerdown',8);assert(input.pressed.has('KeyR'),'Reload button queues R');
 pointer(root.querySelector('.gp-touch-jump'),'pointerdown',9);assert(input.pressed.has('Space'),'Jump tap survives until frame');
 pointer(root.querySelector('.gp-touch-use'),'pointerdown',10);assert(input.pressed.has('KeyE'),'Interaction button queues E');
 pointer(root.querySelector('.gp-touch-pause'),'pointerdown',11);assert.equal(pauses,1);
 pointer(fire,'pointerdown',12);pointer(charging,'pointerdown',13);input.clear();assert.equal(input.left,false);assert.equal(input.right,false);assert.equal(c.pointers.size,0);assert.deepEqual(input.touchMove,{x:0,y:0});
 active=false;pointer(fire,'pointerdown',14);assert.equal(input.left,false,'Inactive controls are ignored');
 c.dispose();assert.equal(input.clear,originalClear);assert.equal(input.touchMove,undefined);assert(root.removed);active=true;pointer(fire,'pointerdown',15);assert.equal(input.left,false,'Disposed touch listeners are removed');
 console.log('Touch controls: pointer ownership, cancel without shot, simultaneous move/look, actions, reset and disposal passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
