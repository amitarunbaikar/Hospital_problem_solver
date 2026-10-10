/* Autonomous monitor and live data drift */
/* ---------- monitor ---------- */
const clamp=(v,a,z)=>Math.max(a,Math.min(z,v));
function drift(){const e=db.ed;e.waitMin=clamp(e.waitMin+Math.round(Math.random()*11-3),15,150);if(Math.random()<.4)e.boarding=clamp(e.boarding+1,0,15);else if(Math.random()<.2)e.boarding=clamp(e.boarding-1,0,15);db.beds.waiting=clamp(n(db.beds.waiting)+Math.round(Math.random()*3-1),0,60);if(Math.random()<.3){const l=db.labs.find(x=>n(x.pending)>n(x.delayed));if(l)l.delayed=n(l.delayed)+1}clampBeds()}
function updatePill(){const p=document.querySelector(".monPill");if(!p)return;const M=db.monitor;p.className="ghost monPill"+(M.on?" on":"");p.innerHTML=`<i></i>${M.on?"Agent monitoring":"Monitor paused"}${M.last?" · "+new Date(M.last).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}):""}`;const bell=document.querySelector("#notifyBtn span");if(bell)bell.textContent=countUnread()}
function ensureMonitorPill(){const top=document.querySelector(".top-actions");if(!top||top.querySelector(".monPill"))return;const p=document.createElement("button");p.type="button";p.className="ghost monPill";p.dataset.addon="mon-toggle";p.title="Click to pause/resume the autonomous monitor";top.insertBefore(p,document.getElementById("notifyBtn"));updatePill()}
function monitorTick(){
 if(!db.user)return;ensureAddons();const M=db.monitor;if(!M.on)return;
 if(M.live)drift();
 if(!M.known)initKnown();
 const ins=insights(),next={},fresh=[];
 ins.forEach(x=>{next[x.key]=x.priority;if(x.priority==="Low")return;const prev=M.known[x.key];if(!prev||RANKP[x.priority]>RANKP[prev])fresh.push(x)});
 M.known=next;M.last=now();
 if(fresh.length){autoActions();const top=fresh[0];
  logEvent(`Agent monitor: ${fresh.length} new/worsening issue(s) — ${top.issue} (${top.priority}, score ${top.score}). Escalated to ${top.owner}.`,"Sanjeevani Agent",top.priority);
  db.agentRuns.unshift({id:id("RUN"),time:now(),trigger:"Autonomous monitor",observed:top.data,reason:top.cause,ranked:fresh.slice(0,3).map(x=>({issue:x.issue,score:x.score,priority:x.priority,owner:x.owner})),tasks:0,escalations:[top.owner],total:fresh.length});db.agentRuns=db.agentRuns.slice(0,12);
  toast(`⚠ Agent monitor: ${top.issue} (${top.priority})`,"error")}
 save();updatePill();
 const ae=document.activeElement,typing=ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName);
 if(fresh.length&&!typing&&!document.getElementById("traceModal")&&["overview","insights","actions"].includes(db.active))renderPage();
}
