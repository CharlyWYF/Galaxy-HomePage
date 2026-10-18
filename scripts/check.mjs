import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseGalaxyContent} from '../public/assets/js/galaxy-content.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),publicRoot=path.join(root,'public');
async function files(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const name=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await files(name));else result.push(name);}return result;}
let checked=0;
for(const file of await files(publicRoot)){
 if(!/\.(html|css|m?js)$/.test(file)||file.includes(path.sep+'vendor'+path.sep)&&!file.endsWith('fonts.css'))continue;
 const text=await readFile(file,'utf8');
 const refs=[];
 if(file.endsWith('.html'))for(const m of text.matchAll(/(?:src|href)=["']([^"']+)["']/g))refs.push(m[1]);
 if(file.endsWith('.css'))for(const m of text.matchAll(/url\(["']?([^\s'"\)]+)["']?\)/g))refs.push(m[1]);
 if(/\.m?js$/.test(file))for(const m of text.matchAll(/(?:from\s*|import\s*\(|new URL\()["']([^"']+)["']/g))refs.push(m[1]);
 for(const ref of refs){
  if(!ref.startsWith('.')&&!ref.startsWith('/'))continue;
  const clean=decodeURIComponent(ref.split(/[?#]/)[0]);
  const target=path.resolve(clean.startsWith('/')?publicRoot:path.dirname(file),'.'+(clean.startsWith('/')?clean:'/'+clean));
  if(!target.startsWith(publicRoot+path.sep)&&target!==publicRoot)throw new Error('Resource escapes public/: '+ref);
  try{await stat(target);checked++;}catch{throw new Error('Missing resource: '+path.relative(root,file)+' → '+ref);}
 }
}
const content=parseGalaxyContent(JSON.parse(await readFile(path.join(publicRoot,'content/galaxy-content.json'),'utf8')));
const migration=JSON.parse(await readFile(path.join(root,'migration-config.json'),'utf8'));
const deployment=process.argv.includes('--deployment');
if(deployment&&!migration.legacyOrigin)throw new Error('Migration not ready: deploy charly-sites first, then run node scripts/configure-legacy.mjs https://NEW-ORIGIN before deploying the homepage.');
if(deployment){
 const vercel=JSON.parse(await readFile(path.join(root,'vercel.json'),'utf8'));
 for(const prefix of migration.legacyPaths){
  const rule=vercel.rewrites?.find(rule=>rule.source===prefix);
  if(rule?.destination!==migration.legacyOrigin+prefix)throw new Error('Missing legacy rewrite: '+prefix);
 }
}
console.log(`Homepage: ${content.planets.length} planets; ${checked} local resource references valid.`);
if(!migration.legacyOrigin)console.log('Production cutover pending: legacy origin has not been configured.');
