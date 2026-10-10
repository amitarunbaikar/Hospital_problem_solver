/* Agent UI panels and LLM briefing */
/* ---------- panels ---------- */
function agentPanels(){
 const M=db.monitor,runs=db.agentRuns.slice(0,4),D=diagnose(),act=db.escalations.filter(e=>e.status==="Open"||e.status==="Acknowledged");
 return `<div class="grid two" style="margin-top:16px"><div class="card"><h3>🧪 Scenario lab — stress-test the agent</h3><p class="muted smalltext">Inject a realistic situation and watch the agent observe, reason, rank, escalate and create tasks. ${db.scenarioSnap?`<span class="tag amber">Scenario active: ${esc(db.scenarioName)}</span>`:"Baseline data is restorable at any time."}</p><div class="form-actions"><button data-addon="scn-morning">▶ Run morning scenario</button><button class="secondary" data-addon="scn-shock">⚡ Random shock</button><button class="ghost" data-addon="scn-restore" ${db.scenarioSnap?"":"disabled"}>↺ Restore baseline</button></div><div class="mon-row"><label class="mon-sw"><input type="checkbox" data-addon="mon-toggle-cb" ${M.on?"checked":""}> Autonomous monitor (checks every 15 s)</label><label class="mon-sw"><input type="checkbox" data-addon="live-toggle-cb" ${M.live?"checked":""}> Live data drift simulation</label></div><p class="muted smalltext">Live drift nudges ED wait, waiting patients and lab delays so the agent can raise alerts by itself. Use “Restore baseline” afterwards.</p></div>
 <div class="card"><h3>Agent briefing &amp; activity</h3><div class="notice"><b>Current reading</b><p class="smalltext">${esc(D.text)}</p></div>${runs.map(r=>`<div class="run-row"><div><b>${esc(r.trigger)}</b><div class="muted smalltext">${dt(r.time)} · ${r.total} issue(s) · top: ${esc(r.ranked[0]?.issue||"—")}</div></div><button class="small secondary" data-addon="trace" data-run="${r.id}">Replay</button></div>`).join("")||`<div class="empty" style="padding:12px">No agent cycles yet — run a scenario.</div>`}<p class="muted smalltext" style="margin-top:8px">${act.length} escalation(s) open · <a href="#" data-page="actions" style="color:var(--teal)">open escalation queue</a></p></div></div>`;
}
function escalationPanel(){
 const rows=db.escalations.slice(0,20).map(e=>{const age=Math.round((Date.now()-new Date(e.created))/60000),due=e.slaMin?e.slaMin-age:null,open=e.status==="Open"||e.status==="Acknowledged";
  return `<tr><td>${statusTag(e.priority)}<div class="muted smalltext">score ${e.score}</div></td><td><b>${esc(e.issue)}</b><div class="muted smalltext">${esc(e.note||"")}</div></td><td><b>${esc(e.to)}</b><div class="muted smalltext">via ${esc(e.via)}${e.up?" · then "+esc(e.up):""}</div></td><td>${open?(due!==null?(due>=0?`<span class="tag green">${due} min left</span>`:`<span class="tag red">${-due} min overdue</span>`):"—"):"—"}</td><td>${statusTag(e.status)}${e.ackBy?`<div class="muted smalltext">${esc(e.ackBy)}</div>`:""}</td><td>${open?`${e.status==="Open"?`<button class="small secondary" data-addon="esc-ack" data-id="${e.id}">Acknowledge</button> `:""}<button class="small" data-addon="esc-res" data-id="${e.id}">Resolve</button>`:"—"}</td></tr>`});
 return `<div class="card" style="margin-top:16px"><h3>🚨 Escalation queue</h3><p class="muted smalltext">High and Critical issues are routed to a named owner with a response window. Escalations clear automatically if the underlying condition goes away.</p>${table(["Priority","Issue","Escalate to","Response window","Status","Action"],rows,"No escalations yet.")}</div>`;
}
function edPanel(){
 const ed=db.ed,edit=canEdit("Bed Management");
 return `<div class="card" style="margin-top:16px"><h3>🚑 Emergency department wait time</h3><div class="grid three"><div><div class="muted smalltext">Current wait</div><div class="metric"><div class="value">${ed.waitMin} min</div></div></div><div><div class="muted smalltext">Normal baseline</div><div class="metric"><div class="value">${ed.baselineMin} min</div></div></div><div><div class="muted smalltext">ED patients boarding for a bed</div><div class="metric"><div class="value">${ed.boarding}</div></div></div></div>${edit?`<form id="edForm" style="margin-top:12px"><div class="grid three">${field("Current ED wait (min)","waitMin",ed.waitMin,"number")}${field("Baseline wait (min)","baselineMin",ed.baselineMin,"number")}${field("ED patients boarding","boarding",ed.boarding,"number")}</div><button>Update ED wait time</button></form>`:`<p class="muted smalltext">Read-only for your role.</p>`}<p class="muted smalltext">The agent links a jump in ED wait to blocked beds, stuck discharges, late labs and staffing.</p></div>`;
}
function rulesNarrative(){
 const ins=insights().filter(x=>x.priority!=="Low").slice(0,3),D=diagnose();
 return `Good day. ${D.text}\n\nTop priorities right now:\n${ins.map((x,i)=>`${i+1}. ${x.issue} (${x.priority}, score ${x.score}) — ${x.data}. Owner: ${x.owner}. Next step: ${x.action}`).join("\n")||"No active issues."}\n\nAll actions are operational tasks for authorised staff to review; this briefing contains no clinical advice.`;
}
function llmPanel(){
 return `<div class="card" style="margin-top:16px;border-top:4px solid var(--teal)"><h3>📝 Plain-language briefing (rules + optional LLM)</h3><p class="muted smalltext">The decisions are made by the transparent rules above. The briefing below is always generated from those rules. Optionally, Claude can rewrite it more fluently — it only receives the briefing text of this fictional demo data, your key stays in memory in this tab only, and nothing is stored.</p><div class="field"><label for="llmKey">Anthropic API key (optional)</label><input id="llmKey" type="password" autocomplete="off" placeholder="sk-ant-… (leave empty to use the rules-based briefing)"></div><div class="form-actions"><button data-addon="llm-run">Generate briefing</button></div><div id="llmOut" class="notice" style="margin-top:12px;white-space:pre-wrap" aria-live="polite">Press “Generate briefing”.</div></div>`;
}
async function runBriefing(){
 const out=document.getElementById("llmOut"),keyEl=document.getElementById("llmKey");if(!out)return;
 if(keyEl&&keyEl.value.trim())llmKey=keyEl.value.trim();
 const base=rulesNarrative();out.textContent=base;
 if(!llmKey)return;
 out.textContent=base+"\n\n— Rewriting with Claude…";
 try{
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":llmKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:LLM_MODEL,max_tokens:700,system:"You rewrite hospital operations briefings for a Medical Superintendent. Use ONLY the facts provided, do not invent numbers, never give clinical advice or diagnoses, and keep every recommendation an operational task for authorised staff to review. Be concise.",messages:[{role:"user",content:"Rewrite this briefing in clear, calm prose with a short bullet list of next steps:\n\n"+base}]})});
  const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||("HTTP "+r.status));
  out.textContent=(j.content||[]).map(c=>c.text||"").join("\n").trim()||base;
 }catch(err){out.textContent=base+"\n\n(LLM rewrite unavailable: "+String(err.message||err)+". Showing the rules-based briefing.)"}
}
function addonsInject(html,page){
 if(page==="actions")return html+escalationPanel();
 if(page==="beds")return html+edPanel();
 if(page==="superai"&&userIsSuper())return html+llmPanel();
 return html;
}
