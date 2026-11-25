const repo="Gunavikesh/Gunavikesh.github.io";
const endpoint="https://api.github.com/repos/"+repo+"/contents/data/portfolio.json";
const fields={profile:{name:"Full name",title:"Job title",experience:"Years of experience",focus:"Engineering focus",headline:"Headline",bio:"Professional summary",company:"Current company",location:"Location",primaryStack:"Primary stack",linkedin:"LinkedIn URL",github:"GitHub URL",photo:"Profile image HTTPS URL",resume:"Résumé HTTPS URL"},experience:{company:"Company",role:"Role",period:"Period",details:"Responsibilities (one per line)",stack:"Technologies (one per line)"},projects:{name:"Project name",domain:"Category",summary:"Summary",challenge:"Challenge",approach:"Approach",engineering:"Engineering focus",architecture:"Architecture steps (one per line)",stack:"Technologies (one per line)",link:"Project HTTPS URL"},skills:{name:"Skill category",description:"Description",stack:"Technologies (one per line)"},links:{name:"Repository name",url:"HTTPS URL"}};
const arrays=new Set(["details","stack","architecture"]);
const long=new Set(["bio","summary","challenge","approach","engineering","description",...arrays]);
const root=document.getElementById("root");
let data=null,sha="",tab="profile",busy=false,dirty=false;
function el(tag,attrs={},...children){
 const node=document.createElement(tag);
 for(const [k,v] of Object.entries(attrs)){
  if(k==="className")node.className=v;else if(k==="onClick")node.addEventListener("click",v);else if(k==="onInput")node.addEventListener("input",v);else if(k==="value")node.value=v;else if(k==="disabled")node.disabled=v;else node.setAttribute(k,v);
 }
 for(const c of children.flat())if(c!==null&&c!==undefined)node.append(c instanceof Node?c:document.createTextNode(String(c)));
 return node;
}
const button=(text,fn,cls="btn")=>el("button",{type:"button",className:cls,onClick:fn},text);
const token=el("input",{type:"password",autocomplete:"off",placeholder:"Token is held in memory only","aria-label":"GitHub access token"});
const status=el("p",{className:"status",role:"status","aria-live":"polite"},"Loading portfolio…");
const editor=el("div",{}),preview=el("aside",{className:"panel preview"}),tabs=el("div",{className:"tabs"});
const publishButton=button("Publish changes",publish,"btn primary");
const reloadButton=button("Reload published content",()=>{if(!dirty||confirm("Discard unsaved changes?"))load()});
const exportButton=button("Export draft",()=>{if(!data)return;const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));const a=el("a",{href:url,download:"portfolio.json"});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
function setBusy(value){busy=value;publishButton.disabled=value||!data;reloadButton.disabled=value;exportButton.disabled=value||!data}
function notify(message){status.textContent=message}
function renderPreview(){
 preview.replaceChildren(el("div",{className:"label"},"Live draft preview"));
 if(!data)return;
 const p=data.profile;
 preview.append(el("h2",{},p.name),el("h3",{},p.title),el("p",{},p.headline),el("p",{},p.bio),el("p",{},p.experience+" · "+p.company));
 if(tab!=="profile")for(const x of data[tab])preview.append(el("div",{className:"card"},el("h3",{},x.name||x.company||"New entry"),el("p",{},x.summary||x.description||x.role||x.url||""),el("p",{},(x.stack||[]).join(" · "))));
}
function render(){
 tabs.replaceChildren();editor.replaceChildren();if(!data){renderPreview();return}
 for(const t of Object.keys(fields)){const b=button(t[0].toUpperCase()+t.slice(1),()=>{tab=t;render()});b.setAttribute("aria-pressed",String(t===tab));tabs.append(b)}
 const entries=tab==="profile"?[data.profile]:data[tab];
 entries.forEach((obj,i)=>{
  const panel=el("div",{className:"panel"});
  for(const [k,title] of Object.entries(fields[tab])){
   const input=el(long.has(k)?"textarea":"input",{value:arrays.has(k)?(obj[k]||[]).join("\n"):obj[k]||"",onInput:e=>{obj[k]=arrays.has(k)?e.target.value.split("\n"):e.target.value;dirty=true;renderPreview()}});
   panel.append(el("label",{},title,input));
  }
  if(tab!=="profile")panel.append(button("Remove entry",()=>{if(confirm("Remove this entry from your draft?")){data[tab].splice(i,1);dirty=true;render()}},"btn danger"));
  editor.append(panel);
 });
 if(tab!=="profile")editor.append(button("+ Add entry",()=>{const obj=Object.fromEntries(Object.keys(fields[tab]).map(k=>[k,arrays.has(k)?[]:""]));if(tab==="projects")obj.id=crypto.randomUUID();data[tab].push(obj);dirty=true;render()}));
 renderPreview();
}
function validate(x){if(!x||!x.profile||!["experience","projects","skills","links"].every(k=>Array.isArray(x[k])))throw Error("Unexpected portfolio data format.");return x}
const decode=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,"")),c=>c.charCodeAt(0)));
const encode=s=>{let str="";for(const b of new TextEncoder().encode(s))str+=String.fromCharCode(b);return btoa(str)};
async function githubRead(auth=""){const headers={Accept:"application/vnd.github+json"};if(auth)headers.Authorization="Bearer "+auth;const r=await fetch(endpoint,{cache:"no-store",headers});if(!r.ok)throw Error("GitHub returned "+r.status);const x=await r.json();return {data:validate(JSON.parse(decode(x.content))),sha:x.sha}}
async function load(){setBusy(true);notify("Loading…");try{try{const x=await githubRead(token.value.trim());data=x.data;sha=x.sha;notify("Loaded latest published content.")}catch(e){const r=await fetch("../data/portfolio.json",{cache:"no-store"});if(!r.ok)throw Error("Unable to load portfolio data (HTTP "+r.status+").");data=validate(await r.json());sha="";notify("Loaded website data. GitHub API unavailable: "+e.message+". Reload with your token before publishing.")}dirty=false;render()}catch(e){notify(e.message+" Use Reload to try again.")}finally{setBusy(false)}}
async function publish(){if(busy||!data)return;const auth=token.value.trim();if(!auth){notify("Enter your repository-scoped token to publish.");return}if(!sha){notify("Reload published content with your token before editing and publishing. Export your draft first if needed.");return}if(!confirm("Publish these details publicly?"))return;
 setBusy(true);try{const clean=JSON.parse(JSON.stringify(data));for(const key of ["experience","projects","skills"])for(const item of clean[key])for(const k of arrays)if(Array.isArray(item[k]))item[k]=item[k].map(s=>s.trim()).filter(Boolean);
 const r=await fetch(endpoint,{method:"PUT",headers:{Authorization:"Bearer "+auth,Accept:"application/vnd.github+json","Content-Type":"application/json"},body:JSON.stringify({message:"Update portfolio via Portfolio Studio",content:encode(JSON.stringify(clean,null,2)+"\n"),sha,branch:"main"})});const x=await r.json();
 if(!r.ok)throw Error(r.status===409||r.status===422?"Conflict or validation error. Export your draft before reloading.":r.status===401||r.status===403?"Token invalid, expired, or missing repository Contents write permission.":x.message||"Publish failed");
 sha=x.content.sha;data=clean;dirty=false;render();notify("Published to GitHub. Public changes appear after GitHub Pages deployment.");
 }catch(e){notify(e.message)}finally{setBusy(false)}}
root.replaceChildren(el("main",{className:"shell"},el("div",{className:"label"},"Authorized publishing workflow"),el("h1",{style:"font-size:42px"},"Portfolio Studio"),el("p",{},"Edit your public profile without touching code. Drafts are local until you publish."),el("a",{className:"btn",href:"../"},"← Public portfolio"),el("div",{className:"panel"},el("label",{},"GitHub fine-grained access token (only this repository; Contents read/write)",token),el("a",{href:"https://github.com/settings/personal-access-tokens/new",target:"_blank",rel:"noopener noreferrer"},"Create a restricted token ↗"),el("div",{className:"buttons"},publishButton,reloadButton,exportButton,button("Clear token",()=>{token.value="";notify("Token cleared.")})),status),tabs,el("div",{className:"editor"},editor,preview)));
load();
window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});
