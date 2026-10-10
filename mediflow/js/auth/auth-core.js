/* Accounts: storage, salted password hashing, lockout, policy */
/* ===================== ACCOUNTS: sign up / sign in ===================== */
const AUTH_KEY="mediflow_accounts_v1",AUTH_LOCK_KEY="mediflow_auth_lock_v1";
const AUTH_ADMIN_ROLES=["Hospital Superintendent","Medical Superintendent"];
const AUTH_HERO=`<div class="login-hero"><div class="brand-mark">✚</div><h1>Sanjeevani Hospital AI<br><span style="color:#70e0d5">The Blocked Bed</span></h1><p>A connected hospital operations workspace that helps teams spot bottlenecks, coordinate actions, and make operational information visible.</p><div class="hero-points"><div>✓ Shared hospital overview</div><div>✓ Cross-department operational alerts</div><div>✓ Superintendent report review</div></div></div>`;
const AUTHUI={tab:"in",pending:null,msg:"",result:null};
const authNormId=s=>String(s||"").trim().toUpperCase();
function authLoad(){try{const o=JSON.parse(localStorage.getItem(AUTH_KEY));if(o&&Array.isArray(o.accounts))return o}catch(e){}return{accounts:[]}}
function authSave(o){localStorage.setItem(AUTH_KEY,JSON.stringify(o))}
const authFind=(o,sid)=>o.accounts.find(a=>authNormId(a.staffId)===authNormId(sid));
const authHex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
function authSalt(){const a=new Uint8Array(16);crypto.getRandomValues(a);return authHex(a)}
function authTemp(){const al="ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789",a=new Uint32Array(10);crypto.getRandomValues(a);return[...a].map(x=>al[x%al.length]).join("")}
async function authHashWith(pw,salt,algo){
 if(algo==="p1:"){if(!(window.crypto&&crypto.subtle))return null;const enc=new TextEncoder();
  const k=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:enc.encode(salt),iterations:150000},k,256);return"p1:"+authHex(bits)}
 let h1=0xdeadbeef,h2=0x41c6ce57;const s=salt+"|"+pw;
 for(let r=0;r<2000;r++)for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
 h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
 return"f1:"+(h2>>>0).toString(16).padStart(8,"0")+(h1>>>0).toString(16).padStart(8,"0")}
const authHash=(pw,salt)=>authHashWith(pw,salt,(window.crypto&&crypto.subtle)?"p1:":"f1:");
async function authVerify(pw,a){const h=await authHashWith(pw,a.salt,String(a.hash||"").slice(0,3));return h!==null&&h===a.hash}
function authPolicy(pw,sid){if(pw.length<8)return"Password must be at least 8 characters.";if(authNormId(pw)===authNormId(sid))return"Password must not be the same as the staff ID.";return""}
const authIdOk=s=>/^[A-Za-z0-9._\-]{3,30}$/.test(s);
function authLockLeft(){try{const l=JSON.parse(localStorage.getItem(AUTH_LOCK_KEY));if(l&&l.until>Date.now())return Math.ceil((l.until-Date.now())/1000)}catch(e){}return 0}
function authFail(){let l;try{l=JSON.parse(localStorage.getItem(AUTH_LOCK_KEY))||{n:0}}catch(e){l={n:0}}l.n=(l.n||0)+1;if(l.n>=5)l.until=Date.now()+30000*Math.min(8,l.n-4);localStorage.setItem(AUTH_LOCK_KEY,JSON.stringify(l))}
const authOk=()=>localStorage.removeItem(AUTH_LOCK_KEY);
const activeAdmins=A=>A.accounts.filter(a=>a.status==="active"&&AUTH_ADMIN_ROLES.includes(a.role));
function authLogin(a){const A=authLoad(),x=authFind(A,a.staffId);if(x){x.lastLogin=now();authSave(A)}
 db.user={name:a.name,staffId:a.staffId,role:a.role};db.active="overview";AUTHUI.pending=null;AUTHUI.tab="in";save();render();toast(`Welcome, ${a.name}`)}
/* drop any old demo session that has no real account behind it; keep role in sync with the account */
(function(){const A=authLoad();if(db.user){const a=authFind(A,db.user.staffId);if(!a||a.status!=="active")db.user=null;else{db.user.role=a.role;db.user.name=a.name}}})();
NAV.push(["accounts","🔑","Account & Access"]);
