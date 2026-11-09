from pathlib import Path
from argparse import ArgumentParser
import json,shutil
from playwright.sync_api import sync_playwright

parser=ArgumentParser(description='Check the bundled combat starter: visible release, audible decay, cleanup and controls.')
parser.add_argument('--html',type=Path,default=Path(__file__).resolve().parents[1]/'assets/demo/Ember-Vault-Impact.html')
parser.add_argument('--browser',type=Path)
args=parser.parse_args()
assert args.html.is_file(),f'Missing HTML: {args.html}'
chrome=str(args.browser) if args.browser else shutil.which('google-chrome') or shutil.which('chromium')
if not chrome:
    for path in [Path('C:/Program Files/Google/Chrome/Application/chrome.exe'),Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')]:
        if path.is_file():chrome=str(path);break
with sync_playwright() as pw:
    options={'headless':True}
    if chrome:options['executable_path']=chrome
    browser=pw.chromium.launch(**options)
    try:
        page=browser.new_page(viewport={'width':1150,'height':1100});errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.add_init_script('''window.requestAnimationFrame=()=>0;const NativeAudio=window.AudioContext;window.AudioContext=class extends NativeAudio{constructor(...a){super(...a);window.probeAudio=this}}''')
        page.goto(args.html.resolve().as_uri()+'?qa=1',wait_until='load')
        page.locator('#practice').click();page.wait_for_function('emberVault.state().audio.ready')
        result=page.evaluate('''async()=>{
         emberQA.clear();emberQA.spawn('boss',0);emberQA.setEnemy(0,405,208);emberQA.setAim(410,198);emberQA.render();
         const canvas=document.querySelector('#game'),g=canvas.getContext('2d'),baseline=g.getImageData(260,181,110,34).data;
         function energy(){const p=g.getImageData(260,181,110,34).data;let e=0;for(let i=0;i<p.length;i+=4)e+=Math.max(0,p[i]+p[i+1]+p[i+2]-baseline[i]-baseline[i+1]-baseline[i+2]-30);return e}
         const analyser=probeAudio.createAnalyser();analyser.fftSize=1024;probeAudio._combatInput.connect(analyser);const a=new Float32Array(1024);
         function rms(){analyser.getFloatTimeDomainData(a);return Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length)}
         const sleep=ms=>new Promise(r=>setTimeout(r,ms));
         emberQA.activate('Digit1');emberQA.step(1.73);await sleep(350);const peak=energy(),before=rms();
         emberQA.step(.23);const tail=energy();const levels=[];
         for(let i=0;i<16;i++){await sleep(10);levels.push(rms())}
         const audibleTail=levels.slice(9).reduce((a,b)=>a+b,0)/7;
         emberQA.step(.16);const beforeRelease=emberVault.state();await sleep(1100);const silent=rms(),voices=emberVault.state().audio;
         const hp=beforeRelease.enemies.map(e=>e.hp);emberQA.step(.7);const after=energy(),noTailDamage=JSON.stringify(hp)===JSON.stringify(emberVault.state().enemies.map(e=>e.hp));
         emberQA.practice();emberQA.activate('Digit1');await sleep(100);emberQA.step(1.83);await sleep(60);
         document.querySelector('#pause').click();await sleep(70);const pausedLevel=rms();
         document.querySelector('#pause').click();emberQA.refreshPractice();await sleep(70);const resetAudio=emberVault.state().audio;
         return{peak,tail,after,before,audibleTail,silent,pausedLevel,activeAfterRelease:voices.active,releasingAfterRelease:voices.releasing,activeAfterReset:resetAudio.active,releasingAfterReset:resetAudio.releasing,damageAfterRelease:noTailDamage}
        }''')
        assert result['peak']>10000,'Beam did not render'
        assert result['peak']*.01<result['tail']<result['peak']*.9,'Beam does not visibly taper'
        assert result['after']<result['peak']*.01,'Visual tail never clears'
        assert result['audibleTail']>result['before']*.01,'Audio cuts before a perceptible release'
        assert result['silent']<.0001,'Audio tail never clears'
        assert result['pausedLevel']<.0001,'Pause leaves the release playing'
        assert result['activeAfterRelease']==result['releasingAfterRelease']==0
        assert result['activeAfterReset']==result['releasingAfterReset']==0
        assert result['damageAfterRelease'],'Release continues causing damage'
        page.locator('#modeSwitch').click();assert not page.evaluate('emberVault.state().practice')
        page.locator('#modeSwitch').click();assert page.evaluate('emberVault.state().practice')
        page.locator('#sound').click();assert not page.evaluate('emberVault.state().audio.enabled')
        assert not errors,errors
        print(json.dumps({'result':'passed','measured':result},ensure_ascii=False))
    finally:browser.close()
