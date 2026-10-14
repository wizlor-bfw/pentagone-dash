/* PENTAGONE · globe 3D scanner (v11). Positions décoratives (hash de l'adresse tronquée). */
(function(){
const cv=document.getElementById('graph');if(!cv)return;
const wrap=cv.parentElement;let vis=true;
function hasGL(){try{const t=document.createElement('canvas');return !!(window.THREE&&window.WebGLRenderingContext&&(t.getContext('webgl')||t.getContext('experimental-webgl')))}catch(e){return false}}
function watch(onShow){const set=v=>{const was=vis;vis=v&&!document.hidden;window.__gvis=vis;if(vis&&!was)onShow()};
 if('IntersectionObserver'in window)new IntersectionObserver(es=>set(es[0].isIntersecting),{threshold:0}).observe(wrap);
 document.addEventListener('visibilitychange',()=>set(!document.hidden))}
if(!hasGL()){watch(()=>{if(window.__gstop){window.__gstop=0;requestAnimationFrame(frame)}});requestAnimationFrame(frame);return}
const T=THREE,CY=new T.Color('#00ffcc'),PK=new T.Color('#ff2a85');
let R;try{R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'low-power'})}catch(e){requestAnimationFrame(frame);return}
R.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));R.setClearColor(0,0);
const S=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.1,100);cam.position.set(0,.35,4.2);cam.lookAt(0,-.12,0);
// ---- espace profond (v12) : nébuleuse, étoiles en couches, Lune, satellites, étoiles filantes ----
const LOW=/[?&]lite/.test(location.search)||((navigator.hardwareConcurrency||8)<=2&&(navigator.deviceMemory||8)<=2);window.__gLOW=LOW;
const SUNP=new T.Vector3(-1.75,1.55,-1.6),SUND=SUNP.clone().normalize();S.add(new T.AmbientLight(0x334455,.6));const sun=new T.DirectionalLight(0xffffff,1.1);sun.position.set(-.85,.55,.3);sun.color.set(0xfff0dd);sun.intensity=1.6;S.add(sun);
const neb=new T.Mesh(new T.SphereGeometry(60,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{uO:{value:LOW?2:4},uS:{value:SUND}},
 vertexShader:`varying vec3 d;void main(){d=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform int uO;uniform vec3 uS;varying vec3 d;float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
 float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float fb(vec3 p){float v=0.,a=.5;for(int k=0;k<4;k++){if(k>=uO)break;v+=a*n(p);p*=2.1;a*=.5;}return v;}
 void main(){float band=exp(-pow(dot(d,normalize(vec3(.35,1.,-.25))),2.)*14.);float f=fb(d*3.2),g=fb(d*6.+3.);
 float b2=exp(-pow(dot(d,normalize(vec3(-.6,.3,1.))),2.)*5.);vec3 c=vec3(.25,.12,.55)*pow(f,1.6)*(band*1.6+.25)+vec3(.12,.25,.75)*pow(g,1.8)*(band+.3)*.9+vec3(.9,.15,.55)*pow(fb(d*2.3+7.),2.2)*(b2+.25*band)*1.1+vec3(.0,.45,.5)*pow(g,3.)*band*.6+vec3(.5,.45,.7)*band*pow(f,3.)*.5;float sg=max(dot(d,uS),0.);c*=1.+pow(sg,6.)*2.5;c+=vec3(1.,.55,.25)*pow(sg,14.)*.45+vec3(.9,.3,.5)*pow(sg,4.)*.1;gl_FragColor=vec4(c*1.05+vec3(.025,.015,.05),1.);}`}));
neb.renderOrder=-10;S.add(neb);
const starMat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uT:{value:0},uPR:{value:1}},
 vertexShader:`attribute float sz;attribute float ph;attribute vec3 col;uniform float uT,uPR;varying vec3 c;varying float a;void main(){c=col;a=.7+.3*sin(uT*(1.2+ph*.5)+ph*6.28);vec4 m=modelViewMatrix*vec4(position,1.);gl_PointSize=sz*uPR*(.8+.4*a);gl_Position=projectionMatrix*m;}`,
 fragmentShader:`varying vec3 c;varying float a;void main(){vec2 q=gl_PointCoord-.5;float r=length(q);float s=smoothstep(.5,0.,r)+max(0.,1.-abs(q.x)*14.)*max(0.,1.-abs(q.y)*2.)*.25+max(0.,1.-abs(q.y)*14.)*max(0.,1.-abs(q.x)*2.)*.25;gl_FragColor=vec4(c*s*a*1.5,1.);}`});
const layers=[];[[LOW?700:2200,45,2.4,.004],[LOW?240:700,32,3.6,.009],[LOW?50:120,24,6.,.016]].forEach(([n,rad,sz,sp])=>{const g=new T.BufferGeometry(),P=new Float32Array(n*3),Z=new Float32Array(n),H=new Float32Array(n),K=new Float32Array(n*3);
 const pal=[[.8,.9,1],[.4,1,.9],[1,.5,.75],[1,.95,.85]];for(let i=0;i<n;i++){const v=new T.Vector3().randomDirection().multiplyScalar(rad*(.9+Math.random()*.2));P.set([v.x,v.y,v.z],i*3);Z[i]=sz*(.4+Math.random());H[i]=Math.random();const c=pal[Math.random()<.75?0:1+(i%3)];K.set(c.map(x=>x*(.5+Math.random()*.5)),i*3)}
 g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('sz',new T.BufferAttribute(Z,1));g.setAttribute('ph',new T.BufferAttribute(H,1));g.setAttribute('col',new T.BufferAttribute(K,3));const pts=new T.Points(g,starMat);pts.userData.sp=sp;S.add(pts);layers.push(pts)});

// Soleil : disque + couronne + lens flare (lumière principale)
const glowTex=(c0,c1,st)=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,c0);g.addColorStop(st,c1);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c)};
const SP=SUNP.clone(),sunG=new T.Group();sunG.position.copy(SP);S.add(sunG);
const spr=(tex,s,col,op)=>{const m=new T.Sprite(new T.SpriteMaterial({map:tex,color:col,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false}));m.scale.setScalar(s);return m};
const tCore=glowTex('#ffffff','rgba(255,240,200,.95)',.35),tCor=glowTex('rgba(255,200,120,.9)','rgba(255,120,80,.25)',.3),tF=glowTex('rgba(255,255,255,.6)','rgba(255,255,255,.08)',.5);
const corona=spr(tCor,LOW?2.2:2.8,0xffb070,.85),sunCore=spr(tCore,.55,0xffffff,1);sunG.add(spr(tCor,6,0xff7040,.3),corona,sunCore);
{const c=document.createElement('canvas');c.width=256;c.height=32;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,256,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(255,230,200,.8)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,14,256,4);
 const st=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,blending:T.AdditiveBlending,depthWrite:false,color:0xffe0c0}));st.scale.set(4.5,.6,1);sunG.add(st)}
const flares=LOW?[]:[[.35,.5,0x00ffcc,.25],[.55,.25,0xff2a85,.3],[.8,.7,0x6080ff,.15],[1.15,.35,0x00ffcc,.2],[1.4,1.1,0xff2a85,.1]].map(([k,s,c,o])=>{const m=spr(tF,s,c,o);m.userData={k,o};S.add(m);return m});
const _a=new T.Vector3(),_b=new T.Vector3();
function sunFx(t){corona.material.rotation=t/2e4;corona.scale.setScalar((LOW?2.2:2.8)*(1+.03*Math.sin(t/700)));_a.copy(SP).project(cam);const on=_a.z<1&&Math.abs(_a.x)<1.3&&Math.abs(_a.y)<1.3;
 flares.forEach(f=>{const k=f.userData.k;_b.set(_a.x*(1-2*k),_a.y*(1-2*k),.5).unproject(cam);_b.sub(cam.position).normalize().multiplyScalar(6).add(cam.position);f.position.copy(_b);f.material.opacity=on?f.userData.o:0})}
// Lune
const moonPiv=new T.Group();moonPiv.rotation.set(.55,0,.12);S.add(moonPiv);
const moon=new T.Mesh(new T.SphereGeometry(.17,LOW?20:32,LOW?14:24),new T.MeshLambertMaterial({map:new T.TextureLoader().load('moon.jpg'),color:0xc8d8e0,emissive:0x101418}));moonPiv.add(moon);
// satellites
const sats=[];if(!LOW||true){const nS=LOW?3:5,body=new T.BoxGeometry(.05,.05,.07),pan=new T.BoxGeometry(.12,.003,.05),bm=new T.MeshLambertMaterial({color:0xb8c0c8,emissive:0x111111}),pm=new T.MeshLambertMaterial({color:0x2a5ad0,emissive:0x1a3a88});
 for(let i=0;i<nS;i++){const piv=new T.Group();piv.rotation.set(i*1.1+.3,i*.9,i*.7-.6);S.add(piv);const sat=new T.Group();sat.add(new T.Mesh(body,bm));[-1,1].forEach(k=>{const p=new T.Mesh(pan,pm);p.position.x=k*.09;sat.add(p)});
  const bl=new T.Sprite(new T.SpriteMaterial({map:dotTexS(),color:i%2?0xff2a85:0x00ffcc,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));bl.scale.setScalar(.11);bl.position.y=.04;sat.add(bl);
  piv.add(sat);sats.push({piv,sat,bl,r:1.3+i*.12,sp:(.35-i*.05)*(i%2?-1:1),a:i*1.7})}}
function dotTexS(){if(dotTexS.t)return dotTexS.t;const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);return dotTexS.t=new T.CanvasTexture(c)}
// étoiles filantes
const shG=new T.BufferGeometry();shG.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));shG.setAttribute('color',new T.BufferAttribute(new Float32Array([1,1,1,0,.3,.3]),3));
const shoot=new T.Line(shG,new T.LineBasicMaterial({vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));shoot.visible=false;S.add(shoot);let shT=-4,shP=new T.Vector3(),shV=new T.Vector3();
function space(t,dt){starMat.uniforms.uT.value=t/1e3;starMat.uniforms.uPR.value=R.getPixelRatio();layers.forEach((l,i)=>{l.rotation.y+=dt*l.userData.sp;l.rotation.x=Math.sin(t/4e4)*.02*(i+1)});neb.rotation.y+=dt*.0015;
 const ma=1.2+t/1e3*.12;moon.position.set(Math.cos(ma)*1.62,0,Math.sin(ma)*1.0);moon.rotation.y=-ma;
 sats.forEach((s,i)=>{s.a+=dt*s.sp;s.sat.position.set(Math.cos(s.a)*s.r,0,Math.sin(s.a)*s.r);s.sat.lookAt(0,0,0);s.bl.material.opacity=(Math.floor(t/500+i)%3===0)?1:.08;s.bl.scale.setScalar(s.bl.material.opacity>.5?.13:.07)});
 shT-=dt;if(shT<0&&!shoot.visible&&Math.random()<dt*.5){shoot.visible=true;shT=1.1;shP.set(4+Math.random()*8,3+Math.random()*4,-8-Math.random()*4);shV.set(-6-Math.random()*6,-3-Math.random()*3,0)}
 if(shoot.visible){shT-=0;const k=1-shT/1.1;shP.addScaledVector(shV,dt);const p=shG.attributes.position;p.setXYZ(0,shP.x,shP.y,shP.z);p.setXYZ(1,shP.x-shV.x*.25,shP.y-shV.y*.25,shP.z);p.needsUpdate=true;shoot.material.opacity=Math.sin(Math.min(1,k)*Math.PI);if(shT<=0){shoot.visible=false;shT=LOW?5+Math.random()*5:1.5+Math.random()*3.5}}}
const tilt=new T.Group();tilt.rotation.z=-.41;S.add(tilt);const earth=new T.Group();tilt.add(earth);
const U={uMap:{value:null},uScan:{value:0},uT:{value:0},uSun:{value:new T.Vector3(-.85,.55,.3).normalize()}};
const tex=new T.TextureLoader().load('earth.jpg');tex.anisotropy=2;U.uMap.value=tex;
const vs=`varying vec2 vUv;varying vec3 vN;varying vec3 vW;varying vec3 vO;void main(){vUv=uv;vO=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
const fs=`uniform sampler2D uMap;uniform float uScan,uT;uniform vec3 uSun;varying vec2 vUv;varying vec3 vN;varying vec3 vW;varying vec3 vO;
void main(){vec3 c=texture2D(uMap,vUv).rgb;float l=dot(c,vec3(.3,.59,.11));float land=smoothstep(.12,.3,c.r+c.g-c.b*.6);
 vec3 base=mix(vec3(.02,.05,.12)+vec3(0.,.2,.28)*l,vec3(.04,.2,.2)+vec3(.15,.85,.75)*l,land);
 float d=max(dot(vN,uSun),0.);float dl=smoothstep(-.12,.25,dot(vN,uSun));base=mix(base*.62+vec3(.0,.03,.07),base*1.55+vec3(.09,.06,.02)*l,dl);base+=vec3(1.,.55,.25)*exp(-pow(dot(vN,uSun),2.)*60.)*.08;float spec=pow(max(dot(reflect(-uSun,vN),normalize(cameraPosition-vW)),0.),24.)*(1.-land)*dl;base+=vec3(1.,.85,.6)*spec*.35;
 float lat=asin(clamp(vO.y,-1.,1.)),lon=atan(vO.z,vO.x);float gr=max(1.-abs(fract(lat*5.73)-.5)*40.,1.-abs(fract(lon*5.73)-.5)*40.);base+=vec3(0.,.5,.45)*max(gr,0.)*.12;
 float b=vW.y-uScan;float band=exp(-b*b*900.);float trail=b<0.&&b>-.35?exp(b*9.)*.35:0.;
 vec3 cc=base+vec3(.0,1.,.8)*band*1.2+vec3(.0,.6,.55)*trail*(.3+land)+vec3(1.,.16,.52)*exp(-b*b*9000.)*.6;
 vec3 V=normalize(cameraPosition-vW);float fr=pow(1.-max(dot(V,vN),0.),3.);cc+=vec3(0.,.8,.9)*fr*.35+vec3(1.,.16,.52)*fr*fr*.2;
 gl_FragColor=vec4(cc,1.);}`;
earth.add(new T.Mesh(new T.SphereGeometry(1,64,48),new T.ShaderMaterial({uniforms:U,vertexShader:vs,fragmentShader:fs})));
// atmosphère (halo fin)
S.add(new T.Mesh(new T.SphereGeometry(1.07,48,32),new T.ShaderMaterial({side:T.BackSide,transparent:true,blending:T.AdditiveBlending,depthWrite:false,
 vertexShader:`varying float i;void main(){vec3 n=normalize(normalMatrix*normal);i=pow(max(.75+n.z,0.),3.)*0.;i=pow(clamp(.62-dot(n,vec3(0.,0.,1.)),0.,1.),2.2);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying float i;void main(){gl_FragColor=vec4(mix(vec3(0.,1.,.85),vec3(1.,.16,.52),.3)*i*1.1,i);}`})));
// anneau de scan + rayon magnétique
const ringG=new T.BufferGeometry().setFromPoints(Array.from({length:129},(_,i)=>{const a=i/128*6.2832;return new T.Vector3(Math.cos(a),0,Math.sin(a))}));
const ring=new T.Line(ringG,new T.LineBasicMaterial({color:CY,transparent:true,opacity:.9,blending:T.AdditiveBlending}));S.add(ring);
const ring2=new T.Line(ringG,new T.LineBasicMaterial({color:PK,transparent:true,opacity:.35,blending:T.AdditiveBlending}));S.add(ring2);
const EM=new T.Vector3(2.1,1.35,1.1);
const emit=new T.Mesh(new T.OctahedronGeometry(.06),new T.MeshBasicMaterial({color:PK}));emit.position.copy(EM);S.add(emit);
const emitHalo=new T.Mesh(new T.RingGeometry(.09,.11,32),new T.MeshBasicMaterial({color:CY,transparent:true,opacity:.7,side:T.DoubleSide}));emitHalo.position.copy(EM);S.add(emitHalo);
const bG=new T.BufferGeometry(),bP=new Float32Array(48*3),bC=new Float32Array(48*4);bG.setAttribute('position',new T.BufferAttribute(bP,3));bG.setAttribute('color',new T.BufferAttribute(bC,4));
const beam=new T.Mesh(bG,new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,vertexShader:`attribute vec4 color;varying vec4 c;void main(){c=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec4 c;void main(){gl_FragColor=c;}`}));S.add(beam);
const core=new T.Line(new T.BufferGeometry().setFromPoints([EM.clone(),new T.Vector3()]),new T.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.85,blending:T.AdditiveBlending}));S.add(core);
function setBeam(y){const r=Math.sqrt(Math.max(0,1-y*y))*1.005;let k=0,q=0;const pts=[];for(let i=0;i<=8;i++){const a=-.15+i/8*1.75;pts.push([Math.cos(a)*r,y,Math.sin(a)*r])}
 for(let i=0;i<8;i++){[[EM.x,EM.y,EM.z,.0,1,.85,.03],[...pts[i],.0,1,.85,.32],[...pts[i+1],.0,1,.85,.32]].forEach(v=>{bP.set(v.slice(0,3),k);k+=3;bC.set(v.slice(3),q);q+=4})}
 for(let i=0;i<8;i++){[[EM.x,EM.y,EM.z,1,.16,.52,.0],[...pts[i],1,.16,.52,.1],[...pts[i+1],1,.16,.52,.1]].forEach(v=>{bP.set(v.slice(0,3),k);k+=3;bC.set(v.slice(3),q);q+=4})}
 bG.attributes.position.needsUpdate=true;bG.attributes.color.needsUpdate=true;bG.setDrawRange(0,48);
 const cp=core.geometry.attributes.position;cp.setXYZ(1,pts[4][0],y,pts[4][2]);cp.needsUpdate=true;
 ring.position.y=y;ring.scale.set(r,1,r);ring2.position.y=y-.012;ring2.scale.set(r*.995,1,r*.995)}
// wallets
const hsh=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h};
const ll=(id)=>{const h=hsh(id),la=Math.asin(((h%10007)/10007)*1.7-.85),lo=((h>>>14)%3600)/3600*6.2832;return new T.Vector3(Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo))};
const dotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.25,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c)})();
const wg=new T.Group();earth.add(wg);let sig='',fol=[],pg=[];
const ringGeo=new T.RingGeometry(.9,1,32);
function sync(){const ns=typeof nodes!=='undefined'?nodes:[];const s=ns.map(n=>n.id+n.st+n.col).join();if(s===sig)return;sig=s;
 while(wg.children.length)wg.remove(wg.children[0]);fol=[];
 const pos=[],col=[];ns.forEach(n=>{const p=ll(n.id);n.gp=p;if(n.st==='suivi'){const sp=new T.Sprite(new T.SpriteMaterial({map:dotTex,color:CY,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));sp.position.copy(p).multiplyScalar(1.015);sp.scale.setScalar(.09);sp.userData.n=n;wg.add(sp);fol.push(sp)}
  else{pos.push(p.x*1.008,p.y*1.008,p.z*1.008);const c=new T.Color((n.col||'#00ffcc').slice(0,7));if(n.col&&n.col.length>7)c.multiplyScalar(.55);col.push(c.r,c.g,c.b)}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));
 wg.add(new T.Points(g,new T.PointsMaterial({size:.035,map:dotTex,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending})));
 // liens entre wallets suivis (arcs)
 fol.forEach((f,i)=>{const g2=fol[(i+1)%fol.length];if(!g2||g2===f)return;const a=f.position.clone().normalize(),b=g2.position.clone().normalize(),pts=[];for(let k=0;k<=24;k++){const v=a.clone().lerp(b,k/24).normalize();v.multiplyScalar(1.01+Math.sin(k/24*Math.PI)*.18);pts.push(v)}
  wg.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:CY,transparent:true,opacity:.35,blending:T.AdditiveBlending})))})}
function ping(n,color){if(!n||!n.gp)return;const m=new T.Mesh(ringGeo,new T.MeshBasicMaterial({color,transparent:true,side:T.DoubleSide,blending:T.AdditiveBlending,depthWrite:false}));
 m.position.copy(n.gp).multiplyScalar(1.012);m.lookAt(n.gp.clone().multiplyScalar(2));m.userData.t=0;wg.add(m);pg.push(m)}
// overlay HTML (réticule + alertes)
const ov=document.createElement('div');ov.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden;font:10px JBM,monospace';wrap.appendChild(ov);
const lab=document.createElement('div');lab.style.cssText='position:absolute;color:#fff;white-space:nowrap;text-shadow:0 0 6px #00ffcc;transition:opacity .3s';ov.appendChild(lab);
const ret=document.createElement('div');ret.style.cssText='position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border:1px solid #fff;border-radius:50%;box-shadow:0 0 8px #00ffcc;transition:opacity .3s';ov.appendChild(ret);
const hud=document.createElement('div');hud.style.cssText='position:absolute;left:8px;bottom:6px;color:#00ffcc;opacity:.8';ov.appendChild(hud);
const fl=document.createElement('div');fl.style.cssText='position:absolute;left:0;right:0;top:42%;text-align:center;color:#ff2a85;font-weight:bold;font-size:12px;opacity:0;text-shadow:0 0 8px #ff2a85';ov.appendChild(fl);
let ri=0,rt=0,last=0,fid=0,spin=0;const tmp=new T.Vector3();
function size(){const w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;if(cv.width!==Math.round(w*R.getPixelRatio())||cv.height!==Math.round(h*R.getPixelRatio())){R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h*1.1?50:36;cam.position.x=w<700?0:-.55;cam.updateProjectionMatrix()}}
function loop(t){if(!vis){last=0;return}requestAnimationFrame(loop);const dt=last?Math.min(.05,(t-last)/1e3):.016;last=t;size();sync();
 spin+=dt*.18;earth.rotation.y=spin;U.uT.value=t/1e3;const sy=Math.sin(t/1e3*.55)*.98;U.uScan.value=sy;setBeam(sy);emitHalo.lookAt(cam.position);emit.rotation.y+=dt*2;
 // pings : wallets avec swaps réels sur 30 min (act30>0), comme le graphe 2D
 const ns=typeof nodes!=='undefined'?nodes:[];if(Math.random()<dt*1.5){const act=ns.filter(n=>n.act>0);if(act.length)ping(act[Math.floor(Math.random()*act.length)],CY)}
 pg=pg.filter(m=>{m.userData.t+=dt;const k=m.userData.t/1.6;m.scale.setScalar(.02+k*.14);m.material.opacity=1-k;if(k>=1){wg.remove(m);m.material.dispose();return false}return true});
 fol.forEach((f,i)=>{const pul=1+.35*Math.sin(t/300+i);f.scale.setScalar(.085*pul);tmp.copy(f.position);f.getWorldPosition(tmp);f.material.opacity=Math.abs(tmp.y-sy)<.05?1:.85});
 // alertes (flashes alimentés par app.js)
 if(typeof flashes!=='undefined'&&flashes.length){const f=flashes.shift();fid=3;fl.textContent='⚠ '+f.txt;if(f.n)ping(f.n,PK)}if(fid>0){fid-=dt;fl.style.opacity=Math.max(0,fid/3)}
 // réticule
 if(fol.length){rt+=dt;if(rt>2.6){rt=0;ri=(ri+1)%fol.length}const f=fol[ri%fol.length];f.getWorldPosition(tmp);const front=tmp.clone().normalize().dot(cam.position.clone().sub(tmp).normalize())>.15;tmp.project(cam);
  const x=(tmp.x*.5+.5)*wrap.clientWidth,y=(-tmp.y*.5+.5)*wrap.clientHeight;ret.style.left=x+'px';ret.style.top=y+'px';lab.style.left=x+16+'px';lab.style.top=y-24+'px';lab.textContent='WHALE: '+f.userData.n.id;ret.style.opacity=lab.style.opacity=front?1:0;if(!front)rt+=dt*4}
 else ret.style.opacity=lab.style.opacity=0;
 hud.textContent='SCAN LAT '+(Math.asin(Math.max(-1,Math.min(1,sy)))*57.3).toFixed(1)+'° · '+fol.length+' SUIVIS · '+ns.filter(n=>n.act>0).length+' ACTIFS 30 MIN';
 space(t,dt);sunFx(t);R.render(S,cam)}
window.__gvis=true;watch(()=>requestAnimationFrame(loop));requestAnimationFrame(loop);
})();
