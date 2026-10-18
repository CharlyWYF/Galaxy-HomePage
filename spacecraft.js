import * as THREE from './vendor/three.module.js';

// Lightweight, locally generated geometry; no model downloads or textures required.
export function createSpacecraft(){
 const ship=new THREE.Group();
 const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.55,metalness:.45,flatShading:true,...extra});
 const hull=material(0xc8cec9),trim=material(0xbba071),dark=material(0x283641),panel=material(0x203f58,{roughness:.35,metalness:.65});
 const glass=material(0x345d73,{roughness:.18,metalness:.7,emissive:0x173b50,emissiveIntensity:.28});
 const engine=material(0x96d4e2,{emissive:0x72c8e3,emissiveIntensity:.75});
 function part(geometry,mat,x=0,y=0,z=0,parent=ship){const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);parent.add(m);return m;}
 // Faceted pressure hull, a tapered nose and a raised glass canopy.
 part(new THREE.CylinderGeometry(.68,.62,2.35,8),hull).rotation.x=Math.PI/2;
 part(new THREE.CylinderGeometry(.18,.68,.8,8),hull,0,0,1.55).rotation.x=Math.PI/2;
 part(new THREE.BoxGeometry(.92,.09,1.7),trim,0,.57,-.15);
 const canopy=part(new THREE.IcosahedronGeometry(.64,0),glass,0,.62,.55);canopy.scale.set(.82,.62,1.25);
 part(new THREE.BoxGeometry(.045,.045,.86),trim,0,.99,.48);
 part(new THREE.BoxGeometry(.34,.05,.55),dark,0,.67,-.63);
 // Small seams and vent strips make the hull legible without busy surface detail.
 for(const side of [-1,1]){
  part(new THREE.BoxGeometry(.045,.17,1.2),trim,side*.63,.12,-.1);
  for(let i=0;i<3;i++)part(new THREE.BoxGeometry(.2,.035,.055),dark,side*.38,.61,-.68+i*.14);
  part(new THREE.BoxGeometry(2.15,.10,.14),trim,side*1.68,0,-.12);
  part(new THREE.CylinderGeometry(.17,.17,.22,8),dark,side*1.05,0,-.12).rotation.z=Math.PI/2;
  const wing=new THREE.Group();wing.position.set(side*2.5,0,-.12);wing.rotation.z=side*.035;ship.add(wing);
  part(new THREE.BoxGeometry(2.15,.09,1.85),trim,0,0,0,wing);
  for(const x of [-.51,.51])for(const z of [-.43,.43]){
   part(new THREE.BoxGeometry(.96,.04,.77),panel,x,.065,z,wing);
   part(new THREE.BoxGeometry(.025,.008,.73),dark,x,.09,z,wing);
  }
  // Twin recessed engine bells; the light is confined to their cores.
  part(new THREE.CylinderGeometry(.23,.29,.48,8),dark,side*.43,-.08,-1.39).rotation.x=Math.PI/2;
  part(new THREE.CylinderGeometry(.15,.15,.018,12),engine,side*.43,-.08,-1.64).rotation.x=Math.PI/2;
 }
 // Compact communication mast and a small dorsal fin.
 part(new THREE.CylinderGeometry(.025,.035,.48,6),trim,0,.91,-.65);
 part(new THREE.SphereGeometry(.065,6,4),hull,0,1.17,-.65);
 const fin=part(new THREE.BoxGeometry(.07,.48,.52),hull,0,.57,-1.05);fin.rotation.x=-.25;
 return ship;
}
