const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=async file=>import('data:text/javascript;base64,'+fs.readFileSync(path.join(__dirname,'../js/fps/',file)).toString('base64'));
(async()=>{
 const doc=new EventTarget(),win=new EventTarget(),canvas=new EventTarget();global.document=doc;global.window=win;const {InputController}=await source('input.js');
 const input=new InputController(canvas,{active:()=>true,onPause(){},onRelease(){},onLook(){},onLockChange(){}});
 const down=new Event('keydown',{cancelable:true});down.code='Space';doc.dispatchEvent(down);const up=new Event('keyup');up.code='Space';doc.dispatchEvent(up);assert.equal(input.take('Space'),true,'Fast jump tap must not be lost before next frame');assert.equal(input.take('Space'),false);input.dispose();doc.dispatchEvent(down);assert.equal(input.keys.size,0,'Disposed listeners removed');
 const param=()=>({value:0,setTargetAtTime(){},setValueAtTime(){},exponentialRampToValueAtTime(){}});const node=()=>({gain:param(),frequency:param(),connect(n){return n;},disconnect(){},start(){},stop(){}});
 win.AudioContext=class{constructor(){this.sampleRate=16;this.state='running';this.destination={};this.currentTime=0;}createGain(){return node();}createOscillator(){return node();}createBiquadFilter(){return node();}createBuffer(){return {getChannelData:()=>new Float32Array(32)};}resume(){return Promise.resolve();}close(){return Promise.resolve();}};
 const {SynthAudio}=await source('audio.js');const audio=new SynthAudio(.5);audio.setMuted(true);await audio.start();assert.equal(audio.master.gain.value,0,'Initial mute must apply before audio starts');audio.dispose();
 console.log('FPS lifecycle tests passed: queued jump, input cleanup, initial audio mute.');
})().catch(e=>{console.error(e);process.exitCode=1;});
