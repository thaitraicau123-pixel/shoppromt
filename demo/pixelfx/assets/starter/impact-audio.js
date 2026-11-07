import {BANK} from './audio-bank.js';

let ctx=null,master=null,ready=false,enabled=true,volume=.68,destination=null;
let loading=null,serial=0,room=null,impulse=null;
const buffers=new Map(),voices=[],releasing=new Set(),tones=new Set(),events=[],last=new Map();
const MIX={
 shoot:{tail:.032,wet:0},hit:{tail:.055,wet:.018},dash:{tail:.15,wet:.055},
 beamCast:{tail:.10,wet:.075},beamLoop:{release:.38,wet:.13},
 iceCharge:{tail:.08,wet:.05},iceImpact:{tail:.22,wet:.10},
 lightCharge:{tail:.10,wet:.05},lightning:{tail:.42,wet:.15},
 meteorFly:{tail:.16,wet:.07},meteor:{tail:.48,wet:.17},
 slamWind:{tail:.08,wet:.05},slam:{tail:.40,wet:.15}
};
try{enabled=localStorage.getItem('ember-impact-sound')!=='0';volume=Number(localStorage.getItem('ember-impact-volume')??.68);}catch{}
volume=Math.max(0,Math.min(1,Number.isFinite(volume)?volume:.68));

// The transient stays dry and immediate; the room carries only a quiet tail.
function makeRoom(){
 if(room){room.input.disconnect();room.filter.disconnect();room.output.disconnect();}
 if(!impulse){
  impulse=ctx.createBuffer(2,Math.round(ctx.sampleRate*.72),ctx.sampleRate);
  for(let ch=0;ch<2;ch++){
   const a=impulse.getChannelData(ch);let seed=2718+ch*12345;
   for(let i=Math.round(ctx.sampleRate*.012);i<a.length;i++){
    seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
    const u=i/a.length;a[i]=((seed>>>0)/4294967296*2-1)*.018*(1-u)**3.2;
   }
   for(const [seconds,gain] of [[.029,.11],[.051,.065],[.083,.035]])a[Math.round((seconds+ch*.003)*ctx.sampleRate)]+=gain;
  }
 }
 const input=ctx.createConvolver(),filter=ctx.createBiquadFilter(),output=ctx.createGain();
 input.normalize=false;input.buffer=impulse;filter.type='lowpass';filter.frequency.value=2900;output.gain.value=.72;
 input.connect(filter);filter.connect(output);output.connect(ctx._combatInput);room={input,filter,output};
}
function fadeToZero(param,at,seconds){
 const from=param.value;
 if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(at);
 else{param.cancelScheduledValues(0);param.setValueAtTime(from,at);}
 const curve=new Float32Array(48);
 for(let i=0;i<curve.length;i++)curve[i]=from*(1-i/(curve.length-1))**1.65;
 param.setValueCurveAtTime(curve,at,Math.max(.006,seconds));
}
export function init(){
 if(!ctx){
  const A=window.AudioContext||window.webkitAudioContext;if(!A)return Promise.resolve();
  try{ctx=new A({latencyHint:'interactive',sampleRate:48000});}catch{ctx=new A();}
  const high=ctx.createBiquadFilter();high.type='highpass';high.frequency.value=28;
  const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-10;compressor.knee.value=10;compressor.ratio.value=5;compressor.attack.value=.002;compressor.release.value=.14;
  master=ctx.createGain();master.gain.value=enabled?volume:0;
  high.connect(compressor);compressor.connect(master);master.connect(ctx.destination);ctx._combatInput=high;makeRoom();
  loading=Promise.all(Object.entries(BANK).map(async([id,item])=>{
   const bytes=Uint8Array.from(atob(item.data),c=>c.charCodeAt(0));buffers.set(id,await ctx.decodeAudioData(bytes.buffer));
  })).then(()=>ready=true).catch(()=>ready=false);
 }
 ctx.resume().catch(()=>{});return loading??Promise.resolve();
}
export function play(role,{gain=.65,pitch=1,pan=0,priority=2,gameTime=0,minGap=0}={}){
 if(!enabled||volume<=0||!ctx||!buffers.has(role))return null;
 const now=ctx.currentTime;if(now-(last.get(role)??-999)<minGap)return null;last.set(role,now);
 while(voices.length>=8){const lower=voices.filter(v=>!v.loop).sort((a,b)=>a.priority-b.priority||a.id-b.id)[0]??voices[0];lower.stop(.02);}
 const mix=MIX[role]??{tail:.08,wet:0};
 const source=ctx.createBufferSource(),g=ctx.createGain(),p=ctx.createStereoPanner(),send=ctx.createGain();
 source.buffer=buffers.get(role);source.playbackRate.value=pitch;source.loop=!!BANK[role].loop;p.pan.value=Math.max(-.55,Math.min(.55,pan));
 g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(gain,now+(source.loop?.035:.002));
 source.connect(g);g.connect(p);p.connect(ctx._combatInput);send.gain.value=mix.wet;p.connect(send);send.connect(room.input);
 const voice={id:++serial,role,loop:source.loop,priority,endAt:Infinity,ended:false,
  stop(fade=mix.release??.18){
   if(voice.ended)return;const at=ctx.currentTime;
   if(releasing.has(voice)&&at+fade>=voice.endAt)return;
   fadeToZero(g.gain,at,fade);voice.endAt=at+fade+.005;
   if(source.loop&&fade>.1){source.playbackRate.cancelScheduledValues(at);source.playbackRate.setValueAtTime(source.playbackRate.value,at);source.playbackRate.exponentialRampToValueAtTime(pitch*.88,at+fade);}
   try{source.stop(voice.endAt);}catch{}
   const i=voices.indexOf(voice);if(i>=0)voices.splice(i,1);releasing.add(voice);
  }
 };
 source.onended=()=>{
  voice.ended=true;const i=voices.indexOf(voice);if(i>=0)voices.splice(i,1);releasing.delete(voice);
  source.disconnect();g.disconnect();p.disconnect();send.disconnect();
 };
 voices.push(voice);source.start(now);
 if(!source.loop){
  const duration=source.buffer.duration/pitch,tail=Math.min(mix.tail,duration*.65),curve=new Float32Array(48);
  for(let i=0;i<curve.length;i++)curve[i]=gain*(1-i/(curve.length-1))**1.45;
  g.gain.setValueCurveAtTime(curve,now+duration-tail,tail);
 }
 events.push({role,time:gameTime,audioTime:now,priority,pan:p.pan.value});if(events.length>150)events.splice(0,events.length-150);return voice;
}
export function tone(freq,end,duration=.08,type='sine',gain=.04,delay=0){
 if(!enabled||!ctx)return;
 const at=ctx.currentTime+delay,o=ctx.createOscillator(),g=ctx.createGain();
 o.type=type;o.frequency.setValueAtTime(freq,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+duration);
 g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(gain,at+.006);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
 o.connect(g);g.connect(ctx._combatInput);o.start(at);o.stop(at+duration+.02);
 const item={stop(){fadeToZero(g.gain,ctx.currentTime,.018);try{o.stop(ctx.currentTime+.022);}catch{}}};tones.add(item);
 o.onended=()=>{tones.delete(item);o.disconnect();g.disconnect();};
}
export function stopAll(){
 for(const voice of [...voices,...releasing])voice.stop(.018);
 for(const item of tones)item.stop();
 if(ctx)makeRoom();
}
export function setEnabled(value){enabled=!!value;if(!enabled)stopAll();if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.015);try{localStorage.setItem('ember-impact-sound',enabled?'1':'0');}catch{}}
export function setVolume(value){volume=Math.max(0,Math.min(1,value));if(master)master.gain.setTargetAtTime(enabled?volume:0,ctx.currentTime,.015);try{localStorage.setItem('ember-impact-volume',String(volume));}catch{}}
export function state(){return{ready,enabled,volume,active:voices.length,releasing:releasing.size,decoded:buffers.size,context:ctx?.state??'uninitialized',events:events.slice(-40),bufferSeconds:Object.fromEntries([...buffers].map(([k,v])=>[k,v.duration]))};}
export function capture(){init();if(!destination){destination=ctx.createMediaStreamDestination();master.connect(destination);}return destination.stream;}
