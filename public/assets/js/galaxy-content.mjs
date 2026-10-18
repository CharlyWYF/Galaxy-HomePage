// Keep editable data separate from scene objects and validate common editing mistakes.
const fail=message=>{throw new Error('星图配置：'+message);};
const object=(value,path)=>{
 if(!value||typeof value!=='object'||Array.isArray(value))fail(path+' 必须是对象');
 return value;
};
const text=(value,path)=>{
 if(typeof value!=='string'||!value.trim())fail(path+' 必须填写文字');
 return value;
};
const number=(value,path,min=-Infinity,max=Infinity)=>{
 if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)fail(path+' 数值无效');
 return value;
};
const flag=(value,path)=>{
 if(typeof value!=='boolean')fail(path+' 必须为 true 或 false');
 return value;
};
const color=(value,path)=>{
 if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))fail(path+' 请使用 #RRGGBB 颜色');
 return Number.parseInt(value.slice(1),16);
};
export function parseGalaxyContent(input){
 const config=object(input,'根配置');
 const sectorInput=object(config.sectors,'sectors');
 const sectors=Object.fromEntries(Object.entries(sectorInput).map(([id,value])=>{
  if(!/^[a-z][a-z0-9-]*$/.test(id)||['all','home'].includes(id))fail('分类 ID 无效：'+id);
  const sector=object(value,'分类 '+id);
  return [id,{label:text(sector.label,'分类 '+id+'.label'),name:text(sector.name,'分类 '+id+'.name'),sub:text(sector.sub,'分类 '+id+'.sub')}];
 }));
 const defaults={radius:2,color:'#8fb9b2',ring:false,satellites:true,orbit:true,glow:true,...object(config.defaults??{},'defaults')};
 // Validate defaults even when no planet currently uses them.
 number(defaults.radius,'defaults.radius',.1);color(defaults.color,'defaults.color');
 for(const key of ['ring','satellites','orbit','glow'])flag(defaults[key],'defaults.'+key);
 if(!Array.isArray(config.planets))fail('planets 必须是数组');
 const ids=new Set();
 const planets=config.planets.map((value,index)=>{
  const path='planets['+index+']',item={...defaults,...object(value,path)};
  const id=text(item.id,path+'.id');
  if(!/^[a-z][a-z0-9-]*$/.test(id)||id==='home'||ids.has(id))fail(path+'.id 重复或无效：'+id);
  ids.add(id);
  if(!Object.hasOwn(sectors,item.group))fail(path+'.group 不存在：'+item.group);
  const url=text(item.url,path+'.url');
  try{if(!['http:','https:'].includes(new URL(url).protocol))fail(path+'.url 只支持完整的 http/https 地址');}catch{fail(path+'.url 请填写完整的 http/https 地址');}
  if(item.desc!==undefined&&typeof item.desc!=='string')fail(path+'.desc 必须是文字');
  const planet={id,name:text(item.name,path+'.name'),url,desc:item.desc??'',group:item.group,x:number(item.x,path+'.x'),z:number(item.z,path+'.z'),r:number(item.radius,path+'.radius',.1),color:color(item.color,path+'.color')};
  if(item.accentColor!==undefined)planet.accentColor=color(item.accentColor,path+'.accentColor');
  for(const key of ['ring','satellites','orbit','glow'])planet[key]=flag(item[key],path+'.'+key);
  return planet;
 });
 // Place each sector label at the centroid of its member planets.
 for(const [id,sector] of Object.entries(sectors)){
  const members=planets.filter(planet=>planet.group===id);
  sector.hasPlanets=members.length>0;
  sector.x=members.length?members.reduce((sum,planet)=>sum+planet.x,0)/members.length:0;
  sector.z=members.length?members.reduce((sum,planet)=>sum+planet.z,0)/members.length:0;
 }
 const routeInput=object(config.routes??{},'routes');
 const routes={mode:'auto',closed:true,links:[],color:'#4b6b82',opacity:.4,dashSize:.4,gapSize:.8,...routeInput};
 if(!['auto','manual','none'].includes(routes.mode))fail('routes.mode 必须为 auto、manual 或 none');
 flag(routes.closed,'routes.closed');
 routes.color=color(routes.color,'routes.color');
 number(routes.opacity,'routes.opacity',0,1);number(routes.dashSize,'routes.dashSize',.01);number(routes.gapSize,'routes.gapSize',.01);
 if(!Array.isArray(routes.links)||routes.links.some(pair=>!Array.isArray(pair)||pair.length!==2||pair.some(id=>typeof id!=='string')))fail('routes.links 必须为 [["起点ID", "终点ID"]]');
 return {sectors,planets,routes};
}

// IDs survive reordering; removed endpoints, duplicate edges and self-links are ignored.
export function buildRoutePairs(planets,routes){
 const ids=planets.map(n=>n.id),known=new Set(ids),seen=new Set(),pairs=[];
 const add=(a,b)=>{
  if(a===b||!known.has(a)||!known.has(b))return;
  const key=JSON.stringify([a,b].sort());
  if(!seen.has(key)){seen.add(key);pairs.push([a,b]);}
 };
 if(routes.mode==='auto'){
  const sectors=new Map();
  for(const planet of planets){
   if(!sectors.has(planet.group))sectors.set(planet.group,[]);
   sectors.get(planet.group).push(planet.id);
  }
  for(const members of sectors.values()){
   for(let i=1;i<members.length;i++)add(members[i-1],members[i]);
   if(routes.closed&&members.length>2)add(members.at(-1),members[0]);
  }
 }else if(routes.mode==='manual'){
  for(const [a,b] of routes.links)add(a,b);
 }
 return pairs;
}
