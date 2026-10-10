/* Dataset import: wizard UI and top-bar button */
/* ---- UI ---- */
const IMP={step:1,sheets:[],sheet:0,type:null,map:{},mode:"replace",fileName:"",built:null,done:[]};
function impCSS(){/* styles now live in css/import.css */}
function impClose(){const m=document.getElementById("impModal");if(m)m.remove()}
function impOpen(){
 impCSS();impClose();Object.assign(IMP,{step:1,sheets:[],sheet:0,type:null,map:{},mode:"replace",fileName:"",built:null,done:[]});
 const m=document.createElement("div");m.className="gmodal";m.id="impModal";m.innerHTML='<div class="gm-card imp-card" role="dialog" aria-modal="true"></div>';
 document.body.appendChild(m);m.addEventListener("click",e=>{if(e.target===m)impClose()});
 requestAnimationFrame(()=>m.classList.add("on"));impDraw();
}
function impBar(){return `<div class="imp-steps"><i class="${IMP.step>=1?"on":""}"></i><i class="${IMP.step>=2?"on":""}"></i><i class="${IMP.step>=3?"on":""}"></i></div>`}
function impDraw(){
 const box=document.querySelector("#impModal .imp-card");if(!box)return;
 if(IMP.step===1){
  box.innerHTML=`${impBar()}<h3>Import dataset</h3><p class="imp-sub">Upload the file you were given (CSV, JSON or Excel). The app will detect what it is and let you check the column mapping before anything changes.</p>
  <div class="imp-drop" id="impDrop"><b>Drop a file here or click to browse</b><span class="muted smalltext">.csv &nbsp; .json &nbsp; .xlsx</span><input type="file" id="impFile" accept=".csv,.tsv,.txt,.json,.xlsx,.xls" style="display:none"></div>
  <textarea id="impPaste" placeholder="...or paste CSV / JSON text here"></textarea>
  <div class="imp-row"><button id="impPasteGo" class="secondary small">Use pasted text</button><span style="flex:1"></span>
   <select id="impSampleSel" style="width:auto;padding:6px 8px">${Object.keys(IMP_TYPES).map(k=>`<option value="${k}">${esc(IMP_TYPES[k].label)}</option>`).join("")}</select>
   <button id="impSample" class="ghost small" style="width:auto;height:auto;padding:6px 10px;font-size:12px">Download sample CSV</button></div>
  <div class="imp-row" style="justify-content:space-between;border-top:1px solid var(--border);padding-top:12px;margin-top:16px">
   <button id="impReset" class="ghost small" style="width:auto;height:auto;padding:6px 10px;font-size:12px">Reset to original demo data</button><button id="impCancel" class="secondary small">Close</button></div>
  <div id="impMsg" class="imp-warn"></div>`;
  const drop=document.getElementById("impDrop"),fi=document.getElementById("impFile");
  drop.onclick=()=>fi.click();
  ["dragover","dragenter"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("over")}));
  ["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("over")}));
  drop.addEventListener("drop",e=>{if(e.dataTransfer.files[0])impHandleFile(e.dataTransfer.files[0])});
  fi.onchange=()=>{if(fi.files[0])impHandleFile(fi.files[0])};
  document.getElementById("impPasteGo").onclick=()=>{const t=document.getElementById("impPaste").value.trim();if(!t)return;impHandleText(t,"pasted data")};
  document.getElementById("impCancel").onclick=impClose;
  document.getElementById("impSample").onclick=()=>{const k=document.getElementById("impSampleSel").value;const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([IMP_SAMPLES[k]],{type:"text/csv"}));a.download="sample-"+k+".csv";document.body.appendChild(a);a.click();a.remove()};
  document.getElementById("impReset").onclick=()=>{const bk=localStorage.getItem(IMP_BACKUP_KEY);if(!bk){document.getElementById("impMsg").textContent="Nothing to reset: no dataset has been imported yet.";return}
   if(!confirm("Restore the demo data from before your first import? Imported data will be lost."))return;
   const cur=db.user,act=db.active;try{const o=JSON.parse(bk);o.user=cur;o.active=act;localStorage.setItem(KEY,JSON.stringify(o));localStorage.removeItem(IMP_BACKUP_KEY);location.reload()}catch(e){document.getElementById("impMsg").textContent="Could not restore: "+e.message}};
 }
 else if(IMP.step===2){
  const S=IMP.sheets[IMP.sheet],headers=Object.keys(S.rows[0]||{}),T=IMP_TYPES[IMP.type];
  const matched=T.fields.filter(f=>IMP.map[f.k]).length;
  const miss=T.fields.filter(f=>f.req&&!IMP.map[f.k]);
  box.innerHTML=`${impBar()}<h3>Check the mapping<span class="imp-pill">${S.rows.length} rows</span></h3>
  <p class="imp-sub">File: ${esc(IMP.fileName)}. Auto-detected ${matched} of ${T.fields.length} fields. Fix anything that looks wrong.</p>
  <div class="imp-grid">
   ${IMP.sheets.length>1?`<div style="grid-column:1/-1"><label>Sheet / table in file</label><select id="impSheet">${IMP.sheets.map((s,i)=>`<option value="${i}" ${i===IMP.sheet?"selected":""}>${esc(s.name)} (${s.rows.length} rows)</option>`).join("")}</select></div>`:""}
   <div style="grid-column:1/-1"><label>This data is</label><select id="impType">${Object.keys(IMP_TYPES).map(k=>`<option value="${k}" ${k===IMP.type?"selected":""}>${esc(IMP_TYPES[k].label)}</option>`).join("")}</select></div>
   ${T.fields.map(f=>`<div><label>${esc(f.label)}${f.req?" *":""}</label><select data-f="${f.k}"><option value="">(not in file)</option>${headers.map(h=>`<option value="${esc(h)}" ${IMP.map[f.k]===h?"selected":""}>${esc(h)}</option>`).join("")}</select></div>`).join("")}
  </div>
  ${miss.length?`<div class="imp-warn">Required field(s) not mapped: ${miss.map(f=>esc(f.label)).join(", ")}</div>`:""}
  <div class="imp-row"><label style="font-size:13px"><input type="radio" name="impMode" value="replace" ${IMP.mode==="replace"?"checked":""} style="width:auto"> Replace existing ${esc(T.label.toLowerCase())}</label>
   <label style="font-size:13px"><input type="radio" name="impMode" value="append" ${IMP.mode==="append"?"checked":""} style="width:auto"> Add to existing</label></div>
  <div class="imp-row" style="justify-content:flex-end"><button id="impBack" class="secondary small">Back</button><button id="impNext" ${miss.length?"disabled style='opacity:.5;cursor:not-allowed'":""}>Preview</button></div>`;
  document.getElementById("impType").onchange=e=>{IMP.type=e.target.value;IMP.map=impAutoMap(IMP.type,headers);impDraw()};
  const sh=document.getElementById("impSheet");if(sh)sh.onchange=e=>{IMP.sheet=+e.target.value;const hs=Object.keys(IMP.sheets[IMP.sheet].rows[0]||{});IMP.type=impDetect(hs)||IMP.type;IMP.map=impAutoMap(IMP.type,hs);impDraw()};
  box.querySelectorAll("select[data-f]").forEach(s=>s.onchange=()=>{if(s.value)IMP.map[s.dataset.f]=s.value;else delete IMP.map[s.dataset.f];impDraw()});
  box.querySelectorAll("input[name=impMode]").forEach(r=>r.onchange=()=>IMP.mode=r.value);
  document.getElementById("impBack").onclick=()=>{IMP.step=1;impDraw()};
  document.getElementById("impNext").onclick=()=>{if(miss.length)return;try{IMP.built=impBuild(IMP.type,S.rows,IMP.map);IMP.step=3;impDraw()}catch(e){alert(e.message)}};
 }
 else{
  const B=IMP.built,T=IMP_TYPES[IMP.type];
  let prevHead,prevRows;
  if(B.kind==="beds"){prevHead=["Ward","Total","Occupied","Blocked","Cleaning"];prevRows=B.wards.slice(0,8).map(w=>[w.name,w.total,w.occupied,w.blocked,w.cleaning])}
  else{prevHead=T.fields.filter(f=>IMP.map[f.k]||["status","priority"].includes(f.k)).map(f=>f.k).slice(0,6);prevRows=B.rows.slice(0,6).map(r=>prevHead.map(k=>r[k]))}
  box.innerHTML=`${impBar()}<h3>Preview<span class="imp-pill">${B.count} ${B.kind==="beds"?"beds":"records"}</span></h3>
  <p class="imp-sub">${IMP.mode==="replace"?"This will replace the current":"This will be added to the current"} ${esc(T.label.toLowerCase())}. You can undo with "Reset to original demo data".</p>
  <div class="imp-prev"><table><thead><tr>${prevHead.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${prevRows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  ${B.skipped.length?`<div class="imp-warn">${B.skipped.length} row(s) skipped: ${esc([...new Set(B.skipped)].slice(0,4).join("; "))}${B.skipped.length>4?" ...":""}</div>`:""}
  ${B.unknown?`<div class="imp-warn">${B.unknown} bed(s) had an unrecognised status and were counted in the total only.</div>`:""}
  <div class="imp-row" style="justify-content:flex-end"><button id="impBack" class="secondary small">Back</button><button id="impGo">Import now</button></div>`;
  document.getElementById("impBack").onclick=()=>{IMP.step=2;impDraw()};
  document.getElementById("impGo").onclick=()=>{try{const lbl=impApply(IMP.type,IMP.built,IMP.mode,IMP.fileName);IMP.done.push(lbl);impDone(lbl)}catch(e){alert(e.message)}};
 }
}
function impDone(lbl){
 const box=document.querySelector("#impModal .imp-card");if(!box)return;
 box.innerHTML=`<div class="imp-steps"><i class="on"></i><i class="on"></i><i class="on"></i></div><h3>Imported</h3>
 ${IMP.done.map(d=>`<div class="imp-ok">✓ ${esc(d)}</div>`).join("")}
 <p class="imp-sub">The dashboard, insights and agent have re-run on the new data.</p>
 <div class="imp-row" style="justify-content:flex-end"><button id="impMore" class="secondary small">Import another file</button><button id="impView">View insights</button></div>`;
 document.getElementById("impMore").onclick=()=>{IMP.step=1;impDraw()};
 document.getElementById("impView").onclick=()=>{impClose();go("insights")};
}
function impHandleText(text,name){
 try{let sheets;if(/^\s*[\[{]/.test(text))sheets=impFromJSON(text);else sheets=[{name,rows:impParseCSV(text)}];impAfterParse(sheets.filter(s=>s.rows.length),name)}
 catch(e){const m=document.getElementById("impMsg");if(m)m.textContent="Could not read that data: "+e.message}
}
async function impHandleFile(file){
 const m=document.getElementById("impMsg");if(m)m.textContent="Reading "+file.name+" ...";
 try{impAfterParse(await impReadFile(file),file.name)}catch(e){if(m)m.textContent=e.message}
}
function impAfterParse(sheets,name){
 const m=document.getElementById("impMsg");
 if(!sheets.length){if(m)m.textContent="No table rows found. Check that the first row contains column names.";return}
 IMP.sheets=sheets;IMP.sheet=0;IMP.fileName=name;const hs=Object.keys(sheets[0].rows[0]||{});
 const det=impDetect(hs);if(!det){IMP.sheets=[];if(m)m.textContent="Could not match this file to any data type. Columns found: "+(hs.join(", ")||"none")+". Please use a file with matching column names.";return}
 IMP.type=det;IMP.map=impAutoMap(IMP.type,hs);IMP.mode="replace";IMP.step=2;impDraw();
}
/* ---- top-bar button ---- */
function impInjectBtn(){
 const top=document.querySelector(".top-actions");if(!top||top.querySelector(".impBtn"))return;
 const b=document.createElement("button");b.type="button";b.className="ghost impBtn";b.title="Import dataset (CSV / JSON / Excel)";b.setAttribute("aria-label","Import dataset");b.textContent="⇪";
 b.onclick=impOpen;const anchor=document.getElementById("notifyBtn");top.insertBefore(b,anchor||top.firstChild);
}
(function(){const app=document.getElementById("app");let q=0;new MutationObserver(()=>{if(!q)q=requestAnimationFrame(()=>{q=0;if(db&&db.user)impInjectBtn()})}).observe(app,{childList:true,subtree:true})})();
/* ===================== END DATASET IMPORT ===================== */
