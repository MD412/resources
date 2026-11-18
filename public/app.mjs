import {categories, currentCatalog, readIssues} from './lib/catalog.mjs';
import {content,esc} from './lib/view.mjs';
import {icon} from './lib/icons.mjs';

const root=document.body.dataset.root, page=document.body.dataset.page;
const snapshot=JSON.parse(document.getElementById('catalog').textContent);
let items=snapshot, loading=false, lastCheck=0;
const cacheKey='ai-repo:MD412/resources:1';
const dialog=document.querySelector('#search'), input=document.querySelector('#query');
function renderSearch(){
 const q=input.value.toLowerCase().trim();
 const matches=items.filter(i=>[i.title,i.description,i.url,i.author,categories[i.category].name].join(' ').toLowerCase().includes(q));
 document.querySelector('#results').innerHTML=matches.length?matches.map(i=>'<a class="search-result" href="'+esc(i.url)+'" rel="noopener noreferrer" target="_blank"><span class="category-icon '+i.category+'">'+icon(categories[i.category].icon)+'</span><span><b>'+esc(i.title)+'</b><small>'+esc(new URL(i.url).hostname)+'</small></span>'+icon('external',15)+'</a>').join(''):'<p>No resources match this search.</p>';
}
function display(records){
 const previous=items;items=currentCatalog(snapshot,records);
 if(JSON.stringify(previous)!==JSON.stringify(items)){
   document.querySelector('#main').innerHTML=content(page,root,items);
   if(dialog.open)renderSearch();
 }
}
try{
 const cache=JSON.parse(localStorage.getItem(cacheKey));
 if(cache && Array.isArray(cache.records)){display(cache.records);lastCheck=cache.time;}
}catch{/* Browser storage is optional. */}
async function refresh(){
 if(loading||Date.now()-lastCheck<60000||document.hidden)return;
 loading=true;lastCheck=Date.now();
 try{
  const records=await readIssues();display(records);
  try{localStorage.setItem(cacheKey,JSON.stringify({time:Date.now(),records}));}catch{}
 }catch{/* A static, browsable snapshot is always available. */}
 finally{loading=false;}
}
refresh();document.addEventListener('visibilitychange',refresh);setInterval(refresh,90000);
function search(){if(dialog.open)return;renderSearch();dialog.showModal();input.focus();}
document.querySelector('.find').addEventListener('click',search);
input.addEventListener('input',renderSearch);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{input.value='';});
const toggle=document.querySelector('.mobile-menu');
function nav(open){document.body.classList.toggle('nav-open',open);toggle.setAttribute('aria-expanded',String(open));if(open)document.querySelector('#sidebar a').focus();else toggle.focus();}
toggle.addEventListener('click',()=>nav(!document.body.classList.contains('nav-open')));
document.querySelector('.scrim').addEventListener('click',()=>nav(false));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&document.body.classList.contains('nav-open'))nav(false);
 if((e.key==='/'&&!/INPUT|TEXTAREA/.test(e.target.tagName))||((e.ctrlKey||e.metaKey)&&e.key==='k')){e.preventDefault();search();}
});
document.addEventListener('toggle',e=>{
 if(!e.target.matches?.('details.embed[open]'))return;
 const mount=e.target.querySelector('[data-post]');
 if(mount.firstChild||!/^\d+$/.test(mount.dataset.post))return;
 const frame=document.createElement('iframe');frame.title='Original post on X';frame.referrerPolicy='no-referrer';
 frame.src='https://platform.twitter.com/embed/Tweet.html?dnt=true&id='+mount.dataset.post;mount.append(frame);
},true);
