import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url)),temp=await mkdtemp(path.join(tmpdir(),'homepage-routing-'));
try{
 await mkdir(path.join(temp,'scripts'));
 for(const file of ['migration-config.json','vercel.json','scripts/configure-legacy.mjs'])await copyFile(path.join(root,file),path.join(temp,file));
 const run=origin=>spawnSync(process.execPath,[path.join(temp,'scripts/configure-legacy.mjs'),origin],{encoding:'utf8'});
 assert.notEqual(run('https://www.charlyw.top').status,0,'self-proxy must be rejected');
 assert.notEqual(run('https://legacy.example.test/path').status,0,'only bare origins are supported');
 assert.notEqual(run('http://legacy.example.test').status,0,'production origin must use HTTPS');
 assert.equal(run('https://legacy.example.test').status,0);
 const config=JSON.parse(await readFile(path.join(temp,'migration-config.json'),'utf8'));
 const vercel=JSON.parse(await readFile(path.join(temp,'vercel.json'),'utf8'));
 assert.equal(config.legacyOrigin,'https://legacy.example.test');
 for(const prefix of config.legacyPaths){
  assert.equal(vercel.rewrites.find(rule=>rule.source===prefix)?.destination,config.legacyOrigin+prefix);
  if(!prefix.includes('.'))assert.equal(vercel.rewrites.find(rule=>rule.source===prefix+'/:path*')?.destination,config.legacyOrigin+prefix+'/:path*');
 }
 for(const [source,destination] of Object.entries(config.homepageAliases))assert.equal(vercel.rewrites.find(rule=>rule.source===source)?.destination,destination);
 console.log('Migration routing: legacy entries, nested assets, cache aliases and loop prevention passed.');
}finally{await rm(temp,{recursive:true,force:true});}
