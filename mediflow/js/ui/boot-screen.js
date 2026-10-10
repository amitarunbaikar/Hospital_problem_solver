/* Animated splash / boot screen */
(function(){
var b=document.getElementById('boot');if(!b)return;
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var T=document.getElementById('bootTitle');'SANJEEVANI'.split('').forEach(function(c,i){var s=document.createElement('span');s.textContent=c;s.style.animationDelay=(.25+i*.07)+'s';T.appendChild(s)});
var C=document.getElementById('bootCrosses');for(var i=0;i<14;i++){var e=document.createElement('i');e.textContent='+';e.style.left=(Math.random()*100)+'%';e.style.fontSize=(12+Math.random()*22)+'px';e.style.animationDuration=(6+Math.random()*7)+'s';e.style.animationDelay=(-Math.random()*8)+'s';C.appendChild(e)}
var msgs=[[0,'Initialising core systems'],[16,'Syncing bed registry'],[34,'Calibrating vitals monitors'],[52,'Linking departments & labs'],[70,'Securing patient data'],[88,'Preparing your dashboard'],[100,'All systems stable']];
var fill=document.getElementById('bootFill'),pct=document.getElementById('bootPct'),msg=document.getElementById('bootMsg'),bpm=document.getElementById('bootBpm');
var DUR=RM?300:3600,t0=performance.now(),last=-1;
function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
function tick(now){var x=Math.min(1,(now-t0)/DUR),p=Math.round(ease(x)*100);
 if(p!==last){last=p;fill.style.width=p+'%';pct.textContent=p+'%';for(var i=msgs.length-1;i>=0;i--){if(p>=msgs[i][0]){msg.textContent=msgs[i][1];break}}}
 if(Math.random()<.08)bpm.textContent=70+Math.floor(Math.random()*8);
 if(x<1)requestAnimationFrame(tick);else{setTimeout(function(){b.classList.add('done');setTimeout(function(){b.remove();var s=document.getElementById('boot-css');if(s)s.remove()},1300)},RM?0:350)}}
requestAnimationFrame(tick);
})();
