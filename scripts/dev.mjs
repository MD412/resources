import './build.mjs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const arg=name=>{const n=process.argv.indexOf(name);return n<0?undefined:process.argv[n+1]};
const port=Number(arg('--port')||process.env.PORT||4173),host=arg('--host')||'127.0.0.1';
const types={'.mjs':'text/javascript','.css':'text/css','.html':'text/html','.ttf':'font/ttf','.webp':'image/webp','.svg':'image/svg+xml'};
const base=resolve('dist');
createServer(async(req,res)=>{
 try {
  let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(path.endsWith('/'))path+='index.html';
  const file=resolve(base,'.'+path);if(!file.startsWith(base+sep))throw Error();
  const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,host,()=>console.log('Serving AI Repo on http://'+host+':'+port));
