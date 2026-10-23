'use strict';
const $=s=>document.querySelector(s),KEY='quests.v1',DAY=864e5;
const R=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
const TYPES={daily:'Daily',weekly:'Weekly',monthly:'Monthly',custom:'Custom'},TK=Object.keys(TYPES);
const num=(v,a,b,d)=>{v=Math.round(+v);return Number.isFinite(v)?Math.min(b,Math.max(a,v)):d};
const str=(v,n)=>String(v??'').slice(0,n);
const sid=v=>str(v,40).replace(/[^\w-]/g,'');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const hue=t=>200-(t-1)*22;               // tier I = biru dingin ... tier X = merah panas

/* ---------- sanitasi data (dipakai saat load & import) ---------- */
function cleanQ(q,keep){q=q||{};const w=q.dl||{},k=['day','week','custom'].includes(w.k)?w.k:'none',
 at=k!=='none'&&w.at!==null&&Number.isFinite(+w.at)?+w.at:null;
 return{id:sid(q.id)||uid(),name:str(q.name,120)||'Tanpa nama',desc:str(q.desc,1000),tier:num(q.tier,1,10,1),
  type:TK.includes(q.type)?q.type:'daily',every:num(q.every,0,3650,0),dl:{k:at===null?'none':k,at},
  notes:(Array.isArray(q.notes)?q.notes:[]).slice(0,200).map(n=>({id:sid(n&&n.id)||uid(),text:str(n&&n.text,5000),ts:num(n&&n.ts,0,9e15,Date.now())})),
  created:num(q.created,0,9e15,Date.now()),doneAt:keep&&q.doneAt?num(q.doneAt,0,9e15,null):null,doneLog:keep&&q.doneLog?sid(q.doneLog):null}}
const cleanL=l=>l&&l.at?{id:sid(l.id)||uid(),qid:sid(l.qid),name:str(l.name,120),tier:num(l.tier,1,10,1),
 type:TK.includes(l.type)?l.type:'custom',xp:num(l.xp,0,1e4,10),at:num(l.at,0,9e15,Date.now())}:null;

/* ---------- state ---------- */
let S={quests:[],log:[]},ui={type:'all',edit:null,d:null,imp:null};
try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.quests)){
 S.quests=d.quests.map(q=>cleanQ(q,1));S.log=(Array.isArray(d.log)?d.log:[]).map(cleanL).filter(Boolean)}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Gagal menyimpan data')}};
const get=id=>S.quests.find(q=>q.id===id);

/* ---------- tanggal, reset, deadline ---------- */
const dkey=t=>{const d=new Date(t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const fmtD=t=>new Date(t).toLocaleDateString('id-ID',{day:'numeric',month:'short'});
const fmtT=t=>new Date(t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
const fmtDT=t=>new Date(t).toLocaleString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
// kapan quest yang sudah selesai aktif lagi (minggu dimulai hari Senin)
function resetAt(q){const d=new Date(q.doneAt);d.setHours(0,0,0,0);
 if(q.type==='daily')return d.setDate(d.getDate()+1);
 if(q.type==='weekly')return d.setDate(d.getDate()+((8-d.getDay())%7||7));
 if(q.type==='monthly')return new Date(d.getFullYear(),d.getMonth()+1,1).getTime();
 return q.every>0?d.setDate(d.getDate()+q.every):Infinity}
const isDone=q=>!!q.doneAt&&Date.now()<resetAt(q);
const isOnce=q=>q.type==='custom'&&!(q.every>0);
const typeLabel=q=>TYPES[q.type]+(q.type==='custom'&&q.every>0?' (tiap '+q.every+' hari)':'');
function refresh(){let ch=false;const n=Date.now();
 S.quests.forEach(q=>{if(q.doneAt&&n>=resetAt(q)){q.doneAt=q.doneLog=null;ch=true;
  if(q.dl.k==='day'||q.dl.k==='week')q.dl.at=n+(q.dl.k==='day'?1:7)*DAY}});
 if(ch)save()}
function span(ms){const m=Math.round(ms/6e4);if(m<60)return Math.max(m,1)+' mnt';const h=Math.round(m/60);return h<48?h+' jam':Math.round(h/24)+' hari'}
function dlInfo(q){if(!q.dl.at)return{t:'Tanpa deadline',c:''};const d=q.dl.at-Date.now();
 return d<0?{t:'Terlambat '+span(-d),c:'bad'}:{t:'Sisa '+span(d),c:d<DAY?'warn':''}}

/* ---------- sort / filter ---------- */
const cmpDl=dir=>(a,b)=>{const x=a.dl.at,y=b.dl.at;if(x==null&&y==null)return 0;if(x==null)return 1;if(y==null)return -1;return dir*(x-y)};
const SORTS={tierA:(a,b)=>a.tier-b.tier,tierD:(a,b)=>b.tier-a.tier,dlA:cmpDl(1),dlD:cmpDl(-1)};
function visible(){const q=$('#q').value.trim().toLowerCase(),tf=$('#tf').value,sd=$('#sd').checked,cmp=SORTS[$('#sort').value];
 return S.quests.filter(x=>(ui.type==='all'||x.type===ui.type)&&(!tf||x.tier==tf)&&(sd||!isDone(x))&&
  (!q||(x.name+' '+x.desc+' '+x.notes.map(n=>n.text).join(' ')).toLowerCase().includes(q)))
  .sort((a,b)=>isDone(a)-isDone(b)||cmp(a,b)||b.tier-a.tier||a.created-b.created)}

/* ---------- render ---------- */
function card(q){const d=isDone(q),i=dlInfo(q);
 return `<article class="row${d?' done':''}" data-id="${q.id}" style="--t:${hue(q.tier)}"><span class="tier" data-act="open">${R[q.tier-1]}</span>
<div class="body" data-act="open"><h3>${esc(q.name)}</h3>${q.desc?`<p>${esc(q.desc)}</p>`:''}
<div class="chips"><span class="chip">${typeLabel(q)}</span>${d?`<span class="chip">Selesai ${fmtD(q.doneAt)}</span>`:`<span class="chip ${i.c}">${i.t}</span>`}${d&&!isOnce(q)?`<span class="chip">Aktif lagi ${fmtD(resetAt(q))}</span>`:''}${q.notes.length?`<span class="chip">${q.notes.length} note</span>`:''}</div></div>
<button class="chk" data-act="${d?'undo':'done'}" aria-label="${d?'Batalkan selesai':'Tandai selesai'}">${d?'✓':''}</button></article>`}
function renderTypes(){const n=t=>S.quests.filter(q=>(t==='all'||q.type===t)&&!isDone(q)).length;
 $('#types').innerHTML=[['all','Semua'],...Object.entries(TYPES)].map(([k,l])=>`<button role="tab" data-type="${k}" class="${ui.type===k?'on':''}">${l}<b>${n(k)}</b></button>`).join('')}
function renderList(){const L=visible();
 $('#list').innerHTML=L.length?L.map(card).join(''):`<div class="empty">${S.quests.length?'Tidak ada quest yang cocok dengan filter.':'Belum ada quest.<br>Tekan + untuk membuat quest pertamamu.'}</div>`}
function stats(){const xp=S.log.reduce((s,l)=>s+l.xp,0),lv=Math.floor(Math.sqrt(xp/100))+1,lo=100*(lv-1)**2,hi=100*lv**2;
 const days=new Set(S.log.map(l=>dkey(l.at))),d=new Date();d.setHours(0,0,0,0);if(!days.has(dkey(d)))d.setDate(d.getDate()-1);
 let st=0;while(days.has(dkey(d))){st++;d.setDate(d.getDate()-1)}
 return{xp,lv,hi,pct:Math.round((xp-lo)/(hi-lo)*100),st,total:S.log.length,today:S.log.filter(l=>dkey(l.at)===dkey(Date.now())).length}}
function renderLog(){const s=stats();$('#lvl').textContent='Lv '+s.lv;
 $('#stats').innerHTML=`<div class="stat" style="grid-column:1/-1"><b>Level ${s.lv}</b><span>${s.xp} dari ${s.hi} XP menuju level berikutnya</span><div class="bar"><i style="width:${s.pct}%"></i></div></div>
<div class="stat"><b>${s.today}</b><span>Selesai hari ini</span></div><div class="stat"><b>${s.total}</b><span>Total selesai</span></div>
<div class="stat"><b>${s.st} hari</b><span>Streak berturut-turut</span></div><div class="stat"><b>${S.quests.filter(q=>!isDone(q)).length}</b><span>Quest aktif</span></div>`;
 let h='',last='';[...S.log].sort((a,b)=>b.at-a.at).slice(0,300).forEach(l=>{const k=dkey(l.at);
  if(k!==last){last=k;h+=`<div class="day">${new Date(l.at).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>`}
  h+=`<div class="le" style="--t:${hue(l.tier)}"><span class="tier">${R[l.tier-1]}</span><div>${esc(l.name)}<br><small>${TYPES[l.type]}, ${fmtT(l.at)}</small></div><em>+${l.xp}</em></div>`});
 $('#loglist').innerHTML=h||'<div class="empty">Belum ada quest yang selesai.<br>Selesaikan quest pertamamu.</div>'}
function render(){refresh();renderTypes();renderList();renderLog()}
function show(t){['quests','log','data'].forEach(k=>$('#v-'+k).hidden=k!==t);
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.nav===t));$('#fab').hidden=t!=='quests';scrollTo(0,0)}
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2600)}

/* ---------- aksi quest ---------- */
function complete(id){const q=get(id);if(!q||isDone(q))return;
 const e={id:uid(),qid:q.id,name:q.name,tier:q.tier,type:q.type,xp:q.tier*10,at:Date.now()};
 S.log.push(e);q.doneAt=e.at;q.doneLog=e.id;save();render();toast(`Selesai: ${q.name} (+${e.xp} XP)`)}
function undo(id){const q=get(id);if(!q)return;S.log=S.log.filter(l=>l.id!==q.doneLog);q.doneAt=q.doneLog=null;save();render()}
const noteH=n=>`<div class="note" data-nid="${n.id}"><textarea rows="2" placeholder="Tulis catatan…" aria-label="Note">${esc(n.text)}</textarea><button data-act="delnote" aria-label="Hapus note">✕</button><small>Diedit ${fmtDT(n.ts)}</small></div>`;
function openDetail(id){const q=get(id);if(!q)return;ui.d=id;const d=isDone(q),i=dlInfo(q);
 $('#dd').innerHTML=`<div class="dh" style="--t:${hue(q.tier)}"><span class="tier" style="cursor:default">${R[q.tier-1]}</span><h2>${esc(q.name)}</h2><button class="ic" data-close aria-label="Tutup">✕</button></div>
<p class="desc">${q.desc?esc(q.desc):'<i>Tanpa deskripsi</i>'}</p>
<div class="chips"><span class="chip">${typeLabel(q)}</span><span class="chip ${d?'':i.c}">${d?'Selesai '+fmtDT(q.doneAt):i.t}</span>${q.dl.at?`<span class="chip">Deadline ${fmtDT(q.dl.at)}</span>`:''}</div>
<h4>Catatan</h4><div id="notes">${q.notes.map(noteH).join('')}</div><button class="ghost" data-act="addnote">+ Tambah note</button>
<menu><button class="danger" data-act="del">Hapus</button><button data-act="edit">Edit</button><button class="pri" data-act="${d?'undo':'done'}">${d?'Batalkan selesai':'Selesai'}</button></menu>`;
 $('#dd').showModal()}
const closeD=()=>{const d=$('#dd');if(d.open)d.close()};
let tm;$('#dd').addEventListener('input',e=>{const el=e.target.closest('.note'),q=get(ui.d);if(!el||!q)return;
 const n=q.notes.find(n=>n.id===el.dataset.nid);if(n){n.text=e.target.value;n.ts=Date.now();el.querySelector('small').textContent='Diedit '+fmtDT(n.ts);clearTimeout(tm);tm=setTimeout(save,300)}});
$('#dd').addEventListener('close',()=>{save();render()});

/* ---------- form tambah / edit ---------- */
const F=$('#qf');
F.tr.innerHTML=R.map((r,i)=>`<option value="${i+1}">${r}${i===0?' (prioritas rendah)':i===9?' (prioritas tinggi)':''}</option>`).join('');
F.ty.innerHTML=TK.map(k=>`<option value="${k}">${TYPES[k]}</option>`).join('');
$('#tf').innerHTML='<option value="">Semua tier</option>'+R.map((r,i)=>`<option value="${i+1}">Tier ${r}</option>`).join('');
function sync(){$('#evl').hidden=F.ty.value!=='custom';$('#dtl').hidden=F.dk.value!=='custom';F.dt.required=F.dk.value==='custom'}
function openForm(q){ui.edit=q?q.id:null;$('#qt').textContent=q?'Edit quest':'Quest baru';
 F.nm.value=q?q.name:'';F.ds.value=q?q.desc:'';F.tr.value=q?q.tier:5;F.ty.value=q?q.type:(ui.type==='all'?'daily':ui.type);F.ev.value=q?q.every:0;
 F.dk.value=q?q.dl.k:'none';F.dt.value=q&&q.dl.k==='custom'&&q.dl.at?new Date(q.dl.at-new Date(q.dl.at).getTimezoneOffset()*6e4).toISOString().slice(0,16):'';
 sync();$('#qd').showModal();F.nm.focus()}
F.addEventListener('change',sync);
F.addEventListener('submit',e=>{e.preventDefault();const name=F.nm.value.trim();if(!name)return;
 const old=ui.edit&&get(ui.edit),k=F.dk.value;let at=null;
 if(k==='custom')at=new Date(F.dt.value).getTime();
 else if(k!=='none')at=old&&old.dl.k===k&&old.dl.at?old.dl.at:Date.now()+(k==='day'?1:7)*DAY;
 const data={name,desc:F.ds.value.trim(),tier:+F.tr.value,type:F.ty.value,every:F.ty.value==='custom'?num(F.ev.value,0,3650,0):0,dl:{k,at}};
 if(old)Object.assign(old,data);else S.quests.push({id:uid(),notes:[],created:Date.now(),doneAt:null,doneLog:null,...data});
 save();$('#qd').close();render()});

/* ---------- export / import ---------- */
function dlFile(name,obj){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));
 a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2e3)}
const stamp=()=>new Date().toISOString().slice(0,10),meta=k=>({app:'quests',kind:k,v:1,exported:new Date().toISOString()});
const exportQ=()=>{dlFile(`quests-${stamp()}.json`,{...meta('quests'),data:S.quests.map(({doneAt,doneLog,...q})=>q)});toast('Quests berhasil di-export')};
const exportP=()=>{dlFile(`progres-${stamp()}.json`,{...meta('progress'),log:S.log,done:Object.fromEntries(S.quests.filter(q=>q.doneAt).map(q=>[q.id,[q.doneAt,q.doneLog]]))});toast('Progres berhasil di-export')};
const pick=k=>{ui.imp=k;const f=$('#file');f.value='';f.click()};
$('#file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;
 try{const d=JSON.parse(await file.text());if(d.app!=='quests'||d.kind!==ui.imp)throw 0;const rep=$('#mode').value==='replace';
  if(ui.imp==='quests'){const list=(Array.isArray(d.data)?d.data:[]).map(q=>cleanQ(q));
   if(rep)S.quests=list;else list.forEach(n=>{const o=get(n.id);if(o)Object.assign(o,n,{doneAt:o.doneAt,doneLog:o.doneLog});else S.quests.push(n)});
   toast(list.length+' quest berhasil di-import')}
  else{const log=(Array.isArray(d.log)?d.log:[]).map(cleanL).filter(Boolean);
   if(rep)S.log=log;else{const ids=new Set(S.log.map(l=>l.id));log.forEach(l=>ids.has(l.id)||S.log.push(l))}
   const m=d.done&&typeof d.done==='object'?d.done:{};
   S.quests.forEach(q=>{const x=m[q.id];if(Array.isArray(x)){const at=num(x[0],0,9e15,0);if(at&&(rep||at>(q.doneAt||0))){q.doneAt=at;q.doneLog=sid(x[1])||null}}else if(rep)q.doneAt=q.doneLog=null});
   toast(log.length+' catatan progres berhasil di-import')}
  save();render()}catch(err){toast('File tidak cocok untuk jenis import ini')}
 e.target.value=''});

/* ---------- event ---------- */
const A={add:()=>openForm(),open:id=>openDetail(id),done:id=>{complete(id);closeD()},undo:id=>{undo(id);closeD()},
 edit:id=>{closeD();openForm(get(id))},
 del:id=>{if(confirm('Hapus quest ini? Riwayat di Log tetap tersimpan.')){S.quests=S.quests.filter(q=>q.id!==id);save();closeD();render()}},
 addnote:id=>{const q=get(id);q.notes.push({id:uid(),text:'',ts:Date.now()});save();const n=$('#notes');n.insertAdjacentHTML('beforeend',noteH(q.notes.at(-1)));n.lastElementChild.querySelector('textarea').focus()},
 delnote:(id,b)=>{const q=get(id),el=b.closest('.note');q.notes=q.notes.filter(n=>n.id!==el.dataset.nid);el.remove();save()},
 exq:exportQ,imq:()=>pick('quests'),exp:exportP,imp:()=>pick('progress'),
 reset:()=>{if(confirm('Hapus SEMUA quest dan progres? Ini tidak bisa dibatalkan.')&&confirm('Yakin? Pastikan kamu sudah export cadangan.')){S={quests:[],log:[]};save();render()}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act],[data-nav],[data-type],[data-close]');if(!b)return;const d=b.dataset;
 if(d.nav)return show(d.nav);
 if(d.type){ui.type=d.type;return render()}
 if('close' in d)return b.closest('dialog').close();
 A[d.act]?.(b.closest('.row')?.dataset.id||ui.d,b)});
$('#q').oninput=renderList;['#sort','#tf','#sd'].forEach(s=>$(s).onchange=renderList);
const applyTheme=t=>{document.documentElement.dataset.theme=t;$('meta[name=theme-color]').content=t==='dark'?'#0e131b':'#f2f4f8'};
$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(t);localStorage.setItem('quests.theme',t)};
applyTheme(document.documentElement.dataset.theme);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
setInterval(render,6e4);
navigator.storage?.persist?.();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
render();show('quests');
