/* PENTAGONE v16 · LIVE TRADES — ticks temps réel WebSocket (serveur, lecture seule), repli SSE puis data.json. Sans WebGL. */
(function(){
const FEED='https://178-104-3-172.sslip.io';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sg=(v,n=1)=>v==null||isNaN(v)?'—':(v>0?'+':v<0?'−':'')+Math.abs(v).toFixed(n),cls=v=>v>0?'up':v<0?'dn':'fl';
const fpx=p=>{if(p==null||!isFinite(p)||p<=0)return'—';if(p>=1)return p.toFixed(4);const e=Math.floor(-Math.log10(p));if(e<3)return p.toFixed(6);
 const sub='₀₁₂₃₄₅₆₇₈₉';return'0.0'+String(e-1).split('').map(d=>sub[d]).join('')+(p*10**e).toFixed(3).replace('.','').slice(0,4)};
const SK={hard:'STOP DUR',trail:'SL DYNAMIQUE',breakeven:'BREAKEVEN',runner:'RUNNER · PLANCHER'};
let MODE='',TF=0,LAT=[],D0=null,POS=[],TPS=[30,100],EV=[],on=false,flt='ALL',lastTick=0,es=null,sel=null,first=true,cards={},seenF=new Set();
const H={};  // k -> [[ts,ret,mark]] (15 min)
const keyOf=p=>p.k||(p.grp+'|'+p.mint+'|'+p.ts);
/* ---------- DOM ---------- */
const lv=document.createElement('section');lv.className='lv';lv.id='lv';lv.innerHTML=`
<div class="g"><div class="lvtop"><div><div class="lvtitle"><i id="lvdot"></i>LIVE TRADES <span class="lvst" id="lvst">…</span></div><div class="lvsub" id="lvage">—</div></div>
<div style="text-align:right"><div class="lvsub">POSITIONS</div><div style="font:800 22px JBM,monospace;color:#e9e6ef" id="lvn">0</div></div></div>
<div class="lvsub" style="margin-top:10px;letter-spacing:.18em">P&amp;L DU JOUR · TOUS GROUPES <em style="font-style:normal;color:#5d566b">(clôturés)</em></div><div class="tot fl" id="lvtot">—</div>
<div class="lvsub" style="margin-top:10px;letter-spacing:.18em">SOLDE TOTAL · CAPITAL + RÉALISÉ + LATENT</div><div class="tot fl" id="lvbal" style="font-size:24px">—</div><div class="lvsub" id="lvbal2"></div>
<div class="grs" id="lvgr"></div></div>
<div class="g"><h3>POSITIONS OUVERTES <em id="lvopen"></em></h3><div class="flt" id="lvflt"></div><div id="lvpos"></div></div>
<div class="g feed"><h3>FLUX ENTRÉES / SORTIES <em>NET</em></h3><div id="lvfeed"></div></div>
<div class="lvnote">SIMULATION PAPIER · AUCUN ARGENT RÉEL · ADRESSES TRONQUÉES<br>LIVE = chaque prix du bot poussé en direct (WebSocket) · DIFFÉRÉ = data.json (~1 min) · heures de Paris · touche une position pour son graphique</div>
<div class="lvm" id="lvm"><div class="lvmc g"><div class="lvmh"><div><div class="sym" id="mS"></div><div class="mt" id="mM"></div></div><div class="ret"><b id="mR">—</b><small id="mP"></small></div></div>
<div class="flt" id="mT"><button data-t="0" class="on">TICKS</button><button data-t="5">5 S</button><button data-t="15">15 S</button><button data-t="60">1 M</button></div><canvas id="mC"></canvas><div class="sl" id="mL"></div><button class="lvx" id="mX">FERMER</button></div></div>`;
document.body.appendChild(lv);
const tb=document.createElement('nav');tb.className='tabbar';tb.innerHTML='<button id="tbE" class="on">◉ TERRE</button><button id="tbL">▲ LIVE<span class="bd" id="tbn" style="display:none">0</span></button>';
document.body.appendChild(tb);
let dT=null,pollT=null;function show(v){on=v;clearTimeout(dT);$('tbE').classList.toggle('on',!v);$('tbL').classList.toggle('on',v);
 if(v){document.body.classList.add('lvon');dT=setTimeout(()=>document.body.classList.add('lvdone'),560);history.replaceState(null,'','#live');connect();loadD();paint()}
 else{document.body.classList.remove('lvdone');requestAnimationFrame(()=>document.body.classList.remove('lvon'));history.replaceState(null,'',location.pathname+location.search);closeM()}}
$('tbE').onclick=()=>show(false);$('tbL').onclick=()=>show(true);
let sx=0,sy=0;addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
addEventListener('touchend',e=>{if(sel)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>80&&Math.abs(dx)>2*Math.abs(dy)){if(dx<0&&!on&&sx>innerWidth*.6)show(true);else if(dx>0&&on&&sx<innerWidth*.4)show(false)}},{passive:true});
/* ---------- animations ---------- */
const NV=new WeakMap();
function count(el,to,fmt,d=650){if(to==null||isNaN(to)){el.textContent='—';NV.delete(el);return}const st=NV.get(el);const from=st?st.v:to;NV.set(el,{v:to,a:(st?.a||0)+1});const id=NV.get(el).a;
 if(from===to||first){el.textContent=fmt(to);return}const t0=performance.now();(function f(t){if(NV.get(el)?.a!==id)return;const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)requestAnimationFrame(f)})(t0)}
function pulse(el,up){el.classList.remove('pu','pd');void el.offsetWidth;el.classList.add(up?'pu':'pd');clearTimeout(el._pt);el._pt=setTimeout(()=>el.classList.remove('pu','pd'),900)}
function chart(cv,h,w,hh,opt={}){const r=devicePixelRatio||1;if(cv.width!==w*r){cv.width=w*r;cv.height=hh*r}const x=cv.getContext('2d');x.setTransform(r,0,0,r,0,0);x.clearRect(0,0,w,hh);
 const now=Date.now()/1000,span=opt.span||900,pts=(h||[]).filter(p=>p[0]>=now-span);if(!pts.length)return;const a=pts.length>1?pts:[[now-30,pts[0][1]],[now,pts[0][1]]];
 const lv=opt.levels||[];const vs=a.map(p=>p[1]).concat([0],lv.map(l=>l.v).filter(v=>v!=null));let mn=Math.min(...vs),mx=Math.max(...vs);const pad=(mx-mn)*.12||1;mn-=pad;mx+=pad;
 const t0=Math.min(a[0][0],now-Math.min(span,Math.max(60,now-a[0][0]))),X=t=>2+(t-t0)/(now-t0||1)*(w-(opt.big?44:8)),Y=v=>hh-3-(v-mn)/(mx-mn)*(hh-6);
 x.lineWidth=1;lv.forEach(l=>{if(l.v==null)return;x.strokeStyle=l.c;x.setLineDash([3,4]);x.globalAlpha=.7;x.beginPath();x.moveTo(0,Y(l.v));x.lineTo(w,Y(l.v));x.stroke();x.globalAlpha=1;
  if(opt.big){x.setLineDash([]);x.fillStyle=l.c;x.font='600 9px JBM,monospace';x.fillText(l.t,w-40,Y(l.v)-3)}});x.setLineDash([]);
 if(!opt.big){x.strokeStyle='#ffffff22';x.setLineDash([2,3]);x.beginPath();x.moveTo(0,Y(0));x.lineTo(w,Y(0));x.stroke();x.setLineDash([])}
 const last=a[a.length-1][1],up=last>=0,c=up?'#2bffb0':'#ff4d7d',g=x.createLinearGradient(0,0,0,hh);g.addColorStop(0,up?'#2bffb055':'#ff4d7d05');g.addColorStop(1,up?'#2bffb003':'#ff4d7d55');
 const path=()=>{x.beginPath();a.forEach((p,i)=>{const px=X(p[0]),py=Y(p[1]);if(!i)x.moveTo(px,py);else{x.lineTo(px,Y(a[i-1][1]));x.lineTo(px,py)}});x.lineTo(X(now),Y(last))};
 path();x.lineTo(X(now),Y(0));x.lineTo(X(a[0][0]),Y(0));x.closePath();x.fillStyle=g;x.fill();
 path();x.strokeStyle=c;x.lineWidth=opt.big?2:1.6;x.shadowColor=c;x.shadowBlur=opt.big?10:6;x.stroke();x.shadowBlur=0;
 const ph=(performance.now()/600)%1;x.fillStyle=c;x.globalAlpha=1-ph;x.beginPath();x.arc(X(now),Y(last),2+ph*(opt.big?9:6),0,7);x.fill();x.globalAlpha=1;
 x.shadowColor='#fff';x.shadowBlur=10;x.fillStyle='#fff';x.beginPath();x.arc(X(now),Y(last),opt.big?3:2.2,0,7);x.fill();x.shadowBlur=0}
function barHTML(p){const s=p.stop?.pct??-19,top=Math.max(110,(p.ret||0)*1.12,(s||0)+20),bot=Math.min(-25,s)-3,P=v=>((v-bot)/(top-bot)*100).toFixed(2)+'%',r=p.ret??0,a=Math.min(0,r),b=Math.max(0,r);
 return `<div class="fill" style="left:${P(a)};width:calc(${P(b)} - ${P(a)});background:${r>=0?'linear-gradient(90deg,#2bffb055,#2bffb0)':'linear-gradient(90deg,#ff4d7d,#ff4d7d55)'};box-shadow:0 0 10px ${r>=0?'#2bffb088':'#ff4d7d88'}"></div>
 <div class="mk stp" style="left:${P(s)}"><span>${sg(s,0)}%</span></div><div class="mk" style="left:${P(0)}"><span>${Math.abs(s)<9?'':'0'}</span></div>
 ${TPS.map((t,i)=>`<div class="mk" style="left:${P(t)};background:${(p.tp||[]).includes(t)?'#2bffb0':'#ffffff40'}"><span>TP${i+1}</span></div>`).join('')}<div class="cur" style="left:${P(r)}"></div>`}
/* ---------- cartes (mises à jour en place) ---------- */
function card(p){const k=keyOf(p);let c=cards[k];if(!c){const e=document.createElement('div');e.className='lpos'+(first?'':' new');e.dataset.k=k;
  e.innerHTML=`<div class="pr1"><div class="gb ${p.grp}">${p.grp}</div><div style="min-width:0"><div class="sym">${esc(p.sym)}</div><div class="mt">${esc(p.mint)} · ${p.t||''} · ${(p.cost||0).toFixed(3)} SOL</div></div>
  <div class="ret"><b data-r>—</b><small data-p></small></div></div><div class="pr2"><canvas class="spk"></canvas><div class="px">ENTRÉE <b>${fpx(p.entry)}</b><br>ACTUEL <b data-m>—</b><br>PIC <b data-k>—</b></div><div class="tags" data-t></div></div>
  <div class="bar" data-b></div><div class="sl"><span>STOP <b data-s></b></span><span>${TPS.map((t,i)=>'TP'+(i+1)+' +'+t+'%').join(' · ')}</span></div>`;
  e.onclick=()=>openM(k);c=cards[k]={e,q:s=>e.querySelector(s),prev:null};setTimeout(()=>e.classList.remove('new'),1000)}
 const e=c.e,rb=c.q('[data-r]'),pb=c.q('[data-p]');rb.className=cls(p.ret);pb.className=cls(p.pnl);count(rb,p.ret,v=>sg(v,2)+'%',180);count(pb,p.pnl,v=>sg(v,4)+' SOL',180);
 const mb=c.q('[data-m]');if(c.pm!=null&&p.mark!=null&&p.mark!==c.pm){mb.classList.remove('fu','fd');void mb.offsetWidth;mb.classList.add(p.mark>c.pm?'fu':'fd')}c.pm=p.mark;mb.textContent=fpx(p.mark);c.q('[data-k]').textContent=sg(p.peak,1)+'%';
 const isR=p.grp==='H'||p.runner!=null;c.q('[data-t]').innerHTML=TPS.map((t,i)=>`<span class="tg ${(p.tp||[]).includes(t)?'on':''}">TP${i+1}</span>`).join('')+(isR?`<span class="tg rn ${p.runner?'on':''}">${p.runner?'RUNNER ACTIF':'RUNNER ARMÉ'}</span>`:'');
 c.q('[data-b]').innerHTML=barHTML(p);const st=p.stop||{},sk=st.kind||'hard',sb=c.q('[data-s]');sb.className=sk==='trail'||sk==='breakeven'?'tr':sk==='runner'?'rn':'';sb.textContent=(SK[sk]||sk)+' '+sg(st.pct,1)+'%';
 if(c.prev!=null&&p.ret!=null&&c.prev!==p.ret)pulse(e,p.ret>c.prev);c.prev=p.ret;c.p=p;return e}
function paint(){if(!on)return;const ps=POS;$('lvn').textContent=ps.length;const n=$('tbn');n.textContent=ps.length;n.style.display=ps.length?'block':'none';
 const gs=['ALL',...new Set(ps.map(p=>p.grp))].sort((a,b)=>a==='ALL'?-1:b==='ALL'?1:a<b?-1:1);if(!gs.includes(flt))flt='ALL';
 const fh=gs.map(g=>`<button class="${g===flt?'on':''}" data-g="${g}">${g==='ALL'?'TOUS':g} ${g==='ALL'?ps.length:ps.filter(p=>p.grp===g).length}</button>`).join('');
 if($('lvflt')._h!==fh){$('lvflt').innerHTML=fh;$('lvflt')._h=fh;$('lvflt').querySelectorAll('button').forEach(b=>b.onclick=()=>{flt=b.dataset.g;paint()})}
 const V=ps.filter(p=>flt==='ALL'||p.grp===flt).sort((a,b)=>(b.ret??-1e9)-(a.ret??-1e9)),exp=V.reduce((s,p)=>s+(p.pnl||0),0);
 $('lvopen').innerHTML=`latent <span class="${cls(exp)}">${sg(exp,4)} SOL</span>`;const box=$('lvpos'),keep=new Set();
 if(!V.length)box.innerHTML='<div class="empty">AUCUNE POSITION OUVERTE</div>';else{const em=box.querySelector('.empty');if(em)em.remove()}
 V.forEach((p,i)=>{const e=card(p);keep.add(e.dataset.k);if(box.children[i]!==e)box.insertBefore(e,box.children[i]||null)});
 Object.keys(cards).forEach(k=>{if(!ps.some(p=>keyOf(p)===k)){cards[k].e.remove();delete cards[k]}else if(!keep.has(k))cards[k].e.remove()});
 feed();first=false}
function feed(){const T=(EV.length?EV:(D0?.trades||[])).slice(0,30),fe=$('lvfeed');
 const html=T.length?T.map(t=>{const k=Math.round(t.ts)+t.kind+t.grp+t.sym,nw=!first&&!seenF.has(k),en=t.kind==='entry';
  return`<div class="fr ${nw?'fx'+(en?'':' cl'):''}"><span class="t">${(t.t||'').slice(0,5)}</span><div class="gb ${t.grp}" style="width:20px;height:20px">${t.grp}</div>
  <div class="nm"><span class="k" style="color:${en?'#00ffcc':'#ff9cf0'}">${en?'ENTRÉE':'SORTIE'}</span> ${esc(t.sym)}<small>${esc(en?(t.sol||0).toFixed(3)+' SOL':(t.reason||''))}</small></div>
  <div class="v ${en?'fl':cls(t.pct)}">${en?'→':sg(t.pct,1)+'%'}${en?'':`<small>${sg(t.pnl,4)} SOL</small>`}</div></div>`}).join(''):'<div class="empty">AUCUN TRADE</div>';
 if(fe._h!==html){fe.innerHTML=html;fe._h=html}T.forEach(t=>seenF.add(Math.round(t.ts)+t.kind+t.grp+t.sym))}
/* ---------- groupes / jour (data.json) ---------- */
function day(d){D0=d;const G=d.groups||{},tot=Object.values(G).reduce((s,g)=>s+(g.pnl_today||0),0),te=$('lvtot');te.className='tot '+cls(tot);
 te.innerHTML='<span></span><small>SOL</small>';count(te.firstChild,tot,v=>sg(v,4));
 $('lvgr').innerHTML=Object.keys(G).sort().map(g=>{const x=G[g];return`<div class="grc ${g}"><b>${g}</b><span class="${cls(x.pnl_today)}">${sg(x.pnl_today,3)}</span><small data-gb="${g}">—</small><small>${x.closed_today||0} clôt. · ${x.wins_today||0} ✓ · ${x.open||0} ouv.</small></div>`}).join('');
 if(!live()){const lp=d.live||{};TPS=lp.tp_ladder||TPS;POS=lp.positions||[];const t=Date.now()/1000;POS.forEach(p=>{const k=keyOf(p),h=H[k]||(H[k]=[]);if(p.ret!=null)h.push([lp.ts||t,p.ret,p.mark])});paint()}}
async function loadD(){try{const r=await fetch('data.json?'+Date.now(),{cache:'no-store'});if(r.ok)day(await r.json())}catch(e){}}
let dN=0;setInterval(()=>{if(on&&(!live()||++dN%4===0))loadD()},15000);
/* ---------- flux temps réel ---------- */
const live=()=>Date.now()/1000-lastTick<6;
function tick(m){lastTick=Date.now()/1000;const p=POS.find(q=>q.k===m.k);if(!p)return;p.ret=+m.ret.toFixed(2);p.pnl=m.pnl;p.mark=m.px;p.peak=Math.max(p.peak||0,m.ret);
 const h=H[m.k]||(H[m.k]=[]);h.push([m.t,m.ret,m.px]);while(h.length&&h[0][0]<m.t-900)h.shift();LAT.push(Date.now()/1000-m.t);if(LAT.length>60)LAT.shift();DIRTY.add(m.k)}
const DIRTY=new Set();
function ingest(m){if(m.type==='px')return tick(m);if(m.type==='hello'){Object.entries(m.hist||{}).forEach(([k,h])=>H[k]=h.slice());if(m.events?.length)EV=m.events;return}
 lastTick=Date.now()/1000;TPS=m.tp_ladder||TPS;POS=m.pos||[];const ks=new Set();
 POS.forEach(p=>{const k=keyOf(p);ks.add(k);const h=H[k]||(H[k]=[]);if(p.ret!=null&&!h.length)h.push([m.ts,p.ret,p.mark]);while(h.length&&h[0][0]<m.ts-900)h.shift()});
 Object.keys(H).forEach(k=>{if(!ks.has(k))delete H[k]});
 if(m.ev?.length){const seen=new Set(EV.map(e=>e.ts+e.kind+e.sym));EV=m.ev.filter(e=>!seen.has(e.ts+e.kind+e.sym)).concat(EV).slice(0,40)}paint()}
let retry=0,rT=null,wsFail=0;function connect(){if(es)return;
 if(window.WebSocket&&wsFail<3){let w;try{w=new WebSocket(FEED.replace('https','wss')+'/ws')}catch(e){wsFail++;return connect()}es=w;let opened=false;
  w.onopen=()=>{opened=true;MODE='WS';retry=0;wsFail=0};w.onmessage=e=>{try{ingest(JSON.parse(e.data))}catch(x){}};
  w.onclose=()=>{es=null;if(!opened)wsFail++;MODE='';clearTimeout(rT);rT=setTimeout(connect,Math.min(30000,1000*2**retry++))};return}
 if(!window.EventSource)return;try{es=new EventSource(FEED+'/stream');MODE='SSE'}catch(e){return}
 es.onmessage=e=>{retry=0;try{ingest(JSON.parse(e.data))}catch(x){}};es.addEventListener('hello',e=>{try{ingest(JSON.parse(e.data))}catch(x){}});
 es.onerror=()=>{if(es.readyState===2){es=null;wsFail=0;clearTimeout(rT);rT=setTimeout(connect,Math.min(30000,2000*2**retry++))}}}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&es){es.close();es=null}else if(!document.hidden)connect()});
/* ---------- grand graphique ---------- */
function openM(k){sel=k;$('lvm').classList.add('on');drawM()}function closeM(){sel=null;$('lvm').classList.remove('on')}
$('mX').onclick=closeM;$('mT').querySelectorAll('button').forEach(b=>b.onclick=()=>{TF=+b.dataset.t;$('mT').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))});$('lvm').onclick=e=>{if(e.target.id==='lvm')closeM()};
function drawM(){const c=sel&&cards[sel];if(!c){if(sel)closeM();return}const p=c.p;$('mS').textContent=p.grp+' · '+p.sym;$('mM').textContent=`${p.mint} · entrée ${p.t||''} à ${fpx(p.entry)} · actuel ${fpx(p.mark)} · pic ${sg(p.peak,1)}%`;
 const r=$('mR');r.className=cls(p.ret);r.textContent=sg(p.ret,2)+'%';const pp=$('mP');pp.className=cls(p.pnl);pp.textContent=sg(p.pnl,4)+' SOL';
 const cv=$('mC'),w=cv.parentElement.clientWidth-24;if(TF)candles(cv,H[sel],w,260,TF,p);else chart(cv,H[sel],w,260,{big:1,span:900,levels:[{v:0,c:'#ffffff66',t:'ENTRÉE'},{v:p.stop?.pct,c:'#ff4d7d',t:'STOP'},...TPS.map((t,i)=>({v:t,c:(p.tp||[]).includes(t)?'#2bffb0':'#ffd166',t:'TP'+(i+1)}))].filter(l=>l.v!=null&&l.v<=Math.max(p.peak||0,p.ret||0)+40)});
 $('mL').innerHTML=`<span>STOP <b>${(SK[p.stop?.kind]||'')} ${sg(p.stop?.pct,1)}%</b></span><span>15 MIN · ${(H[sel]||[]).length} PTS</span>`}
function candles(cv,h,w,hh,tf,p){const r=devicePixelRatio||1;if(cv.width!==w*r){cv.width=w*r;cv.height=hh*r}const x=cv.getContext('2d');x.setTransform(r,0,0,r,0,0);x.clearRect(0,0,w,hh);
 const C=[];(h||[]).forEach(([t,v])=>{const b=Math.floor(t/tf)*tf,l=C[C.length-1];if(l&&l.b===b){l.h=Math.max(l.h,v);l.l=Math.min(l.l,v);l.c=v}else C.push({b,o:l?l.c:v,h:v,l:v,c:v})});
 const n=Math.max(12,Math.floor((w-44)/9)),V=C.slice(-n);if(!V.length)return;let mn=Math.min(0,...V.map(c=>c.l)),mx=Math.max(0,...V.map(c=>c.h));const pad=(mx-mn)*.1||1;mn-=pad;mx+=pad;
 const Y=v=>hh-4-(v-mn)/(mx-mn)*(hh-8),cw=(w-44)/n;x.strokeStyle='#ffffff22';x.setLineDash([2,3]);[0,p.stop?.pct].forEach(v=>{if(v==null||v<mn||v>mx)return;x.beginPath();x.moveTo(0,Y(v));x.lineTo(w-44,Y(v));x.stroke()});x.setLineDash([]);
 V.forEach((c,i)=>{const up=c.c>=c.o,col=up?'#2bffb0':'#ff4d7d',cx=i*cw+cw/2;x.strokeStyle=col;x.fillStyle=col;x.shadowColor=col;x.shadowBlur=i===V.length-1?10:0;
  x.beginPath();x.moveTo(cx,Y(c.h));x.lineTo(cx,Y(c.l));x.stroke();const y1=Y(Math.max(c.o,c.c)),y2=Y(Math.min(c.o,c.c));x.fillRect(cx-cw*.35,y1,cw*.7,Math.max(1.5,y2-y1))});x.shadowBlur=0;
 const last=V[V.length-1].c;x.fillStyle=last>=0?'#2bffb0':'#ff4d7d';x.fillRect(w-44,Y(last)-8,44,16);x.fillStyle='#06110f';x.font='700 9px JBM,monospace';x.fillText(sg(last,2)+'%',w-42,Y(last)+3)}
/* ---------- boucle d'affichage (~15 i/s, seulement si l'écran est visible) ---------- */
let lastF=0;(function loop(t){requestAnimationFrame(loop);if(!on||document.hidden||t-lastF<33)return;lastF=t;if(DIRTY.size){DIRTY.forEach(k=>{const p=POS.find(q=>keyOf(q)===k);if(p&&cards[k])card(p)});DIRTY.clear()}
 const L=live(),a=Math.max(0,Date.now()/1000-(L?lastTick:(D0?.live?.ts||D0?.updated_ts||0)));$('lvdot').classList.toggle('stale',!L);
 const st=$('lvst');st.textContent=L?'LIVE '+(MODE||''):'DIFFÉRÉ';st.className='lvst '+(L?'ok':'ko');
 const lm=LAT.length?[...LAT].sort((a,b)=>a-b)[LAT.length>>1]:null;$('lvage').textContent=L?`tick il y a ${a.toFixed(1)} s${lm!=null?` · latence ${Math.max(0,Math.round(lm*1000))} ms`:''}`:`MAJ ${D0?.updated||'—'} · il y a ${a<90?Math.round(a)+' s':Math.round(a/60)+' min'} · reconnexion…`;
 Object.entries(cards).forEach(([k,c])=>{if(c.e.isConnected)chart(c.q('.spk'),H[k],96,30,{span:900})});if(sel)drawM()})(0);
/* ---------- v19 : solde = capital + réalisé (data.json) + latent (flux temps réel) ---------- */
const CAP=10;function bal(){const G=D0?.groups;if(!G)return null;const lat={};POS.forEach(p=>{lat[p.grp]=(lat[p.grp]||0)+(p.pnl||0)});
 const per={};let tot=0,rz=0,lt=0;Object.keys(G).forEach(g=>{const r=G[g].pnl||0,l=lat[g]||0,b=CAP+r+l;per[g]={b,r,l};tot+=b;rz+=r;lt+=l});return{per,tot,rz,lt,n:Object.keys(G).length}}
(function(){const pf=document.getElementById('pnlpct');if(pf){const e=document.createElement('div');e.id='balE';e.className='sub';e.style.cssText='margin-top:4px;font-variant-numeric:tabular-nums';pf.after(e)}})();
setInterval(()=>{const B=bal();if(!B)return;const f=v=>v.toFixed(4);
 const e=document.getElementById('balE');if(e){const a=B.per.A||{b:CAP,r:0,l:0};e.innerHTML=`SOLDE A (réalisé+latent) <b class="${cls(a.b-CAP)}">${f(a.b)}</b> · TOTAL ${B.n} GROUPES <b class="${cls(B.tot-B.n*CAP)}">${f(B.tot)}</b> SOL${live()?' <span style="color:#2bffb0">● LIVE</span>':''}`}
 if(!on)return;const lb=$('lvbal');lb.className='tot '+cls(B.tot-B.n*CAP);count(lb,B.tot,v=>v.toFixed(4)+' SOL',300);
 $('lvbal2').innerHTML=`capital ${B.n}×${CAP} · réalisé <span class="${cls(B.rz)}">${sg(B.rz,4)}</span> · latent <span class="${cls(B.lt)}">${sg(B.lt,4)}</span>`;
 document.querySelectorAll('[data-gb]').forEach(x=>{const p=B.per[x.dataset.gb];if(p){x.textContent='= '+p.b.toFixed(3)+' SOL';x.style.color='#cfc8da'}})},500);
loadD();if(location.hash==='#live')show(true);else connect();
})();
