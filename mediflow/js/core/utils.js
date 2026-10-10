/* Small helpers: time, ids, HTML escaping, status tags */
const now=()=>new Date().toISOString();
const dt=iso=>iso?new Date(iso).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"—";
const id=prefix=>prefix+"-"+Math.random().toString(36).slice(2,7).toUpperCase();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const n=v=>Math.max(0,Number(v)||0);
const statusTag=s=>{let cls=/critical|high|delayed|blocked|rejected/i.test(s)?"red":/pending|progress|requested|awaiting|shortage|medium|information/i.test(s)?"amber":/approved|completed|accepted|available|resolved|low/i.test(s)?"green":"blue";return `<span class="tag ${cls}">${esc(s||"—")}</span>`};
