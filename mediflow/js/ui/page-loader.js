/* Page-transition loader (animated icons per page) */
(function(){
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var ICON={
ecg:'<path class="pl-ecg" d="M5 52H42l8-10 8 10h10l8-40 14 74 10-34h14l8-8 8 8H145"/>',
building:'<path d="M30 90V30h60v60M20 90h80M60 12v22M49 23h22"/><rect class="fl pl-blink" x="40" y="44" width="10" height="9"/><rect class="fl pl-blink" x="70" y="44" width="10" height="9"/><rect class="fl pl-blink" x="40" y="62" width="10" height="9"/><rect class="fl pl-blink" x="70" y="62" width="10" height="9"/>',
list:'<rect x="25" y="14" width="100" height="72" rx="8"/><path class="pl-row" d="M40 34h70"/><path class="pl-row" d="M40 50h54"/><path class="pl-row" d="M40 66h62"/>',
bed:'<path d="M18 80V24M18 62H132V80M132 62V46a10 10 0 0 0-10-10H62v26"/><circle cx="40" cy="48" r="9"/><rect class="fl pl-blink" x="70" y="46" width="14" height="10" rx="2"/><rect class="fl pl-blink" x="90" y="46" width="14" height="10" rx="2"/><rect class="fl pl-blink" x="110" y="46" width="14" height="10" rx="2"/>',
calendar:'<rect x="32" y="20" width="86" height="70" rx="8"/><path d="M32 40h86M52 12v14M98 12v14"/><path class="pl-draw" d="M54 66l14 14 28-28"/>',
flask:'<path d="M63 12h24M69 12v30L44 84a6 6 0 0 0 5 10h52a6 6 0 0 0 5-10L81 42V12"/><circle class="pl-rise" cx="68" cy="76" r="4"/><circle class="pl-rise" cx="82" cy="80" r="3"/><circle class="pl-rise" cx="76" cy="84" r="4"/>',
discharge:'<path d="M28 12h44v76H28z"/><circle class="fl" cx="62" cy="50" r="3"/><g class="pl-slide"><path d="M82 50h42M110 36l14 14-14 14"/></g>',
staff:'<g class="pl-bounce"><circle cx="40" cy="38" r="9"/><path d="M24 74a16 16 0 0 1 32 0"/></g><g class="pl-bounce"><circle cx="75" cy="32" r="11"/><path d="M56 78a19 19 0 0 1 38 0"/></g><g class="pl-bounce"><circle cx="110" cy="38" r="9"/><path d="M94 74a16 16 0 0 1 32 0"/></g>',
chat:'<path d="M30 14h90a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H66l-20 18V70H30a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8z"/><circle class="fl pl-bounce" cx="56" cy="42" r="4"/><circle class="fl pl-bounce" cx="75" cy="42" r="4"/><circle class="fl pl-bounce" cx="94" cy="42" r="4"/>',
ambulance:'<path class="pl-road" d="M8 88H142"/><g class="pl-drive"><path d="M34 74V44h46v30M80 52h18l12 12v10H80M28 74h86"/><path d="M52 50v18M43 59h18"/><circle cx="48" cy="78" r="6" fill="#050b14"/><circle cx="98" cy="78" r="6" fill="#050b14"/></g>',
pill:'<g class="pl-spin"><rect x="38" y="34" width="74" height="32" rx="16"/><path d="M75 34v32"/><path class="fl" d="M75 34h-21a16 16 0 0 0 0 32h21z" opacity=".55"/></g>',
spark:'<path class="pl-star" d="M75 8l7 27 27 7-27 7-7 27-7-27-27-7 27-7z"/><path class="pl-star" d="M118 54l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/><path class="pl-star" d="M30 62l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/>',
bell:'<g class="pl-ring"><path d="M75 14a24 24 0 0 0-24 24c0 28-12 34-12 34h72s-12-6-12-34A24 24 0 0 0 75 14z"/></g><path d="M66 82a10 10 0 0 0 18 0"/>',
search:'<rect x="30" y="14" width="68" height="76" rx="6"/><path d="M44 34h40M44 50h40M44 66h26"/><g class="pl-scan"><circle cx="96" cy="58" r="16" fill="rgba(25,227,211,.12)"/><path d="M108 70l16 16"/></g>',
clip:'<rect x="40" y="18" width="70" height="74" rx="7"/><path d="M63 12h24v12H63z"/><path class="pl-draw" d="M56 58l12 12 24-26"/>',
neural:'<path d="M30 25L75 50M30 75L75 50M75 50L122 25M75 50L122 75M30 25v50M122 25v50" opacity=".5"/><circle class="fl pl-blink" cx="30" cy="25" r="6"/><circle class="fl pl-blink" cx="30" cy="75" r="6"/><circle class="fl pl-blink" cx="122" cy="25" r="6"/><circle class="fl pl-blink" cx="122" cy="75" r="6"/><circle class="fl pl-star" cx="75" cy="50" r="9"/>'
};
var PG={
overview:['Hospital Overview','ecg',['Reading hospital pulse','Compiling key metrics','Rendering overview']],
department:['My Department','building',['Locating your department','Loading unit status','Preparing workspace']],
updates:['Department Updates','list',['Collecting latest updates','Sorting by priority','Almost ready']],
beds:['Bed Management','bed',['Scanning ward beds','Checking cleaning & clearance','Updating capacity board']],
doctors:['Appointments & Doctors','calendar',['Checking doctor availability','Balancing appointment load','Opening schedule']],
labs:['Diagnostics & Labs','flask',['Connecting to laboratories','Fetching test queues','Compiling results']],
discharges:['Discharge Coordination','discharge',['Reviewing discharge queue','Verifying clearances','Loading coordination board']],
staff:['Staff & Rosters','staff',['Assembling care teams','Reading duty rosters','Checking coverage']],
complaints:['Complaints & Feedback','chat',['Opening patient voices','Sorting by urgency','Preparing responses']],
transfers:['Hospital Transfers','ambulance',['Contacting partner hospitals','Verifying safety checks','Loading transfer board']],
inventory:['Medicines, Oxygen & Supplies','pill',['Counting medicine stock','Measuring oxygen levels','Flagging shortages']],
insights:['Hospital AI Insights','spark',['Analysing hospital data','Detecting patterns','Generating insights']],
actions:['Actions & Alerts','bell',['Checking active alerts','Ranking priorities','Loading action list']],
reports:['Reports & Global Search','search',['Indexing records','Searching across departments','Preparing reports']],
reviews:['Superintendent Review','clip',['Gathering submitted reports','Preparing review queue','Opening decisions']],
superai:['Superintendent AI','neural',['Waking the AI agent','Linking hospital signals','Preparing recommendations']]
};
var el=document.createElement('div');el.id='pgLoad';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
el.innerHTML='<div class="pl-box"><i></i><i></i><i></i><i></i><svg class="ico" id="plIco" viewBox="0 0 150 100"></svg><h2 id="plTitle"></h2><div class="pl-track"><div class="pl-fill" id="plFill"></div></div><div class="pl-msg" id="plMsg"></div></div>';
document.body.appendChild(el);
var ico=el.querySelector('#plIco'),ttl=el.querySelector('#plTitle'),fill=el.querySelector('#plFill'),msg=el.querySelector('#plMsg'),timers=[];
function clear(){timers.forEach(clearTimeout);timers=[]}
window.__pgLoad=function(page,cb){
 clear();var c=PG[page]||['Loading','ecg',['Loading…','Please wait','Almost ready']];
 var D=RM?120:1050;
 ico.innerHTML=ICON[c[1]];ttl.textContent=c[0];msg.textContent=c[2][0];
 fill.style.transition='none';fill.style.width='0';void fill.offsetWidth;
 fill.style.transition='width '+D+'ms cubic-bezier(.35,.1,.25,1)';fill.style.width='100%';
 el.classList.add('on');
 timers.push(setTimeout(function(){msg.textContent=c[2][1]},D*.35));
 timers.push(setTimeout(function(){msg.textContent=c[2][2]},D*.7));
 timers.push(setTimeout(function(){cb();var ct=document.getElementById('content');if(ct)ct.scrollTop=0;window.scrollTo(0,0);
  requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.remove('on')})})},D));
};
})();
