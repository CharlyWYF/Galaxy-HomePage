import {parseGalaxyContent,buildRoutePairs} from './galaxy-content.mjs?v=20261018-content1';
import * as THREE from './vendor/three.module.js';
import {createSpacecraft} from './spacecraft.js?v=20261018-model1';
import {measureGesture,gestureChange} from './gestures.js?v=20261018-mobile1';
import {fitPlanetView} from './view-fit.js?v=20261018-fit1';
const $=s=>document.querySelector(s);
let touchMode=matchMedia('(hover: none) and (pointer: coarse)').matches,lastTouchTime=-Infinity,infoPinned=false;
function updateInputMode(touch){touchMode=touch;document.body.classList.toggle('touch-ui',touch);$('.intro div').textContent=touch?'轻点了解星球，靠近后进入。':'悬停了解星球，靠近后进入。';}
updateInputMode(touchMode);
document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){lastTouchTime=performance.now();updateInputMode(true);}else if(e.pointerType==='mouse')updateInputMode(false);},{capture:true});
function mobileModelScale(){return touchMode&&(innerWidth<=700||innerHeight<=500)?1.25:1;}
function displayUrl(url){return url.replace(/^https?:\/\//i,'');}
// Content is revalidated on each visit, so editing JSON needs no version bump.
const contentResponse=await fetch(new URL('./galaxy-content.json',import.meta.url),{cache:'no-cache'});
if(!contentResponse.ok)throw new Error('无法读取星图配置：HTTP '+contentResponse.status);
const content=parseGalaxyContent(await contentResponse.json());
const groups=content.sectors;
const nodes=[...content.planets,{id:'home',name:'星图原点',url:new URL('/',window.location.href).href,group:'home',x:0,z:0,r:1.4,color:0xd6ad75,desc:'这片星图的零号坐标。无论航行多远，都可以回到这里，重新选择方向。'}];
const navigation=$('nav');
navigation.replaceChildren();
for(const [id,label] of [['all','全部星区'],...Object.entries(groups).map(([id,g])=>[id,g.label])]){
 const button=document.createElement('button');button.dataset.filter=id;button.textContent=label;button.classList.toggle('active',id==='all');navigation.append(button);
}
const canvas=$('#space');let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true});}catch(e){throw new Error('无法创建 WebGL 场景：'+e.message);}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x070b13);scene.fog=new THREE.FogExp2(0x070b13,.0016);
const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,1500);
if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;}
scene.add(new THREE.HemisphereLight(0xa6bfd7,0x0e1423,2.3));const sun=new THREE.DirectionalLight(0xffdfb6,4.3);sun.position.set(-15,25,15);scene.add(sun);const edge=new THREE.DirectionalLight(0x649bca,2);edge.position.set(15,5,-20);scene.add(edge);
let seed=147;function rand(){seed=seed*16807%2147483647;return(seed-1)/2147483646;}
function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
function mat(color){return new THREE.MeshStandardMaterial({color,roughness:.88,metalness:.15,flatShading:true});}
const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,255,255,.7)');gradient.addColorStop(.12,'rgba(255,255,255,.25)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const glowTexture=new THREE.CanvasTexture(c);
function halo(parent,x,y,z,color,size,opacity){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false}));s.position.set(x,y,z);s.scale.setScalar(size);parent.add(s);return s;}
halo(scene,-25,-18,-45,0x38668d,110,.12);halo(scene,45,-23,0,0x65517d,100,.1);halo(scene,-25,-26,45,0x355a71,95,.1);
const coords=[],colors=[];for(let i=0;i<3200;i++){const az=rand()*Math.PI*2,el=Math.acos(2*rand()-1),r=200+rand()*500;coords.push(Math.sin(el)*Math.cos(az)*r,Math.cos(el)*r,Math.sin(el)*Math.sin(az)*r);const light=.25+rand()*.7;colors.push(light*.85,light*.94,light);}
const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));stars.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({size:.65,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.85})));
const dustPos=[];for(let i=0;i<800;i++)dustPos.push((rand()-.5)*250,(rand()-.5)*15-6,(rand()-.5)*210);const dust=new THREE.BufferGeometry();dust.setAttribute('position',new THREE.Float32BufferAttribute(dustPos,3));scene.add(new THREE.Points(dust,new THREE.PointsMaterial({color:0x5b7b91,size:.11,transparent:true,opacity:.5})));
const pickables=[];
nodes.forEach(node=>{
 const body=new THREE.Group();body.position.set(node.x,0,node.z);scene.add(body);node.body=body;
 const geo=new THREE.IcosahedronGeometry(node.r,1),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),noise=1+.12*Math.sin(x*3.1+y*4.2+z*2.3);p.setXYZ(i,x*noise,y*noise,z*noise);}geo.computeVertexNormals();
 const rock=mesh(geo,mat(node.color),body);rock.rotation.set(rand(),rand(),rand());rock.scale.set(1,.78+rand()*.3,1);rock.userData.node=node;pickables.push(rock);node.rock=rock;
 if(node.group!=='home'){
 for(let k=0;k<(node.satellites?3:0);k++){const a=rand()*Math.PI*2,r=node.r+1+rand()*1.3;const shard=mesh(new THREE.IcosahedronGeometry(.1+rand()*.22,0),mat(node.color),body,Math.cos(a)*r,(rand()-.5)*1.4,Math.sin(a)*r);shard.rotation.set(rand(),rand(),rand());shard.userData.node=node;pickables.push(shard);}
 if(node.orbit){const orbit=mesh(new THREE.TorusGeometry(node.r+1,.012,4,64),new THREE.MeshBasicMaterial({color:node.color,transparent:true,opacity:.25}),body);orbit.rotation.x=Math.PI/2;node.orbit=orbit;}
 if(node.glow)halo(body,0,-.2,0,node.color,node.r*5,.15);
 node.hoverGlow=halo(body,0,0,0,0xffffff,node.r*6.5,0);
 node.hoverGlow.visible=false;
 }
 if(node.ring){const ring=mesh(new THREE.RingGeometry(node.r*1.4,node.r*1.9,80),new THREE.MeshStandardMaterial({color:0xb78f65,side:THREE.DoubleSide,transparent:true,opacity:.5,roughness:1}),body);ring.rotation.set(-1.2,.1,.25);ring.userData.node=node;pickables.push(ring);}
 if(node.group==='home'){
  rock.visible=false;
  // The spacecraft travels independently; the origin's coordinates stay fixed.
  const ship=createSpacecraft();scene.add(ship);node.ship=ship;
  ship.traverse(m=>{if(m.isMesh){m.userData.node=node;pickables.push(m);}});
 }
 const label=document.createElement('button');label.className='node-label';label.hidden=node.group==='home';label.append(document.createTextNode(node.name));const host=document.createElement('small');host.textContent=displayUrl(node.url);label.append(host);label.setAttribute('aria-label',node.name+'，单击靠近，双击进入');label.onclick=e=>{if(e.detail!==0&&performance.now()-lastTouchTime<700)return;e.detail===0?select(node,touchMode):clickNode(node);};$('#labels').append(label);node.label=label;label.onpointerenter=e=>{if(e.pointerType!=='touch'&&!touchMode)showInfo(node);};label.onpointerleave=hideInfoSoon;label.onfocus=()=>showInfo(node);label.onblur=hideInfoSoon;node.phase=rand()*6;node.speed=(rand()-.5)*.15;
});
const spacecraft=nodes.find(n=>n.ship).ship;
const shipVelocity=new THREE.Vector3(),shipTarget=new THREE.Vector3();
const shipError=new THREE.Vector3(),shipStep=new THREE.Vector3();
function updateShip(dt){
 // A point on the camera's center ray stays in front of the planet, not inside it.
 shipTarget.copy(camera.position).sub(focus);
 shipTarget.setLength(Math.min(4,shipTarget.length()*.25)).add(focus);
 const targetScale=mobileModelScale()*THREE.MathUtils.lerp(.30,1,THREE.MathUtils.smoothstep(distance,42,110));
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){
  spacecraft.position.copy(shipTarget);shipVelocity.set(0,0,0);
  spacecraft.scale.setScalar(targetScale);spacecraft.rotation.z=0;return;
 }
 // Critically damped following retains momentum when the center keeps moving.
 // Exact integration avoids restarting an animation on every pointer movement.
 const omega=2.6,decay=Math.exp(-omega*dt);
 shipError.copy(spacecraft.position).sub(shipTarget);
 shipStep.copy(shipVelocity).addScaledVector(shipError,omega).multiplyScalar(dt);
 spacecraft.position.copy(shipTarget).addScaledVector(shipError,decay).addScaledVector(shipStep,decay);
 shipVelocity.addScaledVector(shipStep,-omega).multiplyScalar(decay);
 const ease=1-Math.exp(-dt*3);
 spacecraft.scale.setScalar(THREE.MathUtils.lerp(spacecraft.scale.x,targetScale,ease));
 const bank=THREE.MathUtils.clamp(-shipVelocity.x*.012,-.12,.12);
 spacecraft.rotation.z=THREE.MathUtils.lerp(spacecraft.rotation.z,bank,ease);
}
Object.values(groups).forEach(g=>{const el=document.createElement('div');el.className='sector-label';el.textContent=g.sub+' / '+g.name;$('#sectorLabels').append(el);g.el=el;});
const routePairs=buildRoutePairs(content.planets,content.routes);
const nodesById=new Map(nodes.map(n=>[n.id,n]));
const routeGeo=new THREE.BufferGeometry();
const routes=new THREE.LineSegments(routeGeo,new THREE.LineDashedMaterial({color:content.routes.color,dashSize:content.routes.dashSize,gapSize:content.routes.gapSize,transparent:true,opacity:content.routes.opacity}));scene.add(routes);
function updateRoutes(){
 const positions=[];
 for(const [from,to] of routePairs){
  const a=nodesById.get(from),b=nodesById.get(to);
  if(a.body.visible&&b.body.visible)positions.push(a.x,-2,a.z,b.x,-2,b.z);
 }
 routeGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 routes.visible=positions.length>0;
 if(routes.visible){routeGeo.computeBoundingSphere();routes.computeLineDistances();}
}
updateRoutes();
let focus=new THREE.Vector3(-5,0,0),desired=new THREE.Vector3(-5,0,0),distance=105,wantedDistance=105,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,filter='all',selected=null;
let infoNode=null,infoTimer=null,nearbyNode=null;
spacecraft.position.copy(focus);
const initialAzimuth=Math.atan2(.15,.64),initialElevation=Math.atan2(.82,Math.hypot(.15,.64)),orbitRadius=Math.hypot(.15,.82,.64);
let azimuth=initialAzimuth,elevation=initialElevation,wantedAzimuth=azimuth,wantedElevation=elevation;
// Slow idle orbit; user input pauses immediately and restarts after 20 seconds.
let autoOrbitLastActivity=-Infinity,autoOrbitSpeed=0,autoOrbitOffset=0;
function pauseAutoOrbit(){autoOrbitLastActivity=performance.now();autoOrbitSpeed=0;}
function updateAutoOrbit(now,dt){
 const blocked=paused||document.hidden||departure||pointers.size>0||!$('#destination').hidden||document.activeElement instanceof HTMLInputElement;
 if(blocked){pauseAutoOrbit();return;}
 if(now-autoOrbitLastActivity<20000||!document.body.classList.contains('ready'))return;
 autoOrbitSpeed=THREE.MathUtils.lerp(autoOrbitSpeed,.018,1-Math.exp(-dt*.7));
 const turn=autoOrbitSpeed*dt;
 wantedAzimuth+=turn;autoOrbitOffset+=turn;
}
let pendingClick=null,clickTimer=null;
// 等待双击判定结束后才移动镜头，避免第二次点击时星球已经移走。
function clickNode(node){const now=performance.now();if(pendingClick?.node===node&&now-pendingClick.time<=450){clearTimeout(clickTimer);pendingClick=null;enterPlanet(node);return;}clearTimeout(clickTimer);pendingClick={node,time:now};clickTimer=setTimeout(()=>{pendingClick=null;select(node);},450);}
// Keep departure feedback visible while the browser waits for the destination.
let departure=null;
const departureUI=$('#departure'),departureVeil=$('#departureVeil');
const departureControls=[canvas,$('header'),$('.intro'),$('#labels'),$('#sectorLabels'),$('#destination'),$('#destLink'),$('.zoom'),$('footer')];
function enterPlanet(node){
 if(departure)return;
 cancelTouchTap();
 clearTimeout(clickTimer);pendingClick=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 departure={node,start:performance.now(),duration:reduced?120:950,reduced,focus:focus.clone(),distance,active:document.activeElement};
 $('#departureTitle').textContent='正在前往 '+node.name;
 $('#departureHost').textContent=displayUrl(node.url);
 departureUI.hidden=false;document.body.classList.add('departing');
 departureControls.forEach(el=>el.inert=true);
 $('#cancelDeparture').focus({preventScroll:true});
 departure.timer=setTimeout(()=>{
  if(!departure)return;
  departureVeil.style.opacity='1';
  $('#departureTitle').textContent='正在连接 '+node.name+'…';
  window.location.assign(node.url);
 },departure.duration);
}
function cancelDeparture(){
 if(!departure)return;
 const previousDeparture=departure;
 clearTimeout(previousDeparture.timer);
 window.stop();
 focus.copy(previousDeparture.focus);desired.copy(previousDeparture.focus);
 distance=wantedDistance=previousDeparture.distance;
 departure=null;departureUI.hidden=true;departureVeil.style.opacity='0';
 document.body.classList.remove('departing');departureControls.forEach(el=>el.inert=false);
 if(previousDeparture.active?.isConnected)previousDeparture.active.focus({preventScroll:true});
}
$('#cancelDeparture').onclick=cancelDeparture;
$('#destLink').onclick=e=>{
 if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 if(nearbyNode){e.preventDefault();enterPlanet(nearbyNode);}
};
addEventListener('pageshow',e=>{if(e.persisted)cancelDeparture();});
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),projection=new THREE.Vector3();
function pointOnPlane(x,y){ndc.set(x/innerWidth*2-1,-y/innerHeight*2+1);ray.setFromCamera(ndc,camera);return ray.ray.intersectPlane(ground,new THREE.Vector3());}
function pick(x,y){ndc.set(x/innerWidth*2-1,-y/innerHeight*2+1);ray.setFromCamera(ndc,camera);const hits=ray.intersectObjects(pickables,false).filter(hit=>hit.object.visible&&hit.object.parent.visible);return (hits.find(hit=>hit.object.userData.node.group!=='home')||hits[0])?.object.userData.node;}
const navigationBounds={minX:Math.min(-105,...nodes.map(n=>n.x-n.r-30)),maxX:Math.max(105,...nodes.map(n=>n.x+n.r+30)),minZ:Math.min(-95,...nodes.map(n=>n.z-n.r-30)),maxZ:Math.max(95,...nodes.map(n=>n.z+n.r+30))};
function clampFocus(){desired.x=THREE.MathUtils.clamp(desired.x,navigationBounds.minX,navigationBounds.maxX);desired.z=THREE.MathUtils.clamp(desired.z,navigationBounds.minZ,navigationBounds.maxZ);}
function showInfo(node){
 if(departure||!node.body.visible)return;
 clearTimeout(infoTimer);infoTimer=null;infoNode=node;
 $('#destination').hidden=false;document.body.classList.add('info-open');
 $('#destSector').textContent=(groups[node.group]?.sub||'HOME')+' / COORDINATE '+String(nodes.indexOf(node)+1).padStart(2,'0');
 $('#destTitle').textContent=node.name;$('#destDesc').textContent=node.desc;$('#destUrl').textContent=displayUrl(node.url);
 measureInfoFraming();
}
function hideInfoSoon(){if(infoPinned||infoTimer)return;infoTimer=setTimeout(()=>{infoTimer=null;infoNode=null;$('#destination').hidden=true;document.body.classList.remove('info-open');},160);}
function select(node,pin=false){
 infoPinned=pin;selected=node;desired.set(node.x,0,node.z);wantedDistance=Math.min(wantedDistance,42);
 showInfo(node);nodes.forEach(n=>n.label.classList.toggle('selected',n===node));
}
$('#destination').onpointerenter=()=>{clearTimeout(infoTimer);infoTimer=null;};
$('#destination').onpointerleave=hideInfoSoon;
$('#close').onclick=()=>{cancelTouchTap();infoPinned=false;clearTimeout(infoTimer);infoTimer=null;infoNode=null;$('#destination').hidden=true;document.body.classList.remove('info-open');selected=null;nodes.forEach(n=>n.label.classList.remove('selected'));};
function updateEntry(){
 // Proximity follows the camera, independently of whichever description is hovered.
 let nearest=null,best=Infinity;
 if(distance<60){
  for(const n of nodes){
   if(!n.body.visible||n.group==='home')continue;
   const gap=Math.hypot(focus.x-n.x,focus.z-n.z),p=project(n.body.position);
   if(gap<n.r+9&&gap<best&&p.visible&&p.x>0&&p.x<innerWidth&&p.y>0&&p.y<innerHeight){nearest=n;best=gap;}
  }
 }
 if(nearest!==nearbyNode){
  nearbyNode=nearest;$('#destLink').hidden=!nearest;
  if(nearest){$('#destLink').href=nearest.url;$('#destLink').title=displayUrl(nearest.url);$('#entryText').textContent='进入 '+nearest.name;}
 }
}
function home(){pauseAutoOrbit();autoOrbitOffset=0;cancelTouchTap();clearTimeout(clickTimer);pendingClick=null;desired.set(-5,0,0);wantedDistance=defaultDistance();wantedAzimuth=initialAzimuth;wantedElevation=initialElevation;$('#close').click();}
function isHomeView(){
 const angle=Math.atan2(Math.sin(wantedAzimuth-initialAzimuth-autoOrbitOffset),Math.cos(wantedAzimuth-initialAzimuth-autoOrbitOffset));
 return Math.hypot(desired.x+5,desired.z)<.2&&Math.abs(wantedDistance-defaultDistance())<.5&&Math.abs(angle)<.01&&Math.abs(wantedElevation-initialElevation)<.01;
}
function defaultDistance(){return innerWidth/innerHeight<1?175:110;}
wantedDistance=defaultDistance();distance=wantedDistance*(paused?1:1.2);
$('#home').onclick=home;$('#plus').onclick=()=>wantedDistance=Math.max(13,wantedDistance*.78);$('#minus').onclick=()=>wantedDistance=Math.min(600,wantedDistance*1.28);
const pointers=new Map();let moved=false,lastGesture=null,pendingTouchTap=null;
function cancelTouchTap(){if(pendingTouchTap)clearTimeout(pendingTouchTap.timer);pendingTouchTap=null;}
function handleTouchTap(node,x,y){
 const now=performance.now(),previous=pendingTouchTap;
 if(previous&&now-previous.time<=300&&Math.hypot(x-previous.x,y-previous.y)<30){
  cancelTouchTap();
  const target=node||previous.node,before=wantedDistance;
  if(target){select(target,true);wantedDistance=Math.max(13,Math.min(wantedDistance,before*.6));}
  else{
   dismissTouchInfo();const anchor=pointOnPlane(x,y),next=Math.max(13,before*.6);
   if(anchor){desired.x+=(anchor.x-desired.x)*(1-next/before);desired.z+=(anchor.z-desired.z)*(1-next/before);clampFocus();}
   wantedDistance=next;
  }
  return;
 }
 if(previous){clearTimeout(previous.timer);pendingTouchTap=null;if(previous.node)select(previous.node,true);}
 const tap={node,x,y,time:now};
 tap.timer=setTimeout(()=>{if(pendingTouchTap!==tap)return;pendingTouchTap=null;if(node)select(node,true);else $('#close').click();},300);
 pendingTouchTap=tap;
}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function pointerDown(e){
 if(departure||(e.pointerType==='mouse'&&e.button!==0&&e.button!==2))return;
 e.preventDefault();canvas.setPointerCapture(e.pointerId);
 if(e.pointerType==='touch'){clearTimeout(clickTimer);pendingClick=null;}
 if(!pointers.size){moved=false;lastGesture=null;}
 const label=e.target.closest?.('.node-label');
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,rotate:e.button===2,node:nodes.find(n=>n.label===label)});
 if(pointers.size>1){cancelTouchTap();moved=true;lastGesture=measureGesture([...pointers.values()]);dismissTouchInfo();}
 if(e.pointerType!=='touch')hideInfoSoon();
 canvas.style.cursor='grabbing';
}
function dismissTouchInfo(){if(touchMode){infoPinned=false;clearTimeout(infoTimer);infoTimer=null;infoNode=null;$('#destination').hidden=true;document.body.classList.remove('info-open');}}
canvas.addEventListener('pointerdown',pointerDown);
$('#labels').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')pointerDown(e);});
canvas.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId)){
  if(e.pointerType==='touch'||touchMode)return;
  const node=pick(e.clientX,e.clientY);canvas.style.cursor=node?'pointer':'grab';if(node)showInfo(node);else hideInfoSoon();return;
 }
 const old=pointers.get(e.pointerId);
 pointers.set(e.pointerId,{...old,x:e.clientX,y:e.clientY});
 if(Math.hypot(e.clientX-old.startX,e.clientY-old.startY)>(e.pointerType==='touch'?8:4)){cancelTouchTap();moved=true;dismissTouchInfo();}
 if(e.pointerType==='touch'&&pointers.size===1&&!moved)return;
 if(pointers.size===1&&old.rotate){wantedAzimuth-=(e.clientX-old.x)*.006;wantedElevation=THREE.MathUtils.clamp(wantedElevation+(e.clientY-old.y)*.005,.3,1.45);}
 else if(pointers.size===1){const a=pointOnPlane(old.x,old.y),b=pointOnPlane(e.clientX,e.clientY);if(a&&b){desired.add(a.sub(b));clampFocus();}}
 else{
  const gesture=measureGesture([...pointers.values()]);
  if(lastGesture){
   const change=gestureChange(lastGesture,gesture);
   wantedDistance=THREE.MathUtils.clamp(wantedDistance*change.zoom,13,600);
   // Camera orbit must match screen-space finger rotation.
   wantedAzimuth+=change.twist-change.dx*.004;
   wantedElevation=THREE.MathUtils.clamp(wantedElevation+change.dy*.004,.3,1.45);
  }
  lastGesture=gesture;moved=true;
 }
});
canvas.addEventListener('pointerleave',()=>{if(!touchMode)hideInfoSoon();});
function releasePointer(e,cancelled=false){
 const pointer=pointers.get(e.pointerId);if(!pointer)return;
 if(cancelled)cancelTouchTap();
 if(!cancelled&&!moved&&pointers.size===1&&e.button===0&&!pointer.rotate){
  const node=pointer.node||pick(e.clientX,e.clientY);
  if(e.pointerType==='touch'){lastTouchTime=performance.now();handleTouchTap(node,e.clientX,e.clientY);}
  else if(node)clickNode(node);
 }
 pointers.delete(e.pointerId);lastGesture=null;
 if(pointers.size){moved=true;for(const p of pointers.values()){p.startX=p.x;p.startY=p.y;}}
 if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
 canvas.style.cursor=pointers.size?'grabbing':'grab';
}
canvas.addEventListener('pointerup',e=>releasePointer(e));
canvas.addEventListener('pointercancel',e=>releasePointer(e,true));
canvas.addEventListener('lostpointercapture',e=>releasePointer(e,true));
canvas.addEventListener('wheel',e=>{e.preventDefault();const anchor=pointOnPlane(e.clientX,e.clientY),ratio=Math.exp(THREE.MathUtils.clamp(e.deltaY,-200,200)*.0015),next=THREE.MathUtils.clamp(wantedDistance*ratio,13,600);if(anchor){const factor=1-next/wantedDistance;desired.x+=(anchor.x-desired.x)*factor;desired.z+=(anchor.z-desired.z)*factor;clampFocus();}wantedDistance=next;},{passive:false});
function applyFilter(){const query=$('#search').value.trim().toLowerCase();let count=0;nodes.forEach(n=>{const visible=(filter==='all'||n.group===filter)&&(!query||(n.name+' '+n.url).toLowerCase().includes(query));n.body.visible=visible;n.label.hidden=!visible||(n.group==='home'&&n!==selected);if(visible)count++;});$('#empty').hidden=count>0;Object.entries(groups).forEach(([key,g])=>g.el.hidden=filter!=='all'&&filter!==key);if((selected&&!selected.body.visible)||(infoNode&&!infoNode.body.visible))$('#close').click();updateRoutes();}
function fitCategory(){
 const visible=nodes.filter(n=>n.body.visible&&n.group!=='home');
 const fit=fitPlanetView(visible.map(n=>({...n,r:n.r*mobileModelScale()})),{width:innerWidth,height:innerHeight,azimuth:wantedAzimuth,elevation:wantedElevation,fov:camera.fov,orbitRadius});
 if(fit){desired.set(fit.x,0,fit.z);wantedDistance=fit.distance;clampFocus();}
}
$('#search').oninput=applyFilter;
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{
 cancelTouchTap();clearTimeout(clickTimer);pendingClick=null;$('#close').click();
 filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(n=>n.classList.toggle('active',n===b));applyFilter();
 fitCategory();
});
document.addEventListener('keydown',e=>{if(departure){if(e.key==='Escape'){e.preventDefault();cancelDeparture();}return;}if(e.target instanceof HTMLInputElement){if(e.key==='Escape'){e.target.value='';applyFilter();e.target.blur();}return;}if(e.key==='/'){e.preventDefault();$('#search').focus();return;}if(e.key==='Escape'){$('#close').click();return;}const step=wantedDistance*.06;const moves={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};if(moves[e.key]){e.preventDefault();desired.x+=moves[e.key][0];desired.z+=moves[e.key][1];clampFocus();}if(e.key==='+'||e.key==='=')$('#plus').click();if(e.key==='-')$('#minus').click();if(e.key==='Home')home();});
// Keep distant labels small and quiet; preserve the larger close-up labels.
// Use each label's camera depth so panning and rotation also preserve perspective.
const labelViewPosition=new THREE.Vector3();
function labelMetrics(position){
 const depth=Math.max(.1,-labelViewPosition.copy(position).applyMatrix4(camera.matrixWorldInverse).z);
 const zoom=defaultDistance()*orbitRadius/depth;
 const emphasis=THREE.MathUtils.smoothstep(zoom,1,1.6);
 const scale=THREE.MathUtils.clamp(Math.pow(zoom,.55)*(.8+.2*emphasis),.72,1.9);
 const opacity=.45+.55*THREE.MathUtils.smoothstep(zoom,.8,1.7);
 return {scale, opacity, pixelsPerUnit:innerHeight/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*depth)};
}
function project(pos){projection.copy(pos).project(camera);return {x:(projection.x*.5+.5)*innerWidth,y:(-.5*projection.y+.5)*innerHeight,visible:projection.z<1&&projection.z>-1};}
// Shift the projection, not the planet's coordinates or the gesture's world target.
const infoFraming={x:0,y:0,targetX:0,targetY:0,clearBottom:Infinity};
function measureInfoFraming(){
 const card=$('#destination');
 infoFraming.targetX=infoFraming.targetY=0;infoFraming.clearBottom=Infinity;
 if(!touchMode||!infoPinned||!infoNode||card.hidden)return;
 const top=$('header').offsetTop+$('header').offsetHeight+16;
 if(innerWidth<=700&&innerHeight>500){
  infoFraming.clearBottom=card.offsetTop-12;
  const bottom=Math.max(top+80,card.offsetTop-20);
  infoFraming.targetY=innerHeight/2-(top+bottom)/2;
 }else if(innerHeight<=500){
  const left=card.offsetLeft+card.offsetWidth+20,right=$('.zoom').offsetLeft-16;
  const bottom=Math.max(top+60,innerHeight-100);
  infoFraming.targetX=innerWidth/2-(left+Math.max(left+80,right))/2;
  infoFraming.targetY=innerHeight/2-(top+bottom)/2;
 }
}
function updateInfoFraming(dt){
 if(!touchMode||!infoPinned||!infoNode||$('#destination').hidden||departure){infoFraming.targetX=infoFraming.targetY=0;infoFraming.clearBottom=Infinity;}
 const ease=paused?1:1-Math.exp(-dt*8);
 infoFraming.x=THREE.MathUtils.lerp(infoFraming.x,infoFraming.targetX,ease);
 infoFraming.y=THREE.MathUtils.lerp(infoFraming.y,infoFraming.targetY,ease);
 if(Math.abs(infoFraming.x)<.05&&Math.abs(infoFraming.y)<.05){
  if(camera.view?.enabled)camera.clearViewOffset();
 }else{
  camera.setViewOffset(innerWidth,innerHeight,infoFraming.x,infoFraming.y,innerWidth,innerHeight);
 }
}
const infoResizeObserver=new ResizeObserver(measureInfoFraming);
infoResizeObserver.observe($('#destination'));infoResizeObserver.observe($('header'));
// Font loading can change label bounds after the first frame.
document.fonts.ready.then(()=>nodes.forEach(n=>{n.labelLayoutKey=null;}));
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer?.setSize(innerWidth,innerHeight);measureInfoFraming();});
for(const event of ['pointerdown','pointermove','pointerup','pointercancel','wheel','keydown','input','focusin','focusout'])document.addEventListener(event,pauseAutoOrbit,{capture:true,passive:true});
document.addEventListener('visibilitychange',pauseAutoOrbit);
let previous=performance.now(),lastHud=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.05);previous=now;updateAutoOrbit(now,dt);if(!paused&&!document.hidden)time+=dt;const ease=paused?1:1-Math.exp(-dt*6);focus.lerp(desired,ease);distance+=(wantedDistance-distance)*ease;azimuth+=(wantedAzimuth-azimuth)*ease;elevation+=(wantedElevation-elevation)*ease;if(departure&&!departure.reduced){
 const t=THREE.MathUtils.clamp((now-departure.start)/departure.duration,0,1),travel=t*t*(3-2*t);
 focus.lerpVectors(departure.focus,departure.node.body.position,travel);
 const arrivalDistance=Math.max(.6,departure.node.r*.35);
 distance=departure.distance*Math.pow(arrivalDistance/departure.distance,travel);
 departureVeil.style.opacity=THREE.MathUtils.smoothstep(t,.45,1).toFixed(3);
 }
 const radius=distance*orbitRadius,groundRadius=radius*Math.cos(elevation);camera.position.set(focus.x+Math.sin(azimuth)*groundRadius,radius*Math.sin(elevation),focus.z+Math.cos(azimuth)*groundRadius);camera.lookAt(focus);camera.updateMatrixWorld();updateInfoFraming(dt);
 nodes.forEach(n=>{
  n.body.scale.setScalar(mobileModelScale());
  n.body.position.y=Math.sin(time*.5+n.phase)*.25;
  n.rock.rotation.y=n.phase+time*n.speed;
  if(n.orbit)n.orbit.material.opacity=n===selected ? .75 : .2;
  if(n.hoverGlow){
   const target=n===infoNode&&!departure ? .32 : 0;
   n.hoverGlow.material.opacity=THREE.MathUtils.lerp(n.hoverGlow.material.opacity,target,paused?1:1-Math.exp(-dt*10));
   n.hoverGlow.visible=n.hoverGlow.material.opacity>.002;
  }
  const p=project(n.body.position),metrics=labelMetrics(n.body.position);
  n.label.style.setProperty('--label-scale',metrics.scale.toFixed(3));
  n.label.querySelector('small').hidden=distance>100;
  // Cache unscaled bounds; only text visibility and viewport changes affect them.
  const layoutKey=innerWidth+':'+innerHeight+':'+(distance>100);
  if(n.labelLayoutKey!==layoutKey){
   n.label.hidden=false;
   n.labelWidth=n.label.offsetWidth;n.labelHeight=n.label.offsetHeight;
   n.labelLayoutKey=layoutKey;
  }
  const halfWidth=n.labelWidth*metrics.scale/2;
  const labelTop=p.y+n.r*mobileModelScale()*metrics.pixelsPerUnit+10*metrics.scale;
  const labelBottom=labelTop+n.labelHeight*metrics.scale;
  n.label.style.left=THREE.MathUtils.clamp(p.x,halfWidth+12,innerWidth-halfWidth-12)+'px';
  n.label.style.top=labelTop+'px';
  const onScreen=p.visible&&p.x>45&&p.x<innerWidth-45&&p.y>95&&labelBottom<innerHeight-100;
  const coveredByInfo=touchMode&&infoPinned&&n===infoNode&&labelBottom>infoFraming.clearBottom;
  n.label.hidden=!n.body.visible||!onScreen||coveredByInfo||(n.group==='home'&&n!==selected);
  n.label.style.setProperty('--label-opacity',metrics.opacity.toFixed(3));
 });
 Object.values(groups).forEach(g=>{const position=new THREE.Vector3(g.x,-1,g.z),p=project(position),metrics=labelMetrics(position);g.el.style.setProperty('--label-scale',metrics.scale.toFixed(3));g.el.style.left=p.x+'px';g.el.style.top=p.y+'px';g.el.style.opacity=distance<45?'0':metrics.opacity.toFixed(3);});
 if(now-lastHud>80){document.body.classList.toggle('view-changed',!isHomeView());$('#zoomValue').textContent=(105/distance).toFixed(1)+'×';$('.intro').style.visibility=distance<75?'hidden':'visible';lastHud=now;}
 updateShip(dt);
 updateEntry();
 if(renderer){renderer.render(scene,camera);if(!document.body.classList.contains('ready')){document.body.classList.add('ready');$('#loading').setAttribute('aria-hidden','true');}}}
frame(performance.now());

