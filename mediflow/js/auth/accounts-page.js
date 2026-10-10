/* Account & Access admin page */
function accountsPage(){
 const A=authLoad(),admin=userIsSuper(),res=AUTHUI.result;AUTHUI.result=null;
 let h=pageTitle("Account & Access",admin?"Create staff accounts, approve sign-up requests and reset passwords.":"Manage your sign-in password.");
 if(res)h+=`<div class="notice warn"><b>${esc(res.title)}</b><div class="cred-box">Staff ID: ${esc(res.staffId)}<br>Temporary password: ${esc(res.pw)}</div><div class="muted smalltext">Shown once. Give it to the staff member; they must choose a new password at first sign-in.</div><button type="button" class="secondary small" id="credCopy" style="margin-top:8px">Copy details</button></div>`;
 h+=`<div class="card" style="margin-top:16px"><h3>My account</h3><p class="muted smalltext">${esc(db.user.name)} · ${esc(db.user.staffId)} · ${esc(db.user.role)}</p><form id="pwChangeForm"><div class="grid three"><div class="field"><label>Current password</label><input type="password" name="cur" autocomplete="current-password" required></div><div class="field"><label>New password (min 8)</label><input type="password" name="n1" autocomplete="new-password" required></div><div class="field"><label>Confirm new password</label><input type="password" name="n2" autocomplete="new-password" required></div></div><button type="submit">Change password</button></form></div>`;
 if(!admin)return h;
 const pend=A.accounts.filter(a=>a.status==="pending").length;
 h+=`<div class="card" style="margin-top:16px"><h3>Create a staff account</h3><p class="muted smalltext">Give each person their Staff ID and the temporary password shown after creation.</p><form id="acctCreateForm"><div class="grid two"><div class="field"><label>Full name</label><input name="name" required maxlength="70"></div><div class="field"><label>Staff ID</label><input name="sid" required maxlength="30" placeholder="e.g. STF-LAB-07"></div><div class="field"><label>Department / role</label><select name="role">${ROLES.map(r=>`<option ${r==="Bed Management"?"selected":""}>${esc(r)}</option>`).join("")}</select></div><div class="field"><label>Temporary password</label><div style="display:flex;gap:8px"><input name="pw" required minlength="8" maxlength="70"><button type="button" class="secondary small" id="acctGen">Generate</button></div></div></div><button type="submit">Create account</button></form></div>`;
 const rows=A.accounts.slice().sort((a,b)=>(a.status==="pending"?0:1)-(b.status==="pending"?0:1)||a.staffId.localeCompare(b.staffId)).map(a=>{
  const self=authNormId(a.staffId)===authNormId(db.user.staffId);
  const tag=a.status==="active"?'<span class="tag teal">Active</span>':a.status==="pending"?'<span class="tag amber">Pending</span>':'<span class="tag red">Disabled</span>';
  const role=`<select data-acct-role="${esc(a.staffId)}" style="min-width:150px">${ROLES.map(r=>`<option ${r===a.role?"selected":""}>${esc(r)}</option>`).join("")}</select>`;
  const btn=(k,t,c)=>`<button type="button" class="${c||"secondary"} small" data-acct="${k}" data-sid="${esc(a.staffId)}">${t}</button>`;
  const acts=(a.status==="pending"?btn("approve","Approve","")+" ":"")+(a.status==="active"&&!self?btn("toggle","Disable")+" ":"")+(a.status==="disabled"?btn("toggle","Enable")+" ":"")+btn("reset","Reset password")+(self?"":" "+btn("delete","Delete","danger"));
  return`<tr><td><b>${esc(a.staffId)}</b>${self?' <span class="muted smalltext">(you)</span>':""}</td><td>${esc(a.name)}</td><td>${role}</td><td>${tag}</td><td>${a.lastLogin?esc(new Date(a.lastLogin).toLocaleString()):"Never"}</td><td><div class="acct-actions">${acts}</div></td></tr>`});
 h+=`<div class="card" style="margin-top:16px"><h3>All accounts</h3>${pend?`<div class="notice warn" style="margin-bottom:10px">${pend} sign-up request(s) waiting for your approval.</div>`:""}${table(["Staff ID","Name","Role","Status","Last sign-in","Actions"],rows)}
 <div class="toolbar" style="margin-top:12px"><button type="button" class="secondary small" id="acctExport">Export accounts (JSON)</button><label class="secondary small" style="display:inline-block;padding:6px 9px;border-radius:9px;cursor:pointer;font-weight:650">Import accounts<input type="file" id="acctImport" accept=".json" style="display:none"></label></div>
 <p class="muted smalltext">Accounts live only in this browser. Export them to carry the same logins to another browser or computer. Keep the exported file private.</p></div>`;
 return h;
}
function wireAccounts(){
 const back=()=>renderPage();
 const pc=document.getElementById("pwChangeForm");
 if(pc)pc.onsubmit=async e=>{e.preventDefault();const f=new FormData(pc),A=authLoad(),a=authFind(A,db.user.staffId);if(!a)return;
  if(!(await authVerify(f.get("cur"),a))){toast("Current password is incorrect.","error");return}
  const pe=authPolicy(f.get("n1"),a.staffId);if(pe){toast(pe,"error");return}if(f.get("n1")!==f.get("n2")){toast("New passwords do not match.","error");return}
  a.salt=authSalt();a.hash=await authHash(f.get("n1"),a.salt);a.mustChange=false;authSave(A);pc.reset();toast("Password changed.")};
 const gen=document.getElementById("acctGen");if(gen)gen.onclick=()=>{document.querySelector("#acctCreateForm [name=pw]").value=authTemp()};
 const cf=document.getElementById("acctCreateForm");
 if(cf)cf.onsubmit=async e=>{e.preventDefault();if(!userIsSuper())return;const f=new FormData(cf),sid=String(f.get("sid")).trim(),name=String(f.get("name")).trim(),pw=String(f.get("pw"));
  if(!authIdOk(sid)){toast("Staff ID must be 3-30 characters: letters, numbers, dot, dash or underscore.","error");return}
  const pe=authPolicy(pw,sid);if(pe){toast(pe,"error");return}
  const A=authLoad();if(authFind(A,sid)){toast("That staff ID already exists.","error");return}
  const salt=authSalt();A.accounts.push({staffId:authNormId(sid),name,role:String(f.get("role")),salt,hash:await authHash(pw,salt),status:"active",mustChange:true,created:now()});authSave(A);
  AUTHUI.result={title:"Account created",staffId:authNormId(sid),pw};logEvent(`Account created for ${name} (${authNormId(sid)})`,"System","Low");save();back()};
 const cc=document.getElementById("credCopy");if(cc)cc.onclick=()=>{const t=document.querySelector(".cred-box").innerText;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast("Copied."),()=>toast("Copy not available; select and copy manually.","error"))};
 document.querySelectorAll("[data-acct]").forEach(b=>b.onclick=async()=>{if(!userIsSuper())return;const A=authLoad(),a=authFind(A,b.dataset.sid);if(!a)return;const k=b.dataset.acct;
  const lastAdmin=activeAdmins(A).length<=1&&AUTH_ADMIN_ROLES.includes(a.role)&&a.status==="active";
  if(k==="approve"){a.status="active";authSave(A);logEvent(`Account approved: ${a.name} (${a.staffId})`,"System","Low");toast("Account approved.")}
  else if(k==="toggle"){if(a.status==="active"){if(lastAdmin){toast("You cannot disable the last active administrator.","error");return}a.status="disabled"}else a.status="active";authSave(A);toast("Account updated.")}
  else if(k==="reset"){const pw=authTemp();a.salt=authSalt();a.hash=await authHash(pw,a.salt);a.mustChange=true;if(a.status==="pending")a.status="active";authSave(A);AUTHUI.result={title:"Password reset for "+a.name,staffId:a.staffId,pw}}
  else if(k==="delete"){if(lastAdmin){toast("You cannot delete the last active administrator.","error");return}if(!confirm(`Delete account ${a.staffId}? This cannot be undone.`))return;A.accounts=A.accounts.filter(x=>x!==a);authSave(A);toast("Account deleted.")}
  save();back()});
 document.querySelectorAll("[data-acct-role]").forEach(s=>s.onchange=()=>{if(!userIsSuper())return;const A=authLoad(),a=authFind(A,s.dataset.acctRole);if(!a)return;
  if(AUTH_ADMIN_ROLES.includes(a.role)&&!AUTH_ADMIN_ROLES.includes(s.value)&&activeAdmins(A).length<=1&&a.status==="active"){toast("At least one active administrator is required.","error");back();return}
  a.role=s.value;authSave(A);if(authNormId(a.staffId)===authNormId(db.user.staffId)){db.user.role=a.role;save();render()}else{toast("Role updated.");back()}});
 const ex=document.getElementById("acctExport");if(ex)ex.onclick=()=>{const l=document.createElement("a");l.href=URL.createObjectURL(new Blob([JSON.stringify(authLoad(),null,1)],{type:"application/json"}));l.download="sanjeevani-accounts.json";document.body.appendChild(l);l.click();l.remove()};
 const im=document.getElementById("acctImport");if(im)im.onchange=async()=>{const file=im.files[0];if(!file)return;try{const o=JSON.parse(await file.text());if(!o||!Array.isArray(o.accounts))throw new Error("Not an accounts file");
  const A=authLoad();let added=0;o.accounts.forEach(x=>{if(x&&x.staffId&&x.hash&&x.salt&&x.role&&x.name&&!authFind(A,x.staffId)){A.accounts.push({staffId:authNormId(x.staffId),name:String(x.name),role:ROLES.includes(x.role)?x.role:"Administration",salt:String(x.salt),hash:String(x.hash),status:["active","pending","disabled"].includes(x.status)?x.status:"pending",mustChange:!!x.mustChange,created:x.created||now()});added++}});
  authSave(A);toast(`Imported ${added} account(s).`);back()}catch(err){toast("Import failed: "+err.message,"error")}};
}
document.addEventListener("click",e=>{if(db.user&&e.target.closest&&e.target.closest(".top-actions .avatar"))go("accounts")});
