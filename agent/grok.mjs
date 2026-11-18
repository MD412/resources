import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
import {canonicalUrl} from '../src/catalog.mjs';
import {submit} from './save.mjs';

const format = {type:'function',function:{name:'save_resource',description:'Save a link supplied by the curator to AI Repo.',parameters:{type:'object',properties:{url:{type:'string'},title:{type:'string'},category:{type:'string',enum:['agents','models','reading','x']},description:{type:'string'}},required:['url','category'],additionalProperties:false}}};
async function chat(message){
  const links=new Set([...message.matchAll(/https?:\/\/[^\s<>\x60"]+/g)].map(m=>canonicalUrl(m[0].replace(/[.,;!?)\]]+$/,''))));
  if(!links.size){console.log('Paste a website or X post URL to save it.');return;}
  const response=await fetch('https://api.x.ai/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+process.env.XAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({
    model:process.env.XAI_MODEL||'grok-4.3',messages:[
      {role:'system',content:'You file resources for Marc’s AI Repo. Call save_resource once per link the user wants saved. Use only the supplied URL and notes. Keep titles and descriptions factual. Omit a description or title when unknown. Never invent a quote. An X status belongs to x.'},
      {role:'user',content:message}],tools:[format],tool_choice:'required'
  }),signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error('xAI returned '+response.status+'. Check XAI_API_KEY and XAI_MODEL.');
  const calls=(await response.json()).choices?.[0]?.message?.tool_calls||[];
  if(!calls.length)throw Error('Grok did not return a submission.');
  for(const call of calls){
    if(call.function?.name!=='save_resource')throw Error('Unexpected tool.');
    const args=JSON.parse(call.function.arguments);
    if(!links.has(canonicalUrl(args.url)))throw Error('The returned URL did not match a link in your message.');
    const result=await submit(args);
    console.log((result.existing?'Already saved: ':'Saved: ')+result.url);
  }
}
async function main(){
  if(!process.env.XAI_API_KEY || !process.env.AI_REPO_GITHUB_TOKEN)throw Error('Set XAI_API_KEY and AI_REPO_GITHUB_TOKEN in the bot environment.');
  if(process.argv.length>2){await chat(process.argv.slice(2).join(' '));return;}
  const rl=createInterface({input:stdin,output:stdout});
  console.log('AI Repo · paste a link or note. Enter /quit to exit.');
  try{
    for await(const line of rl){
      if(line.trim()==='/quit')break;
      if(line.trim())try{await chat(line.trim())}catch(e){console.error(e.message)}
    }
  }finally{rl.close()}
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
