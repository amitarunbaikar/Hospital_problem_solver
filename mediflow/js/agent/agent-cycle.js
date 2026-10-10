/* Agent cycle (sense > reason > act) and decision trace */
/* ---------- agent cycle ---------- */
function initKnown(){db.monitor.known={};insights().forEach(x=>{db.monitor.known[x.key]=x.priority})}
function runAgentCycle(trigger){
 ensureAddons();const beforeA=new Set(db.actions.map(a=>a.id)),beforeE=new Set(db.escalations.map(e=>e.id));
 autoActions();const ins=insights().filter(x=>x.priority!=="Low");
 const newA=db.actions.filter(a=>!beforeA.has(a.id)),newE=db.escalations.filter(e=>!beforeE.has(e.id));
 const D=diagnose(),ed=db.ed,b=db.beds;
 const run={id:id("RUN"),time:now(),trigger,observed:`ED wait ${ed.waitMin} min (baseline ${ed.baselineMin}); ${b.blocked} blocked beds; ${b.waiting} patients waiting; ${delayedLabs()} delayed labs; ${pendingDischarges()} discharges pending; ${shortages()} staff short`,reason:D.text,ranked:ins.slice(0,3).map(x=>({issue:x.issue,score:x.score,priority:x.priority,owner:x.owner})),tasks:newA.length,escalations:newE.map(e=>`${e.to}`),total:ins.length};
 db.agentRuns.unshift(run);db.agentRuns=db.agentRuns.slice(0,12);
 const top=ins[0];logEvent(`Agent cycle (${trigger}): ${ins.length} issue(s) ranked${top?`; top: ${top.issue} (score ${top.score})`:""}`,"Sanjeevani Agent",top?top.priority:"Low");
 initKnown();save();return run;
}
function showTrace(run){
 const old=document.getElementById("traceModal");if(old)old.remove();
 const m=document.createElement("div");m.className="gmodal on";m.id="traceModal";
 const step=(i,t,body)=>`<div class="trace-step" style="animation-delay:${i*.55}s"><span class="trace-n">${i+1}</span><div><b>${t}</b><div class="smalltext">${body}</div></div></div>`;
 m.innerHTML=`<div class="gm-card" role="dialog" aria-modal="true" style="width:min(660px,100%);max-height:88vh;overflow:auto"><h3 style="margin:0 0 4px">🤖 Agent response — ${esc(run.trigger)}</h3><p class="muted smalltext" style="margin:0 0 14px">The agent observed, reasoned, ranked and acted. Every action below waits for authorised staff.</p>${step(0,"OBSERVE",esc(run.observed))}${step(1,"REASON",esc(run.reason))}${step(2,"RANK (urgency × impact)",run.ranked.map((r,i)=>`${i+1}. <b>${esc(r.issue)}</b> — score ${r.score} (${r.priority}) → ${esc(r.owner)}`).join("<br>")||"No active issues")}${step(3,"ACT",`${run.tasks} follow-up task(s) added to the Action queue; ${run.escalations.length} escalation(s) queued${run.escalations.length?": "+esc([...new Set(run.escalations)].join(", ")):""}.`)}${step(4,"HAND OFF","Awaiting review by authorised staff. No discharge, diagnosis or treatment decision is made by the agent.")}<div class="gm-actions"><button class="secondary" data-addon="trace-close">Close</button><button data-addon="goto" data-page="insights">View ranked insights →</button></div></div>`;
 document.body.appendChild(m);
}
