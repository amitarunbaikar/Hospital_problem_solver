/* Sign in / sign up screen */
function authShell(){db.user={name:"Demo User",staffId:"DEMO",role:"Hospital Superintendent"};db.active=db.active||"overview";save();render()}
function authShellOriginal(){
 const A=authLoad(),first=A.accounts.length===0;
 let tab=first?"setup":AUTHUI.tab;if(tab==="force"&&!AUTHUI.pending)tab="in";if(!first)AUTHUI.tab=tab;
 const inp=(id,label,ph,ac,type)=>`<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type||"text"}" placeholder="${ph}" autocomplete="${ac}" maxlength="70" required></div>`;
 let title,sub,fields,btn,note="";
 if(tab==="setup"){title="Set up the administrator account";sub="No accounts exist yet. The first account becomes the hospital administrator and can then create accounts for all staff.";
  fields=inp("aName","Full name","e.g. Dr. Anita Rao","name")+inp("aId","Staff ID","e.g. STF-ADM-01","username")+inp("aPw","Password (min 8 characters)","","new-password","password")+inp("aPw2","Confirm password","","new-password","password");btn="Create administrator account"}
 else if(tab==="up"){title="Request an account";sub="Fill this in and an administrator will approve it.";
  fields=inp("aName","Full name","e.g. Kavya S.","name")+inp("aId","Staff ID","e.g. STF-BED-02","username")+
  `<div class="field"><label for="aRole">Department / role</label><select id="aRole">${ROLES.filter(r=>!AUTH_ADMIN_ROLES.includes(r)).map(r=>`<option>${esc(r)}</option>`).join("")}</select></div>`+
  inp("aPw","Password (min 8 characters)","","new-password","password")+inp("aPw2","Confirm password","","new-password","password");btn="Request account";
  note="You can sign in once an administrator approves your request."}
 else if(tab==="force"){title="Choose a new password";sub="Your administrator gave you a temporary password. Set your own to continue.";
  fields=inp("aPw","New password (min 8 characters)","","new-password","password")+inp("aPw2","Confirm new password","","new-password","password");btn="Save and sign in"}
 else{title="Welcome back";sub="Sign in with your staff ID and password.";
  fields=inp("aId","Staff ID","e.g. STF-001","username")+inp("aPw","Password","","current-password","password");btn="Sign in";
  note=`<button type="button" class="linkbtn" id="aForgot">Forgot password?</button>`}
 const tabs=(first||tab==="force")?"":`<div class="auth-tabs"><button type="button" data-tab="in" class="${tab==="in"?"on":""}">Sign in</button><button type="button" data-tab="up" class="${tab==="up"?"on":""}">Sign up</button></div>`;
 const m=AUTHUI.msg;AUTHUI.msg="";
 document.getElementById("app").innerHTML=`<div class="login-screen">${AUTH_HERO}<div class="login-panel"><form class="login-box" id="authForm" novalidate><div class="tag teal" style="margin-bottom:15px">STAFF ACCESS</div>${tabs}<h2>${title}</h2><p>${sub}</p>${fields}<button type="submit" style="width:100%;padding:13px;margin-top:5px">${btn}</button><div id="authMsg" class="auth-msg ${m?"ok":""}" role="alert">${esc(m)}</div><div class="auth-note">${note}</div></form></div><button type="button" class="ghost themeBtn login-theme" aria-label="Toggle light or dark mode"></button><div class="login-foot">Sanjeevani Hospital AI · accounts are stored in this browser · prototype</div></div>`;
 const f=document.getElementById("authForm"),msg=document.getElementById("authMsg"),sb=f.querySelector("button[type=submit]");
 const say=(t,ok)=>{msg.textContent=t;msg.className="auth-msg"+(ok?" ok":"")};
 f.querySelectorAll("input[type=password]").forEach(pw=>{pw.parentNode.classList.add("pw");const eye=document.createElement("button");eye.type="button";eye.className="ghost eye";eye.textContent="Show";eye.setAttribute("aria-label","Show or hide password");pw.after(eye);eye.onclick=()=>{const s=pw.type==="password";pw.type=s?"text":"password";eye.textContent=s?"Hide":"Show"}});
 f.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{AUTHUI.tab=b.dataset.tab;authShell()});
 const fg=document.getElementById("aForgot");if(fg)fg.onclick=()=>say("Ask your hospital administrator to reset your password (Account & Access page).");
 const v=id=>{const e=document.getElementById(id);return e?e.value:""};
 f.onsubmit=async e=>{e.preventDefault();sb.disabled=true;say("");
  try{
   if(tab==="in"){
    const left=authLockLeft();if(left){say(`Too many attempts. Try again in ${left}s.`);return}
    const sid=v("aId").trim(),pw=v("aPw"),A=authLoad(),a=authFind(A,sid);
    const ok=a?await authVerify(pw,a):(await authHash(pw,"0".repeat(32)),false);
    if(!a||!ok){authFail();say("Incorrect staff ID or password.");return}
    if(a.status==="pending"){say("Your account is still waiting for administrator approval.");return}
    if(a.status==="disabled"){say("This account has been disabled. Contact the administrator.");return}
    authOk();if(a.mustChange){AUTHUI.pending=a.staffId;AUTHUI.tab="force";authShell();return}
    authLogin(a);return}
   if(tab==="force"){
    const A=authLoad(),a=authFind(A,AUTHUI.pending),pw=v("aPw"),pw2=v("aPw2");if(!a){AUTHUI.pending=null;AUTHUI.tab="in";authShell();return}
    const pe=authPolicy(pw,a.staffId);if(pe){say(pe);return}if(pw!==pw2){say("Passwords do not match.");return}
    if(await authVerify(pw,a)){say("Choose a password different from the temporary one.");return}
    a.salt=authSalt();a.hash=await authHash(pw,a.salt);a.mustChange=false;authSave(A);authLogin(a);return}
   const name=v("aName").trim(),sid=v("aId").trim(),pw=v("aPw"),pw2=v("aPw2");
   if(!name){say("Enter your full name.");return}
   if(!authIdOk(sid)){say("Staff ID must be 3-30 characters: letters, numbers, dot, dash or underscore.");return}
   const pe=authPolicy(pw,sid);if(pe){say(pe);return}if(pw!==pw2){say("Passwords do not match.");return}
   const A=authLoad();if(authFind(A,sid)){say("That staff ID is already registered.");return}
   const salt=authSalt(),hash=await authHash(pw,salt);
   if(tab==="setup"){const a={staffId:authNormId(sid),name,role:"Hospital Superintendent",salt,hash,status:"active",mustChange:false,created:now()};A.accounts.push(a);authSave(A);authLogin(a);return}
   A.accounts.push({staffId:authNormId(sid),name,role:v("aRole"),salt,hash,status:"pending",mustChange:false,created:now()});authSave(A);
   db.notifications.unshift({id:id("NTF"),text:`Account request from ${name} (${authNormId(sid)}) is waiting for approval.`,time:now(),read:false});save();
   AUTHUI.tab="in";AUTHUI.msg="Request sent. You can sign in after an administrator approves it.";authShell();
  }catch(err){say("Something went wrong: "+err.message)}finally{sb.disabled=false}};
}
