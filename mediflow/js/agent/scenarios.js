/* Scenario lab: morning surge, random shocks, restore baseline */
/* ---------- scenarios ---------- */
const clone=o=>JSON.parse(JSON.stringify(o));
function snapshot(name){if(db.scenarioSnap)return;db.scenarioSnap=clone({beds:db.beds,doctors:db.doctors,labs:db.labs,discharges:db.discharges,staff:db.staff,complaints:db.complaints,ed:db.ed,oxygen:db.oxygen,actions:db.actions,escalations:db.escalations});db.scenarioName=name}
function clampBeds(){const b=db.beds;const room=b.total-b.occupied-b.cleaning-b.clearance;if(b.blocked>room)b.blocked=Math.max(0,room);b.emergency=Math.min(b.emergency,b.waiting)}
function morningScenario(){
 snapshot("Morning surge");const b=db.beds;
 db.ed.waitMin=84;db.ed.baselineMin=25;db.ed.boarding=8;
 b.blocked+=4;b.waiting=34;b.emergency=9;b.reason="Discharges waiting on paperwork; late lab reports holding discharge decisions";clampBeds();
 db.discharges.push({id:"DIS-304",patient:"PT-1103",medical:"Cleared by clinician",documents:"Pending",pharmacy:"Pending",billing:"Pending",approval:"Pending",release:"3 hours",coordinator:"Arjun K.",notes:"Scenario: waiting on paperwork",created:now()},{id:"DIS-305",patient:"PT-1118",medical:"Cleared by clinician",documents:"Pending",pharmacy:"Cleared",billing:"Pending",approval:"Pending",release:"90 minutes",coordinator:"Meera N.",notes:"Scenario: waiting on paperwork",created:now()});
 const l=db.labs.find(x=>x.id==="LAB-201");if(l){l.delayed=7;l.pending=22;l.status="Delayed"}
 db.labs.push({id:"LAB-204",test:"Troponin",pending:6,delayed:2,expected:"40 minutes",requesting:"Emergency",priority:"High",status:"Delayed",notes:"Scenario: analyser queue backed up",created:now()});
 const s=db.staff.find(x=>x.id==="STF-403");if(s){s.available=7;s.shortage=3;s.uncovered="3 nursing positions";s.workload="High";s.notes="Next shift short-staffed"}
 db.complaints.unshift({id:"CMP-"+Math.floor(900+Math.random()*90),category:"Waiting time",description:"Emergency waiting time over two hours",priority:"High",date:now(),department:"Emergency",status:"Open",action:"Update waiting families",notes:"Scenario record"});
 const d=db.doctors.find(x=>x.id==="DOC-102");if(d){d.waiting=24;d.avgWait=70;d.noShows=(d.noShows||0)+2}
 return "Morning surge scenario";
}
const SHOCKS=[
 ["Lab analyser outage",()=>{const l=db.labs[0];l.delayed=Math.min(l.pending+9,l.delayed+5);l.pending+=9;l.status="Delayed"}],
 ["Sudden sick calls",()=>{const s=db.staff[Math.floor(Math.random()*db.staff.length)];s.shortage=n(s.shortage)+3;s.available=Math.max(0,n(s.available)-3);s.workload="High"}],
 ["Ambulance surge",()=>{db.beds.waiting+=12;db.beds.emergency+=6;db.ed.waitMin+=45;db.ed.boarding+=5}],
 ["Discharge paperwork stall",()=>{db.discharges.forEach(d=>{if(d.approval!=="Approved")d.documents="Pending"});db.beds.blocked+=3;clampBeds()}],
 ["Consultant unavailable",()=>{const d=db.doctors.find(x=>x.status==="Available");if(d){d.status="Unavailable";d.slots=0;db.doctors.filter(x=>x!==d&&x.department===d.department).forEach(x=>x.waiting+=8)}}],
 ["No-show spike",()=>{db.doctors.slice(0,3).forEach(d=>d.noShows=(d.noShows||0)+4)}],
 ["Oxygen readiness drop",()=>{const o=(db.oxygen||[])[0];if(o)o.qty=Math.max(0,n(o.min)-2)}],
 ["Complaint wave",()=>{["Waiting time","Communication","Waiting time"].forEach(c=>db.complaints.unshift({id:"CMP-"+Math.floor(900+Math.random()*90),category:c,description:"Delay in diagnostic report and discharge updates",priority:"High",date:now(),department:"Diagnostics and Laboratories",status:"Open",action:"Follow up",notes:"Scenario record"}))}]
];
let lastShock=-1;
function randomShock(){snapshot("Random shock");let i;do{i=Math.floor(Math.random()*SHOCKS.length)}while(i===lastShock&&SHOCKS.length>1);lastShock=i;SHOCKS[i][1]();return SHOCKS[i][0]}
function restoreBaseline(){if(!db.scenarioSnap)return;const sn=db.scenarioSnap;["beds","doctors","labs","discharges","staff","complaints","ed","oxygen"].forEach(k=>db[k]=clone(sn[k]));db.actions=clone(sn.actions);db.escalations=clone(sn.escalations);db.scenarioSnap=null;db.scenarioName=null;db.monitor.known=null;ensureAddons();logEvent("Baseline restored after scenario","Sanjeevani Agent","Low");initKnown();save()}
