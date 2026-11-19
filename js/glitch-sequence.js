// Fictional site corruption: geometry/position changes, never a full-screen strobe.
const clamp=v=>Math.max(0,Math.min(1,v));
function random(seed=1731){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const ALERTS=[['WARNING','UNAUTHORIZED ACCESS DETECTED','red'],['HACKING DETECTED','CONTROL CHANNEL COMPROMISED','red'],['危険','処分プロトコルを準備中','amber'],['探知','SIGNAL SOURCE IDENTIFIED','red'],['逆探知開始','REVERSE TRACE INITIATED','amber'],['アクセス権限剥奪','ACCESS CONTROL OVERRIDDEN','red'],['対象識別完了','TARGET ACQUISITION COMPLETE','red'],['SYSTEM BREACH','EXECUTION UNIT STANDBY','red']];
export function buildPopupPlan(width,height,reduced=false){
 const rand=random(),cols=width<720?3:6,rows=6,count=reduced?3:cols*rows,cells=Array.from({length:cols*rows},(_,i)=>i);for(let i=cells.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
 return Array.from({length:count},(_,i)=>{const a=ALERTS[i%ALERTS.length],cell=cells[i],cw=width/cols,ch=height/rows,w=reduced?Math.min(width-34,420):Math.max(190,cw*(1.1+rand()*.42)),h=reduced?125:Math.max(110,ch*(.9+rand()*.18));return {at:reduced?250+i*320:420+i*42,x:reduced?(width-w)/2:(cell%cols)*cw-25+rand()*40,y:reduced?height*.2+i*140:Math.floor(cell/cols)*ch-12+rand()*25,w,h,label:a[0],body:a[1],tone:a[2],serial:(i+1).toString(16).padStart(3,'0').toUpperCase()};});
}
export function overwriteProgress(elapsed,reduced=false){return clamp((elapsed-(reduced?1250:2150))/(reduced?300:500));}
export function createGlitchSequence({root,onComplete,reducedMotion=false}){
 const canvas=root.querySelector('.gp-intro-canvas'),popupMount=root.querySelector('.gp-popups'),status=root.querySelector('.gp-intro-status strong'),context=canvas.getContext('2d');
 let width=0,height=0,plan=[],next=0,elapsed=0,last=performance.now(),raf=0,disposed=false,completed=false;
 const rand=random(42),scanStarts=[20,140,260,370,540,670,820,1010,1270,1490,1760,1980],scans=scanStarts.map(at=>({at,y:rand(),speed:rand()>.5?1:-1,height:1+Math.floor(rand()*5),life:60+rand()*70}));
 const glyphs='01ABCDEF0123456789アイウエオカキクケコサシスセソナニヌネノ';let columns=[];
 function resize(){width=innerWidth;height=innerHeight;canvas.width=width;canvas.height=height;plan=buildPopupPlan(width,height,reducedMotion);popupMount.replaceChildren();next=0;const cols=Math.ceil(width/10);columns=Array.from({length:cols},()=>({lag:rand()*75,speed:.5+rand(),chars:Array.from({length:Math.ceil(height/16)+25},()=>glyphs[Math.floor(rand()*glyphs.length)])}));}
 function popup(p){const el=document.createElement('div');el.className='gp-alert-popup '+p.tone;Object.assign(el.style,{left:p.x+'px',top:p.y+'px',width:p.w+'px',height:p.h+'px'});const tag=document.createElement('span');tag.className='gp-alert-label';tag.textContent='CH // TRACE '+p.serial+' // LOCAL CONTROL';const heading=document.createElement('strong');heading.textContent=p.label;const message=document.createElement('p');message.textContent=p.body;const footer=document.createElement('small');footer.textContent='RULER_PROTOCOL / SIGNAL LOCKED / '+p.serial;el.append(tag,heading,message,footer);popupMount.append(el);}
 function draw(){context.clearRect(0,0,width,height);const wipe=overwriteProgress(elapsed,reducedMotion);
  if(wipe>0){const fontSize=16;context.font='14px ui-monospace,monospace';columns.forEach((col,x)=>{const head=wipe*(height+90)-col.lag;if(head<=0)return;const left=x*10;context.fillStyle='#090105';context.fillRect(left,0,11,Math.min(height,head+2));const rows=Math.min(col.chars.length,Math.ceil(head/fontSize));for(let y=0;y<rows;y++){const py=y*fontSize;if(py>head)break;const offset=Math.floor((elapsed-2150)*col.speed/90);context.fillStyle=head-py<30?'#dc6a78':(y+x)%7===0?'#b23b50':'#841f35';context.fillText(col.chars[(y+Math.max(0,offset))%col.chars.length],left,py+13);}});
  }
  if(!reducedMotion&&wipe<1){for(const line of scans){const age=elapsed-line.at;if(age<0||age>line.life)continue;const p=age/line.life,y=line.y*height;context.fillStyle='rgba(218,44,67,'+(.18+Math.sin(p*Math.PI)*.3)+')';context.fillRect(line.speed>0?-width+p*width*2:width-p*width*2,y,width,line.height);context.fillStyle='#29060e99';context.fillRect(0,y+line.height+2,width,3);}}
 }
 function frame(now){if(disposed)return;raf=requestAnimationFrame(frame);const delta=now-last;last=now;if(document.hidden)return;elapsed+=delta;while(next<plan.length&&elapsed>=plan[next].at)popup(plan[next++]);root.dataset.popupCount=String(next);root.dataset.overwrite=String(overwriteProgress(elapsed,reducedMotion));status.textContent=elapsed<420?'異常信号を受信':elapsed<2150?'WARNING / 侵入検知・対象解析':'CONTROL SYSTEM OVERRIDDEN';draw();if(!completed&&overwriteProgress(elapsed,reducedMotion)===1){completed=true;root.classList.add('gp-code-complete');onComplete();}}
 function visibility(){last=performance.now();}
 resize();addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);raf=requestAnimationFrame(frame);
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);}
 return {dispose};
}
