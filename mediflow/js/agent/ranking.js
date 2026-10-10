/* Department priority ranking and attention strip */
/* ---------- ranking ---------- */
const DEPT_DEF=[["Emergency Department","beds",/Emergency/i],["Bed Management","beds",/Bed Management/i],["Discharge Coordination","discharges",/Discharge Coordination/i],["Diagnostics and Laboratories","labs",/Diagnostic|Laborator/i],["Staff and Rosters","staff",/Staff and Rosters/i],["Appointments and Doctors","doctors",/Appointments and Doctors/i],["Complaints and Feedback","complaints",/Complaints/i],["Medicines, Oxygen & Supplies","inventory",/Pharmacy|Inventory|Oxygen|Supplies/i],["Hospital Transfers","transfers",/Transfer/i]];
function deptRanking(){
 const ins=insights().filter(x=>x.priority!=="Low");
 return DEPT_DEF.map(([name,page,re])=>{
  const hits=[];ins.forEach(x=>{const parts=x.departments.split(/\s\+\s/);const idx=parts.findIndex(p=>re.test(p));if(idx>=0)hits.push({x,w:idx===0?1:.55})});
  let score=0,reason="No active issues",affected=0;
  if(hits.length){const sc=hits.map(h=>h.x.score*h.w).sort((p,q)=>q-p);score=Math.min(100,Math.round(sc[0]+Math.min(10,.05*sc.slice(1).reduce((s,v)=>s+v,0))));const top=hits.sort((p,q)=>q.x.score*q.w-p.x.score*p.w)[0];reason=top.x.issue;affected=Math.max(...hits.map(h=>n(h.x.affected)))}
  if(name==="Hospital Transfers"){const o=db.transfers.filter(t=>!/Completed|Rejected|Cancelled/.test(t.status)).length;if(o&&score<o*8){score=o*8;reason=`${o} open transfer(s) awaiting confirmation`;affected=o}}
  const level=score>=80?"Critical":score>=60?"High":score>=35?"Watch":"Stable";
  return{name,page,score,level,reason,affected,count:hits.length};
 }).sort((p,q)=>q.score-p.score);
}
function lvlTag(l){return `<span class="tag ${l==="Critical"?"red":l==="High"?"amber":l==="Watch"?"blue":"green"}">${l}</span>`}
function attentionStrip(){
 const rk=deptRanking().slice(0,6),ed=db.ed,edBad=ed.waitMin>=Math.max(45,ed.baselineMin*1.6);
 return `<div class="card att-wrap" style="margin-top:16px"><div class="att-head"><div><h3>Departments needing attention</h3><p class="muted smalltext">Ranked by urgency × impact using linked signals across departments (not a single KPI).</p></div><div class="att-chips"><span class="tag ${edBad?"red":"green"}">ED wait ${ed.waitMin} min · baseline ${ed.baselineMin}</span><span class="tag blue">${db.escalations.filter(e=>e.status==="Open"||e.status==="Acknowledged").length} open escalations</span></div></div><div class="att-grid">${rk.map((d,i)=>`<div class="att-card lvl-${d.level.toLowerCase()}" data-page="${d.page}" role="link" tabindex="0"><div class="att-top"><span class="att-rank">#${i+1}</span>${lvlTag(d.level)}<span class="att-score">${d.score}</span></div><b>${esc(d.name)}</b><div class="progress"><span style="width:${d.score}%"></span></div><span class="smalltext">${esc(d.reason)}</span><span class="muted smalltext">${d.affected} patients affected · ${d.count} linked issue(s)</span></div>`).join("")}</div></div>`;
}
function scoreBlock(x){return `<div class="score-block"><div class="score-line"><b>Priority score ${x.score}/100</b><span class="muted smalltext">urgency ${x.urgency} × impact ${x.impact} (${x.affected} patients affected)</span></div><div class="progress"><span style="width:${x.score}%"></span></div><p class="smalltext" style="margin-top:8px"><b>Escalate to:</b> ${esc(x.owner)} · via ${esc(x.via)}${x.priority==="Critical"?" · then Medical Superintendent":""} · respond within ${x.slaMin?x.slaMin+" min":"—"}</p></div>`}
