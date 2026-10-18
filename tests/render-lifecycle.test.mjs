import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../public/assets/js/galaxy.js',import.meta.url),'utf8');
const lifecycle=source.slice(source.indexOf('// Stop scheduling frames entirely'));
const windowEvents=new Map(),documentEvents=new Map(),scheduled=new Map();
let clock=1000,id=0,focused=true,suspended=false;
const context=vm.createContext({
 document:{hidden:false,hasFocus:()=>focused,body:{classList:{toggle:(_,value)=>{suspended=value;}}},addEventListener:(event,fn)=>documentEvents.set(event,fn)},
 performance:{now:()=>clock},
 requestAnimationFrame:fn=>{const token=id++;scheduled.set(token,fn);return token;},
 cancelAnimationFrame:token=>scheduled.delete(token),
 addEventListener:(event,fn)=>windowEvents.set(event,fn),
 pauseAutoOrbit(){},frame(){},
});
vm.runInContext('let previous=0,frameRequest=null,pageFocused=document.hasFocus();'+lifecycle,context);
assert.equal(scheduled.size,1);
windowEvents.get('focus')();assert.equal(scheduled.size,1,'duplicate focus must not create another loop');
focused=false;windowEvents.get('blur')();
assert.equal(scheduled.size,0,'blur must cancel even request ID zero');assert.equal(suspended,true);
context.document.hidden=true;documentEvents.get('visibilitychange')();
focused=true;windowEvents.get('focus')();assert.equal(scheduled.size,0,'hidden documents must stay suspended even if focused');
clock=90000;context.document.hidden=false;documentEvents.get('visibilitychange')();
assert.equal(scheduled.size,1);assert.equal(suspended,false);
assert.equal(vm.runInContext('previous',context),clock,'resume must reset the animation clock');
windowEvents.get('pagehide')();assert.equal(scheduled.size,0);
focused=false;windowEvents.get('pageshow')();assert.equal(scheduled.size,0);
focused=true;windowEvents.get('focus')();assert.equal(scheduled.size,1);
console.log('Blur, visibility, restore and single-loop scheduling checks passed.');
