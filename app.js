'use strict';
const $=s=>document.querySelector(s),KEY='quests.v1',DAY=864e5,VER=5;
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

/* ---------- state ---------- */
let S={quests:[],log:[]},ui={type:'all',edit:null,d:null,imp:null};
try{const raw=localStorage.getItem(KEY);if(raw&&!localStorage.getItem('quests.bak'))localStorage.setItem('quests.bak',raw)}catch(e){}
try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.quests)){
 S.quests=d.quests.map(q=>cleanQ(q,1));S.log=(Array.isArray(d.log)?d.log:[]).map(cleanL).filter(Boolean)}}catch(e){}
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
const SORTS={dlA:cmpDl(1),dlD:cmpDl(-1),tierD:(a,b)=>b.tier-a.tier,tierA:(a,b)=>a.tier-b.tier},ORD={on:0,wait:1,done:2,fail:3,end:4};
function visible(){const q=$('#q').value.trim().toLowerCase(),tf=$('#tf').value,cmp=SORTS[$('#sort').value]||SORTS.dlA,
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
function stats(){const xp=S.log.reduce((s,l)=>s+l.xp,0),lv=Math.floor(Math.sqrt(xp/100))+1,lo=100*(lv-1)**2,hi=100*lv**2;
 const days=new Set(S.log.filter(l=>l.res!=='fail').map(l=>dkey(l.at))),d=new Date();d.setHours(0,0,0,0);if(!days.has(dkey(d)))d.setDate(d.getDate()-1);
 let st=0;while(days.has(dkey(d))){st++;d.setDate(d.getDate()-1)}
 const okL=S.log.filter(l=>l.res!=='fail');return{xp,lv,hi,pct:Math.round((xp-lo)/(hi-lo)*100),st,total:okL.length,fail:S.log.length-okL.length,avg:okL.length?Math.round(okL.reduce((a,l)=>a+l.pct,0)/okL.length):0,today:okL.filter(l=>dkey(l.at)===dkey(Date.now())).length}}
function renderLog(){const s=stats();$('#lvl').textContent='Lv '+s.lv;
 $('#stats').innerHTML=`<div class="stat" style="grid-column:1/-1"><b>Level ${s.lv}</b><span>${s.xp} dari ${s.hi} XP menuju level berikutnya</span><div class="bar"><i style="width:${s.pct}%"></i></div></div>
<div class="stat"><b>${s.today}</b><span>Selesai hari ini</span></div><div class="stat"><b>${s.total}</b><span>Total selesai</span></div>
<div class="stat"><b>${s.st} hari</b><span>Streak berturut-turut</span></div><div class="stat"><b>${S.quests.filter(q=>status(q)==='on').length}</b><span>Quest berlangsung</span></div><div class="stat"><b>${s.fail}</b><span>Total gagal</span></div><div class="stat"><b>${s.avg}%</b><span>Rata-rata persentase selesai</span></div>`;
 let h='',last='';[...S.log].sort((a,b)=>b.at-a.at).slice(0,300).forEach(l=>{const k=dkey(l.at);
  if(k!==last){last=k;h+=`<div class="day">${new Date(l.at).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>`}
  h+=`<div class="le" style="--t:${hue(l.tier)}"><span class="tier">${R[l.tier-1]}</span><div>${esc(l.name)}<br><small>${TYPES[l.type]}, ${fmtT(l.at)}${l.res==='fail'?', gagal':l.pct<100?', selesai '+l.pct+'%':''}</small></div>${l.res==='fail'?'<em class="bad">Gagal</em>':`<em>+${l.xp}</em>`}</div>`});
 $('#loglist').innerHTML=h||'<div class="empty">Belum ada quest yang selesai.<br>Selesaikan quest pertamamu.</div>'}
function render(){refresh();const w=new Set(S.quests.filter(q=>status(q)==='wait').map(q=>q.id)),
 up=S.quests.filter(q=>ui.w&&ui.w.has(q.id)&&!w.has(q.id)&&status(q)==='on');ui.w=w;
 if(up.length)toast('Quest dimulai: '+up.map(q=>q.name).join(', '));renderTypes();renderList();renderLog()}
function show(t){['quests','log','data'].forEach(k=>$('#v-'+k).hidden=k!==t);
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.nav===t));$('#fab').hidden=t!=='quests';scrollTo(0,0)}
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2600)}

/* ---------- aksi quest ---------- */
function finish(id,fail){const q=get(id);if(!q||status(q)!=='on')return;const p=fail?0:eff(q);
 if(!fail&&p<=0){toast('Persentase 0%: naikkan persentasenya atau tandai Gagal');return}
 const e={id:uid(),qid:q.id,name:q.name,tier:q.tier,type:q.type,xp:fail?0:pts(q),at:Date.now(),res:fail?'fail':'done',pct:p};
 S.log.push(e);q.doneAt=e.at;q.doneLog=e.id;q.res=fail?'fail':null;if(!fail)q.pct=p;save();render();
 toast(fail?`Gagal: ${q.name}`:`Selesai${p<100?' '+p+'%':''}: ${q.name} (+${e.xp} XP)`)}
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
const exportP=()=>{dlFile(`progres-${stamp()}.json`,{...meta('progress'),log:S.log,done:Object.fromEntries(S.quests.filter(q=>q.doneAt).map(q=>[q.id,[q.doneAt,q.doneLog,q.res,q.pct]]))});toast('Progres berhasil di-export')};
const pick=k=>{ui.imp=k;const f=$('#file');f.value='';f.click()};
const sk=x=>JSON.stringify([x.sch&&x.sch.days,x.sch&&x.sch.time,x.start]);
$('#file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;
 try{const d=JSON.parse(await file.text());if(d.app!=='quests'||d.kind!==ui.imp)throw 0;const rep=$('#mode').value==='replace';
  if(ui.imp==='quests'){const list=(Array.isArray(d.data)?d.data:[]).map(q=>cleanQ(q));
   if(rep)S.quests=list;else list.forEach(n=>{const o=get(n.id);
    if(o){n.cl.forEach(i=>{const m=o.cl.find(x=>x.t===i.t);if(m)i.d=m.d});Object.assign(o,n,{doneAt:o.doneAt,doneLog:o.doneLog,res:o.res,pct:o.pct,cs:sk(o)===sk(n)?o.cs:n.cs})}else S.quests.push(n)});
   toast(list.length+' quest berhasil di-import')}
  else{const log=(Array.isArray(d.log)?d.log:[]).map(cleanL).filter(Boolean);
   if(rep)S.log=log;else{const ids=new Set(S.log.map(l=>l.id));log.forEach(l=>ids.has(l.id)||S.log.push(l))}
   const m=d.done&&typeof d.done==='object'?d.done:{};
   S.quests.forEach(q=>{const x=m[q.id];if(Array.isArray(x)){const at=num(x[0],0,9e15,0);if(at&&(rep||at>(q.doneAt||0))){q.doneAt=at;q.doneLog=sid(x[1])||null;q.res=x[2]==='fail'?'fail':null;if(fin(x[3]))q.pct=num(x[3],0,100,null)}}else if(rep)q.doneAt=q.doneLog=q.res=null});
   toast(log.length+' catatan progres berhasil di-import')}
  save();render()}catch(err){toast('File tidak cocok untuk jenis import ini')}
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
 upd:async()=>{try{for(const k of await caches.keys())await caches.delete(k);for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister()}catch(e){}location.reload()},
 exq:exportQ,imq:()=>pick('quests'),exp:exportP,imp:()=>pick('progress'),
 reset:()=>{if(confirm('Hapus SEMUA quest dan progres? Ini tidak bisa dibatalkan.')&&confirm('Yakin? Pastikan kamu sudah export cadangan.')){S={quests:[],log:[]};save();render()}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act],[data-nav],[data-type],[data-close],[data-pct]');if(!b)return;const d=b.dataset;
 if(d.pct){const q=get(ui.d);if(q&&status(q)==='on'){q.pct=+d.pct;syncProg();save()}return}
 if(d.nav)return show(d.nav);
 if(d.type){ui.type=d.type;return render()}
 if('close' in d)return b.closest('dialog').close();
 A[d.act]?.(b.closest('.row')?.dataset.id||ui.d,b)});
$('#q').oninput=renderList;['#sort','#tf','#fst'].forEach(s=>$(s).onchange=renderList);
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
render();show('quests');
