import {readFile,writeFile} from 'node:fs/promises';
const input=process.argv[2];
if(!input)throw new Error('Usage: node scripts/configure-legacy.mjs https://YOUR-NEW-SITES-DOMAIN');
const url=new URL(input);
if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('Use a bare HTTPS origin without path, query or credentials.');
if(['charlyw.top','www.charlyw.top'].includes(url.hostname))throw new Error('The new origin must differ from the homepage to avoid rewrite loops.');
const settingsFile=new URL('../migration-config.json',import.meta.url),vercelFile=new URL('../vercel.json',import.meta.url);
const settings=JSON.parse(await readFile(settingsFile,'utf8')),vercel=JSON.parse(await readFile(vercelFile,'utf8'));
settings.legacyOrigin=url.origin;
vercel.rewrites=[...Object.entries(settings.homepageAliases).map(([source,destination])=>({source,destination})),...settings.legacyPaths.flatMap(prefix=>{
 const exact={source:prefix,destination:url.origin+prefix};
 return prefix.includes('.')?[exact]:[exact,{source:prefix+'/:path*',destination:url.origin+prefix+'/:path*'}];
})];
await writeFile(settingsFile,JSON.stringify(settings,null,2)+'\n');
await writeFile(vercelFile,JSON.stringify(vercel,null,2)+'\n');
console.log('Legacy path rewrites configured for '+url.origin+'. Deploy and verify the new site before merging the homepage migration.');
