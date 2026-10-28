'use strict';
const $=s=>document.querySelector(s),KEY='quests.v1',DAY=864e5,VER=8;
const R=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
const TYPES={daily:'Daily',weekly:'Weekly',monthly:'Monthly',custom:'Custom'},TK=Object.keys(TYPES);
const SPAN={m:6e4,h:36e5,d:DAY,w:7*DAY};
const num=(v,a,b,d)=>{v=Math.round(+v);return Number.isFinite(v)?Math.min(b,Math.max(a,v)):d};
const fin=v=>v!=null&&v!==''&&Number.isFinite(+v);
const str=(v,n)=>String(v??'').slice(0,n);
const sid=v=>str(v,40).replace(/[^\w-]/g,'');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const hue=t=>200-(t-1)*22;               // tier I = biru dingin ... tier X = merah panas

/* ---------- Quest Dimulai (jadwal & siklus) dan Quest Berakhir ---------- */
function cleanS(s){if(!s||typeof s!=='object')return null;
 const days=[...new Set((Array.isArray(s.days)?s.days:[]).map(Number).filter(d=>Number.isInteger(d)&&d>=0&&d<=6))].sort();
 return days.length?{days,time:/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time)?s.time:'08:00',at:num(s.at,0,9e15,Date.now())}:null}
function nextOcc(s,t,incl){const[h,m]=s.time.split(':').map(Number);          // jadwal pertama pada/setelah t
 for(let i=0;i<=7;i++){const d=new Date(t);d.setDate(d.getDate()+i);d.setHours(h,m,0,0);const x=d.getTime();
  if((incl?x>=t:x>t)&&s.days.includes(d.getDay()))return x}
 return Infinity}
const nd=(t,incl,ok)=>{const d=new Date(t);d.setHours(0,0,0,0);
 while(d.getTime()<t||(!incl&&d.getTime()===t)||!ok(d))d.setDate(d.getDate()+1);return d.getTime()};
const isOnce=q=>!q.sch&&q.type==='custom'&&!(q.every>0);
function nextStart(q,t,incl,a){                                              // awal siklus berikutnya (Infinity = tidak ada)
 if(q.sch)return nextOcc(q.sch,t,incl);
 if(q.type==='daily')return nd(t,incl,()=>true);
 if(q.type==='weekly')return nd(t,incl,d=>d.getDay()===1);
 if(q.type==='monthly')return nd(t,incl,d=>d.getDate()===1);
 if(q.every>0){const g=new Date(a);g.setHours(0,0,0,0);
  do g.setDate(g.getDate()+q.every);while(g.getTime()<t||(!incl&&g.getTime()===t));return g.getTime()}
 return Infinity}
const dlSpan=d=>d.k==='after'?d.n*SPAN[d.u]:0;
const ps=(q,t)=>{const d=new Date(t);d.setHours(0,0,0,0);
 if(q.type==='weekly')d.setDate(d.getDate()-(d.getDay()+6)%7);else if(q.type==='monthly')d.setDate(1);return d.getTime()};
function firstStart(q,t0){const b=Math.max(t0,q.start||0);                   // awal siklus pertama
 if(q.sch)return nextOcc(q.sch,b,true);
 if(isOnce(q)||(q.start&&q.start>t0))return b;
 const p=Math.max(ps(q,b),q.start||0);return p<b&&q.dl.k==='after'&&p+dlSpan(q.dl)>b?p:b}
const endAt=q=>q.dl.k==='after'?q.cs+dlSpan(q.dl):q.dl.k==='custom'?q.dl.at:Infinity;

/* ---------- sanitasi data (dipakai saat load & import; juga migrasi dari versi lama) ---------- */
function cleanQ(q,keep){q=q||{};const w=q.dl||{},mig=w.k==='day'||w.k==='week',sc=cleanS(q.sch);
 let k=mig?'after':['after','custom'].includes(w.k)?w.k:'none';
 const at=k==='custom'&&fin(w.at)?+w.at:null;if(k==='custom'&&at===null)k='none';
 const dl={k,at,n:mig?1:num(w.n,1,9999,1),u:mig?(w.k==='day'?'d':'w'):(['m','h','d','w'].includes(w.u)?w.u:'d')};
 const o={id:sid(q.id)||uid(),name:str(q.name,120)||'Tanpa nama',desc:str(q.desc,1000),tier:num(q.tier,1,10,1),
  type:TK.includes(q.type)?q.type:'daily',every:num(q.every,0,3650,0),dl,sch:sc,start:fin(q.start)?+q.start:null,
  notes:(Array.isArray(q.notes)?q.notes:[]).slice(0,200).map(n=>({id:sid(n&&n.id)||uid(),text:str(n&&n.text,5000),ts:num(n&&n.ts,0,9e15,Date.now())})),
  created:num(q.created,0,9e15,Date.now()),doneAt:keep&&q.doneAt?num(q.doneAt,0,9e15,null):null,doneLog:keep&&q.doneLog?sid(q.doneLog):null,res:keep&&q.doneAt&&q.res==='fail'?'fail':null,pct:keep&&fin(q.pct)?num(q.pct,0,100,null):null,
  cl:(Array.isArray(q.cl)?q.cl:[]).slice(0,100).map(i=>({id:sid(i&&i.id)||uid(),t:str(i&&i.t,200),d:!!(keep&&i&&i.d)})).filter(i=>i.t.trim())};
 o.cs=fin(q.cs)?+q.cs:mig&&fin(w.at)?+w.at-dlSpan(dl):firstStart(o,sc?sc.at:o.created);
 return o}
const cleanL=l=>l&&l.at?{id:sid(l.id)||uid(),qid:sid(l.qid),name:str(l.name,120),tier:num(l.tier,1,10,1),
 type:TK.includes(l.type)?l.type:'custom',xp:num(l.xp,0,1e4,10),at:num(l.at,0,9e15,Date.now()),res:l.res==='fail'?'fail':'done',pct:num(l.pct,0,100,l.res==='fail'?0:100)}:null;

const cleanP=p=>({name:str(p&&p.name,24).trim()||'Petualang',goal:num(p&&p.goal,1,30,3),rest:[...new Set((Array.isArray(p&&p.rest)?p.rest:[]).map(Number).filter(d=>Number.isInteger(d)&&d>=0&&d<=6))].sort()});

const parseTags=s=>{const seen=new Set(),out=[];String(s).split(/[,\n]/).forEach(t=>{t=t.replace(/^#+/,'').trim().replace(/\s+/g,' ').slice(0,24);const k=t.toLowerCase();if(t&&!seen.has(k)&&out.length<12){seen.add(k);out.push(t)}});return out};
const cleanRep=r=>{if(!r||typeof r!=='object')return null;const k=['d','w','m'].includes(r.k)?r.k:null;if(!k)return null;
 const hm=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(v)?v:null,
  days=[...new Set((Array.isArray(r.days)?r.days:[]).map(Number).filter(d=>Number.isInteger(d)&&d>=0&&d<=6))].sort(),
  dom=[...new Set((Array.isArray(r.dom)?r.dom:[]).map(Number).filter(d=>Number.isInteger(d)&&d>=0&&d<=31))].sort((a,b)=>a-b);
 if(k==='w'&&!days.length||k==='m'&&!dom.length)return null;return{k,days,dom,t1:hm(r.t1),t2:hm(r.t2)}};   // d=tiap hari, w=hari dalam minggu, m=tanggal dalam bulan (0 = akhir bulan)
const cleanN=n=>{n=n||{};const from=fin(n.from)?+n.from:null,until=fin(n.until)?+n.until:null,now=Date.now();
 const o={id:sid(n.id)||uid(),title:str(n.title,120).trim(),body:str(n.body,5000),tags:parseTags(Array.isArray(n.tags)?n.tags.join(','):''),pin:!!n.pin,arch:!!n.arch,
  from,until:from!=null&&until!=null&&until<=from?null:until,rep:cleanRep(n.rep),created:num(n.created,0,9e15,now),edited:num(n.edited,0,9e15,now)};
 return o.title||o.body.trim()?o:null};
const dayOk=(r,d)=>r.k==='d'||(r.k==='w'&&r.days.includes(d.getDay()))||(r.k==='m'&&(r.dom.includes(d.getDate())||(r.dom.includes(0)&&new Date(d.getFullYear(),d.getMonth()+1,0).getDate()===d.getDate())));
const hmMs=(d,hm)=>{const[h,m]=hm.split(':').map(Number),x=new Date(d);x.setHours(h,m,0,0);return x.getTime()};
function repWin(r,D){if(!dayOk(r,D))return null;const d0=new Date(D);d0.setHours(0,0,0,0);const d1=new Date(d0);d1.setDate(d1.getDate()+1);   // jendela tampil yang DIMULAI pada hari D
 const s=r.t1?hmMs(d0,r.t1):d0.getTime();let e=d1.getTime();if(r.t2)e=r.t2<=(r.t1||'00:00')?hmMs(d1,r.t2):hmMs(d0,r.t2);return{s,e}}
function repNow(n,t){if(!n.rep)return null;for(let i=0;i<2;i++){const D=new Date(t);D.setDate(D.getDate()-i);const w=repWin(n.rep,D);if(w&&w.s<=t&&t<w.e)return w}return null}   // cek hari ini & kemarin (jendela lewat tengah malam)
function nextWin(n,t){for(let i=0;i<=800;i++){const D=new Date(t);D.setDate(D.getDate()+i);const w=repWin(n.rep,D);if(w&&w.s>t)return w.s}return Infinity}
const nst=n=>{const t=Date.now();if(n.arch)return'arch';if(n.until!=null&&t>=n.until)return'end';if(n.from!=null&&t<n.from)return'wait';return n.rep&&!repNow(n,t)?'wait':'show'};   // show, wait, end, arch
function nextShow(n){const t=Date.now(),b=Math.max(t,n.from??-Infinity);let x;
 if(n.rep)x=b>t&&repNow(n,b)?b:nextWin(n,b);else x=n.from!=null&&n.from>t?n.from:t;return n.until!=null&&x>=n.until?Infinity:x}
const curEnd=n=>{const w=repNow(n,Date.now());return Math.min(w?w.e:Infinity,n.until??Infinity)};
const plain=s=>s.replace(/^\s*(#{1,3}|[-*]|&#62;|>|\d+[.)])\s+/gm,'').replace(/\[[ xX]\]\s*/g,'').replace(/[*`]/g,'');
const noteName=n=>n.title||plain(n.body.split('\n')[0]).slice(0,80)||'Tanpa judul';


/* ---------- state ---------- */
let S={quests:[],log:[],notes:[],profile:cleanP()},ui={type:'all',edit:null,d:null,imp:null,tab:'quests',pt:'sum',rng:7,lf:'all',nt:'',ne:null};
try{const raw=localStorage.getItem(KEY);if(raw&&!localStorage.getItem('quests.bak'))localStorage.setItem('quests.bak',raw)}catch(e){}
try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.quests)){
 S.quests=d.quests.map(q=>cleanQ(q,1));S.log=(Array.isArray(d.log)?d.log:[]).map(cleanL).filter(Boolean);S.profile=cleanP(d.profile);S.notes=(Array.isArray(d.notes)?d.notes:[]).map(cleanN).filter(Boolean)}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Gagal menyimpan data')}};
const get=id=>S.quests.find(q=>q.id===id);

/* ---------- status, tanggal ---------- */
const dkey=t=>{const d=new Date(t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const fmtD=t=>new Date(t).toLocaleDateString('id-ID',{day:'numeric',month:'short'});
const fmtT=t=>new Date(t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
const fmtDT=t=>new Date(t).toLocaleString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const fmtW=t=>new Date(t).toLocaleString('id-ID',{weekday:'short',hour:'2-digit',minute:'2-digit'});
const fmtS=t=>t-Date.now()<6*DAY?fmtW(t):fmtDT(t);
const loc=t=>new Date(t-new Date(t).getTimezoneOffset()*6e4).toISOString().slice(0,16);
function resetAt(q){const r=nextStart(q,q.doneAt,false,q.doneAt);return q.dl.k==='custom'&&r>=q.dl.at?Infinity:r}
// done = selesai, wait = belum dimulai, end = berakhir (lewat Quest Berakhir), on = sedang berlangsung
function status(q){const n=Date.now();if(q.doneAt&&n<resetAt(q))return q.res==='fail'?'fail':'done';if(q.cs>n)return'wait';return n>=endAt(q)?'end':'on'}
function refresh(){let ch=false;const n=Date.now();
 S.quests.forEach(q=>{for(let i=0;i<400;i++){
  if(q.doneAt){const r=resetAt(q);if(n<r)break;q.doneAt=q.doneLog=null;q.cs=r;newRun(q);ch=true;continue}      // siklus baru setelah selesai
  const e=endAt(q);if(n<e||q.cs>n||q.dl.k==='custom')break;
  const ns=nextStart(q,e,true,q.cs);if(ns>n)break;q.cs=ns;newRun(q);ch=true}});                               // siklus baru setelah berakhir
 if(ch)save()}
const typeLabel=q=>TYPES[q.type]+(q.type==='custom'&&!q.sch&&q.every>0?' (tiap '+q.every+' hari)':'');
const DN={0:'Min',1:'Sen',2:'Sel',3:'Rab',4:'Kam',5:'Jum',6:'Sab'};
const schLabel=q=>(q.sch.days.length===7?'setiap hari':[1,2,3,4,5,6,0].filter(d=>q.sch.days.includes(d)).map(d=>DN[d]).join(', '))+' pukul '+q.sch.time.replace(':','.');
function left(ms){const m=Math.floor(ms/6e4);if(m<1)return'kurang dari 1 mnt';if(m<60)return m+' mnt';const h=Math.floor(m/60);
 if(h<24)return h+' jam'+(m%60?' '+m%60+' mnt':'');return Math.floor(h/24)+' hari'+(h%24?' '+h%24+' jam':'')}

/* ---------- persentase selesai & checklist ---------- */
const newRun=q=>{q.res=null;q.pct=null;q.cl.forEach(i=>i.d=false)};      // siklus baru: progres dikosongkan
const clItems=q=>q.cl.filter(i=>i.t.trim());
const clPct=q=>{const a=clItems(q);return a.length?Math.round(a.filter(i=>i.d).length/a.length*100):null};
const eff=q=>q.pct!=null?q.pct:(clPct(q)??100);                           // slider (manual) menang; kalau kosong ikut checklist; tanpa keduanya 100%
const pts=q=>Math.round(q.tier*10*eff(q)/100);

/* ---------- sort / filter ---------- */
const cmpDl=dir=>(a,b)=>{const x=endAt(a),y=endAt(b);if(x===y)return 0;if(x===Infinity)return 1;if(y===Infinity)return -1;return dir*(x-y)};
const SORTS={stA:(a,b)=>a.cs-b.cs,stD:(a,b)=>b.cs-a.cs,dlA:cmpDl(1),dlD:cmpDl(-1),tierD:(a,b)=>b.tier-a.tier,tierA:(a,b)=>a.tier-b.tier},ORD={on:0,wait:1,done:2,fail:3,end:4};
function visible(){const q=$('#q').value.trim().toLowerCase(),tf=$('#tf').value,cmp=SORTS[$('#sort').value]||SORTS.stA,
 want=new Set([...document.querySelectorAll('#fst input:checked')].map(c=>c.value));
 return S.quests.filter(x=>(ui.type==='all'||x.type===ui.type)&&want.has(status(x))&&(!tf||x.tier==tf)&&
  (!q||(x.name+' '+x.desc+' '+x.notes.map(n=>n.text).join(' ')).toLowerCase().includes(q)))
  .sort((a,b)=>ORD[status(a)]-ORD[status(b)]||cmp(a,b)||b.tier-a.tier||a.created-b.created)}

/* ---------- render ---------- */
function chips(q){const n=Date.now(),s=status(q),e=endAt(q);let h=`<span class="chip">${typeLabel(q)}</span>`;
 if(q.sch)h+=`<span class="chip">Dimulai ${schLabel(q)}</span>`;
 if(s==='on')h+=e===Infinity?'<span class="chip">Tanpa batas waktu</span>':`<span class="chip ${e-n<36e5?'bad':e-n<DAY?'warn':''}">Berakhir dalam ${left(e-n)}</span>`;
 if(s==='wait')h+=`<span class="chip">Dimulai ${fmtS(q.cs)}</span>`;
 if(s==='done'||s==='fail'){h+=s==='fail'?`<span class="chip bad">Gagal ${fmtD(q.doneAt)}</span>`:`<span class="chip ok">Selesai${q.pct!=null&&q.pct<100?' '+q.pct+'%':''} ${fmtD(q.doneAt)}</span>`;const r=resetAt(q);if(r!==Infinity)h+=`<span class="chip">Dimulai lagi ${fmtS(r)}</span>`}
 if(s==='end'){h+=`<span class="chip bad">Berakhir ${fmtDT(e)}</span>`;const ns=q.dl.k==='custom'?Infinity:nextStart(q,e,true,q.cs);if(ns!==Infinity)h+=`<span class="chip">Dimulai lagi ${fmtS(ns)}</span>`}
 return h}
function card(q){const s=status(q),it=clItems(q),dn=it.filter(i=>i.d).length,p=s==='on'&&(q.cl.length||q.pct!=null),closed=s==='done'||s==='fail';
 return `<article class="row${s==='on'?'':' '+s}" data-id="${q.id}" style="--t:${hue(q.tier)}"><span class="tier" data-act="open">${R[q.tier-1]}</span>
<div class="body" data-act="open"><h3>${esc(q.name)}</h3>${q.desc?`<p>${esc(q.desc)}</p>`:''}
<div class="chips">${chips(q)}${p?`<span class="chip">${eff(q)}% selesai</span>`:''}${p&&it.length?`<span class="chip">${dn}/${it.length} item</span>`:''}${q.notes.length?`<span class="chip">${q.notes.length} note</span>`:''}</div>${p?`<div class="pbar"><i style="width:${eff(q)}%"></i></div>`:''}</div>
<button class="chk" data-act="${closed?'undo':'done'}" aria-label="${s==='fail'?'Batalkan gagal':s==='done'?'Batalkan selesai':'Tandai selesai'}">${s==='done'?'✓':s==='fail'?'✕':''}</button></article>`}
function renderTypes(){const n=t=>S.quests.filter(q=>(t==='all'||q.type===t)&&status(q)==='on').length;
 $('#types').innerHTML=[['all','Semua'],...Object.entries(TYPES)].map(([k,l])=>`<button role="tab" data-type="${k}" class="${ui.type===k?'on':''}">${l}<b>${n(k)}</b></button>`).join('')}
function renderList(){const L=visible();
 $('#list').innerHTML=L.length?L.map(card).join(''):`<div class="empty">${S.quests.length?'Tidak ada quest dengan status yang dipilih.<br>Centang status lain di atas untuk melihat quest lainnya.':'Belum ada quest.<br>Tekan + untuk membuat quest pertamamu.'}</div>`}
/* ---------- rank (gaya Mobile Legends), profil, statistik, log ---------- */
const RK=['Warrior','Elite','Master','Grandmaster','Epic','Legend','Mythic'],RH=[[28,38],[210,14],[45,72],[205,72],[268,55],[22,82],[345,76]],DAYL=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const XPL=n=>5*(n-1)*(n-1)+95*(n-1);                                   // total XP untuk mencapai level n (tiap level butuh 10 XP lebih banyak: 100, 110, 120, ...)
const lvOf=xp=>{let m=Math.max(0,Math.floor((-95+Math.sqrt(9025+20*xp))/10));while(XPL(m+2)<=xp)m++;while(m>0&&XPL(m+1)>xp)m--;
 const lv=m+1,lo=XPL(lv),hi=XPL(lv+1);return{xp,lv,lo,hi,pct:Math.round((xp-lo)/(hi-lo)*100)}};
function roman(n){let s='';for(const[v,r]of[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){s+=r;n-=v}return s}
const rk=i=>{const t=Math.min(6,Math.floor(i/10)),s=t===6?i-59:i%10+1;return{t,s,name:RK[t]+' '+roman(s)}};
const rankOf=lv=>{const i=Math.floor((lv-1)/5);return{...rk(i),next:rk(i+1).name,pos:(lv-1)%5+1}};   // 5 level = 1 tingkat rank; Mythic tanpa batas
const rankName=()=>rankOf(lvOf(S.log.reduce((s,l)=>s+l.xp,0)).lv).name;
const keyDate=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const fmtL=d=>d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const todayCount=()=>S.log.filter(l=>l.res!=='fail'&&dkey(l.at)===dkey(Date.now())).length;
function renderGoal(){const el=$('#goal');if(!el)return;const g=S.profile.goal,n=todayCount();
 el.innerHTML=`<span>Target hari ini <b>${n} dari ${g}</b>${n>=g?', tercapai':''}</span><div class="pbar"><i style="width:${Math.min(100,Math.round(n/g*100))}%"></i></div>`}
function analyze(){                                       // semua angka profil dihitung dari log
 const okL=S.log.filter(l=>l.res!=='fail'),fl=S.log.filter(l=>l.res==='fail'),rest=new Set(S.profile.rest),byDay={};
 const a={...lvOf(S.log.reduce((s,l)=>s+l.xp,0)),total:okL.length,fail:fl.length,byDay,tier:Array(10).fill(0),wd:Array(7).fill(0),hr:Array(24).fill(0),perfect:0,top:{},bad:{}};
 fl.forEach(l=>{a.bad[l.name]=(a.bad[l.name]||0)+1});
 okL.forEach(l=>{const d=new Date(l.at),x=byDay[dkey(l.at)]=byDay[dkey(l.at)]||{n:0,xp:0};x.n++;x.xp+=l.xp;
  a.tier[l.tier-1]++;a.wd[d.getDay()]++;a.hr[d.getHours()]++;if(l.pct>=100)a.perfect++;a.top[l.name]=(a.top[l.name]||0)+1});
 a.avg=okL.length?Math.round(okL.reduce((s,l)=>s+l.pct,0)/okL.length):0;
 const t=new Date();t.setHours(0,0,0,0);a.today=(byDay[dkey(t)]||{n:0}).n;
 const d=new Date(t);if(!byDay[dkey(d)])d.setDate(d.getDate()-1);a.cur=0;                      // streak: hari libur tidak memutus
 for(let i=0;i<4000;i++){if(byDay[dkey(d)])a.cur++;else if(!rest.has(d.getDay()))break;d.setDate(d.getDate()-1)}
 a.best=0;if(okL.length){let run=0;const s=new Date(okL.reduce((m,l)=>Math.min(m,l.at),Infinity));s.setHours(0,0,0,0);
  for(let i=0;i<5000&&s<=t;i++){if(byDay[dkey(s)]){run++;a.best=Math.max(a.best,run)}else if(!rest.has(s.getDay()))run=0;s.setDate(s.getDate()+1)}}
 return a}
const bars=(vals,lab,o={})=>{const mx=Math.max(1,...vals);
 return `<div class="bars">${vals.map((v,i)=>`<div class="bc${o.now===i?' now':''}${o.col?' hot':''}"${o.col?` style="--t:${o.col(i)}"`:''}><span class="bv">${o.nv?'':(v||'')}</span><div class="bb"><i style="height:${Math.round(v/mx*100)}%"></i></div><span class="bl">${lab[i]}</span></div>`).join('')}</div>`};
function profH(a){const C=2*Math.PI*34,r=rankOf(a.lv),h=RH[r.t];
 return `<div class="pcard" style="--rh:${h[0]};--rs:${h[1]}%"><div class="rwrap"><svg class="ring" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" class="rb"/><circle cx="40" cy="40" r="34" class="rf" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-a.pct/100)).toFixed(1)}"/></svg><b class="rl">${a.lv}</b></div>
<div class="pi"><b>${esc(S.profile.name)}</b><span class="rk">${r.name}</span><div class="pips" aria-hidden="true">${[1,2,3,4,5].map(i=>`<i${i<=r.pos?' class="on"':''}></i>`).join('')}</div>
<small>${a.xp} dari ${a.hi} XP ke level berikutnya</small><small>${6-r.pos} level lagi ke ${r.next}</small><button data-act="prof">Atur profil</button></div></div>`}
function sumH(a){const g=S.profile.goal,n=ui.rng,days=[...Array(n)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(n-1-i));return d}),
 xpOf=d=>(a.byDay[dkey(d)]||{xp:0}).xp,vals=days.map(xpOf),sum7=days.slice(-7).reduce((s,d)=>s+xpOf(d),0),rate=a.total+a.fail?Math.round(a.total/(a.total+a.fail)*100):0,
 lab=days.map((d,i)=>n===7?DN[d.getDay()]:(i%5===0||i===n-1?d.getDate():''));
 return `<div class="stats"><div class="stat wide"><b>${a.today} dari ${g}</b><span>Target quest hari ini${a.today>=g?' tercapai':''}</span><div class="bar"><i style="width:${Math.min(100,Math.round(a.today/g*100))}%"></i></div></div>
<div class="stat"><b>${a.cur} hari</b><span>Streak sekarang</span><small>Terbaik ${a.best} hari</small></div>
<div class="stat"><b>${a.total}</b><span>Quest selesai</span><small>${a.perfect} sempurna (100%)</small></div>
<div class="stat"><b>${a.fail}</b><span>Quest gagal</span><small>Selesai dibanding gagal ${rate}%</small></div>
<div class="stat"><b>${a.avg}%</b><span>Rata-rata persentase selesai</span></div>
<div class="stat"><b>${sum7}</b><span>XP 7 hari terakhir</span></div>
<div class="stat"><b>${S.quests.filter(q=>status(q)==='on').length}</b><span>Quest berlangsung</span></div></div>
<h4 class="sec">XP per hari</h4><div class="seg"><button data-rng="7" class="${n===7?'on':''}">7 hari</button><button data-rng="30" class="${n===30?'on':''}">30 hari</button></div>
${bars(vals,lab,{now:n-1,nv:n>7})}`}
function heatH(a){const t=new Date();t.setHours(0,0,0,0);const s=new Date(t);s.setDate(s.getDate()-(t.getDay()+6)%7-17*7);
 const mx=Object.values(a.byDay).reduce((m,x)=>Math.max(m,x.xp),1);let mon='',cells='',pm=-1;
 for(let w=0;w<18;w++){const m=new Date(s);m.setDate(m.getDate()+w*7);mon+=`<i>${m.getMonth()!==pm?m.toLocaleDateString('id-ID',{month:'short'}):''}</i>`;pm=m.getMonth();
  for(let d=0;d<7;d++){const x=new Date(s);x.setDate(x.getDate()+w*7+d);if(x>t){cells+='<i class="hc hid"></i>';continue}
   const k=dkey(x),v=a.byDay[k],l=v?Math.min(4,Math.ceil(v.xp/mx*4)):0;
   cells+=`<button class="hc l${l}${x.getTime()===t.getTime()?' td':''}" data-day="${k}" aria-label="${fmtL(x)}: ${v?v.n+' quest selesai, '+v.xp+' XP':'tidak ada aktivitas'}"></button>`}}
 return `<div class="heat"><div class="hm">${mon}</div><div class="hg">${cells}</div></div><p class="hd" id="hd">Ketuk satu kotak untuk melihat detail hari itu.</p>
<div class="leg"><span>Sedikit</span><i class="hc l0"></i><i class="hc l1"></i><i class="hc l2"></i><i class="hc l3"></i><i class="hc l4"></i><span>Banyak</span></div>`}
function insH(a){if(a.total<3)return'<p class="hint">Selesaikan minimal 3 quest untuk melihat pola produktivitasmu.</p>';
 const mi=r=>r.indexOf(Math.max(...r)),topOf=o=>Object.entries(o).sort((x,y)=>y[1]-x[1])[0],wd=mi(a.wd),hr=mi(a.hr),tq=topOf(a.top),bq=a.fail?topOf(a.bad):null;
 return `<ul class="ins"><li>Hari paling produktif: <b>${DAYL[wd]}</b>, ${a.wd[wd]} quest selesai.</li><li>Jam paling aktif: <b>${hr}.00 sampai ${hr}.59</b>, ${a.hr[hr]} quest selesai.</li>
<li>Quest paling sering selesai: <b>${esc(tq[0])}</b>, ${tq[1]} kali.</li>${bq?`<li>Quest paling sering gagal: <b>${esc(bq[0])}</b>, ${bq[1]} kali.</li>`:''}</ul>`}
function statH(a){const ord=[1,2,3,4,5,6,0];
 return `<h4 class="sec">Aktivitas 18 minggu</h4>${heatH(a)}<h4 class="sec">Selesai per hari dalam seminggu</h4>${bars(ord.map(d=>a.wd[d]),ord.map(d=>DN[d]))}
<h4 class="sec">Selesai per tier</h4>${bars(a.tier,R,{col:i=>hue(i+1)})}<h4 class="sec">Pola produktivitas</h4>${insH(a)}`}
function logH(){const f=ui.lf,L=S.log.filter(l=>f==='all'||(f==='fail')===(l.res==='fail')).sort((x,y)=>y.at-x.at).slice(0,300);
 let h='',g=null;const flush=()=>{if(g)h+=`<div class="day">${fmtL(new Date(g.t))}<span>${g.n} selesai${g.f?', '+g.f+' gagal':''}, +${g.xp} XP</span></div>${g.h}`};
 L.forEach(l=>{const k=dkey(l.at);if(!g||g.k!==k){flush();g={k,t:l.at,n:0,f:0,xp:0,h:''}}
  if(l.res==='fail')g.f++;else{g.n++;g.xp+=l.xp}
  g.h+=`<div class="le" style="--t:${hue(l.tier)}"><span class="tier">${R[l.tier-1]}</span><div>${esc(l.name)}<br><small>${TYPES[l.type]}, ${fmtT(l.at)}${l.res==='fail'?', gagal':l.pct<100?', selesai '+l.pct+'%':''}</small></div>${l.res==='fail'?'<em class="bad">Gagal</em>':`<em>+${l.xp}</em>`}</div>`});flush();
 return `<div class="seg">${[['all','Semua'],['done','Selesai'],['fail','Gagal']].map(([k,l])=>`<button data-lf="${k}" class="${f===k?'on':''}">${l}</button>`).join('')}</div>`+(h||'<div class="empty">Belum ada catatan.<br>Selesaikan quest pertamamu.</div>')}
function renderProf(force){const sig=[S.log.length,(S.log.at(-1)||{}).id,S.profile.name,S.profile.goal,S.profile.rest.join(),dkey(Date.now()),ui.pt,ui.rng,ui.lf,S.quests.filter(q=>status(q)==='on').length].join('|');
 if(!force&&sig===ui.sig)return;ui.sig=sig;const a=analyze();ui.a=a;$('#prof').innerHTML=profH(a);
 $('#ptabs').innerHTML=[['sum','Ringkasan'],['stat','Statistik'],['log','Log']].map(([k,l])=>`<button role="tab" data-pt="${k}" class="${ui.pt===k?'on':''}">${l}</button>`).join('');
 $('#pbody').innerHTML={sum:sumH,stat:statH,log:logH}[ui.pt](a)}
const PF=$('#pf');
function openProf(){PF.pn.value=S.profile.name;PF.pg.value=S.profile.goal;
 document.querySelectorAll('#prest input').forEach(c=>c.checked=S.profile.rest.includes(+c.value));$('#pd').showModal();PF.pn.focus()}
if(PF)PF.addEventListener('submit',e=>{e.preventDefault();
 S.profile=cleanP({name:PF.pn.value,goal:PF.pg.value,rest:[...document.querySelectorAll('#prest input:checked')].map(c=>+c.value)});save();$('#pd').close();render()});

/* ---------- note: baca, edit, properti, jadwal tampil berulang, tag, sort, filter ---------- */
const nullLast=(f,dir)=>(a,b)=>{const x=f(a),y=f(b);if(x==null&&y==null)return 0;if(x==null)return 1;if(y==null)return -1;return dir*(x-y)};
const nn=n=>noteName(n).toLowerCase(),nK=n=>{const s=nst(n);return s==='show'?Date.now():s==='wait'?(k=>k===Infinity?null:k)(nextShow(n)):null};
const NSORT={eD:(a,b)=>b.edited-a.edited,cD:(a,b)=>b.created-a.created,cA:(a,b)=>a.created-b.created,tA:(a,b)=>nn(a).localeCompare(nn(b),'id'),tD:(a,b)=>nn(b).localeCompare(nn(a),'id'),
 nA:nullLast(nK,1),nD:nullLast(nK,-1),uA:nullLast(n=>n.until,1),uD:nullLast(n=>n.until,-1)};
const tagStats=()=>{const c={};S.notes.forEach(n=>n.tags.forEach(t=>{const k=t.toLowerCase();(c[k]=c[k]||{t,k,n:0}).n++}));return Object.values(c).sort((a,b)=>b.n-a.n||a.t.localeCompare(b.t,'id'))};
function visibleN(){const q=$('#nq').value.trim().toLowerCase(),want=new Set([...document.querySelectorAll('#nst input:checked')].map(c=>c.value)),cmp=NSORT[$('#nsort').value]||NSORT.eD,tg=ui.nt;
 return S.notes.filter(n=>want.has(nst(n))&&(!tg||n.tags.some(t=>t.toLowerCase()===tg))&&(!q||(n.title+' '+n.body+' '+n.tags.join(' ')).toLowerCase().includes(q)))
  .sort((a,b)=>b.pin-a.pin||cmp(a,b)||b.edited-a.edited)}
const repLabel=n=>{const r=n.rep,o=[1,2,3,4,5,6,0],p=v=>v.replace(':','.');
 const w=r.k==='d'?'Setiap hari':r.k==='w'?(r.days.length===7?'Setiap hari':'Setiap '+o.filter(d=>r.days.includes(d)).map(d=>DN[d]).join(', ')):'Tanggal '+[...r.dom.filter(d=>d),...(r.dom.includes(0)?['akhir']:[])].join(', ')+' tiap bulan';
 return w+(r.t1&&r.t2?' pukul '+p(r.t1)+' sampai '+p(r.t2):r.t1?' mulai '+p(r.t1):r.t2?' sampai '+p(r.t2):'')};
function nTime(n,s){const t=Date.now();let h=n.rep?`<span class="chip">${repLabel(n)}</span>`:'';
 if(s==='show'){const e=curEnd(n);if(e<Infinity)h+=`<span class="chip ${e-t<36e5?'warn':''}">Tampil ${left(e-t)} lagi</span>`}
 else if(s==='wait'){const x=nextShow(n);h+=x<Infinity?`<span class="chip">Tampil ${n.rep?'lagi ':'mulai '}${fmtS(x)}</span>`:'<span class="chip bad">Tidak tampil lagi</span>'}
 else if(s==='end')h+=`<span class="chip bad">Berakhir ${fmtDT(n.until)}</span>`;
 else if(s==='arch')h+='<span class="chip">Arsip</span>';
 return h}
function nCard(n){const s=nst(n),pv=plain(n.title?n.body:n.body.split('\n').slice(1).join('\n')).trim();
 return `<article class="ncard${s==='show'?'':' '+s}${n.rep?' rep':''}" data-nid="${n.id}" data-act="nopen"><h3>${n.pin?'<span class="pin" aria-label="Disematkan">★</span> ':''}${esc(noteName(n))}</h3>${pv?`<p>${esc(pv)}</p>`:''}
<div class="chips">${n.tags.map(t=>`<span class="chip tg">#${esc(t)}</span>`).join('')}${nTime(n,s)}</div></article>`}
function renderNotes(){const ts=tagStats();if(ui.nt&&!ts.some(x=>x.k===ui.nt))ui.nt='';
 $('#ntags').innerHTML=`<button data-nt="" class="${ui.nt?'':'on'}">Semua</button>`+ts.map(x=>`<button data-nt="${esc(x.k)}" class="${ui.nt===x.k?'on':''}">#${esc(x.t)}<b>${x.n}</b></button>`).join('');
 const L=visibleN();$('#nlist').innerHTML=L.length?L.map(nCard).join(''):`<div class="empty">${S.notes.length?'Tidak ada note dengan filter ini.<br>Note berjadwal yang belum waktunya ada di status "Belum tampil".':'Belum ada note.<br>Tekan + untuk membuat note pertamamu.'}</div>`}
function renderStrip(){const el=$('#nstrip');if(!el)return;                       // note berjadwal yang sedang tampil, ditampilkan di tab Quests
 const L=S.notes.filter(n=>(n.rep||n.from!=null||n.until!=null)&&nst(n)==='show').sort((a,b)=>curEnd(a)-curEnd(b)||0).slice(0,3);
 el.innerHTML=L.length?`<div class="nsh">Note aktif<button data-nav="notes">Semua note</button></div>`+L.map(n=>{const e=curEnd(n);return `<div class="ns" data-nid="${n.id}" data-act="nopen"><b>${esc(noteName(n))}</b><span>${e<Infinity?'Tampil sampai '+fmtS(e):'Sedang tampil'}</span></div>`}).join(''):''}

/* pembaca / editor note */
const RD=$('#rd'),NF=$('#nf');
const curNote=()=>S.notes.find(x=>x.id===ui.ne);
const wc=s=>s.trim()?s.trim().split(/\s+/).length:0;
function md(src){const out=[];let list=null;                                            // format sederhana: # judul, - daftar, - [ ] centang, 1. daftar, > kutipan, **tebal**, *miring*, `kode`, tautan
 const inl=t=>t.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g,'$1<i>$2</i>')
  .replace(/(https?:\/\/[^\s<]+?)([.,;:!?)]*)(?=\s|$)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>$2');
 const flush=()=>{if(list){out.push(`<${list.t}>${list.i.join('')}</${list.t}>`);list=null}};
 const add=(t,h)=>{if(!list||list.t!==t){flush();list={t,i:[]}}list.i.push(h)};
 for(const l of esc(src).split('\n')){let m;
  if(m=l.match(/^\s*[-*] \[([ xX])\] (.*)$/))add('ul',`<li class="ck">${m[1]===' '?'☐':'☑'} ${inl(m[2])}</li>`);
  else if(m=l.match(/^\s*[-*] (.*)$/))add('ul',`<li>${inl(m[1])}</li>`);
  else if(m=l.match(/^\s*\d+[.)] (.*)$/))add('ol',`<li>${inl(m[1])}</li>`);
  else{flush();if(m=l.match(/^(#{1,3}) (.*)$/))out.push(`<h${m[1].length+2} class="mh">${inl(m[2])}</h${m[1].length+2}>`);
   else if(m=l.match(/^&#62; (.*)$/))out.push(`<blockquote>${inl(m[1])}</blockquote>`);
   else if(/^-{3,}$/.test(l.trim()))out.push('<hr>');
   else if(l.trim())out.push(`<p>${inl(l)}</p>`)}}
 flush();return out.join('')}
const tagsH=n=>n.tags.length?`<div class="rtags">${n.tags.map(t=>`<span class="chip tg">#${esc(t)}</span>`).join('')}</div>`:'';
const metaH=(n,s)=>`<div class="chips rm">${n.pin?'<span class="chip">Disematkan</span>':''}${nTime(n,s)}</div>`;
const readH=(n,s)=>`${n.title?`<h2 class="rt">${esc(n.title)}</h2>`:''}${tagsH(n)}${metaH(n,s)}
<div class="md">${n.body.trim()?md(n.body):'<p class="hint">Note ini belum punya isi. Tekan Edit untuk mulai menulis.</p>'}</div>
<div class="rfoot"><span>Diedit ${fmtDT(n.edited)}</span><button data-act="ncopy">Salin isi</button></div>`;
const editH=(n,s)=>`<input class="rti" id="rti" placeholder="Judul" maxlength="120" value="${esc(n.title)}" aria-label="Judul">${tagsH(n)}${metaH(n,s)}
<textarea class="rta" id="rta" placeholder="Tulis isi note…" maxlength="5000" aria-label="Isi note">${esc(n.body)}</textarea>
<div class="rfoot"><span id="rwc"></span><span>Tersimpan otomatis. Tag dan jadwal diatur lewat Properti.</span></div>`;
function drawNote(){const n=curNote();if(!n)return;
 document.querySelectorAll('#rmode button').forEach(b=>b.classList.toggle('on',b.dataset.md===ui.rm));
 $('#rbody').innerHTML=ui.rm==='read'?readH(n,nst(n)):editH(n,nst(n));if(ui.rm==='edit')$('#rwc').textContent=wc(n.body)+' kata'}
function openNote(id){let n=id&&S.notes.find(x=>x.id===id),mode='read';
 if(!n){const t=Date.now();n={id:uid(),title:'',body:'',tags:[],pin:false,arch:false,from:null,until:null,rep:null,created:t,edited:t};S.notes.push(n);mode='edit'}
 ui.ne=n.id;ui.rm=mode;drawNote();RD.showModal();if(mode==='edit')$('#rti').focus()}
function setMode(m){if(ui.rm===m||!curNote())return;ui.rm=m;save();drawNote();$('#rbody').scrollTop=0;if(m==='edit')$('#rta').focus()}
async function copyNote(b){const n=curNote();if(!n)return;
 try{await navigator.clipboard.writeText((n.title?n.title+'\n\n':'')+n.body);b.textContent='Tersalin'}catch(e){b.textContent='Gagal menyalin'}setTimeout(()=>{b.textContent='Salin isi'},1600)}
let tn;RD.addEventListener('input',e=>{const n=curNote(),t=e.target;if(!n)return;
 if(t.id==='rti')n.title=t.value;else if(t.id==='rta'){n.body=t.value;$('#rwc').textContent=wc(t.value)+' kata'}else return;
 n.edited=Date.now();clearTimeout(tn);tn=setTimeout(save,300)});
RD.addEventListener('close',()=>{const n=curNote();if(n&&!n.title.trim()&&!n.body.trim())S.notes=S.notes.filter(x=>x!==n);ui.ne=null;save();render()});
/* properti note: tag, jadwal tampil, rentang waktu, sematkan, arsip */
const ntSug=()=>{const cur=parseTags(NF.ng.value).map(t=>t.toLowerCase());
 $('#nsug').innerHTML=tagStats().filter(x=>!cur.includes(x.k)).slice(0,10).map(x=>`<button type="button" data-tag="${esc(x.t)}">#${esc(x.t)}</button>`).join('')};
function syncP(){const k=NF.rp.value;$('#wdw').hidden=k!=='w';$('#mdw').hidden=k!=='m';$('#twb').hidden=!k}
function openProps(){const n=curNote();if(!n)return;const r=n.rep;
 NF.ng.value=n.tags.join(', ');NF.rp.value=r?r.k:'';NF.t1.value=r&&r.t1||'';NF.t2.value=r&&r.t2||'';
 document.querySelectorAll('#wdc input').forEach(c=>c.checked=!!(r&&r.k==='w'&&r.days.includes(+c.value)));
 document.querySelectorAll('#mdc input').forEach(c=>c.checked=!!(r&&r.k==='m'&&r.dom.includes(+c.value)));
 NF.nf.value=n.from!=null?loc(n.from):'';NF.nu.value=n.until!=null?loc(n.until):'';NF.np.checked=n.pin;NF.na.checked=n.arch;syncP();ntSug();$('#nd').showModal()}
$('#mdc').innerHTML=[...Array(31)].map((_,i)=>`<label><input type="checkbox" value="${i+1}"><span>${i+1}</span></label>`).join('')+'<label class="lastd"><input type="checkbox" value="0"><span>Akhir</span></label>';
if(NF){
 NF.addEventListener('click',e=>{const b=e.target.closest('[data-tag],[data-nw],[data-wd],[data-tw]');if(!b)return;const d=b.dataset;
  if(d.tag){NF.ng.value=parseTags(NF.ng.value+','+d.tag).join(', ');ntSug();return}
  if(d.wd!==undefined){document.querySelectorAll('#wdc input').forEach(c=>c.checked=d.wd.includes(c.value));return}
  if(d.tw){if(d.tw==='clear')NF.t1.value=NF.t2.value='';else{const[a,z]=d.tw.split('-');NF.t1.value=a;NF.t2.value=z}return}
  const n=new Date(),k=d.nw;let f=null,u=null;
  if(k==='today'){const x=new Date(n);x.setHours(23,59,0,0);f=n.getTime();u=x.getTime()}
  else if(k==='tomorrow'){const s=new Date(n);s.setDate(s.getDate()+1);s.setHours(0,0,0,0);const x=new Date(s);x.setHours(23,59,0,0);f=s.getTime();u=x.getTime()}
  else if(k==='week'){f=n.getTime();u=n.getTime()+7*DAY}
  NF.nf.value=f?loc(f):'';NF.nu.value=u?loc(u):''});
 NF.addEventListener('input',e=>{if(e.target===NF.ng)ntSug()});
 NF.addEventListener('change',e=>{if(e.target===NF.rp)syncP()});
 NF.addEventListener('submit',e=>{e.preventDefault();const n=curNote();if(!n)return;const k=NF.rp.value;
  const days=[...document.querySelectorAll('#wdc input:checked')].map(c=>+c.value),dom=[...document.querySelectorAll('#mdc input:checked')].map(c=>+c.value);
  if(k==='w'&&!days.length){alert('Pilih minimal satu hari dalam seminggu.');return}
  if(k==='m'&&!dom.length){alert('Pilih minimal satu tanggal dalam sebulan.');return}
  let t1=NF.t1.value||null,t2=NF.t2.value||null;if(t1&&t1===t2)t1=t2=null;
  const from=NF.nf.value?new Date(NF.nf.value).getTime():null,until=NF.nu.value?new Date(NF.nu.value).getTime():null;
  if(from!=null&&until!=null&&until<=from){alert('Waktu tampil sampai harus setelah waktu tampil mulai.');return}
  Object.assign(n,{tags:parseTags(NF.ng.value),rep:k?{k,days:k==='w'?days:[],dom:k==='m'?dom:[],t1,t2}:null,from,until,pin:NF.np.checked,arch:NF.na.checked,edited:Date.now()});
  save();$('#nd').close();drawNote();render()})}

function render(){refresh();const w=new Set(S.quests.filter(q=>status(q)==='wait').map(q=>q.id)),nw=new Set(S.notes.filter(n=>nst(n)==='wait').map(n=>n.id)),msg=[],
 up=S.quests.filter(q=>ui.w&&ui.w.has(q.id)&&!w.has(q.id)&&status(q)==='on'),un=S.notes.filter(n=>ui.nw&&ui.nw.has(n.id)&&!nw.has(n.id)&&nst(n)==='show');ui.w=w;ui.nw=nw;
 if(up.length)msg.push('Quest dimulai: '+up.map(q=>q.name).join(', '));if(un.length)msg.push('Note tampil: '+un.map(noteName).join(', '));if(msg.length)toast(msg.join('. '));
 renderTypes();renderList();renderGoal();renderStrip();$('#lvl').textContent=rankName();if(ui.tab==='notes')renderNotes();if(ui.tab==='log')renderProf()}
function show(t){['quests','notes','log','data'].forEach(k=>$('#v-'+k).hidden=k!==t);
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.nav===t));
 const f=$('#fab');f.hidden=t!=='quests'&&t!=='notes';f.dataset.act=t==='notes'?'nadd':'add';f.setAttribute('aria-label',t==='notes'?'Tambah note':'Tambah quest');
 ui.tab=t;if(t==='log')renderProf(true);if(t==='notes')renderNotes();if(t==='data')renderBk();scrollTo(0,0)}
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2600)}

/* ---------- aksi quest ---------- */
function finish(id,fail){const q=get(id);if(!q||status(q)!=='on')return;const p=fail?0:eff(q);
 if(!fail&&p<=0){toast('Persentase 0%: naikkan persentasenya atau tandai Gagal');return}
 const e={id:uid(),qid:q.id,name:q.name,tier:q.tier,type:q.type,xp:fail?0:pts(q),at:Date.now(),res:fail?'fail':'done',pct:p};
 const r0=rankName();S.log.push(e);q.doneAt=e.at;q.doneLog=e.id;q.res=fail?'fail':null;if(!fail)q.pct=p;save();render();
 toast((fail?`Gagal: ${q.name}`:`Selesai${p<100?' '+p+'%':''}: ${q.name} (+${e.xp} XP)`)+(!fail&&rankName()!==r0?` Naik rank: ${rankName()}!`:''))}
function undo(id){const q=get(id);if(!q)return;S.log=S.log.filter(l=>l.id!==q.doneLog);q.doneAt=q.doneLog=q.res=null;save();render()}
const noteH=n=>`<div class="note" data-nid="${n.id}"><textarea rows="2" placeholder="Tulis catatan…" aria-label="Note">${esc(n.text)}</textarea><button data-act="delnote" aria-label="Hapus note">✕</button><small>Diedit ${fmtDT(n.ts)}</small></div>`;
const ciH=(i,off)=>`<div class="ci" data-cid="${i.id}"><input type="checkbox" ${i.d?'checked':''} ${off?'disabled':''} aria-label="Item selesai"><input class="ct" value="${esc(i.t)}" placeholder="Tulis item…" ${off?'disabled':''} aria-label="Item checklist">${off?'':'<button data-act="delci" aria-label="Hapus item">✕</button>'}</div>`;
function progH(q,s){const on=s==='on',cl=`<h4>Checklist</h4><div id="cls">${q.cl.map(i=>ciH(i,!on)).join('')}</div>${on?'<button class="ghost" data-act="addci">+ Tambah item</button>':''}`;
 if(s==='wait'||s==='end')return q.cl.length?cl:'';
 return `<h4>Progres</h4><div class="prog"><div class="ph"><b id="pv"></b><span id="px"></span></div>
<input type="range" id="pr" min="0" max="100" step="1" ${on?'':'disabled'} aria-label="Persentase selesai">
${on?'<div class="presets"><button data-pct="25">25%</button><button data-pct="50">50%</button><button data-pct="75">75%</button><button data-pct="100">100%</button></div>':''}</div>${on||q.cl.length?cl:''}`}
function syncProg(){const q=get(ui.d),pv=$('#pv');if(!q||!pv)return;const p=eff(q);
 pv.textContent=p+'%';$('#px').textContent=status(q)==='fail'?'Gagal, tanpa poin':'Poin: +'+pts(q)+' dari '+q.tier*10;$('#pr').value=p;
 const ob=$('#okb');if(ob)ob.disabled=p<=0}
function openDetail(id){const q=get(id);if(!q)return;ui.d=id;const s=status(q),e=endAt(q);
 const btn={on:'<button class="fb" data-act="fail">Gagal</button><button class="pri" id="okb" data-act="done">Selesai</button>',
  done:'<button class="pri" data-act="undo">Batalkan selesai</button>',fail:'<button class="pri" data-act="undo">Batalkan gagal</button>',
  wait:'<button class="pri" disabled>Belum dimulai</button>',end:'<button class="pri" disabled>Sudah berakhir</button>'}[s];
 $('#dd').innerHTML=`<div class="dh" style="--t:${hue(q.tier)}"><span class="tier" style="cursor:default">${R[q.tier-1]}</span><h2>${esc(q.name)}</h2><button class="ic" data-close aria-label="Tutup">✕</button></div>
<p class="desc">${q.desc?esc(q.desc):'<i>Tanpa deskripsi</i>'}</p>
<div class="chips">${chips(q)}</div>
<p class="meta">Quest Dimulai: ${fmtDT(q.cs)}<br>Quest Berakhir: ${e===Infinity?'tanpa batas waktu':fmtDT(e)}</p>
${progH(q,s)}
<h4>Catatan</h4><div id="notes">${q.notes.map(noteH).join('')}</div><button class="ghost" data-act="addnote">+ Tambah note</button>
<menu><button class="danger" data-act="del">Hapus</button><button data-act="edit">Edit</button><span class="sp"></span>${btn}</menu>`;
 $('#dd').showModal();syncProg()}
const closeD=()=>{const d=$('#dd');if(d.open)d.close()};
let tm;$('#dd').addEventListener('input',e=>{const q=get(ui.d),t=e.target;if(!q)return;
 if(t.id==='pr'){q.pct=+t.value;syncProg()}
 else if(t.classList.contains('ct')){const i=q.cl.find(i=>i.id===t.closest('.ci').dataset.cid);if(i){i.t=t.value;syncProg()}}
 else{const el=t.closest('.note'),n=el&&q.notes.find(n=>n.id===el.dataset.nid);if(!n)return;n.text=t.value;n.ts=Date.now();el.querySelector('small').textContent='Diedit '+fmtDT(n.ts)}
 clearTimeout(tm);tm=setTimeout(save,300)});
$('#dd').addEventListener('change',e=>{const t=e.target;if(t.type!=='checkbox')return;const q=get(ui.d),i=q&&q.cl.find(i=>i.id===t.closest('.ci').dataset.cid);
 if(!i)return;i.d=t.checked;q.pct=null;syncProg();save()});
$('#dd').addEventListener('close',()=>{const q=get(ui.d);if(q)q.cl=q.cl.filter(i=>i.t.trim());save();render()});

/* ---------- form tambah / edit ---------- */
const F=$('#qf');
F.tr.innerHTML=R.map((r,i)=>`<option value="${i+1}">${r}${i===0?' (prioritas rendah)':i===9?' (prioritas tinggi)':''}</option>`).join('');
F.ty.innerHTML=TK.map(k=>`<option value="${k}">${TYPES[k]}</option>`).join('');
$('#tf').innerHTML='<option value="">Semua tier</option>'+R.map((r,i)=>`<option value="${i+1}">Tier ${r}</option>`).join('');
F.addEventListener('click',e=>{const b=e.target.closest('[data-days]');if(!b)return;
 document.querySelectorAll('#dchips input').forEach(c=>c.checked=b.dataset.days.includes(c.value));sync()});
function sync(){const on=!!document.querySelector('#dchips input:checked'),k=F.dk.value;
 $('#evl').hidden=F.ty.value!=='custom'||on;$('#afl').hidden=k!=='after';$('#dtl').hidden=k!=='custom';F.dt.required=k==='custom';
 $('#dkh').textContent=k==='after'?'Dihitung sejak quest dimulai dan berlaku di setiap pengulangan. Tanpa hari di Quest Dimulai, quest dimulai sesuai type (Daily tiap hari 00.00, Weekly tiap Senin 00.00, Monthly tiap tanggal 1).'
  :k==='custom'?'Quest berakhir pada tanggal ini. Quest yang berulang tidak dimulai lagi setelahnya.':'Quest tetap ada sampai kamu menyelesaikannya.'}
function openForm(q){ui.edit=q?q.id:null;$('#qt').textContent=q?'Edit quest':'Quest baru';
 F.nm.value=q?q.name:'';F.ds.value=q?q.desc:'';F.ck.value=q?q.cl.map(i=>i.t).join('\n'):'';F.tr.value=q?q.tier:5;F.ty.value=q?q.type:(ui.type==='all'?'daily':ui.type);F.ev.value=q?q.every:0;
 F.dk.value=q?q.dl.k:'none';F.dn.value=q?q.dl.n:1;F.du.value=q?q.dl.u:'d';F.dt.value=q&&q.dl.k==='custom'?loc(q.dl.at):'';
 F.tm.value=q&&q.sch?q.sch.time:'08:00';F.st.value=q&&q.start?loc(q.start):'';
 document.querySelectorAll('#dchips input').forEach(c=>c.checked=!!(q&&q.sch&&q.sch.days.includes(+c.value)));
 sync();$('#qd').showModal();F.nm.focus()}
F.addEventListener('change',sync);
F.addEventListener('submit',e=>{e.preventDefault();const name=F.nm.value.trim();if(!name)return;
 const old=ui.edit&&get(ui.edit),n=Date.now(),k=F.dk.value,
  days=[...document.querySelectorAll('#dchips input:checked')].map(c=>+c.value),
  sch=days.length?{days,time:F.tm.value||'08:00',at:old&&old.sch?old.sch.at:n}:null,
  start=F.st.value?new Date(F.st.value).getTime():null,
  dl={k,at:k==='custom'?new Date(F.dt.value).getTime():null,n:num(F.dn.value,1,9999,1),u:F.du.value};
 const pool=old?[...old.cl]:[],cl=F.ck.value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,100).map(t=>{const k=pool.findIndex(i=>i.t===t);return k>=0?pool.splice(k,1)[0]:{id:uid(),t:t.slice(0,200),d:false}});
 const data={name,cl,desc:F.ds.value.trim(),tier:+F.tr.value,type:F.ty.value,every:F.ty.value==='custom'?num(F.ev.value,0,3650,0):0,dl,sch,start};
 if(old){const od=old.dl,chg=od.k!==dl.k||od.n!==dl.n||od.u!==dl.u||od.at!==dl.at;Object.assign(old,data);
  if(old.cs>n||(start&&start>n))old.cs=firstStart(old,n);                  // belum dimulai / awal ditunda: hitung ulang awal quest
  else if(chg&&k==='after'&&endAt(old)<=n)old.cs=n}                         // hitung mundur baru yang sudah lewat: mulai dihitung dari sekarang
 else{const q={id:uid(),notes:[],created:n,doneAt:null,doneLog:null,res:null,pct:null,...data};q.cs=firstStart(q,n);S.quests.push(q)}
 save();$('#qd').close();render()});

/* ---------- export / import ---------- */
function dlFile(name,obj){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));
 a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2e3)}
const stamp=()=>new Date().toISOString().slice(0,10),meta=k=>({app:'quests',kind:k,v:2,exported:new Date().toISOString()});
const exportQ=()=>{dlFile(`quests-${stamp()}.json`,{...meta('quests'),data:S.quests.map(({doneAt,doneLog,cs,res,pct,...q})=>({...q,cl:q.cl.map(({id,t})=>({id,t}))}))});toast('Quests berhasil di-export')};
const exportP=()=>{dlFile(`progres-${stamp()}.json`,{...meta('progress'),log:S.log,profile:S.profile,done:Object.fromEntries(S.quests.filter(q=>q.doneAt).map(q=>[q.id,[q.doneAt,q.doneLog,q.res,q.pct]]))});toast('Progres berhasil di-export')};
const exportN=()=>{dlFile(`note-${stamp()}.json`,{...meta('notes'),data:S.notes});toast('Note berhasil di-export')};
const exportA=()=>{dlFile(`quests-semua-data-${stamp()}.json`,{...meta('all'),quests:S.quests,log:S.log,notes:S.notes,profile:S.profile});
 try{localStorage.setItem('quests.bk',Date.now())}catch(e){}renderBk();toast('Semua data berhasil di-export')};
function renderBk(){const el=$('#bk');if(!el)return;const t=+localStorage.getItem('quests.bk');
 el.textContent=t?'Cadangan semua data terakhir: '+fmtDT(t)+', '+left(Date.now()-t)+' lalu.':'Belum pernah export semua data. Sebaiknya lakukan sekarang untuk berjaga-jaga.'}
const pick=k=>{ui.imp=k;const f=$('#file');f.value='';f.click()};
const sk=x=>JSON.stringify([x.sch&&x.sch.days,x.sch&&x.sch.time,x.start]);
$('#file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;
 try{const d=JSON.parse(await file.text());if(d.app!=='quests'||d.kind!==ui.imp)throw 0;const rep=$('#mode').value==='replace',k=ui.imp;let msg='';
  const arr=(v,f)=>(Array.isArray(v)?v:[]).map(f).filter(Boolean);
  const upQ=n=>{const o=get(n.id);if(o){n.cl.forEach(i=>{const m=o.cl.find(x=>x.t===i.t);if(m)i.d=m.d});Object.assign(o,n,{doneAt:o.doneAt,doneLog:o.doneLog,res:o.res,pct:o.pct,cs:sk(o)===sk(n)?o.cs:n.cs})}else S.quests.push(n)};
  const addL=log=>{const ids=new Set(S.log.map(l=>l.id));log.forEach(l=>ids.has(l.id)||S.log.push(l))};
  const upN=list=>list.forEach(n=>{const i=S.notes.findIndex(x=>x.id===n.id);if(i<0)S.notes.push(n);else S.notes[i]=n});
  if(k==='quests'){const list=arr(d.data,q=>cleanQ(q));if(rep)S.quests=list;else list.forEach(upQ);msg=list.length+' quest berhasil di-import'}
  else if(k==='notes'){const list=arr(d.data,cleanN);if(rep)S.notes=list;else upN(list);msg=list.length+' note berhasil di-import'}
  else if(k==='all'){const qs=arr(d.quests,q=>cleanQ(q,1)),log=arr(d.log,cleanL),ns=arr(d.notes,cleanN);
   if(rep){S.quests=qs;S.log=log;S.notes=ns}else{qs.forEach(n=>{const i=S.quests.findIndex(x=>x.id===n.id);if(i<0)S.quests.push(n);else S.quests[i]=n});addL(log);upN(ns)}
   if(d.profile)S.profile=cleanP(d.profile);msg='Semua data berhasil di-import ('+qs.length+' quest, '+ns.length+' note)'}
  else{const log=arr(d.log,cleanL);if(rep)S.log=log;else addL(log);if(d.profile)S.profile=cleanP(d.profile);
   const m=d.done&&typeof d.done==='object'?d.done:{};
   S.quests.forEach(q=>{const x=m[q.id];if(Array.isArray(x)){const at=num(x[0],0,9e15,0);if(at&&(rep||at>(q.doneAt||0))){q.doneAt=at;q.doneLog=sid(x[1])||null;q.res=x[2]==='fail'?'fail':null;if(fin(x[3]))q.pct=num(x[3],0,100,null)}}else if(rep)q.doneAt=q.doneLog=q.res=null});
   msg=log.length+' catatan progres berhasil di-import'}
  save();render();toast(msg)}catch(err){toast('File tidak cocok untuk jenis import ini')}
 e.target.value=''});

/* ---------- event ---------- */
const A={add:()=>openForm(),open:id=>openDetail(id),done:id=>{const q=get(id);if(q&&!$('#dd').open&&clItems(q).length){openDetail(id);return}finish(id,false);closeD()},
 fail:id=>{finish(id,true);closeD()},
 addci:id=>{const q=get(id);q.cl.push({id:uid(),t:'',d:false});q.pct=null;save();const c=$('#cls');c.insertAdjacentHTML('beforeend',ciH(q.cl.at(-1),false));syncProg();c.lastElementChild.querySelector('.ct').focus()},
 delci:(id,b)=>{const q=get(id),el=b.closest('.ci');q.cl=q.cl.filter(i=>i.id!==el.dataset.cid);q.pct=null;el.remove();save();syncProg()},undo:id=>{undo(id);closeD()},
 edit:id=>{closeD();openForm(get(id))},
 del:id=>{if(confirm('Hapus quest ini? Riwayat di Log tetap tersimpan.')){S.quests=S.quests.filter(q=>q.id!==id);save();closeD();render()}},
 addnote:id=>{const q=get(id);q.notes.push({id:uid(),text:'',ts:Date.now()});save();const n=$('#notes');n.insertAdjacentHTML('beforeend',noteH(q.notes.at(-1)));n.lastElementChild.querySelector('textarea').focus()},
 delnote:(id,b)=>{const q=get(id),el=b.closest('.note');q.notes=q.notes.filter(n=>n.id!==el.dataset.nid);el.remove();save()},
 prof:()=>openProf(),
 upd:async()=>{try{for(const k of await caches.keys())await caches.delete(k);for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister()}catch(e){}location.reload()},
 exq:exportQ,imq:()=>pick('quests'),exp:exportP,imp:()=>pick('progress'),exn:exportN,imn:()=>pick('notes'),exa:exportA,ima:()=>pick('all'),
 nadd:()=>openNote(),nopen:(_,b)=>openNote(b.closest('[data-nid]').dataset.nid),
 ndel:()=>{const id=ui.ne;if(id&&confirm('Hapus note ini?')){S.notes=S.notes.filter(n=>n.id!==id);ui.ne=null;save();$('#nd').close();RD.close();render()}},
 nprop:()=>openProps(),ncopy:(_,b)=>copyNote(b),
 reset:()=>{if(confirm('Hapus SEMUA quest dan progres? Ini tidak bisa dibatalkan.')&&confirm('Yakin? Pastikan kamu sudah export cadangan.')){S={quests:[],log:[],notes:[],profile:cleanP()};save();render()}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act],[data-nav],[data-type],[data-close],[data-pct],[data-pt],[data-rng],[data-lf],[data-day],[data-nt],[data-md]');if(!b)return;const d=b.dataset;
 if('nt' in d){ui.nt=d.nt;return renderNotes()}
 if(d.md){setMode(d.md);return}
 if(d.pt){ui.pt=d.pt;return renderProf(true)}
 if(d.rng){ui.rng=+d.rng;return renderProf(true)}
 if(d.lf){ui.lf=d.lf;return renderProf(true)}
 if(d.day){const v=ui.a&&ui.a.byDay[d.day],h=$('#hd');if(h)h.textContent=fmtL(keyDate(d.day))+': '+(v?v.n+' quest selesai, +'+v.xp+' XP':'tidak ada aktivitas');return}
 if(d.pct){const q=get(ui.d);if(q&&status(q)==='on'){q.pct=+d.pct;syncProg();save()}return}
 if(d.nav)return show(d.nav);
 if(d.type){ui.type=d.type;return render()}
 if('close' in d)return b.closest('dialog').close();
 A[d.act]?.(b.closest('.row')?.dataset.id||ui.d,b)});
$('#q').oninput=renderList;['#sort','#tf','#fst'].forEach(s=>$(s).onchange=renderList);
$('#nq').oninput=renderNotes;['#nsort','#nst'].forEach(s=>$(s).onchange=renderNotes);
const applyTheme=t=>{document.documentElement.dataset.theme=t;$('meta[name=theme-color]').content=t==='dark'?'#0e131b':'#f2f4f8'};
$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(t);localStorage.setItem('quests.theme',t)};
applyTheme(document.documentElement.dataset.theme);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
setInterval(render,6e4);
navigator.storage?.persist?.();
if('serviceWorker' in navigator){const had=!!navigator.serviceWorker.controller;let rl=false;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!rl){rl=true;location.reload()}});
 addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
const ve=$('#ver');if(ve)ve.textContent=VER;
renderBk();
render();show('quests');
