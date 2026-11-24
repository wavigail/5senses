/* Verse — 3D shelf (three.js r128, global THREE). Builds stylised figurines from primitives.
   Usage: VerseShelf.mount(containerEl, {onPick:(id)=>{}}) */
(function(){
const FIGS=[
 {id:'walk',  title:'ללכת בדרכך', author:"ג׳וג׳ו מויס"},
 {id:'harry', title:'הארי פוטר', author:'ג׳.ק. רולינג'},
 {id:'prince',title:'הנסיך הקטן', author:'סנט־אכזופרי'},
 {id:'alice', title:'אליס בארץ הפלאות', author:'לואיס קרול'},
 {id:'sherlock',title:'שרלוק הולמס', author:'ארתור קונן דויל'},
 {id:'anne',  title:'אן מהחווה הירוקה', author:'לוסי מוד מונטגומרי'},
 {id:'oz',    title:'הקוסם מארץ עוץ', author:'פרנק באום'},
 {id:'hunger',title:'משחקי הרעב', author:'סוזן קולינס'},
];
function M(c,o){return new THREE.MeshStandardMaterial(Object.assign({roughness:.62,metalness:0},o||{},{color:new THREE.Color(c).convertSRGBToLinear()}))}
const SKIN=M(0xf1c9a5), WHITE=M(0xf4f1ea), BLACK=M(0x1d1d22), SHOE=M(0x2a2420);
function mesh(g,m,x,y,z){const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.castShadow=true;o.receiveShadow=true;return o}
function cyl(rt,rb,h,m,x,y,z,s){return mesh(new THREE.CylinderGeometry(rt,rb,h,s||20),m,x,y,z)}
function sph(r,m,x,y,z){return mesh(new THREE.SphereGeometry(r,24,18),m,x,y,z)}
function box(w,h,d,m,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z)}

function baseLabel(f){
  const c=document.createElement('canvas');c.width=2048;c.height=160;const x=c.getContext('2d');
  x.fillStyle='#d8b98c';x.fillRect(0,0,2048,160);
  // burnt edge feel
  const g=x.createLinearGradient(0,0,0,160);g.addColorStop(0,'rgba(90,55,20,.0)');g.addColorStop(1,'rgba(90,55,20,.35)');x.fillStyle=g;x.fillRect(0,0,2048,160);
  x.fillStyle='#3a2410';x.textAlign='center';x.direction='rtl';
  x.font='700 74px "Rubik", Arial';x.fillText(f.title,1024,78);
  x.font='500 46px "Rubik", Arial';x.fillText(f.author,1024,138);
  const t=new THREE.CanvasTexture(c);t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t;
}
function makeBase(f){
  const g=new THREE.Group();
  const wood=M(0xd2b083,{roughness:.8});
  const side=new THREE.MeshStandardMaterial({map:baseLabel(f),roughness:.8});
  // label wraps the front half of the cylinder side
  const geo=new THREE.CylinderGeometry(.62,.62,.22,48,1,false,-Math.PI,Math.PI*2);
  const b=new THREE.Mesh(geo,[side,wood,wood]);b.position.y=.11;b.castShadow=b.receiveShadow=true;
  // rotate so texture centre faces camera (+z)
  g.add(b);
  g.add(cyl(.6,.6,.005,M(0x8a5a2b,{roughness:.9}),0,.0,0,48));
  return g;
}
function legs(g,m,h){g.add(cyl(.07,.06,h,m||WHITE,-.09,.22+h/2,0));g.add(cyl(.07,.06,h,m||WHITE,.09,.22+h/2,0));
  g.add(box(.13,.06,.2,SHOE,-.09,.25,.03));g.add(box(.13,.06,.2,SHOE,.09,.25,.03));}
function head(g,y,hair,hairStyle){
  g.add(sph(.2,SKIN,0,y,0));
  g.add(sph(.032,BLACK,-.075,y+.01,.175));g.add(sph(.032,BLACK,.075,y+.01,.175));{const ck=M(0xe8968a);g.add(sph(.03,ck,-.12,y-.05,.15));g.add(sph(.03,ck,.12,y-.05,.15));}
  const H=M(hair);
  if(hairStyle==='spiky'){const cap=sph(.21,H,0,y+.06,-.02);cap.scale.set(1,.75,1);g.add(cap);
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const c=mesh(new THREE.ConeGeometry(.06,.18,8),H,Math.cos(a)*.15,y+.2,Math.sin(a)*.13-.02);c.rotation.z=-Math.cos(a)*.6;c.rotation.x=Math.sin(a)*.6;g.add(c);} }
  else if(hairStyle==='long'){const cap=sph(.215,H,0,y+.04,-.03);cap.scale.set(1,.9,1);g.add(cap);g.add(box(.38,.36,.12,H,0,y-.15,-.12));}
  else if(hairStyle==='bun'){const cap=sph(.215,H,0,y+.05,-.03);cap.scale.set(1,.8,1);g.add(cap);g.add(sph(.1,H,0,y+.12,-.2));}
  else if(hairStyle==='braids'){const cap=sph(.215,H,0,y+.05,-.03);cap.scale.set(1,.8,1);g.add(cap);
    [-1,1].forEach(s=>{for(let i=0;i<4;i++)g.add(sph(.055-.006*i,H,s*.2,y-.08-i*.09,-.02));});}
  else if(hairStyle==='sidebraid'){const cap=sph(.215,H,0,y+.05,-.03);cap.scale.set(1,.8,1);g.add(cap);for(let i=0;i<5;i++)g.add(sph(.055-.005*i,H,.16,y-.1-i*.085,.06));}
  else {const cap=sph(.215,H,0,y+.06,-.02);cap.scale.set(1,.72,1);g.add(cap);}
}
function arms(g,m,y,len){[-1,1].forEach(s=>{const a=cyl(.055,.05,len||.42,m,s*.24,y,0);a.rotation.z=s*.12;g.add(a);g.add(sph(.055,SKIN,s*.265,y-(len||.42)/2-.02,0));});}

const BUILD={
 walk(g){legs(g,SKIN,.38);const skirt=cyl(.14,.36,.48,M(0xc8323f),0,.82,0,28);g.add(skirt);g.add(cyl(.15,.14,.3,M(0xc8323f),0,1.2,0));g.add(cyl(.05,.05,.08,SKIN,0,1.38,0));arms(g,SKIN,1.13,.44);head(g,1.58,0x1a1414,'bun');},
 harry(g){legs(g,M(0x2b2b33),.4);const robe=cyl(.16,.3,.78,M(0x16161a),0,.98,0,24);g.add(robe);g.add(box(.18,.4,.05,M(0x9a9aa0),0,1.1,.17));g.add(box(.04,.3,.02,M(0xa3262a),0,1.12,.2));g.add(cyl(.05,.05,.08,SKIN,0,1.42,0));arms(g,M(0x16161a),1.12,.46);
   const wand=cyl(.012,.012,.42,M(0x6b4a2b),.3,.86,.12);wand.rotation.x=1.1;g.add(wand);head(g,1.62,0x2a1a14);
   const gl=M(0x111111,{metalness:.4});[-1,1].forEach(s=>{const t=mesh(new THREE.TorusGeometry(.06,.012,8,20),gl,s*.075,1.64,.19);g.add(t)});},
 prince(g){legs(g,M(0x2f8a4a),.32);g.add(cyl(.17,.22,.5,M(0x2f8a4a),0,.82,0));g.add(cyl(.225,.225,.06,M(0xf2c230),0,.72,0));g.add(cyl(.05,.05,.08,SKIN,0,1.1,0));arms(g,M(0x2f8a4a),.86,.42);
   const sc=M(0xf2c230);g.add(cyl(.12,.12,.08,sc,0,1.08,0));const tail=box(.5,.1,.04,sc,-.32,1.1,-.02);tail.rotation.z=.25;tail.rotation.y=.3;g.add(tail);
   const sw=cyl(.01,.01,.36,M(0xb8b8c0,{metalness:.7,roughness:.3}),.3,.52,.08);sw.rotation.z=.3;g.add(sw);head(g,1.3,0xf0c23a,'spiky');},
 alice(g){legs(g,WHITE,.34);g.add(cyl(.13,.34,.5,M(0x5d9bd5),0,.78,0,28));g.add(box(.26,.4,.04,WHITE,0,.82,.24));g.add(cyl(.14,.13,.28,M(0x5d9bd5),0,1.15,0));g.add(cyl(.05,.05,.08,SKIN,0,1.32,0));arms(g,M(0x5d9bd5),1.08,.42);head(g,1.52,0xf2d36b,'long');
   const band=mesh(new THREE.TorusGeometry(.2,.02,8,24,Math.PI),BLACK,0,1.6,0);g.add(band);},
 sherlock(g){legs(g,M(0x3b3530),.42);g.add(cyl(.17,.27,.8,M(0x7a5a3c),0,1,0));g.add(cyl(.05,.05,.08,SKIN,0,1.44,0));arms(g,M(0x7a5a3c),1.14,.46);head(g,1.64,0x2c2420);
   const hat=sph(.225,M(0x8c7454),0,1.72,0);hat.scale.set(1,.55,1.15);g.add(hat);g.add(box(.06,.02,.16,M(0x8c7454),0,1.74,.22));
   const pipe=cyl(.015,.015,.14,M(0x3a2410),.06,1.56,.24);pipe.rotation.x=1.4;g.add(pipe);g.add(cyl(.03,.025,.06,M(0x3a2410),.06,1.55,.31));},
 anne(g){legs(g,WHITE,.36);g.add(cyl(.13,.32,.5,M(0x5f7d4e),0,.8,0,24));g.add(cyl(.14,.13,.28,M(0x5f7d4e),0,1.17,0));g.add(cyl(.05,.05,.08,SKIN,0,1.34,0));arms(g,M(0x5f7d4e),1.1,.42);head(g,1.54,0xc4471f,'braids');
   g.add(cyl(.34,.34,.02,M(0xe6c879),0,1.66,0));g.add(cyl(.17,.2,.12,M(0xe6c879),0,1.72,0));},
 oz(g){legs(g,WHITE,.34);g.add(box(.13,.06,.2,M(0xd42a2a,{metalness:.4,roughness:.3}),-.09,.25,.03));g.add(box(.13,.06,.2,M(0xd42a2a,{metalness:.4,roughness:.3}),.09,.25,.03));
   const ging=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,64,64);x.fillStyle='rgba(60,110,200,.65)';for(let i=0;i<64;i+=16){x.fillRect(i,0,8,64);x.fillRect(0,i,64,8);}const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,3);return new THREE.MeshStandardMaterial({map:t,roughness:.7});})();
   g.add(cyl(.13,.33,.5,ging,0,.78,0,28));g.add(cyl(.14,.13,.28,WHITE,0,1.15,0));g.add(cyl(.05,.05,.08,SKIN,0,1.32,0));arms(g,WHITE,1.08,.42);head(g,1.52,0x6a3d22,'braids');},
 hunger(g){legs(g,M(0x2e3a2c),.42);g.add(cyl(.16,.2,.5,M(0x3c3a36),0,.88,0));g.add(cyl(.05,.05,.08,SKIN,0,1.18,0));arms(g,M(0x3c3a36),.92,.44);head(g,1.38,0x3a2a1e,'sidebraid');
   const bow=mesh(new THREE.TorusGeometry(.42,.015,6,30,Math.PI*1.1),M(0x6b4a2b),-.3,.92,-.08);bow.rotation.z=Math.PI/2+.1;g.add(bow);},
};

function mount(el,opts){
  opts=opts||{};
  const W=()=>el.clientWidth,H=()=>el.clientHeight;
  const r=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
  r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));r.setSize(W(),H());
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.outputEncoding=THREE.sRGBEncoding;
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.92;
  el.appendChild(r.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x161b33).convertSRGBToLinear();scene.fog=new THREE.Fog(new THREE.Color(0x161b33).convertSRGBToLinear(),14,30);
  const cam=new THREE.PerspectiveCamera(30,W()/H(),.1,100);cam.position.set(0,2.4,12.6);cam.lookAt(0,1.1,0);
  // room
  const wall=mesh(new THREE.PlaneGeometry(40,20),M(0x26305f,{roughness:.95}),0,5,-1.3);wall.castShadow=false;scene.add(wall);
  const shelf=box(12.8,.18,1.9,M(0xb48a5a,{roughness:.7}),0,-.09,0);scene.add(shelf);
  scene.add(box(12.8,.04,1.9,M(0xc9a679,{roughness:.6}),0,.0,0));
  // brackets
  [-5,5].forEach(x=>{const b=box(.1,.7,.9,M(0x1a1a1a,{metalness:.6,roughness:.4}),x,-.5,-.6);scene.add(b)});
  // books & props
  const bookCols=[0x7a2d3a,0x2e4f7a,0xd9b45a,0x4b6b4a,0x6a4fb0];
  bookCols.forEach((c,i)=>{const b=box(.16,1.3+((i*37)%5)*.08,1,M(c,{roughness:.8}),-6.15+i*.18,.65,-.2);scene.add(b)});
  const lean=box(.16,1.3,1,M(0x8a3b2b,{roughness:.8}),-5.25,.62,-.2);lean.rotation.z=-.28;scene.add(lean);
  const pot=cyl(.28,.22,.45,M(0xe9e1d2),5.95,.23,-.2);scene.add(pot);
  for(let i=0;i<7;i++){const l=mesh(new THREE.SphereGeometry(.22,12,8),M(0x3f7a4a,{roughness:.9}),5.95+Math.sin(i)*.22,.6+i*.07,-.2+Math.cos(i*2)*.15);l.scale.set(.6,1.3,.35);l.rotation.z=Math.sin(i*3)*.8;scene.add(l)}
  // lights
  scene.add(new THREE.HemisphereLight(0x8c97d8,0x2a1d14,.55));
  const lamp=new THREE.SpotLight(0xffc27a,2.3,40,Math.PI/5,.45,1.2);lamp.position.set(-6,6.5,5);lamp.target.position.set(.5,.6,0);
  lamp.castShadow=true;lamp.shadow.mapSize.set(2048,2048);lamp.shadow.bias=-.0004;scene.add(lamp);scene.add(lamp.target);
  const fill=new THREE.DirectionalLight(0x9fb2ff,.35);fill.position.set(6,4,6);scene.add(fill);
  const rim=new THREE.PointLight(0xe9a23b,.6,12);rim.position.set(0,3,-.8);scene.add(rim);
  // figures
  const figs=[],picks=[];
  FIGS.forEach((f,i)=>{const g=new THREE.Group();g.add(makeBase(f));const body=new THREE.Group();BUILD[f.id](body);body.position.y=.0;g.add(body);
    const x=(i-(FIGS.length-1)/2)*1.32;g.position.set(x,0,.2);g.rotation.y=(i-(FIGS.length-1)/2)*-.05;
    g.userData={id:f.id,f:f,baseY:0,target:0,body:body};scene.add(g);figs.push(g);g.traverse(o=>{if(o.isMesh)o.userData.fig=g});picks.push(g);});
  // interaction
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let hover=null;
  function pick(ev){const rc=r.domElement.getBoundingClientRect();mouse.x=((ev.clientX-rc.left)/rc.width)*2-1;mouse.y=-((ev.clientY-rc.top)/rc.height)*2+1;ray.setFromCamera(mouse,cam);
    const hit=ray.intersectObjects(figs,true)[0];return hit?hit.object.userData.fig:null;}
  r.domElement.addEventListener('pointermove',e=>{const h=pick(e);if(h!==hover){hover=h;r.domElement.style.cursor=h?'pointer':'default';opts.onHover&&opts.onHover(h?h.userData.f:null,e)}});
  r.domElement.addEventListener('pointerleave',()=>{hover=null;opts.onHover&&opts.onHover(null)});
  r.domElement.addEventListener('click',e=>{const h=pick(e);if(h&&opts.onPick)opts.onPick(h.userData.id)});
  let tx=0;el.addEventListener('pointermove',e=>{const rc=el.getBoundingClientRect();tx=((e.clientX-rc.left)/rc.width-.5)});
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock=new THREE.Clock();
  function loop(){const t=clock.getElapsedTime();
    figs.forEach((g,i)=>{const up=g===hover?.35:0;g.userData.body.position.y+=(up-g.userData.body.position.y)*.15;
      const spin=g===hover?Math.sin(t*2)*.25:0;g.userData.body.rotation.y+=(spin-g.userData.body.rotation.y)*.1;});
    if(!reduce){cam.position.x+=(tx*2.2-cam.position.x)*.04;cam.lookAt(0,1.1,0);}
    r.render(scene,cam);requestAnimationFrame(loop);}
  loop();
  function resize(){cam.aspect=W()/H();cam.updateProjectionMatrix();r.setSize(W(),H());}
  window.addEventListener('resize',resize);
  return {figures:FIGS,resize};
}
window.VerseShelf={mount,FIGS};
})();
