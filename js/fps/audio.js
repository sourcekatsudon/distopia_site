export class SynthAudio {
 constructor(volume=.45){this.volume=volume;this.muted=false;this.ctx=null;this.voices=new Set();this.ambient=[];}
 async start(){
  if(!this.ctx){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;this.ctx=new Context();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:this.volume*.28;this.master.connect(this.ctx.destination);
   this.noiseBuffer=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);const samples=this.noiseBuffer.getChannelData(0);let seed=731;for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=(seed/4294967296*2-1)*.65;}
   for(const f of [37,55]){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.055;o.connect(g).connect(this.master);o.start();this.ambient.push(o,g);}
   this.chargeOsc=this.ctx.createOscillator();this.chargeGain=this.ctx.createGain();this.chargeOsc.type='sawtooth';this.chargeOsc.frequency.value=90;this.chargeGain.gain.value=0;const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1500;this.chargeOsc.connect(filter).connect(this.chargeGain).connect(this.master);this.chargeOsc.start();this.ambient.push(this.chargeOsc,this.chargeGain,filter);
  }
  if(this.ctx.state==='suspended')await this.ctx.resume();
 }
 setVolume(v){this.volume=Math.max(0,Math.min(1,Number(v)||0));this.sync();}
 setMuted(on){this.muted=on;this.sync();}
 sync(){if(this.ctx)this.master.gain.setTargetAtTime(this.muted?0:this.volume*.28,this.ctx.currentTime,.03);}
 tone(freq,duration=.15,level=.3,type='sine',end=0){if(!this.ctx||this.ctx.state!=='running'||this.voices.size>=20)return;const now=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(10,end),now+duration);g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(Math.max(.002,level),now+.008);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g).connect(this.master);this.voices.add(o);o.onended=()=>{o.disconnect();g.disconnect();this.voices.delete(o);};o.start(now);o.stop(now+duration+.02);}
 noise(duration=.18,level=.2,freq=1300){if(!this.ctx||this.ctx.state!=='running'||this.voices.size>=20)return;const now=this.ctx.currentTime,o=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();o.buffer=this.noiseBuffer;f.type='bandpass';f.frequency.value=freq;f.Q.value=.8;g.gain.setValueAtTime(level,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(f).connect(g).connect(this.master);this.voices.add(o);o.onended=()=>{o.disconnect();f.disconnect();g.disconnect();this.voices.delete(o);};o.start(now);o.stop(now+duration);}
 shoot(power=1){this.tone(95,.3,.6,'sine',25);this.tone(1650,.18,.14*power,'sawtooth',130);this.noise(.13,.4,5000);this.tone(4200,.08,.1,'triangle',600);}
 charge(v){if(this.ctx){this.chargeOsc.frequency.setTargetAtTime(110+v*650,this.ctx.currentTime,.03);this.chargeGain.gain.setTargetAtTime(v*.08,this.ctx.currentTime,.025);}}
 alarm(){this.tone(240,.7,.12,'triangle',180);this.tone(480,.55,.035,'sine',360);}
 hit(){this.tone(1700,.045,.1,'square',850);}
 destroy(heavy=false){this.noise(heavy?.7:.35,heavy?.45:.25,500);this.tone(heavy?65:125,.4,.45,'sine',20);this.tone(800,.18,.08,'triangle',80);}
 step(){this.noise(.07,.09,230);this.tone(100,.05,.09,'triangle',60);}
 door(){this.noise(.7,.12,600);this.tone(160,.5,.07,'sawtooth',65);}
 hurt(){this.noise(.18,.17,2000);this.tone(70,.2,.16,'square',40);}
 pause(){this.charge(0);if(this.ctx?.state==='running')this.ctx.suspend().catch(()=>{});}
 async resume(){await this.start();}
 dispose(){if(!this.ctx)return;for(const v of this.voices)try{v.stop();v.disconnect();}catch{}this.voices.clear();for(const n of this.ambient)try{n.stop?.();n.disconnect();}catch{}this.master.disconnect();this.ctx.close().catch(()=>{});this.ctx=null;this.ambient=[];}
}
