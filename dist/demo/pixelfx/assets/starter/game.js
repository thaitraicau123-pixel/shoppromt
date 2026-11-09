import {createFrame,clearFrame,composite,createFx,painterFor,posed,READY,STAND,hex} from './vendor/core/index.js';
import * as beamMod from './vendor/fx/arcane/arcane-beam.js';
import * as frostMod from './vendor/fx/ice/frost-nova.js';
import * as lightningMod from './vendor/fx/lightning/lightning-strike.js';
import * as hitMod from './vendor/fx/impacts/hit-spark.js';
import * as healMod from './vendor/fx/holy/heal.js';
import * as torchMod from './vendor/fx/fire/torch.js';
import * as meteorMod from './vendor/fx/fire/meteor.js';
import * as slamMod from './vendor/fx/impacts/ground-slam.js';
import * as jetMod from './vendor/fx/fire/flamethrower.js';
import * as sound from './impact-audio.js';

const $=s=>document.querySelector(s), canvas=$('#game'),ctx=canvas.getContext('2d',{alpha:false}),W=480,H=300;
const frame=createFrame(W,H),img=ctx.createImageData(W,H),C={floor:hex('#24263b'),edge:hex('#0d1421'),gold:hex('#e6b36c'),ice:hex('#9debff'),violet:hex('#cba4ff'),white:hex('#fff8df'),red:hex('#fb8190')};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),TAU=Math.PI*2;
const pillars=[{x:139,y:115,r:13},{x:341,y:115,r:13},{x:139,y:224,r:13},{x:341,y:224,r:13}];
const skills=[{key:'Space',cd:1.25},{key:'Digit1',cd:5.2},{key:'Digit2',cd:7},{key:'Digit3',cd:6.5},{key:'Digit4',cd:8.5},{key:'Digit5',cd:7.8}];
const run=[{crouch:3,ffx:12,ffy:-5,fbx:-10,fby:-8,fx:-7,fy:-19,bx:12,by:-27},{crouch:1,ffx:4,ffy:-8,fbx:-1,fby:-5,fx:3,fy:-18,bx:5,by:-19},{crouch:3,ffx:-10,ffy:-8,fbx:12,fby:-5,fx:14,fy:-27,bx:-5,by:-19},{crouch:1,ffx:-1,ffy:-5,fbx:4,fby:-8,fx:5,fy:-19,bx:3,by:-19}].map(p=>posed({...READY,turn:.25,lean:4,...p}));
const idle=posed({...STAND,turn:.2}),cast=posed({...READY,fx:18,fy:-23,bx:8,by:-20,lean:3}),dashPose=posed({...READY,crouch:8,lean:10,ffx:14,fbx:-12});
const highPose=posed({...READY,turn:1.05,fx:-8,fy:-40,bx:9,by:-40,crouch:1}),slamPose=posed({...READY,turn:.8,fx:13,fy:-8,bx:-6,by:-23,crouch:8,lean:4}),airPose=posed({...READY,turn:.8,fx:-9,fy:-39,bx:10,by:-39,ffx:6,ffy:-8,fbx:-6,fby:-8}),coilPose=posed({...READY,crouch:8,lean:4,fx:-6,fy:-14,bx:4,by:-14});
const aimPoses=Array.from({length:16},(_,i)=>{const a=i*TAU/16;return posed({...READY,turn:.2,fx:Math.round(Math.abs(Math.cos(a))*16),fy:Math.round(-20+Math.sin(a)*14),bx:Math.round(Math.abs(Math.cos(a))*8),by:Math.round(-20+Math.sin(a)*7),lean:2});});
let p, enemies=[],shots=[],effects=[],particles=[],drops=[],zones=[],ghosts=[],scheduled=[],mode='intro',wave=0,t=0,clock=0,wait=0,shake=0,hitstop=0,kills=0,spent=0,beam=null,lastFire=0,spawnId=0,bossDefeated=false,toastTime=0;
const keys=new Set(),mouse={x:330,y:160,down:false,active:false},touch={x:0,y:0,firing:false,active:false};
let practice=false,numbers=[],feedback=[];
let soundOn=sound.state().enabled,lastUi=-1,lastTime=0,acc=0,drawCount=0,drawMs=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const qa=new URLSearchParams(location.search).has('qa');

function tone(...args){sound.tone(...args);}
function sample(role,options={}){return sound.play(role,{gameTime:t,pan:clamp(((options.x??p?.x??240)-240)/300,-.45,.45),...options});}
function soundUI(){const st=sound.state();soundOn=st.enabled;$('#sound').textContent=st.enabled?'Âm: bật':'Âm: tắt';$('#sound').setAttribute('aria-label',st.enabled?'Tắt âm thanh':'Bật âm thanh');$('#volume').value=Math.round(st.volume*100);}
function initAudio(){return sound.init().then(soundUI);}
function sfx(type,x=p?.x??240){
 if(type==='shoot')return sample('shoot',{gain:.22,pitch:.97+Math.random()*.06,priority:1,minGap:.11,x});
 if(type==='hit')return sample('hit',{gain:.30,pitch:.94+Math.random()*.12,priority:1,minGap:.045,x});
 if(type==='dash')return sample('dash',{gain:.58,priority:2,x});
 if(type==='beam'){sample('beamCast',{gain:.55,priority:3,x});return sample('beamLoop',{gain:.22,priority:3,x});}
 if(type==='ice')return sample('iceImpact',{gain:.72,pitch:1.10,priority:4,x});
 if(type==='lightning')return sample('lightning',{gain:.84,priority:5,x});
 if(type==='hurt')tone(220,60,.18,'sawtooth',.035);
 if(type==='coin'){tone(988,988,.07,'sine',.028);tone(1319,1319,.13,'sine',.020,.06);}
 if(type==='clear')for(let i=0;i<4;i++)tone([523,659,784,1047][i],[523,659,784,1047][i],.15,'triangle',.028,i*.09);
}
function impact(amount=.04,force=3,kind='hit'){hitstop=Math.max(hitstop,amount);shake=Math.max(shake,force);feedback.push({kind,time:t,freeze:amount});if(feedback.length>80)feedback.shift();}
function toast(s,sec=2.2){$('#toast').textContent=s;toastTime=sec;$('#toast').style.opacity=1;}
function addFx(mod,x,y,opts={}){const f=createFx(mod,{x,y,seed:++spawnId,light:.65,...opts});effects.push(f);return f;}
function burst(x,y,color,n=10,speed=60){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=speed*(.3+Math.random()*.7);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-15,life:.2+Math.random()*.35,max:.55,color});}}
function hurtEnemy(e,dmg,kind='shot',a=0){
 if(e.dead)return;const heavy=['ice','lightning','meteor','slam'].includes(kind);e.hp-=dmg;if(kind!=='beam'||(e.numberAt??0)<t){numbers.push({x:e.x-4,y:e.y-30,text:Number.isInteger(dmg)?String(dmg):dmg.toFixed(1),life:.6,heavy});e.numberAt=t+.18;}if(heavy){impact(kind==='meteor'?.07:kind==='slam'?.055:.04,kind==='meteor'?6:4,kind);e.kx+=Math.cos(a)*55;e.ky+=Math.sin(a)*55;}e.flash=.07;e.kx+=Math.cos(a)*(kind==='beam'?6:18);e.ky+=Math.sin(a)*(kind==='beam'?6:18);
 if(kind!=='beam'||e.spark<=0){addFx(hitMod,e.x,e.y,{height:12,aim:a,light:.4});e.spark=.13;sfx('hit');}
 if(e.hp<=0){e.dead=true;e.death=.12;e.flash=.12;impact(.028,2,'kill');kills++;burst(e.x,e.y-9,e.kind==='boss'?C.gold:C.violet,e.kind==='boss'?36:13,70);drops.push({x:e.x,y:e.y,v:1,heal:false,age:0});if(kills%6===0)drops.push({x:e.x+8,y:e.y+4,heal:true,age:0});if(e.kind==='boss')bossDefeated=true;}
}
function hurtPlayer(){if(practice||mode!=='playing'||p.inv>0)return;p.hp--;p.inv=.9;shake=4;sfx('hurt');burst(p.x,p.y-15,C.red,8);if(p.hp<=0)finish(false);}
function pointBlocked(x,y,r=6){return x<28+r||x>452-r||y<68+r||y>279-r||pillars.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+r);}
function move(e,dx,dy,r){const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/3));for(let i=0;i<steps;i++){if(!pointBlocked(e.x+dx/steps,e.y,r))e.x+=dx/steps;if(!pointBlocked(e.x,e.y+dy/steps,r))e.y+=dy/steps;}}
function segDist(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,k=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-ax-k*dx,y-ay-k*dy);}
function rayLength(x,y,a,max=168){for(let d=0;d<=max;d+=2){const xx=x+Math.cos(a)*d,yy=y+Math.sin(a)*d+10;if(pointBlocked(xx,yy,0))return Math.max(2,d-2);}return max;}
function nearest(){return enemies.filter(e=>!e.dead).sort((a,b)=>dist(a,p)-dist(b,p))[0];}
function aim(){if(touch.active){const e=nearest();if(e)return Math.atan2(e.y-11-(p.y-20),e.x-p.x);}return Math.atan2(mouse.y-(p.y-20),mouse.x-p.x);}
function targetPoint(max=145){const a=aim(),d=touch.active?Math.min(max,nearest()?dist(nearest(),p):95):Math.min(max,Math.hypot(mouse.x-p.x,mouse.y-p.y+20));return{x:clamp(p.x+Math.cos(a)*d,43,437),y:clamp(p.y-20+Math.sin(a)*d+10,85,267)};}
function activate(key){
 if(mode!=='playing')return;const s=skills.find(s=>s.key===key);if(!s||p.cool[key]>0||(p.cast==='slam'&&p.castAge<.7))return;
 initAudio();
 if(key==='Space'){
  let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touch.x,y=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+touch.y;
  if(Math.hypot(x,y)<.1){const a=aim();x=Math.cos(a);y=Math.sin(a);}const len=Math.hypot(x,y);p.dx=x/len;p.dy=y/len;p.dash=.18;p.inv=Math.max(p.inv,.3);p.dashHits=new Set();p.jet=addFx(jetMod,p.x,p.y-3,{angle:Math.atan2(-p.dy,-p.dx),reach:36,speed:210,light:.32,fadeOut:.36});sfx('dash');
 }else if(key==='Digit1'){
  beam?.fx.stop();beam?.voice?.stop();const a=aim(),f=addFx(beamMod,p.x,p.y,{angle:a,light:.56,reach:168,fadeOut:.44});beam={fx:f,left:1.8,tick:0,voice:sfx('beam')};p.cast='beam';p.castAge=0;p.castDuration=1.8;
 }else if(key==='Digit2'){
  addFx(frostMod,p.x,p.y,{reach:94,light:.46});zones.push({type:'ice',x:p.x,y:p.y,age:0,hit:false});sample('iceCharge',{gain:.36,pitch:1.12,priority:2});p.cast='ice';p.castAge=0;p.castDuration=.82;
 }else if(key==='Digit3'){
  const pos=targetPoint();addFx(lightningMod,pos.x,pos.y,{light:.52});zones.push({type:'lightning',...pos,age:0,hit:false});sample('lightCharge',{gain:.30,pitch:.84,priority:2});p.cast='lightning';p.castAge=0;p.castDuration=.9;
 }else if(key==='Digit4'){
  const pos=targetPoint();addFx(meteorMod,pos.x,pos.y,{light:.42});zones.push({type:'meteor',...pos,age:0,hit:false});sample('meteorFly',{gain:.48,priority:3,x:pos.x});p.cast='meteor';p.castAge=0;p.castDuration=.55;
 }else if(key==='Digit5'){
  zones.push({type:'slam',x:p.x,y:p.y,age:0,started:false,hitIds:new Set()});sample('slamWind',{gain:.40,priority:2});p.cast='slam';p.castAge=0;p.castDuration=1.0;p.inv=Math.max(p.inv,.74);
 }
 p.cool[key]=s.cd;updateUI();
}
const spawnPoints=[[52,91],[240,81],[429,91],[53,256],[428,256]];
function spawn(kind,index){let [x,y]=spawnPoints[index%spawnPoints.length];enemies.push({id:++spawnId,kind,x,y,r:kind==='boss'?18:8,hp:kind==='boss'?125:kind==='shooter'?12:kind==='dash'?9:8,maxhp:kind==='boss'?125:kind==='shooter'?12:kind==='dash'?9:8,speed:kind==='boss'?19:kind==='dash'?45:kind==='shooter'?24:30,cd:1.2+index*.13,flash:0,freeze:0,kx:0,ky:0,spark:0,charge:0,phase:0,age:0,wind:0,dead:false});burst(x,y-8,C.violet,10,32);}
function nextWave(){if(wave>=3){finish(true);return;}wave++;let list=wave===1?['slime','slime','shooter','slime','dash']:wave===2?['dash','shooter','slime','dash','shooter','slime','dash']:['boss','shooter','dash','slime','shooter'];scheduled=list.map((kind,i)=>({at:t+.5+i*.6,kind,index:i+wave}));wait=0;toast(wave===3?'Đợt cuối: Hộ vệ đã thức tỉnh':`Đợt ${wave} / 3`,2.4);sfx('clear');}
function reset(){
 sound.stopAll();beam?.voice?.stop();numbers=[];feedback=[];
 p={x:240,y:210,hp:6,maxhp:6,inv:practice?0:1,cast:null,castAge:0,castDuration:0,dash:0,dx:0,dy:0,cool:Object.fromEntries(skills.map(s=>[s.key,0])),walk:0,face:1,moving:false};enemies=[];shots=[];effects=[];particles=[];drops=[];zones=[];ghosts=[];scheduled=[];beam=null;t=0;wave=0;kills=0;spent=0;wait=0;shake=0;hitstop=0;lastFire=0;bossDefeated=false;keys.clear();mouse.down=false;touch.firing=false;touch.x=touch.y=0;$('#stick').style.transform='';mode='playing';$('#cover').hidden=true;$('#pause').textContent='Dừng ⏸';nextWave();canvas.focus({preventScroll:true});initAudio();updateUI();
}
function finish(win){sound.stopAll();mode=win?'victory':'dead';mouse.down=false;touch.firing=false;keys.clear();$('#coverTag').textContent=win?'HẦM ĐÃ ĐƯỢC THANH TẨY':'HÀNH TRÌNH CHƯA KẾT THÚC';$('#coverTitle').innerHTML=win?'Kho báu<br>thuộc về anh.':'Thử lại.<br>Lướt đúng nhịp.';$('#coverText').textContent=win?`Đã hạ ${kills} quái trong ${Math.floor(t)} giây. Thu được ${spent} tinh hạch. Hộ vệ đã ngã xuống.`:`Đã vượt tới đợt ${wave}, hạ ${kills} quái. Dùng trụ đá để chặn đạn và giữ lướt né cho lúc nguy hiểm.`;$('#start').textContent='Chơi lại';$('#coverHint').textContent='Enter để bắt đầu lượt mới';$('#cover').hidden=false;if(win)sfx('clear');}
function pause(){if(mode==='playing'){sound.stopAll();mode='paused';keys.clear();mouse.down=false;touch.x=touch.y=0;touch.firing=false;$('#stick').style.transform='';$('#coverTag').textContent='TẠM DỪNG';$('#coverTitle').innerHTML='Nghỉ một nhịp.';$('#coverText').textContent='Căn phòng sẽ đợi. Trở lại khi anh sẵn sàng.';$('#start').textContent='Tiếp tục';$('#coverHint').textContent='P / Esc để tiếp tục';$('#cover').hidden=false;$('#pause').textContent='Tiếp tục ▶';}else if(mode==='paused'){mode='playing';if(beam)beam.voice=sample('beamLoop',{gain:.22,priority:3});$('#cover').hidden=true;$('#pause').textContent='Dừng ⏸';canvas.focus({preventScroll:true});}}

function fireEnemy(e,a,n=1,spread=.24,speed=83){for(let i=0;i<n;i++){const ang=a+(i-(n-1)/2)*spread;shots.push({x:e.x+Math.cos(ang)*13,y:e.y-12+Math.sin(ang)*13,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,life:5,enemy:true,r:3});}}
function update(dt){
 clock+=dt;if(mode!=='playing')return;t+=dt;if(p.cast){p.castAge+=dt;if(p.castAge>=p.castDuration)p.cast=null;}for(const n of numbers){n.life-=dt;n.y-=dt*21;}numbers=numbers.filter(n=>n.life>0).slice(-18);if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('#toast').style.opacity=0;}
 for(const s of skills)p.cool[s.key]=Math.max(0,p.cool[s.key]-dt);p.inv=Math.max(0,p.inv-dt);shake=Math.max(0,shake-dt*22);
 let mx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touch.x,my=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+touch.y;const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m;}p.moving=m>.1;
 if(p.dash>0){p.dash-=dt;move(p,p.dx*280*dt,p.dy*280*dt,7);if(Math.floor(t*45)!==Math.floor((t-dt)*45))ghosts.push({x:p.x,y:p.y,face:p.face,life:.18});}else{const speed=p.cast==='slam'&&p.castAge<.65?0:p.cast==='ice'&&p.castAge<.66?.38:1;move(p,mx*76*dt*speed,my*76*dt*speed,7);}
 if(p.jet){p.jet.options.x=p.x;p.jet.options.y=p.y-3;if(p.dash<=0){p.jet.stop();p.jet=null;}}
 if(p.dash>0)for(const e of enemies)if(!e.dead&&!p.dashHits.has(e.id)&&dist(e,p)<e.r+12){p.dashHits.add(e.id);hurtEnemy(e,5,'dash',Math.atan2(p.dy,p.dx));}
 if(p.moving)p.walk+=dt*11;const a=aim();p.face=Math.cos(a)>=0?1:-1;
 if((mouse.down||touch.firing)&&t-lastFire>.17&&!beam){lastFire=t;const sx=p.x+Math.cos(a)*13,sy=p.y-20+Math.sin(a)*13;shots.push({x:sx,y:sy,vx:Math.cos(a)*230,vy:Math.sin(a)*230,life:.9,enemy:false,r:2});burst(sx,sy,C.ice,3,22);sfx('shoot');}
 if(beam){beam.left-=dt;const aa=aim(),cs=Math.cos(aa),sn=Math.sin(aa),sx=p.x+cs*13,sy=p.y-20+sn*13,len=rayLength(sx,sy,aa);beam.fx.options.x=sx-15*cs+(-24)*sn;beam.fx.options.y=sy-15*sn-(-24)*cs;beam.fx.options.angle=aa;beam.fx.options.reach=Math.max(8,len);beam.tick-=dt;
 if(beam.tick<=0){beam.tick=.095;for(const e of enemies)if(segDist(e.x,e.y-10,sx,sy,sx+cs*len,sy+sn*len)<e.r+5)hurtEnemy(e,2.4,'beam',aa);}if(beam.left<=0){beam.fx.stop();beam.voice?.stop();beam=null;}}
 for(const s of scheduled)if(!s.done&&t>=s.at){s.done=true;spawn(s.kind,s.index);}scheduled=scheduled.filter(s=>!s.done);
 for(const e of enemies){if(e.dead){e.death-=dt;continue;}e.age+=dt;e.flash=Math.max(0,e.flash-dt);e.spark-=dt;e.freeze=Math.max(0,e.freeze-dt);const slow=e.freeze>0?.22:1,dx=p.x-e.x,dy=p.y-e.y,dd=Math.hypot(dx,dy)||1,a=Math.atan2(dy-8,dx);e.cd-=dt*slow;
 if(practice){move(e,e.kx*dt,e.ky*dt,e.r);e.kx*=Math.exp(-dt*10);e.ky*=Math.exp(-dt*10);continue;}
 let vx=dx/dd,vy=dy/dd;
 if(e.kind==='shooter'){if(dd<100){vx=-vx*.7;vy=-vy*.7;}else if(dd<147){vx=-dy/dd*.5;vy=dx/dd*.5;}if(e.cd<.35&&e.cd>0)e.wind=1;if(e.cd<=0){fireEnemy(e,a);e.cd=2.25;e.wind=0;}}
 if(e.kind==='dash'){if(e.cd<.45&&e.cd>0){vx=vy=0;e.wind=1;}if(e.cd<=0){e.charge=.38;e.cx=dx/dd;e.cy=dy/dd;e.cd=2.5;e.wind=0;}if(e.charge>0){e.charge-=dt;vx=e.cx*3;vy=e.cy*3;}}
 if(e.kind==='boss'){if(dd<97){vx=0;vy=0;}if(e.cd<.65&&e.cd>0)e.wind=1;if(e.cd<=0){e.phase++;if(e.phase%2){fireEnemy(e,a,7,.19,80);}else{for(let i=0;i<12;i++)fireEnemy(e,i*TAU/12+e.age*.2,1,0,65);}e.cd=e.hp<50?1.6:2.3;e.wind=0;}}
 move(e,(vx*e.speed*slow+e.kx)*dt,(vy*e.speed*slow+e.ky)*dt,e.r);e.kx*=Math.exp(-dt*10);e.ky*=Math.exp(-dt*10);
 for(const other of enemies){if(other===e||other.dead)continue;const xx=e.x-other.x,yy=e.y-other.y,dd=Math.hypot(xx,yy),min=e.r+other.r;if(dd>0&&dd<min)move(e,xx/dd*(min-dd)*dt*5,yy/dd*(min-dd)*dt*5,e.r);}
 if(Math.hypot(e.x-p.x,e.y-p.y)<e.r+7)hurtPlayer();}
 enemies=enemies.filter(e=>!e.dead||e.death>0);
 for(const b of shots){const ox=b.x,oy=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(pointBlocked(b.x,b.y+10,1)){b.life=0;burst(b.x,b.y,b.enemy?C.red:C.ice,3,25);continue;}if(b.enemy){if(segDist(p.x,p.y-12,ox,oy,b.x,b.y)<9+b.r){b.life=0;hurtPlayer();}}else{for(const e of enemies)if(!e.dead&&segDist(e.x,e.y-10,ox,oy,b.x,b.y)<e.r+3){b.life=0;hurtEnemy(e,3,'shot',Math.atan2(b.vy,b.vx));break;}}}shots=shots.filter(b=>b.life>0);
 for(const z of zones){const old=z.age;z.age+=dt;
  if(z.type==='ice'&&old<.66&&z.age>=.66){let n=0;for(const e of enemies)if(!e.dead&&((e.x-z.x)/96)**2+((e.y-z.y)/48)**2<1){hurtEnemy(e,9,'ice',Math.atan2(e.y-z.y,e.x-z.x));e.freeze=2.5;n++;}sfx('ice',z.x);shake=Math.max(shake,n?3:1);}
  if(z.type==='lightning'&&old<.76&&z.age>=.76){for(const e of enemies)if(!e.dead&&Math.hypot(e.x-z.x,(e.y-z.y)*1.6)<40){hurtEnemy(e,27,'lightning');e.freeze=.5;}impact(.045,4,'lightning-ground');sfx('lightning',z.x);}
  if(z.type==='meteor'&&old<.62&&z.age>=.62){for(const e of enemies)if(!e.dead&&Math.hypot(e.x-z.x,(e.y-z.y)*1.5)<53){hurtEnemy(e,34,'meteor',Math.atan2(e.y-z.y,e.x-z.x));e.freeze=.25;}impact(.065,6,'meteor-ground');sample('meteor',{gain:.94,priority:5,x:z.x});}
  if(z.type==='slam'){
   if(!z.started&&z.age>=.62){z.started=true;addFx(slamMod,z.x,z.y,{reach:84,light:.42});impact(.055,5,'slam-land');sample('slam',{gain:.88,priority:5,x:z.x});}
   if(z.started){const k=clamp((z.age-.62)/.6,0,1),radius=7+77*(1-(1-k)**3);for(const e of enemies)if(!e.dead&&!z.hitIds.has(e.id)&&Math.hypot(e.x-z.x,(e.y-z.y)*1.65)<radius){z.hitIds.add(e.id);hurtEnemy(e,22,'slam',Math.atan2(e.y-z.y,e.x-z.x));e.freeze=.35;}}
  }
 }zones=zones.filter(z=>z.age<(z.type==='meteor'?5:z.type==='slam'?3.9:z.type==='ice'?3.4:3));

 for(const f of effects)f.update(dt);effects=effects.filter(f=>!f.done());if(effects.length>32)effects.splice(0,effects.length-32);
 for(const b of particles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=Math.exp(-dt*4);b.vy+=dt*30;b.life-=dt;}particles=particles.filter(b=>b.life>0);for(const g of ghosts)g.life-=dt;ghosts=ghosts.filter(g=>g.life>0);
 for(const d of drops){d.age+=dt;const dd=Math.hypot(d.x-p.x,d.y-p.y);if(dd<44&&d.age>.2){d.x+=(p.x-d.x)*dt*9;d.y+=(p.y-d.y)*dt*9;}if(dd<10&&mode==='playing'){if(d.heal){if(p.hp<p.maxhp){p.hp++;addFx(healMod,p.x,p.y,{light:.5});toast('Hồi 1 máu',1);}else spent+=2;}else spent++;d.done=true;sfx('coin');}}drops=drops.filter(d=>!d.done);
 if(!practice&&!enemies.length&&!scheduled.length){wait+=dt;if(wait>2.1&&mode==='playing')nextWave();}else wait=0;
 if(!practice&&mode==='playing'&&bossDefeated&&!enemies.length&&!scheduled.length){wait=Math.max(wait,1.3);}
 if(Math.floor(t*12)!==lastUi){lastUi=Math.floor(t*12);updateUI();}
}

function updateUI(){if(!p)return;$('#modeSwitch').hidden=false;$('#modeSwitch').textContent=practice?'Chơi vượt ải':'Phòng thử chiêu';$('#health').innerHTML=Array.from({length:p.maxhp},(_,i)=>`<i class="heart ${i>=p.hp?'empty':''}"></i>`).join('');$('#health').setAttribute('aria-label',`${p.hp}/${p.maxhp} máu`);$('#wallet').textContent=`◆ ${spent} tinh hạch`;$('#status').innerHTML=practice?'PHÒNG THỬ CHIÊU<small>R: hồi chiêu và dựng lại mục tiêu</small>':`ĐỢT ${wave} / 3<small>${enemies.filter(e=>!e.dead).length+scheduled.length} quái còn lại · ${Math.floor(t)}s</small>`;for(const el of document.querySelectorAll('.skill')){const key=el.dataset.key,s=skills.find(s=>s.key===key),cd=p.cool[key];el.style.setProperty('--fill',1-cd/s.cd);el.querySelector('.cd').textContent=cd>.05?cd.toFixed(1)+'s':'';el.setAttribute('aria-label',`${el.querySelector('strong').textContent}: ${cd>.05?'hồi '+cd.toFixed(1)+' giây':'sẵn sàng'}`);}const boss=enemies.find(e=>e.kind==='boss');$('#bossbar').style.display=boss?'block':'none';if(boss)$('#bosslife').style.width=100*boss.hp/boss.maxhp+'%';}

function makeRoom(){const f=createFrame(W,H),q=painterFor(f);q.rect(0,0,W,H,hex('#0d1521'));q.rect(17,39,446,250,hex('#151a2a'));q.rect(23,51,434,231,hex('#27283d'));
 for(let y=51;y<282;y+=20)for(let x=23;x<457;x+=24){const noise=Math.sin(x*37+y*113)*.5+.5;const base=noise>.66?'#2b2e43':noise>.33?'#292b40':'#25283d';q.rect(x+1,y+1,22,18,hex(base));q.line(x+1,y+1,x+22,y+1,hex('#36364b'));q.line(x+23,y,x+23,y+19,hex('#1c2235'));if(noise>.7){q.line(x+5,y+5,x+11,y+9,hex('#35364c'));q.line(x+11,y+9,x+10,y+13,hex('#1d2335'));}}
 // Recessed central floor sigil.
 for(let k=0;k<2;k++)for(let i=0;i<72;i++){const a=i*TAU/72;if(i%5===0)continue;q.dot(240+Math.cos(a)*(55+k*3),169+Math.sin(a)*(34+k*2),hex('#404054'));}q.line(213,169,267,169,hex('#3e3a50'));q.line(240,152,240,186,hex('#3e3a50'));
 // Thick brick walls and a recessed, sealed northern door.
 for(let row=0;row<3;row++)for(let x=16-(row%2)*17;x<464;x+=34){q.rect(x,9+row*14,33,13,hex(row===2?'#303047':'#333146'));q.rect(x+1,10+row*14,31,2,hex('#464153'));q.rect(x+1,21+row*14,31,1,hex('#201f33'));}
 q.rect(13,45,11,240,hex('#353047'));q.rect(15,46,3,236,hex('#575064'));q.rect(456,45,11,240,hex('#353047'));q.rect(458,46,3,236,hex('#575064'));q.rect(20,282,440,8,hex('#393349'));q.rect(20,282,440,2,hex('#615368'));q.rect(211,7,58,43,hex('#151727'));q.rect(207,5,66,5,hex('#6c5867'));for(let i=0;i<7;i++)q.rect(217+i*7,11,3,33,hex('#4e435b'));q.rect(210,45,60,5,hex('#786073'));q.rect(224,40,33,5,hex('#ab836f'));
 for(const [x,y] of [[38,75],[438,75],[41,264],[436,265]]){q.ellipse(x+3,y+3,14,7,hex('#191e31'));for(let j=0;j<4;j++){q.rect(x-7+j*4,y-j%2*7-10,3,10+j%2*7,hex(j%2?'#42627b':'#385067'));q.dot(x-7+j*4,y-j%2*7-10,hex('#86b0bc'));}}
 // Small tesserae and rubble clustered near the walls.
 for(let i=0;i<80;i++){const x=28+(i*113%420),y=i%2?65+(i*19%16):265+(i*13%14);q.rect(x,y,1+i%3,1,hex(i%3?'#494052':'#837078'));}
 return f.color.slice();}
const background=makeRoom();const torches=[[80,49],[400,49]].map(([x,y],i)=>createFx(torchMod,{x,y,seed:7+i,light:.4}));
function actor(q,x,y,sprite,face=1,alpha=1,tint=null){for(let i=0;i<sprite.n;i++)q.put(Math.round(x+sprite.xs[i]*face),Math.round(y+sprite.ys[i]),tint||sprite.color[i],alpha);}
function drawPillar(q,o){const x=o.x,y=o.y;q.ellipse(x+3,y+2,18,7,hex('#171d2c'));q.rect(x-14,y-28,28,30,hex('#26293e'));q.rect(x-13,y-28,5,28,hex('#4a4359'));q.rect(x-8,y-28,16,28,hex('#39384f'));q.rect(x+8,y-27,5,29,hex('#22263a'));q.rect(x-16,y-31,32,6,hex('#645367'));q.rect(x-16,y-31,32,2,hex('#8d6d7d'));q.rect(x-15,y-25,30,3,hex('#23263a'));q.rect(x-15,y-3,30,6,hex('#4a4055'));q.rect(x-15,y-3,30,1,hex('#746070'));q.line(x-4,y-21,x+2,y-16,hex('#59506a'));q.line(x+2,y-16,x-1,y-10,hex('#59506a'));}
function drawEnemy(q,e){const x=Math.round(e.x),y=Math.round(e.y),bob=Math.round(Math.sin(e.age*7)*1.3),f=e.flash>0;
 q.ellipse(x,y+1,e.r+3,4,hex('#111b2a'),.8);if(e.wind){q.ring(x,y,16+(e.kind==='boss'?11:0),1,C.red,.65);q.glow(x,y-10,25,C.red,.16);}
 if(e.kind==='slime'){const c=f?C.white:e.freeze>0?C.ice:hex('#759c8e');q.ellipse(x,y-7-bob,10,8,c);q.rect(x-9,y-6-bob,18,6,c);q.rect(x-7,y-12-bob,9,2,f?C.white:hex('#c4ccb3'));q.rect(x-5,y-7-bob,2,3,C.edge);q.rect(x+4,y-7-bob,2,3,C.edge);q.rect(x-2,y-2-bob,5,1,hex('#384d53'));}
 else if(e.kind==='boss'){const c=f?C.white:e.freeze>0?C.ice:hex('#887386');q.rect(x-15,y-30,30,24,c);q.rect(x-19,y-29,7,17,c);q.rect(x+12,y-29,7,17,c);q.rect(x-11,y-8,8,9,hex('#4c495e'));q.rect(x+3,y-8,8,9,hex('#4c495e'));q.rect(x-12,y-41,24,15,c);q.rect(x-15,y-44,30,5,hex('#b49991'));q.rect(x-14,y-48,5,8,C.gold);q.rect(x+9,y-48,5,8,C.gold);q.rect(x-8,y-35,16,4,C.edge);q.rect(x-6,y-34,4,2,C.red);q.rect(x+3,y-34,4,2,C.red);q.rect(x-4,y-23,8,9,C.gold);q.rect(x-2,y-21,4,5,C.white);q.glow(x,y-19,20,C.gold,.3);}
 else{const col=f?C.white:e.freeze>0?C.ice:e.kind==='shooter'?hex('#967bac'):hex('#b36e79');q.rect(x-7,y-20+bob,14,16,col);q.rect(x-5,y-26+bob,10,10,col);q.rect(x-9,y-8,18,5,hex('#38394e'));q.rect(x-6,y-4,4,5,col);q.rect(x+2,y-4,4,5,col);q.rect(x-4,y-22+bob,8,3,C.edge);q.rect(x-2,y-21+bob,4,1,e.kind==='shooter'?C.violet:C.gold);if(e.kind==='shooter'){q.line(x+8,y-6,x+10,y-24,hex('#947d78'),2);q.circle(x+11,y-25,3,C.violet);q.glow(x+11,y-25,9,C.violet,.2);}else{q.line(x+9,y-14,x+16,y-5,C.gold,2);q.rect(x-7,y-29+bob,3,6,col);}}
 if(e.freeze>0){q.glow(x,y-7,19,C.ice,.22);q.ring(x,y,11,1,C.ice,.6);}if(e.hp<e.maxhp&&e.kind!=='boss'){q.rect(x-10,y-34,20,2,C.edge);q.rect(x-10,y-34,20*e.hp/e.maxhp,2,C.red);}}
function render(){const begin=performance.now();frame.color.set(background);frame.light.fill(0);let q=painterFor(frame);for(const f of torches)f.draw(frame);
 q=painterFor(frame);for(let i=0;i<14;i++){const x=30+(i*79+Math.sin(clock*.3+i)*12)%420,y=67+(i*31+clock*5)%210;q.dot(x,y,i%3?hex('#6e627b'):C.gold,.3);}
 for(const d of drops){const yy=d.y-4-Math.sin(clock*5+d.x)*2;q.ellipse(d.x,d.y+1,4,2,C.edge);if(d.heal){q.rect(d.x-3,yy-3,6,7,hex('#d36880'));q.rect(d.x-1,yy-5,3,2,C.white);q.rect(d.x-2,yy-2,2,3,hex('#ffb1bd'));}else{q.line(d.x,yy-4,d.x+3,yy,C.gold,2);q.line(d.x+3,yy,d.x,yy+4,C.gold,2);q.line(d.x,yy+4,d.x-3,yy,C.gold,2);q.line(d.x-3,yy,d.x,yy-4,C.gold,2);q.glow(d.x,yy,10,C.gold,.18);}}
 for(const z of zones){if(z.type==='meteor'&&z.age<.62){q.ring(z.x,z.y,34,1,C.gold,.65);q.ring(z.x,z.y,30*(1-z.age/.62),1,C.red,.65);}if(z.type==='lightning'&&z.age<.76){q.ring(z.x,z.y,28,1,C.gold,.6);q.line(z.x-5,z.y,z.x+5,z.y,C.gold);q.line(z.x,z.y-5,z.x,z.y+5,C.gold);}if(z.type==='ice'&&z.age>.42&&z.age<1.1){const k=clamp((z.age-.42)/.5,0,1);for(let i=0;i<80;i++){const a=i*TAU/80;q.dot(z.x+Math.cos(a)*94*k,z.y+Math.sin(a)*43*k,C.ice,1-(z.age-.42));}}}
 for(const f of effects)f.draw(frame,'back');q=painterFor(frame);
 for(const g of ghosts)actor(q,g.x,g.y,dashPose,g.face,g.life/.18*.4,C.ice);
 const drawables=[...pillars.map(o=>({y:o.y,draw:()=>drawPillar(q,o)})),...enemies.map(e=>({y:e.y,draw:()=>drawEnemy(q,e)}))];
 if(p)drawables.push({y:p.y,draw:()=>{q.ellipse(p.x,p.y+1,12,4,hex('#111b2a'));const a=aim(),aimPose=aimPoses[Math.round((a+TAU)*16/TAU)%16];let pose=p.dash>0?dashPose:beam?aimPose:p.moving?run[Math.floor(p.walk)%4]:idle,jump=0;if(p.cast==='slam'){const a=p.castAge;if(a<.12)pose=coilPose;else if(a<.62){pose=airPose;jump=a<.38?-46*Math.sin((a-.12)/.26*Math.PI/2):a<.48?-46:-46*(1-(a-.48)/.14);}else pose=slamPose;}else if(p.cast==='ice')pose=p.castAge<.42?highPose:slamPose;else if(p.cast==='lightning'||p.cast==='meteor')pose=highPose;actor(q,p.x,p.y+jump,pose,p.face,p.cast!=='slam'&&p.inv>0&&Math.floor(p.inv*18)%2?.45:1);const x=p.x+Math.cos(a)*13,y=p.y-20+Math.sin(a)*13;q.circle(x,y,2,C.ice);q.glow(x,y,10,C.ice,.18);}});
 drawables.sort((a,b)=>a.y-b.y).forEach(d=>d.draw());
 for(const b of shots){const l=b.enemy?3:6,ss=Math.hypot(b.vx,b.vy);q.line(b.x-b.vx/ss*l,b.y-b.vy/ss*l,b.x,b.y,b.enemy?C.red:C.ice,b.enemy?2:1);q.circle(b.x,b.y,b.r,b.enemy?C.red:C.white);q.glow(b.x,b.y,b.enemy?9:11,b.enemy?C.red:C.ice,.4);}
 for(const f of effects)f.draw(frame,'front');q=painterFor(frame);for(const b of particles)q.rect(b.x,b.y,b.life>.15?2:1,1,b.color,b.life/.25);
 if(mode==='victory'){q.rect(225,144,30,22,hex('#765139'));q.rect(223,141,34,7,C.gold);q.rect(228,139,24,3,C.white);q.rect(236,148,8,9,C.gold);q.glow(240,144,60,C.gold,.55);}
 if(mouse.active&&!touch.active&&mode==='playing'){q.ring(mouse.x,mouse.y,6,2,C.edge);q.ring(mouse.x,mouse.y,5,1,C.gold);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])q.line(mouse.x+dx*6,mouse.y+dy*6,mouse.x+dx*9,mouse.y+dy*9,C.white);q.dot(mouse.x,mouse.y,C.white);}
 composite(frame,img.data,null,.65);ctx.putImageData(img,0,0);drawNumbers();if(shake>0&&!reduced)canvas.style.transform=`translate(${Math.round((Math.random()-.5)*shake)}px,${Math.round((Math.random()-.5)*shake)}px)`;else canvas.style.transform='';drawCount++;drawMs+=performance.now()-begin;
}
const DIGITS={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],'.':['0','0','0','0','1']};
function drawNumbers(){for(const n of numbers){const scale=n.heavy?2:1,y=Math.round(n.y),pixels=[];let x=Math.round(n.x);ctx.globalAlpha=Math.min(1,n.life/.14);for(const c of n.text){const glyph=DIGITS[c]??DIGITS['0'];for(let yy=0;yy<5;yy++)for(let xx=0;xx<glyph[yy].length;xx++)if(glyph[yy][xx]==='1')pixels.push([x+xx*scale,y+yy*scale]);x+=(c==='.'?2:4)*scale;}ctx.fillStyle='#101521';for(const [xx,yy] of pixels)ctx.fillRect(xx-1,yy-1,scale+2,scale+2);ctx.fillStyle=n.heavy?'#ffe3a2':'#f0f7ff';for(const [xx,yy] of pixels)ctx.fillRect(xx,yy,scale,scale);}ctx.globalAlpha=1;}
function tick(dt){if(mode==='playing'&&hitstop>0){hitstop=Math.max(0,hitstop-dt);return;}update(dt);}
function loop(now){const dt=lastTime?Math.max(0,Math.min(.05,(now-lastTime)/1000)):0;lastTime=now;acc+=dt;let count=0;while(acc>=1/120&&count++<7){tick(1/120);for(const f of torches)f.update(1/120);acc-=1/120;}render();requestAnimationFrame(loop);}
function practiceRoom(){practice=true;reset();refreshPractice();toast('1–5 dùng chiêu · Space lướt · R hồi chiêu',3.5);}
function refreshPractice(){sound.stopAll();beam?.voice?.stop();beam=null;effects=[];zones=[];shots=[];numbers=[];drops=[];enemies=[];scheduled=[];hitstop=0;p.hp=p.maxhp;p.inv=0;p.cast=null;p.dash=0;p.jet=null;p.cool=Object.fromEntries(skills.map(s=>[s.key,0]));p.x=220;p.y=218;for(const [kind,x,y] of [['boss',318,173],['shooter',366,223],['slime',261,245]]){spawn(kind,0);const e=enemies[enemies.length-1];Object.assign(e,{x,y,hp:400,maxhp:400,speed:0,cd:999});}updateUI();}
$('#start').addEventListener('click',()=>{if(mode==='paused')pause();else{practice=false;reset();}});$('#practice').addEventListener('click',practiceRoom);$('#modeSwitch').addEventListener('click',()=>{if(practice){practice=false;reset();}else practiceRoom();});$('#volume').addEventListener('input',e=>sound.setVolume(+e.target.value/100));$('#pause').addEventListener('click',pause);$('#sound').addEventListener('click',()=>{initAudio();sound.setEnabled(!sound.state().enabled);if(beam&&sound.state().enabled)beam.voice=sample('beamLoop',{gain:.22,priority:3});soundUI();});soundUI();

document.querySelectorAll('.skill').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();activate(b.dataset.key);}));
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='KeyR'&&practice&&mode==='playing'){refreshPractice();return;}if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;if(['KeyP','Escape'].includes(e.code)){pause();return;}if(e.code==='Enter'&&mode!=='playing'){if(mode==='paused')pause();else{practice=false;reset();}return;}keys.add(e.code);if(skills.some(s=>s.key===e.code))activate(e.code);});addEventListener('keyup',e=>keys.delete(e.code));
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const b=canvas.getBoundingClientRect();mouse.x=(e.clientX-b.left)/b.width*W;mouse.y=(e.clientY-b.top)/b.height*H;mouse.active=true;});canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;const b=canvas.getBoundingClientRect();mouse.x=(e.clientX-b.left)/b.width*W;mouse.y=(e.clientY-b.top)/b.height*H;if(e.button===0){mouse.down=true;initAudio();canvas.setPointerCapture(e.pointerId);}});addEventListener('pointerup',e=>{if(e.pointerType!=='touch')mouse.down=false;});canvas.addEventListener('pointercancel',()=>mouse.down=false);canvas.addEventListener('contextmenu',e=>e.preventDefault());
function loseFocus(){keys.clear();mouse.down=false;touch.firing=false;touch.x=touch.y=0;if(mode==='playing')pause();}addEventListener('blur',loseFocus);document.addEventListener('visibilitychange',()=>{if(document.hidden)loseFocus();});
const pad=$('#pad');pad.addEventListener('pointerdown',e=>{e.preventDefault();touch.active=true;pad.setPointerCapture(e.pointerId);padMove(e);});pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))padMove(e);});function padMove(e){const b=pad.getBoundingClientRect(),dx=(e.clientX-b.left-b.width/2)/(b.width*.35),dy=(e.clientY-b.top-b.height/2)/(b.height*.35),m=Math.max(1,Math.hypot(dx,dy));touch.x=dx/m;touch.y=dy/m;$('#stick').style.transform=`translate(${touch.x*b.width*.24}px,${touch.y*b.height*.24}px)`;}function padEnd(){touch.x=touch.y=0;$('#stick').style.transform='';}pad.addEventListener('pointerup',padEnd);pad.addEventListener('pointercancel',padEnd);$('#fire').addEventListener('pointerdown',e=>{e.preventDefault();touch.active=true;touch.firing=true;initAudio();$('#fire').setPointerCapture(e.pointerId);});$('#fire').addEventListener('pointercancel',()=>touch.firing=false);
$('#fire').addEventListener('pointerup',()=>touch.firing=false);$('#fire').addEventListener('lostpointercapture',()=>touch.firing=false);
if(matchMedia('(pointer:coarse)').matches){document.body.classList.add('touch');touch.active=true;$('#coverHint').textContent='Cần trái di chuyển · Nút phải bắn tự ngắm';}
// Read-only gameplay telemetry; the QA-only controller is absent during normal play.
window.emberVault={state:()=>({mode,practice,wave,time:t,hp:p?.hp,audio:sound.state(),feedback:feedback.slice(-20),hitstop,kills,crystals:spent,enemies:enemies.map(e=>({kind:e.kind,x:e.x,y:e.y,hp:e.hp,freeze:e.freeze})),shots:shots.length,fx:effects.length,cooldowns:p?.cool,player:p?{x:p.x,y:p.y}:null,meanDrawMs:drawMs/Math.max(1,drawCount)})};
if(qa)window.emberQA={step:dt=>{for(let i=0;i<Math.ceil(dt*120);i++)tick(1/120);render();},setPlayer:(x,y)=>{p.x=x;p.y=y;},setHp:n=>p.hp=n,clear:()=>{enemies=[];scheduled=[];shots=[];},spawn:(kind,i=0)=>spawn(kind,i),damageAll:n=>enemies.forEach(e=>hurtEnemy(e,n)),activate,reset,practice:practiceRoom,refreshPractice,setEnemy:(i,x,y)=>{enemies[i].x=x;enemies[i].y=y;},setAim:(x,y)=>{mouse.x=x;mouse.y=y;mouse.active=true;},setCooldown:(key,n)=>p.cool[key]=n,render};
p={x:327,y:186,hp:6,maxhp:6,inv:0,dash:0,walk:0,face:-1,moving:false,cool:Object.fromEntries(skills.map(s=>[s.key,0]))};spawn('slime',4);enemies[0].x=386;enemies[0].y=208;spawn('shooter',0);enemies[1].x=360;enemies[1].y=105;requestAnimationFrame(loop);
