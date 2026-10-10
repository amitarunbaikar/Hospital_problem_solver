/* Theme toggle, reduced-motion handling and glass effects */
(function(){
var root=document.documentElement,RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,KEY='mediflow_ai_demo_v1';
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
function theme(){return root.dataset.theme==='light'?'light':'dark'}
function syncBtns(){document.querySelectorAll('.themeBtn').forEach(function(b){b.textContent=theme()==='dark'?'☀':'☾';b.title='Switch to '+(theme()==='dark'?'light':'dark')+' mode'})}
function setTheme(t){root.classList.add('theme-anim');root.dataset.theme=t;store('mf_theme',t);syncBtns();setTimeout(function(){root.classList.remove('theme-anim')},600)}
function closeModal(){var m=document.querySelector('.gmodal');if(m)m.remove()}
function modal(html){closeModal();var m=document.createElement('div');m.className='gmodal';m.innerHTML='<div class="gm-card" role="dialog" aria-modal="true">'+html+'</div>';document.body.appendChild(m);m.addEventListener('click',function(e){if(e.target===m||e.target.closest('[data-close]'))closeModal()});requestAnimationFrame(function(){m.classList.add('on')});return m}
function loader(t){var l=document.createElement('div');l.className='gloader';l.innerHTML='<div class="spin"></div><p>'+t+'</p>';document.body.appendChild(l);return l}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});
document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.themeBtn'))setTheme(theme()==='dark'?'light':'dark')});
document.addEventListener('pointermove',function(e){var c=e.target.closest&&e.target.closest('.card');if(c){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')}},{passive:true});
document.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('button');if(!b||RM||b.closest('.nav')||b.closest('.bottom-nav'))return;var r=b.getBoundingClientRect(),s=document.createElement('span');s.className='rip';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';b.appendChild(s);setTimeout(function(){s.remove()},650)});
var DEMO=[{t:'Hospital Administrator',r:'Hospital Superintendent',n:'Dr. Anita Rao',i:'STF-ADM-01',e:'🏥'},{t:'Bed Management Staff',r:'Bed Management',n:'Kavya S.',i:'STF-BED-02',e:'🛏'},{t:'Doctor',r:'Appointments and Doctors',n:'Dr. Asha Rao',i:'STF-DOC-03',e:'🩺'},{t:'Discharge Coordinator',r:'Discharge Coordination',n:'Meera N.',i:'STF-DIS-04',e:'📋'}];
function enhanceLogin(){
var s=document.querySelector('.login-screen'),f=document.getElementById('loginForm');if(!s||!f||s.dataset.enh)return;s.dataset.enh=1;
var nm=document.getElementById('staffName'),id=document.getElementById('staffId'),rl=document.getElementById('role'),pw=document.getElementById('password');
var h2=f.querySelector('h2'),p=f.querySelector('h2+p');h2.textContent='Welcome to Sanjeevani Hospital AI';p.textContent='Smarter Hospital Operations. Better Patient Flow.';
var d=document.createElement('div');d.className='demo-grid';d.innerHTML='<div class="dg-title">One-tap demo access (fictional accounts)</div>'+DEMO.map(function(a,i){return '<button type="button" class="secondary" data-demo="'+i+'"><span>'+a.e+'</span><b>'+a.t+'</b></button>'}).join('');p.after(d);
d.addEventListener('click',function(e){var b=e.target.closest('[data-demo]');if(!b)return;var a=DEMO[b.dataset.demo];nm.value=a.n;id.value=a.i;rl.value=a.r;pw.value='demo1234';var l=loader('Signing in as '+a.t+'…');setTimeout(function(){l.remove();if(f.requestSubmit)f.requestSubmit();else f.dispatchEvent(new Event('submit',{cancelable:true}))},RM?0:900)});
pw.parentNode.classList.add('pw');var eye=document.createElement('button');eye.type='button';eye.className='ghost eye';eye.textContent='Show';eye.setAttribute('aria-label','Show or hide password');pw.after(eye);
eye.onclick=function(){var show=pw.type==='password';pw.type=show?'text':'password';eye.textContent=show?'Hide':'Show'};
var go=f.querySelector('button:not([type])');go.textContent='Sign In →';
var row=document.createElement('div');row.className='lrow';row.innerHTML='<label class="check"><input type="checkbox" id="remember"> Remember me</label><button type="button" class="linkbtn" id="forgot">Forgot password?</button>';go.before(row);
var rem=row.querySelector('#remember');try{var r=JSON.parse(store('mf_remember'));if(r){nm.value=r.n;id.value=r.i;rem.checked=true}}catch(e){}
f.addEventListener('submit',function(){if(rem.checked)store('mf_remember',JSON.stringify({n:nm.value,i:id.value}));else store('mf_remember',null)});
row.querySelector('#forgot').onclick=function(){var m=modal('<h3>Reset password (demo)</h3><p class="muted">This prototype has no real accounts or passwords, so nothing is emailed. Type any demo password, or use one of the one-tap demo accounts.</p><div class="gm-actions"><button type="button" class="secondary" data-close>Close</button><button type="button" data-use>Use demo access</button></div>');m.querySelector('[data-use]').onclick=function(){closeModal();d.querySelector('[data-demo]').click()}};
s.insertAdjacentHTML('beforeend','<button type="button" class="ghost themeBtn login-theme" aria-label="Toggle light or dark mode"></button><div class="login-foot">Hackathon prototype · fictional demo data · not secure authentication · hospital photo is loaded from the internet (a gradient shows if offline)</div>');
}
function enhanceApp(){
var top=document.querySelector('.top-actions');if(top&&!top.querySelector('.themeBtn')){var b=document.createElement('button');b.type='button';b.className='ghost themeBtn';b.setAttribute('aria-label','Toggle light or dark mode');top.insertBefore(b,top.firstChild)}
document.querySelectorAll('.metric .value:not([data-a])').forEach(function(el){el.dataset.a=1;var m=el.textContent.trim().match(/^(\d+)(\D*)$/);if(!m||RM)return;var to=+m[1],suf=m[2],t0=performance.now();(function tick(t){var k=Math.min(1,Math.max(0,(t-t0)/900));el.textContent=Math.round(to*(1-Math.pow(1-k,3)))+suf;if(k<1)requestAnimationFrame(tick)})(t0)});
document.querySelectorAll('.progress span:not([data-a])').forEach(function(el){el.dataset.a=1;if(RM)return;var w=el.style.width;el.style.width='0%';void el.offsetWidth;requestAnimationFrame(function(){el.style.width=w})});
}
function donut(){
var c=document.getElementById('content');if(!c||document.getElementById('bedDonut'))return;var d;try{d=JSON.parse(store(KEY))}catch(e){return}
if(!d||!d.beds||d.active!=='overview'||!d.beds.total)return;
var b=d.beds,av=Math.max(0,b.total-b.occupied-b.blocked-b.cleaning-b.clearance),pct=Math.round(b.occupied/b.total*100);
var seg=[['Occupied',b.occupied,'#3b82f6'],['Blocked',b.blocked,'#ef4444'],['Cleaning',b.cleaning,'#f59e0b'],['Awaiting clearance',b.clearance,'#a78bfa'],['Available',av,'#19c3b8']],C=2*Math.PI*52,off=0;
var arcs=seg.map(function(s){var L=Math.min(C,C*s[1]/b.total);var a='<circle cx="70" cy="70" r="52" fill="none" stroke="'+s[2]+'" stroke-width="16" stroke-dasharray="'+L+' '+(C-L)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 70 70)"/>';off+=L;return a}).join('');
c.insertAdjacentHTML('beforeend','<div class="card" id="bedDonut" style="margin-top:16px"><h3>Bed capacity at a glance</h3><div class="donut-wrap"><svg viewBox="0 0 140 140" width="170" height="170" role="img" aria-label="Bed status donut chart">'+arcs+'<text x="70" y="70" text-anchor="middle">'+pct+'%</text><text class="sub" x="70" y="86" text-anchor="middle">OCCUPIED</text></svg><ul class="legend">'+seg.map(function(s){return '<li><i style="background:'+s[2]+'"></i>'+s[0]+'<b>'+s[1]+'</b></li>'}).join('')+'</ul></div><p class="muted smalltext">Calculated from the demo data stored in this browser.</p></div>');
}
var q=0;function run(){q=0;enhanceLogin();enhanceApp();donut();syncBtns()}
new MutationObserver(function(){if(!q)q=requestAnimationFrame(run)}).observe(document.getElementById('app'),{childList:true,subtree:true});
run();
})();
