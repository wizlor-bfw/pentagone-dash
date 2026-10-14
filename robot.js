/* PENTAGONE v20 · ROBOT ANALYSTE J — lit data.json (J_tendances), anime 5 écrans + flux vers PENTAGONE. Papier. */
(function(){
const grid=document.querySelector('main.grid');if(!grid)return;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sec=document.createElement('section');sec.className='p rb';sec.innerHTML=`<h2>J · ROBOT ANALYSTE <em>/ X + ACTUS + PUMP.FUN + DEXSCREENER → PENTAGONE · PAPIER</em><span class="r" id="rbst">…</span></h2>
<div class="rbw" id="rbw"><canvas class="rbfx" id="rbfx"></canvas><div class="rbmons">
<div class="rbm"><div class="h"><span>▣ X · POSTS LUS</span><span id="rbxn">—</span></div><div class="b"><div class="rbroll" id="rbx">—</div></div></div>
<div class="rbm pk"><div class="h"><span>▣ SIGNAUX J</span><span id="rbsn">—</span></div><div class="b" id="rbs">—</div></div>
<div class="rbm"><div class="h"><span>▣ SOURCES 24H</span><span>MENTIONS</span></div><div class="b" id="rbsrc">—</div></div>
<div class="rbm"><div class="h"><span>▣ BUDGET X</span><span>PLAFOND 2 $</span></div><div class="b" id="rbbud">—</div></div>
<div class="rbm pk"><div class="h"><span>▣ DÉCISIONS 24H</span><span id="rbdn">—</span></div><div class="b" id="rbdec">—</div></div>
</div><div class="rbstage"><svg class="robot" id="rbbot" viewBox="0 0 260 200" aria-hidden="true">
<defs><linearGradient id="rbg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3a2a4e"/><stop offset="1" stop-color="#1b1226"/></linearGradient></defs>
<rect x="20" y="168" width="220" height="10" rx="2" fill="#2a1b38" stroke="#00ffcc44"/><rect x="40" y="178" width="8" height="22" fill="#1b1226"/><rect x="212" y="178" width="8" height="22" fill="#1b1226"/>
<rect x="150" y="150" width="60" height="18" rx="2" fill="#120a1a" stroke="#00ffcc66"/><g fill="#00ffcc55"><rect x="154" y="154" width="6" height="3"/><rect x="163" y="154" width="6" height="3"/><rect x="172" y="154" width="6" height="3"/><rect x="181" y="154" width="6" height="3"/><rect x="190" y="154" width="6" height="3"/><rect x="158" y="160" width="40" height="3"/></g>
<rect x="66" y="152" width="44" height="16" rx="2" fill="#120a1a" stroke="#ff2a8566"/><rect x="72" y="156" width="20" height="2" fill="#ff2a85aa"/><rect x="72" y="161" width="30" height="2" fill="#ff2a8566"/>
<rect x="108" y="118" width="44" height="50" rx="8" fill="url(#rbg)" stroke="#00ffcc55"/><circle cx="130" cy="140" r="6" fill="#00ffcc" opacity=".8"><animate attributeName="opacity" values=".3;1;.3" dur="1.6s" repeatCount="indefinite"/></circle>
<g class="armL"><path d="M110 128 Q90 140 96 156" stroke="#5b4a70" stroke-width="7" fill="none" stroke-linecap="round"/></g>
<g class="armR"><path d="M150 128 Q170 140 172 152" stroke="#5b4a70" stroke-width="7" fill="none" stroke-linecap="round"/></g>
<g class="head"><rect x="104" y="78" width="52" height="40" rx="10" fill="url(#rbg)" stroke="#00ffcc88"/><rect x="110" y="86" width="40" height="20" rx="5" fill="#02130f"/>
<rect class="eye" x="117" y="92" width="8" height="8" rx="2" fill="#00ffcc"/><rect class="eye" x="135" y="92" width="8" height="8" rx="2" fill="#00ffcc"/>
<line x1="130" y1="78" x2="130" y2="64" stroke="#5b4a70" stroke-width="3"/><circle class="ant" cx="130" cy="61" r="4" fill="#00ffcc"/>
<rect x="98" y="90" width="6" height="14" rx="2" fill="#5b4a70"/><rect x="156" y="90" width="6" height="14" rx="2" fill="#5b4a70"/></g>
<rect x="118" y="116" width="24" height="4" fill="#5b4a70"/></svg>
<div class="rbnode" id="rbnode"><svg viewBox="0 0 100 100"><polygon points="50,4 94,36 77,90 23,90 6,36" fill="none" stroke="#ff2a85" stroke-width="1.5"/><polygon points="50,16 82,39 70,80 30,80 18,39" fill="#ff2a8510" stroke="#ff2a8566" stroke-dasharray="3 3"/></svg><div class="pulse"></div><span>PENTAGONE</span></div></div>
<div class="rbft"><span>SIMULATION PAPIER · AUCUN ARGENT RÉEL · TEXTES TRONQUÉS · ADRESSES TRONQUÉES</span><span>MAJ <b id="rbupd">—</b> (PARIS)</span></div></div>`;
const net=grid.querySelector('section.net');net&&net.nextSibling?grid.insertBefore(sec,net.nextSibling):grid.appendChild(sec);
const $=id=>document.getElementById(id);
const SRC={x:'X',pump_trade:'PUMP TRADES',pump_live:'PUMP LIVE',ds_profile:'DEX PROFIL',ds_boost:'DEX BOOST',ds_boost_top:'DEX TOP',news:'ACTUS',gnews:'ACTUS',trends:'TRENDS',gtrends:'TRENDS'};
let act=1,pris=0;
function render(d){const J=d&&d.J_tendances;if(!J){$('rbst').textContent='J HORS LIGNE';return}
 const P=J.x_posts||[];$('rbxn').textContent=P.length?P.length+' DERNIERS':'0';
 const ph=P.length?P.map(p=>`<div class="rbp"><i>@${esc(p.author)}</i> <s>${esc(p.t)} · ♥${p.likes|0} ⟲${p.reposts|0}</s><br>${esc(p.text)}</div>`).join(''):'<div class="rbp">En attente des premiers posts X…</div>';
 $('rbx').innerHTML=P.length>2?ph+ph:ph;$('rbx').style.animation=P.length>2?'':'none';
 const S=J.derniers||[];$('rbsn').textContent=S.length+' RÉCENTS';
 $('rbs').innerHTML=S.slice(0,9).map(s=>`<div class="rbs"><span>${esc(s.t)}</span><b>${esc((s.sym||'?').slice(0,10))}</b><span>${s.score??'—'}</span><span class="${s.decision==='pris'?'ok':'ko'}">${s.decision==='pris'?'PRIS':'REFUS'}</span><span class="r">${esc(s.raison||'')}</span></div>`).join('')||'Aucun signal';
 const so={};for(const[k,v]of Object.entries(J.sources||{})){const n=SRC[k]||k.toUpperCase();so[n]=(so[n]||0)+v}
 const mx=Math.max(1,...Object.values(so));$('rbsrc').innerHTML=Object.entries(so).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([k,v])=>`<div class="rbbar"><span>${esc(k)}</span><div><b style="width:${100*v/mx}%"></b></div><em>${v}</em></div>`).join('')||'—';
 const X=J.x_stats;if(X){const u=X.usd_est||0,c=X.cap_usd||2;$('rbbud').innerHTML=`<div class="rbbig">${(X.posts|0)} posts</div><div>lus aujourd'hui (${esc(X.day||'')})</div><div class="rbbar"><span>≈ ${u.toFixed(2)} $</span><div><b style="width:${Math.min(100,100*u/c)}%"></b></div><em>${Math.round(100*u/c)}%</em></div><div>requêtes ${X.polls|0} · échecs ${X.fails|0}</div>${X.lus!=null?`<div>lus ${X.lus|0} · <b style="color:#7CFFB2">retenus ${X.retenus|0}</b> (≥${Math.round((X.min_vues||20000)/1000)}k vues) · rejetés ${Object.values(X.rejets||{}).reduce((a,b)=>a+b,0)}</div>`:''}<div style="color:#827b8a">estimation 0,005 $/post</div>`}
 else $('rbbud').innerHTML='<div class="rbbig">—</div><div>X pas encore branché</div>';
 pris=J.pris|0;const rf=J.refus|0;$('rbdn').textContent=pris+' / '+(pris+rf);
 $('rbdec').innerHTML=`<div><span class="rbbig" style="color:#00ffcc">${pris}</span> pris · <span class="rbbig" style="color:#ff2a85">${rf}</span> refusés</div>`+Object.entries(J.motifs||{}).slice(0,5).map(([k,v])=>`<div class="rbs"><span class="ko">${v}×</span><span class="r">${esc(k)}</span></div>`).join('');
 act=Math.min(4,1+(P.length+S.length)/10);$('rbst').textContent='● ANALYSE EN COURS';$('rbupd').textContent=d.updated||'—'}
function load(){fetch('data.json?'+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(render).catch(()=>{$('rbst').textContent='DONNÉES INDISPONIBLES'})}
load();setInterval(load,30000);
/* flux de données : écrans → tête du robot → PENTAGONE */
const cv=$('rbfx'),w=$('rbw'),x=cv.getContext('2d');let W=0,H=0,pts=[],srcs=[],hd=[0,0],nd=[0,0],vis=true,last=0,run=false;
function lay(){const r=w.getBoundingClientRect(),dp=Math.min(devicePixelRatio||1,1.5);W=r.width;H=r.height;cv.width=W*dp;cv.height=H*dp;x.setTransform(dp,0,0,dp,0,0);
 srcs=[...w.querySelectorAll('.rbm')].map(m=>{const b=m.getBoundingClientRect();return[b.left-r.left+b.width/2,b.bottom-r.top]});
 const bb=$('rbbot').getBoundingClientRect();hd=[bb.left-r.left+bb.width*.5,bb.top-r.top+bb.height*.45];
 const nb=$('rbnode').getBoundingClientRect();nd=[nb.left-r.left+nb.width/2,nb.top-r.top+nb.height/2]}
function spawn(){const s=srcs[(Math.random()*srcs.length)|0];if(!s)return;pts.push({a:s,b:hd,c:nd,t:0,v:.006+Math.random()*.006,pk:Math.random()<.12+pris*.02})}
function frame(ts){if(!vis){run=false;return}const dt=Math.min(50,ts-last||16);last=ts;
 if(Math.random()<.12*act*dt/16)spawn();x.clearRect(0,0,W,H);x.lineWidth=1;
 for(const s of srcs){x.strokeStyle='#00ffcc12';x.beginPath();x.moveTo(s[0],s[1]);x.quadraticCurveTo(s[0],hd[1],hd[0],hd[1]);x.stroke()}
 x.strokeStyle='#ff2a8526';x.setLineDash([4,6]);x.lineDashOffset=-ts/40;x.beginPath();x.moveTo(hd[0],hd[1]);x.quadraticCurveTo((hd[0]+nd[0])/2,hd[1]-40,nd[0],nd[1]);x.stroke();x.setLineDash([]);
 pts=pts.filter(p=>{p.t+=p.v*dt/16;if(p.t>=2)return false;let X_,Y_;
  if(p.t<1){const t=p.t,u=1-t,cx=p.a[0],cy=p.b[1];X_=u*u*p.a[0]+2*u*t*cx+t*t*p.b[0];Y_=u*u*p.a[1]+2*u*t*cy+t*t*p.b[1]}
  else{const t=p.t-1,u=1-t,cx=(p.b[0]+p.c[0])/2,cy=p.b[1]-40;X_=u*u*p.b[0]+2*u*t*cx+t*t*p.c[0];Y_=u*u*p.b[1]+2*u*t*cy+t*t*p.c[1]}
  x.fillStyle=p.t>1&&p.pk?'#ff2a85':'#00ffcc';x.globalAlpha=.9;x.fillRect(X_-1.5,Y_-1.5,3,3);x.globalAlpha=.25;x.fillRect(X_-3,Y_-3,6,6);x.globalAlpha=1;return true});
 requestAnimationFrame(frame)}
function start(){if(!run&&vis){run=true;last=0;requestAnimationFrame(frame)}}
addEventListener('resize',lay);setTimeout(()=>{lay();start()},300);
if('ResizeObserver'in window)new ResizeObserver(lay).observe(w);
if('IntersectionObserver'in window)new IntersectionObserver(e=>{vis=e[0].isIntersecting&&!document.hidden;start()}).observe(w);
document.addEventListener('visibilitychange',()=>{vis=!document.hidden;start()});
})();
