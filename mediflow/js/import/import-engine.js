/* Dataset import: CSV/JSON/Excel parsing, mapping, transform, apply */
/* ---- parsing ---- */
function impParseCSV(text){
 text=text.replace(/^\uFEFF/,"");
 const first=text.split(/\r?\n/).find(l=>l.trim())||"";
 const cand=[",",";","\t","|"];let delim=cand.map(d=>[d,first.split(d).length]).sort((a,b)=>b[1]-a[1])[0][0];
 const rows=[];let row=[],cur="",q=false;
 for(let i=0;i<text.length;i++){const c=text[i];
  if(q){if(c==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
  else if(c==='"')q=true;
  else if(c===delim){row.push(cur);cur=""}
  else if(c==="\n"||c==="\r"){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cur);cur="";if(row.some(x=>x.trim()!==""))rows.push(row);row=[]}
  else cur+=c}
 row.push(cur);if(row.some(x=>x.trim()!==""))rows.push(row);
 if(rows.length<2)return [];
 const heads=rows[0].map((h,i)=>String(h).trim()||("Column "+(i+1)));
 return rows.slice(1).map(r=>{const o={};heads.forEach((h,i)=>o[h]=(r[i]??"").trim());return o});
}
function impFromJSON(txt){
 const j=JSON.parse(txt),sheets=[];
 if(Array.isArray(j))sheets.push({name:"data",rows:j.filter(x=>x&&typeof x==="object")});
 else if(j&&typeof j==="object"){Object.keys(j).forEach(k=>{if(Array.isArray(j[k])&&j[k].length&&typeof j[k][0]==="object")sheets.push({name:k,rows:j[k]})})}
 sheets.forEach(s=>s.rows=s.rows.map(r=>{const o={};Object.keys(r).forEach(k=>o[k]=typeof r[k]==="object"&&r[k]!==null?JSON.stringify(r[k]):r[k]);return o}));
 return sheets;
}
function impLoadXLSX(){return new Promise((res,rej)=>{if(window.XLSX)return res();const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";s.onload=res;s.onerror=()=>rej(new Error("Could not load the Excel reader (offline?). Save the sheet as CSV and import that."));document.head.appendChild(s)})}
async function impReadFile(file){
 const ext=(file.name.split(".").pop()||"").toLowerCase();
 if(ext==="xlsx"||ext==="xls"){await impLoadXLSX();const wb=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:true});
  return wb.SheetNames.map(nm=>({name:nm,rows:XLSX.utils.sheet_to_json(wb.Sheets[nm],{defval:"",raw:false})})).filter(s=>s.rows.length)}
 const text=await file.text();
 if(ext==="json"||/^\s*[\[{]/.test(text))return impFromJSON(text);
 return [{name:file.name.replace(/\.[^.]+$/,""),rows:impParseCSV(text)}];
}
/* ---- mapping ---- */
function impAutoMap(typeKey,headers){
 const map={},used=new Set();const fields=IMP_TYPES[typeKey].fields;
 const nh=headers.map(h=>[h,impNorm(h)]);
 fields.forEach(f=>{for(const a of f.al){const hit=nh.find(([h,n])=>n===a&&!used.has(h));if(hit){map[f.k]=hit[0];used.add(hit[0]);break}}});
 fields.forEach(f=>{if(map[f.k])return;for(const a of f.al){if(a.length<4)continue;const hit=nh.find(([h,n])=>!used.has(h)&&(n.includes(a)||(n.length>=4&&a.includes(n))));if(hit){map[f.k]=hit[0];used.add(hit[0]);break}}});
 return map;
}
function impDetect(headers){
 let best=null,bestScore=-1;
 Object.keys(IMP_TYPES).forEach(t=>{const m=impAutoMap(t,headers);const fields=IMP_TYPES[t].fields;
  const reqOk=fields.filter(f=>f.req).every(f=>m[f.k]);const score=Object.keys(m).length+(reqOk?3:-3);
  if(score>bestScore){bestScore=score;best=t}});
 return best;
}
/* ---- transform ---- */
function impBedClass(st){st=String(st||"").toLowerCase();
 if(/block|out of service|maint|unavail|closed|isolat/.test(st))return"blocked";
 if(/clean|housekeep|turnover|sanit/.test(st))return"cleaning";
 if(/clearance|awaiting|pending|discharge/.test(st))return"clearance";
 if(/occup|in use|inuse|admit|taken|full|busy/.test(st))return"occupied";
 if(/avail|vacant|free|empty|open|ready|clean and/.test(st))return"available";
 return"unknown"}
function impBuild(typeKey,rows,map){
 const T=IMP_TYPES[typeKey],get=(r,k)=>map[k]?r[map[k]]:undefined,skipped=[];
 const nonEmpty=rows.filter(r=>Object.values(r).some(v=>String(v??"").trim()!==""));
 if(typeKey==="beds_records"){
  const w={},reasons={};let unknown=0;
  nonEmpty.forEach(r=>{const st=get(r,"status");if(st===undefined||String(st).trim()===""){skipped.push("blank status");return}
   const name=String(get(r,"ward")||"General Ward").trim()||"General Ward";w[name]??={name,total:0,occupied:0,blocked:0,cleaning:0,clearance:0};
   const c=impBedClass(st);const o=w[name];o.total++;
   if(c==="unknown"){unknown++;return}
   if(c==="occupied")o.occupied++;else if(c==="blocked"){o.blocked++;const rs=String(get(r,"reason")||"").trim();if(rs){reasons[rs]=(reasons[rs]||0)+1}}
   else if(c==="cleaning")o.cleaning++;else if(c==="clearance")o.clearance++});
  return{kind:"beds",wards:Object.values(w),reasons,unknown,skipped,count:Object.values(w).reduce((s,x)=>s+x.total,0)}}
 if(typeKey==="wards"){
  const wards=[];nonEmpty.forEach(r=>{const name=String(get(r,"name")||"").trim();if(!name){skipped.push("no ward name");return}
   const total=impNum(get(r,"total"));if(!total){skipped.push(name+": no total");return}
   const occ=Math.min(total,impNum(get(r,"occupied"))),blk=Math.min(total-occ,impNum(get(r,"blocked"))),cl=Math.min(total-occ-blk,impNum(get(r,"cleaning")));
   wards.push({name,total,occupied:occ,blocked:blk,cleaning:cl,clearance:0})});
  return{kind:"beds",wards,reasons:{},unknown:0,skipped,count:wards.reduce((s,x)=>s+x.total,0)}}
 const out=[];
 nonEmpty.forEach((r,i)=>{const o={};
  T.fields.forEach(f=>{let v=get(r,f.k);if(f.num)o[f.k]=impNum(v);else o[f.k]=v===undefined||v===null?"":String(v).trim()});
  const req=T.fields.find(f=>f.req&&(f.num?false:!o[f.k]));if(req){skipped.push("row "+(i+2)+": missing "+req.label);return}
  if(typeKey==="ed_wait"&&!(o.waitMin>0)){skipped.push("row "+(i+2)+": no wait time");return}
  if(!o.id)o.id=id(T.pre);
  if(typeKey==="doctors"){o.hospital="Main Hospital";o.department=o.department||o.specialty||"General Medicine";o.specialty=o.specialty||o.department;
   o.status=/unavail|off|leave|absent|busy|surgery/i.test(o.status)?"Unavailable":"Available";
   if(!o.capacity)o.capacity=20;if(!map.bookedToday)o.bookedToday=o.waiting;if(!map.slots)o.slots=o.status==="Available"?Math.max(0,o.capacity-o.bookedToday):0;
   if(o.status!=="Available")o.slots=0;o.next=o.next||(o.status==="Available"?"Next available":"Tomorrow");o.noShows=0}
  if(typeKey==="labs"){o.priority=impPri(o.priority||"Medium");o.status=/delay/i.test(o.status)||(!o.status&&o.delayed>0)?"Delayed":/complete|done|closed/i.test(o.status)?"Completed":"In Progress";
   o.delayed=Math.min(o.delayed,o.pending||o.delayed);o.expected=o.expected||"1 hour";o.requesting=o.requesting||"General Medicine";o.created=now()}
  if(typeKey==="discharges"){const done=s=>/clear|complete|done|approv|yes|paid|ok/i.test(s);
   o.medical=!o.medical?"Awaiting clinical review":/clear|approv|yes|fit|ok/i.test(o.medical)&&!/await|pending|not/i.test(o.medical)?"Cleared by clinician":"Awaiting clinical review";
   o.documents=done(o.documents)&&!/pend|incomplete|await/i.test(o.documents)?"Complete":"Pending";
   o.pharmacy=done(o.pharmacy)&&!/pend|await/i.test(o.pharmacy)?"Cleared":"Pending";
   o.billing=done(o.billing)&&!/pend|await|due/i.test(o.billing)?"Cleared":"Pending";
   o.approval=/approv|yes|done|complete/i.test(o.approval)&&!/pend|await|not/i.test(o.approval)?"Approved":"Pending";
   if(o.medical!=="Cleared by clinician")o.approval="Pending";o.release=o.release||"2 hours";o.coordinator=o.coordinator||"Unassigned";o.created=now()}
  if(typeKey==="staff"){if(!map.shortage)o.shortage=Math.max(0,o.required-o.available);o.shift=o.shift||"Day";o.uncovered=o.uncovered||(o.shortage?o.shortage+" position(s)":"None");
   o.workload=o.workload||(o.shortage>=4?"High":o.shortage>0?"Medium":"Normal")}
  if(typeKey==="complaints"){o.priority=impPri(o.priority);o.status=/resol|clos|done/i.test(o.status)?"Resolved":/progress|ongoing|working/i.test(o.status)?"In Progress":"Open";
   o.category=o.category||"General";o.department=o.department||"Patient Services";o.date=o.date||now()}
  if(typeKey==="admissions"){o.ward=o.ward||"General Ward";o.expected=o.expected||"—";o.status=/admitted|admit(?!ted)|done|complete|in ward|occupied/i.test(o.status)&&!/expect|pending|await|schedul/i.test(o.status)?"Admitted":/cancel|no.?show|declin/i.test(o.status)?"Cancelled":"Expected"}
  if(typeKey==="waittimes"){o.department=o.department||"—";o.arrived=o.arrived||"—"}
  if(typeKey==="transfers"){o.priority=impPri(o.priority);o.status=o.status||"Awaiting Receiving Hospital Confirmation";o.created=now()}
  out.push(o)});
 return{kind:"list",key:IMP_DB_KEY[typeKey],rows:out,skipped,count:out.length}
}
function impApply(typeKey,built,mode,fileName){
 if(!localStorage.getItem(IMP_BACKUP_KEY)){try{localStorage.setItem(IMP_BACKUP_KEY,JSON.stringify(db))}catch(e){}}
 let label;
 if(built.kind==="beds"){
  const W=built.wards;if(!W.length)throw new Error("No usable ward/bed rows found.");
  const merged=mode==="append"?[...(db.wards||[]).filter(x=>!W.some(w=>w.name===x.name)),...W]:W;
  db.wards=merged.map(w=>({name:w.name,total:w.total,occupied:w.occupied,blocked:w.blocked,cleaning:w.cleaning}));
  const b=db.beds,S=k=>merged.reduce((s,w)=>s+(w[k]||0),0);
  b.total=S("total");b.occupied=S("occupied");b.blocked=S("blocked");b.cleaning=S("cleaning");
  b.clearance=mode==="append"?b.clearance:S("clearance");b.emergency=Math.min(b.emergency||0,b.waiting||0);clampBeds();
  const topWard=[...merged].sort((a,b2)=>b2.blocked-a.blocked)[0];if(topWard&&topWard.blocked)b.ward=topWard.name;
  const topReason=Object.entries(built.reasons).sort((a,b2)=>b2[1]-a[1])[0];if(topReason)b.reason=topReason[0];
  label=`${b.total} beds across ${merged.length} wards (${b.blocked} blocked)`;
 }else{
  if(!built.rows.length)throw new Error("No usable rows found.");
  const k=built.key;db[k]=mode==="append"?[...(db[k]||[]),...built.rows]:built.rows;
  label=`${built.rows.length} ${IMP_TYPES[typeKey].label.toLowerCase()} record(s)`;
  if(typeKey==="ed_wait"){const h=[...db[k]].sort((a,b)=>(a.date+" "+a.hour).localeCompare(b.date+" "+b.hour)),avg=Math.round(h.reduce((x,r)=>x+r.waitMin,0)/h.length);db.ed??={waitMin:28,baselineMin:25,boarding:3};db.ed.waitMin=Math.round(h[h.length-1].waitMin);db.ed.baselineMin=Math.max(1,avg);label+=` — latest ED wait ${db.ed.waitMin} min, average ${avg} min`}
 }
 db.scenarioSnap=null;
 logEvent(`Dataset imported from "${fileName}": ${label}`,"System","Low");
 try{db.monitor.known=null}catch(e){}
 try{runAgentCycle("Dataset imported")}catch(e){}
 save();render();
 toast("Imported "+label+".");
 return label;
}
