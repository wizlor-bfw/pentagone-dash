(()=>{'use strict';
const COL={TRADING:'#00FFCC',POLYMARKET:'#B78CFF',BRIEFS:'#FFC94D',DRIVE:'#4DA6FF',ROUTINES:'#7CFF6B','DÉCISIONS':'#FF2A85',AGENTS:'#FF8A3D',INBOX:'#FF4DF0'};
const LOBE={'DÉCISIONS':'DÉCISIONS',ROUTINES:'ROUTINES',BRIEFS:'BRIEFS',TRADING:'TRADING',POLYMARKET:'POLYMARKET',DRIVE:'DRIVE',AGENTS:'AGENTS',INBOX:'IA EXT.'};
const REG=['TRADING','POLYMARKET','BRIEFS','DRIVE','ROUTINES','DÉCISIONS','AGENTS'];
const $=id=>document.getElementById(id), T0=Date.now(), MOB=matchMedia('(max-width:700px)').matches;
let D=null, seen=new Set(), shown=0, queue=[], parts=[], tab='rules.md', first=true;
const cv=$('cv'), cx=cv.getContext('2d'); let W=0,H=0,DPR=1;
function rs(){DPR=Math.min(MOB?1.5:2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;cx.setTransform(DPR,0,0,DPR,0,0)}
addEventListener('resize',rs);rs();
// ===== modèle anatomique (Grab3D Human Brain, CC0) : nuage WebGL + fil de fer clairsemé
let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
const RG=['TRADING','POLYMARKET','BRIEFS','DRIVE','ROUTINES','DÉCISIONS','AGENTS','INBOX'];
const P=[],slot={},CEN={};let PATHS=[],READY=false,GL=null;RG.forEach(r=>slot[r]=[]);
let ang=0.6,tilt=.32;const act={};
const SC=()=>Math.min(W*.36,H*.4);
function proj(p){const c=Math.cos(ang),sn=Math.sin(ang);let x=p.x*c+p.z*sn,z=-p.x*sn+p.z*c,y=p.y;
 const ct=Math.cos(tilt),st=Math.sin(tilt);const y2=y*ct-z*st;z=y*st+z*ct;const f=2.8/(2.8+z),sc=SC();return [W/2+x*f*sc,H*.5-y2*f*sc,f,z]}
function along(pa,k){const q=pa.pts,n=q.length-1,u=Math.max(0,Math.min(1,k))*n,i=Math.min(n-1,Math.floor(u)),t=u-i,A=q[i],B=q[i+1]||A;return {x:A[0]+(B[0]-A[0])*t,y:A[1]+(B[1]-A[1])*t,z:A[2]+(B[2]-A[2])*t}}
const VS=`attribute vec3 p;attribute float r;uniform float ang,tilt,sc,dpr,tm;uniform vec2 wh;uniform vec3 col[8];uniform float act[8];uniform float lines;varying vec4 vc;
float hash(vec3 q){return fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453);}
void main(){float c=cos(ang),s=sin(ang);vec3 q=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);float ct=cos(tilt),st=sin(tilt);float y2=q.y*ct-q.z*st;float z=q.y*st+q.z*ct;
 float f=2.8/(2.8+z);vec2 sp=vec2(wh.x*.5+q.x*f*sc,wh.y*.5-y2*f*sc);gl_Position=vec4(sp.x/wh.x*2.-1.,1.-sp.y/wh.y*2.,z*.1,1.);
 int ri=int(r+.5);vec3 rc=col[0];float a=act[0];for(int i=0;i<8;i++){if(i==ri){rc=col[i];a=act[i];}}
 float h=hash(p);float depth=.35+.65*clamp((1.-z)*.5,0.,1.);float tw=step(.985,h)*(.6+.4*sin(tm*2.+h*80.));
 vec3 base=mix(vec3(.82,.84,.9),rc,.32+.35*a);
 if(lines>.5){vc=vec4(mix(vec3(.7,.75,.85),rc,.35)*depth,.11+.1*a);}else{vc=vec4(base*depth*(.55+.25*a)+vec3(tw),1.);}
 gl_PointSize=(1.3+tw*2.2)*f*dpr;}`;
const FS=`precision mediump float;varying vec4 vc;void main(){gl_FragColor=vec4(vc.rgb*vc.a,vc.a);}`;
async function loadModel(){const [meta,buf]=await Promise.all([fetch('brain_model.json').then(r=>r.json()),fetch('brain_model.bin').then(r=>r.arrayBuffer())]);
 const n=meta.n,pos=new Int16Array(buf,0,n*3),reg=new Uint8Array(buf,n*6,n),off=n*6+n+((n*7)%2),edg=new Uint16Array(buf,off,meta.edges*2);
 for(let i=0;i<meta.cloud;i+=7){const p={x:pos[i*3]/32767,y:pos[i*3+1]/32767,z:pos[i*3+2]/32767,r:RG[reg[i]],b:rnd()};P.push(p);slot[p.r].push(p)}
 for(const k in meta.centers){const c=meta.centers[k];CEN[k]={x:c[0],y:c[1],z:c[2]}}
 PATHS=meta.paths.map(p=>({a:p.a,b:p.b,pts:p.p}));
 const g=gcv.getContext('webgl',{antialias:false,premultipliedAlpha:true,alpha:true});if(!g){READY=true;return}
 const sh=(t,src)=>{const o=g.createShader(t);g.shaderSource(o,src);g.compileShader(o);if(!g.getShaderParameter(o,g.COMPILE_STATUS))throw g.getShaderInfoLog(o);return o};
 const pr=g.createProgram();g.attachShader(pr,sh(g.VERTEX_SHADER,VS));g.attachShader(pr,sh(g.FRAGMENT_SHADER,FS));g.linkProgram(pr);g.useProgram(pr);
 const b1=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b1);g.bufferData(g.ARRAY_BUFFER,pos,g.STATIC_DRAW);const lp=g.getAttribLocation(pr,'p');g.enableVertexAttribArray(lp);g.vertexAttribPointer(lp,3,g.SHORT,true,0,0);
 const rf=new Float32Array(reg);const b2=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b2);g.bufferData(g.ARRAY_BUFFER,rf,g.STATIC_DRAW);const lr=g.getAttribLocation(pr,'r');g.enableVertexAttribArray(lr);g.vertexAttribPointer(lr,1,g.FLOAT,false,0,0);
 const eb=g.createBuffer();g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,eb);g.bufferData(g.ELEMENT_ARRAY_BUFFER,edg,g.STATIC_DRAW);
 const U={};['ang','tilt','sc','dpr','tm','wh','lines'].forEach(k=>U[k]=g.getUniformLocation(pr,k));
 const cols=[];RG.forEach(r=>{const h=COL[r];cols.push(...[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255))});g.uniform3fv(g.getUniformLocation(pr,'col'),new Float32Array(cols));
 g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE);
 GL={g,U,act:g.getUniformLocation(pr,'act'),cloud:MOB?Math.floor(meta.cloud*.45):meta.cloud,edges:meta.edges*2};READY=true}
function drawGL(t){if(!GL)return;const {g,U}=GL;g.viewport(0,0,gcv.width,gcv.height);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);
 g.uniform1f(U.ang,ang);g.uniform1f(U.tilt,tilt);g.uniform1f(U.sc,SC());g.uniform1f(U.dpr,DPR);g.uniform1f(U.tm,t/1000);g.uniform2f(U.wh,W,H);
 g.uniform1fv(GL.act,new Float32Array(RG.map(r=>act[r]||0)));
 g.uniform1f(U.lines,1);g.drawElements(g.LINES,GL.edges,g.UNSIGNED_SHORT,0);g.uniform1f(U.lines,0);g.drawArrays(g.POINTS,0,GL.cloud)}
const gcv=$('gl');function rs2(){gcv.width=cv.clientWidth*DPR;gcv.height=cv.clientHeight*DPR}addEventListener('resize',rs2);rs2();
loadModel().catch(e=>{console.error(e);READY=true});
const flows=[],bolts=[];let lastFlow=0;
function spawnFlow(path,strong,col){flows.push({path,t0:performance.now(),dur:(strong?900:1600)+rnd()*800,dir:rnd()<.5,col:col||COL[path.b]||COL[path.a],strong})}
function frame(){const t=performance.now();ang+=.003;cx.clearRect(0,0,W,H);if(!READY){requestAnimationFrame(frame);return}
 const c=Math.cos(ang),sn=Math.sin(ang);
 cx.globalCompositeOperation='lighter';
 drawGL(t);
 // faisceaux + influx
 const base=MOB?2:3,intens=Object.values(act).reduce((a,b)=>a+b,0);
 if(PATHS.length&&t-lastFlow>Math.max(90,450-intens*60)){lastFlow=t;const pa=PATHS[Math.floor(rnd()*PATHS.length)];spawnFlow(pa,(act[pa.a]||0)+(act[pa.b]||0)>.6);if(rnd()<.08+intens*.03)bolts.push({path:pa,t0:t,seed:rnd()*99})}
 cx.lineWidth=.6;for(const pa of PATHS){cx.strokeStyle=hexA(COL[pa.b]||COL[pa.a],.07+.1*((act[pa.a]||0)+(act[pa.b]||0)));cx.beginPath();for(let k=0;k<=12;k++){const q=proj(along(pa,k/12));k?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1])}cx.stroke()}
 for(let i=flows.length-1;i>=0;i--){const fl=flows[i];let k=(t-fl.t0)/fl.dur;if(k>=1){flows.splice(i,1);continue}if(fl.dir)k=1-k;
  for(let j=0;j<5;j++){const kk=Math.max(0,Math.min(1,k-(fl.dir?-1:1)*j*.025));const q=proj(along(fl.path,kk));cx.fillStyle=hexA(fl.col,(fl.strong?.9:.55)*(1-j/5));cx.beginPath();cx.arc(q[0],q[1],(fl.strong?2.6:1.8)*(1-j/6),0,7);cx.fill()}}
 for(let i=bolts.length-1;i>=0;i--){const b=bolts[i],age=(t-b.t0)/260;if(age>1){bolts.splice(i,1);continue}cx.strokeStyle=hexA('#E8FFFF',.9*(1-age));cx.lineWidth=1.2;cx.beginPath();
  for(let k=0;k<=10;k++){const q=proj(along(b.path,k/10));const j=k&&k<10?(Math.sin(b.seed+k*7.3)*6):0;k?cx.lineTo(q[0]+j,q[1]-j*.6):cx.moveTo(q[0],q[1])}cx.stroke()}
 // nœuds réels allumés
 for(const n of lit){const [X,Y,f]=proj(n.p);const age=(t-n.t0)/1000,pulse=.6+.4*Math.sin(t/300+n.p.b*20);const r=(1.5+Math.max(0,3-age*2))*f;
  cx.fillStyle=n.ext?COL.INBOX:COL[n.r];cx.globalAlpha=.18*pulse;cx.beginPath();cx.arc(X,Y,r*1.8,0,7);cx.fill();cx.globalAlpha=.95;cx.beginPath();cx.arc(X,Y,r*.7,0,7);cx.fill();cx.globalAlpha=1}
 cx.lineWidth=.5;for(let i=Math.max(1,lit.length-40);i<lit.length;i++){const A0=lit[i],B0=lit[i-1];if(A0.r!==B0.r)continue;const A=proj(A0.p),B=proj(B0.p);cx.strokeStyle=hexA(COL[A0.r],.35);cx.beginPath();cx.moveTo(A[0],A[1]);cx.lineTo(B[0],B[1]);cx.stroke()}
 // particules d'ingestion (normales : du haut ; IA externe : remonte le tronc + spirale)
 parts=parts.filter(q=>{const k=Math.min(1,(t-q.t0)/(q.ext?2200:900));const [X,Y]=proj(q.p);let x,y;
  if(q.ext){const S=proj({x:CEN.INBOX.x,y:CEN.INBOX.y-.25,z:CEN.INBOX.z});const sp=(1-k)*28;x=S[0]+(X-S[0])*k+Math.cos(k*18)*sp;y=S[1]+(Y-S[1])*k+Math.sin(k*18)*sp;
   cx.strokeStyle=hexA(COL.INBOX,.8*(1-k));cx.lineWidth=1.5;cx.beginPath();cx.arc(x,y,6+18*k,0,7);cx.stroke();
   cx.globalCompositeOperation='source-over';cx.fillStyle=COL.INBOX;cx.font='bold 10px JBM,monospace';cx.fillText('IA EXTERNE · '+q.n.src,x+10,y-8);cx.globalCompositeOperation='lighter'}
  else{x=W/2+(X-W/2)*k;y=-10+(Y+10)*k*k}
  cx.fillStyle=q.ext?COL.INBOX:COL[q.r];cx.beginPath();cx.arc(x,y,q.ext?3.5:2.5,0,7);cx.fill();
  if(k>=1){lit.push({p:q.p,r:q.r,t0:t,ext:q.ext});if(lit.length>400)lit.shift();if(!q.rep)done(q.n);return false}return true});
 cx.globalCompositeOperation='source-over';
 // étiquettes de lobes
 cx.font=(MOB?'9':'10')+'px JBM,monospace';for(const r of [...REG,'INBOX']){const q=proj({x:CEN[r].x,y:CEN[r].y+(r==='AGENTS'?-.05:0),z:CEN[r].z+.2});cx.fillStyle=hexA(COL[r],.85);cx.fillText(LOBE[r],q[0]-24,q[1])}
 requestAnimationFrame(frame)}
const HX={};function hexA(h,a){let v=HX[h];if(!v){v=HX[h]=[1,3,5].map(i=>parseInt(h.substr(i,2),16))}return `rgba(${v[0]},${v[1]},${v[2]},${Math.max(0,Math.min(1,a)).toFixed(3)})`}
const lit=[];requestAnimationFrame(frame);
// ===== ingestion
const used={};function pick(r){const arr=(slot[r]&&slot[r].length)?slot[r]:slot.TRADING;used[r]=(used[r]||0);const p=arr[(used[r]*37)%arr.length];used[r]++;return p}
const live={};REG.forEach(r=>live[r]=0);
function pathTo(r){return PATHS.filter(p=>p.a===r||p.b===r)}
function ingest(n,rep){const ext=n.k==='ext';
 op((rep?'replay ':'')+(ext?'ingest IA externe ['+n.src+']':'read  '+n.s)+' → '+n.r,ext?'x':'r');
 parts.push({p:pick(n.r),r:n.r,n,t0:performance.now(),ext,rep});
 pathTo(n.r).forEach(pa=>spawnFlow(pa,true,ext?COL.INBOX:null));if(ext)PATHS.filter(p=>p.a==='INBOX').forEach(pa=>spawnFlow(pa,true,COL.INBOX));
 if(rep)logl(n,true)}
function done(n){live[n.r]=(live[n.r]||0)+1;shown++;logl(n);op('write '+n.r.toLowerCase()+'/ +1','w');bars()}
let lastRep=0;
function tick(){if(!READY){setTimeout(tick,200);return}if(queue.length)ingest(queue.shift());
 else if(D&&Date.now()-lastRep>1800){lastRep=Date.now();const rec=D.nodes.filter(n=>n.ts).slice(-60);if(rec.length)ingest(rec[Math.floor(rnd()*rec.length)],true)}
 setTimeout(tick,queue.length>40?60:queue.length?220:400)}tick();
const ops=[];function op(s,c){ops.push([s,c]);if(ops.length>6)ops.shift();$('ops').innerHTML=ops.map(o=>`<div class="op-${o[1]}">$ ${esc(o[0])}</div>`).join('');$('opsn').textContent=queue.length?queue.length+' en file':'flux continu'}
function logl(n,rep){const d=document.createElement('div');const h=n.ts?new Date(n.ts*1000).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
 const c=n.k==='ext'?COL.INBOX:COL[n.r];
 d.innerHTML=`<span>${h}</span> ${rep?'<i class="rep">replay</i> ':''}${n.k==='ext'?`<i class="ext">IA·${esc(n.src)}</i> `:''}<b style="color:${c}">[${n.r}]</b> ${esc(n.t)}`;const L=$('log');L.appendChild(d);while(L.children.length>30)L.firstChild.remove()}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function bars(){if(!D)return;const tot=D.total||1;
 $('regions').innerHTML=REG.map(r=>{const pct=100*(live[r]||0)/tot;return `<div class="reg" style="color:${COL[r]}"><span>${r}</span><div class="bar"><i style="width:${pct.toFixed(1)}%"></i></div><b>${live[r]||0}</b></div>`}).join('');
 const p=100*shown/tot;$('totfill').style.width=Math.min(100,p)+'%';$('totpct').textContent=Math.min(100,Math.round(p))+'%';$('tot').textContent=shown+'/'+D.total;const ns=$('nstat');if(ns)ns.textContent=shown;const L=$('logn');if(L)L.textContent=shown}
function md(){const d=D;return{
 'rules.md':'# rules.md\n'+d.rules.map(r=>'- '+r).join('\n'),
 'routines.md':'# routines.md\n'+d.routines.map(r=>'- '+r).join('\n')+'\n\n(heure de Paris)',
 'projects/':'# projects/\n'+d.nodes.filter(n=>n.k==='doc').map(n=>'- ['+n.r+'] '+n.t).join('\n'),
 'inbox/':'# inbox/ — notes des IA externes\n'+(d.nodes.filter(n=>n.k==='ext').map(n=>'- ['+n.src+' · '+n.ty+' · '+n.r+'] '+n.t+(n.d?'\n  '+n.d:'')+(n.l?'\n  lien : '+n.l:'')).join('\n')||'(vide)'),
 'attention.md':'# attention.md\n'+d.attention.map(a=>'- [ ] '+a).join('\n'),
 'notes.md':'# notes.md — décisions\n'+d.decisions.map(a=>'- '+a).join('\n')}}
function paint(){const d=D;$('rules').innerHTML=d.rules.map(r=>`<li>${esc(r)}</li>`).join('');
 $('note').textContent=d.note;$('upd').textContent=d.generated;
 $('agents').innerHTML=d.agents.map(a=>`<span class="${a.kind==='IA externe'?'ext':'int'}" title="${a.kind}">${esc(a.n)}${a.kind==='IA externe'?' ·ext':''}</span>`).join('');
 $('legend').innerHTML=REG.map(r=>`<div><i style="background:${COL[r]}"></i>${r} ${d.counts[r]||0}</div>`).join('')+`<div><i style="background:${COL.INBOX}"></i>IA externe ${d.inbox_count||0}</div>`;
 const w=d.stats.wallets||{},docs=d.nodes.filter(n=>n.k==='doc'||n.k==='drive').length;
 $('stats').innerHTML=`<div><span>NŒUDS</span><b id="nstat">${shown}</b></div><div><span>FICHIERS</span><b>${docs}</b></div><div><span>ENTRÉES JOURNAL</span><b>${d.stats.events}</b></div><div><span>SWAPS VUS</span><b>${d.stats.swaps}</b></div><div><span>WALLETS</span><b>${Object.values(w).reduce((a,b)=>a+b,0)}</b></div><div><span>NOTES IA EXT.</span><b>${d.inbox_count||0}</b></div>`;
 $('waiting').innerHTML=d.waiting.length?d.waiting.map(x=>`<div>▸ ${esc(x)}</div>`).join(''):'<div class="mu">rien — aucune décision en attente</div>';
 const M=md();$('tabs').innerHTML=Object.keys(M).map(k=>`<button class="${k===tab?'on':''}" data-k="${k}">${k}</button>`).join('');$('editor').textContent=M[tab];
 const c=d.counts;$('tree').innerHTML=`<b>~/brain/</b>\n├── rules.md            ${d.rules.length} règles\n├── routines.md         ${d.routines.length} routines\n├── attention.md        ${d.attention.length} tâches\n├── notes.md            ${d.decisions.length} décisions\n├── agents/             ${c.AGENTS||0} agents\n├── inbox/              ${d.inbox_count||0} notes IA externes\n├── projects/\n│   ├── trading/        ${c.TRADING}\n│   ├── polymarket/     ${c.POLYMARKET}\n│   └── briefs/         ${c.BRIEFS}\n├── drive/              ${c.DRIVE} titres\n└── out/log.md          <span id="logn">${shown}</span> lignes`}
$('tabs').addEventListener('click',e=>{const k=e.target.dataset.k;if(k){tab=k;paint()}});
// activité récente par région (1 h) -> intensité des influx
function activity(d){REG.concat('INBOX').forEach(r=>act[r]=0);const lim=d.gen_ts-3600;d.nodes.forEach(n=>{if(n.ts&&n.ts>lim){act[n.r]=(act[n.r]||0)+.12;if(n.k==='ext')act.INBOX+=.3}});for(const r in act)act[r]=Math.min(1,act[r])}
const LS='brain_last_seen_ts';
function banner(n){const b=$('since');if(!b)return;if(n>0){b.textContent='+'+n+' nouvelle'+(n>1?'s':'')+' info'+(n>1?'s':'')+' depuis ta dernière visite';b.className='since on';setTimeout(()=>b.className='since',9000)}}
async function load(why){try{const r=await fetch('brain.json?'+Date.now(),{cache:'no-store'});const d=await r.json();D=d;activity(d);
 const fresh=d.nodes.filter(n=>!seen.has(n.t+'|'+n.ts));fresh.forEach(n=>seen.add(n.t+'|'+n.ts));
 const last=+localStorage.getItem(LS)||0;
 if(why==='open'||why==='visible'){const nw=d.nodes.filter(n=>n.ts&&n.ts>last);if(last)banner(nw.length);
  if(why==='visible')nw.forEach(n=>queue.push(n))}
 // ordre : anciens d'abord, puis nouveaux depuis la dernière visite en fin de file (bien visibles)
 if(first&&last){const old=fresh.filter(n=>!(n.ts>last)),nw=fresh.filter(n=>n.ts>last);queue.push(...old,...nw)}else queue.push(...fresh);
 first=false;const mx=Math.max(0,...d.nodes.map(n=>n.ts||0));localStorage.setItem(LS,mx);
 paint();bars()}catch(e){op('fetch brain.json échoué','w')}}
load('open');setInterval(()=>load('poll'),20000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')load('visible')});
setInterval(()=>{const s=Math.floor((Date.now()-T0)/1000);$('tplus').textContent=[s/3600,s/60%60,s%60].map(v=>String(Math.floor(v)).padStart(2,'0')).join(':')},1000);
})();
