/* Agent click/keyboard/submit handlers and monitor timer */
/* ---------- events ---------- */
document.addEventListener("click",e=>{
 const t=e.target.closest&&e.target.closest("[data-addon]");if(!t||!db.user)return;
 const act=t.dataset.addon;
 if(act==="scn-morning"||act==="scn-shock"){if(act==="scn-morning"&&db.scenarioSnap&&db.scenarioName==="Morning surge"){toast("Morning scenario is already active — restore baseline first.","error");return}
  const name=act==="scn-morning"?morningScenario():randomShock();logEvent(`Scenario injected: ${name}`,"Scenario lab","High");const run=runAgentCycle(name);renderPage();ensureMonitorPill();updatePill();showTrace(run);return}
 if(act==="scn-restore"){restoreBaseline();toast("Baseline restored.");renderPage();updatePill();return}
 if(act==="trace"){const r=db.agentRuns.find(x=>x.id===t.dataset.run);if(r)showTrace(r);return}
 if(act==="trace-close"){const m=document.getElementById("traceModal");if(m)m.remove();return}
 if(act==="goto"){const m=document.getElementById("traceModal");if(m)m.remove();go(t.dataset.page);return}
 if(act==="mon-toggle"||act==="mon-toggle-cb"){db.monitor.on=!db.monitor.on;if(db.monitor.on&&!db.monitor.known)initKnown();save();toast(db.monitor.on?"Autonomous monitor resumed.":"Autonomous monitor paused.");updatePill();if(act==="mon-toggle")renderPage();return}
 if(act==="live-toggle-cb"){db.monitor.live=!db.monitor.live;save();toast(db.monitor.live?"Live drift simulation on — data will change over time.":"Live drift simulation off.");return}
 if(act==="esc-ack"||act==="esc-res"){const x=db.escalations.find(z=>z.id===t.dataset.id);if(!x)return;if(act==="esc-ack"){x.status="Acknowledged";x.ackBy=`${db.user.name} (${db.user.role})`;x.ackTime=now();logEvent(`Escalation acknowledged by ${db.user.name}: ${x.issue}`,"Escalation","Low")}else{x.status="Resolved";x.closed=now();x.ackBy=x.ackBy||`${db.user.name} (${db.user.role})`;logEvent(`Escalation resolved by ${db.user.name}: ${x.issue}`,"Escalation","Low")}save();renderPage();updatePill();return}
 if(act==="llm-run"){runBriefing();return}
});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("att-card"))e.target.click();if(e.key==="Escape"){const m=document.getElementById("traceModal");if(m)m.remove()}});
document.addEventListener("submit",e=>{if(e.target.id!=="edForm")return;e.preventDefault();if(!canEdit("Bed Management")){toast("You do not have permission to update ED wait time.","error");return}
 const f=new FormData(e.target),v=["waitMin","baselineMin","boarding"].map(k=>Number(f.get(k)));if(v.some(x=>!Number.isInteger(x)||x<0)){toast("Enter whole numbers (0 or more).","error");return}
 db.ed={waitMin:v[0],baselineMin:Math.max(1,v[1]),boarding:v[2]};logEvent(`ED wait time updated: ${v[0]} min (baseline ${v[1]})`,"Bed Management",v[0]>=45?"High":"Low");autoActions();save();toast("ED wait time updated.");renderPage()});
ensureAddons();
setInterval(monitorTick,15000);
