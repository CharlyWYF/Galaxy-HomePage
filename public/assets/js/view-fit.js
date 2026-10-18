// Fit every planet (including its rings) inside a padded perspective viewport.
export function fitPlanetView(nodes,{width,height,azimuth,elevation,fov=43,orbitRadius=1,center=null}){
 if(!nodes.length)return null;
 const extent=n=>Math.max(n.r*1.25,n.ring?n.r*2.05:n.r+1.5);
 const x=center?.x??(Math.min(...nodes.map(n=>n.x-extent(n)))+Math.max(...nodes.map(n=>n.x+extent(n))))/2;
 const z=center?.z??(Math.min(...nodes.map(n=>n.z-extent(n)))+Math.max(...nodes.map(n=>n.z+extent(n))))/2;
 const tan=Math.tan(fov*Math.PI/360),aspect=width/height;
 const usableX=Math.max(.25,1-2*Math.min(100,width*.22)/width);
 const usableY=Math.max(.25,1-2*Math.min(110,height*.24)/height);
 const sinA=Math.sin(azimuth),cosA=Math.cos(azimuth),sinE=Math.sin(elevation),cosE=Math.cos(elevation);
 let radius=0;
 for(const n of nodes){
  const dx=n.x-x,dz=n.z-z,r=extent(n);
  const horizontal=dx*cosA-dz*sinA;
  const vertical=-(dx*sinA+dz*cosA)*sinE;
  const depth=(dx*sinA+dz*cosA)*cosE;
  radius=Math.max(radius,depth+r+(Math.abs(horizontal)+r)/(tan*aspect*usableX),depth+r+(Math.abs(vertical)+r)/(tan*usableY));
 }
 return {x,z,distance:Math.max(45,radius*1.06/orbitRadius)};
}
