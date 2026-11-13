/* Edit mode for the Landside capacity planner. Changes stay in this browser tab until saved to GitHub or exported. */
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const NW=53;
const REPO=(location.hostname.endsWith('.github.io')?location.hostname.split('.')[0]+'/'+(location.pathname.split('/')[1]||''):'SSH679/landside-capacity-planner');
let P,base='',on=false,pe=false,peKey='';
const st=document.createElement('style');
st.textContent='#edBar{display:none;margin:0 0 12px;padding:10px 12px;border:1px solid var(--acc);border-radius:6px;background:var(--surface)}#edBar.show{display:block}#edBar .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#edBar .msg{margin-top:8px;color:var(--mut)}#edBar .err{color:var(--u3)}#edBar .ok{color:var(--c2)}#edForm{display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--line)}#edForm.show{display:block}#edForm .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}#edForm label{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--mut)}#edForm[hidden]{display:none}.strip input{width:38px;padding:1px 2px;text-align:center;font:inherit;border:1px solid var(--line);border-radius:3px;background:var(--surface);color:var(--fg)}.rm{margin-left:8px;padding:0 6px;color:var(--u3)}.dirty{font-weight:600;color:var(--acc)}button[hidden]{display:none}#pfMsg{color:var(--mut)}#pfMsg.ok{color:var(--c2)}#pfMsg.err{color:var(--u3)}';
document.head.appendChild(st);
function ready(){
 P=window.PLANNER;base=JSON.stringify(P.DATA);
 const bar=document.createElement('div');bar.id='edBar';
 bar.innerHTML='<div class="row"><strong>Edit mode</strong><button id="edTeam">+ Team member</button><button id="edProj">+ Project</button><button id="edAlloc">+ Allocation</button><span id="edDirty" class="dirty"></span><span style="flex:1"></span><button id="edExp">Export JSON</button><button id="edSave">Save to GitHub</button><button id="edDisc">Discard changes</button></div>'
 +'<div class="row" style="margin-top:8px"><label style="font-size:12px;color:var(--mut)">GitHub token (this tab only)</label><input id="edTok" type="password" placeholder="fine-grained token, Contents: read &amp; write" style="min-width:260px" autocomplete="off"><button id="edForget">Forget token</button></div>'
 +'<div id="edMsg" class="msg">To change capacity, click a name and use “Edit allocation” under the grid. Saving needs a GitHub token with write access to this repo; without one, use Export JSON.</div>'
 +'<div id="edForm"><div class="grid"><label>Person<select id="fP"></select></label><label id="lPN">New person name<input id="fPN"></label><label id="lPR">Role<input id="fPR" list="edRoles"></label><label>Project<select id="fJ"></select></label><label id="lJN">New project name<input id="fJN"></label><label>From week (1–53)<input id="fW1" type="number" min="1" max="53" value="1"></label><label>To week (1–53)<input id="fW2" type="number" min="1" max="53" value="53"></label><label>Days per week (1–5)<input id="fD" type="number" min="1" max="5" value="3"></label></div><datalist id="edRoles"></datalist><div class="row" style="margin-top:8px"><button id="fAdd" class="on">Add</button><button id="fCancel">Cancel</button></div></div>';
 const anchor=$('.bar');anchor.parentNode.insertBefore(bar,anchor);
 const tb=document.createElement('button');tb.id='edToggle';tb.textContent='Edit';tb.title='Add projects, team members and change capacity';anchor.appendChild(tb);
 try{$('#edTok').value=sessionStorage.getItem('gh-token')||''}catch(e){}
 tb.onclick=()=>{on=!on;window.EDIT=on||pe;tb.classList.toggle('on',on);bar.classList.toggle('show',on);P.render()};
 $('#edTeam').onclick=()=>form('newP');$('#edProj').onclick=()=>form('newJ');$('#edAlloc').onclick=()=>form('');
 $('#fCancel').onclick=()=>$('#edForm').classList.remove('show');
 $('#fP').onchange=sync;$('#fJ').onchange=sync;
 $('#fAdd').onclick=add;
 $('#edExp').onclick=exportJson;$('#edSave').onclick=save;
 $('#edDisc').onclick=discard;
 $('#edForget').onclick=()=>{$('#edTok').value='';try{sessionStorage.removeItem('gh-token')}catch(e){}msg('Token forgotten.')};
 window.addEventListener('beforeunload',e=>{if(dirty()){e.preventDefault();e.returnValue=''}});
 window.onDetail=onDetail;
}
function discard(){P.DATA=JSON.parse(base);pe=false;window.EDIT=on;refresh();const cl=$('#cl');if(cl)cl.click();msg('Changes discarded.')}
function dirty(){return JSON.stringify(P.DATA)!==base}
function msg(t,c){const m=$('#edMsg');m.className='msg '+(c||'');m.textContent=t;$('#edDirty').textContent=dirty()?'Unsaved changes':'';const p=$('#pfMsg');if(p){p.className=c||'';p.textContent=t}const sv=$('#pfSave');if(sv){sv.hidden=!dirty();$('#pfDisc').hidden=!dirty()}}
function countChanges(){return dirty()?1:0}
function refresh(){
 const sel=(id)=>$(id).value;const r=sel('#fRole'),i=sel('#fInit');
 const fill=(s,k,first,keep)=>{const e=$(s);e.innerHTML='<option value="">'+first+'</option>';[...new Set(P.DATA.map(x=>x[k]))].sort().forEach(v=>e.add(new Option(v,v)));e.value=keep};
 fill('#fRole','role','All roles',r);fill('#fInit','initiative','All initiatives',i);
 P.render();$('#edDirty').textContent=dirty()?'Unsaved changes':'';
}
function form(mode){
 const people=[...new Set(P.DATA.map(x=>x.name))].sort(),projs=[...new Set(P.DATA.map(x=>x.initiative))].sort();
 $('#fP').innerHTML=people.map(n=>`<option>${esc(n)}</option>`).join('')+'<option value="__new">New person…</option>';
 $('#fJ').innerHTML=projs.map(n=>`<option>${esc(n)}</option>`).join('')+'<option value="__new">New project…</option>';
 $('#edRoles').innerHTML=[...new Set(P.DATA.map(x=>x.role))].sort().map(n=>`<option value="${esc(n)}">`).join('');
 if(mode==='newP')$('#fP').value='__new';if(mode==='newJ')$('#fJ').value='__new';
 const s=P.sel;if(!mode&&s){if(s.t==='P')$('#fP').value=s.k;else $('#fJ').value=s.k}
 sync();$('#edForm').classList.add('show');
}
function sync(){
 const np=$('#fP').value==='__new',nj=$('#fJ').value==='__new';
 $('#lPN').style.display=np?'':'none';$('#lPR').style.display=np?'':'none';$('#lJN').style.display=nj?'':'none';
}
function add(){
 const np=$('#fP').value==='__new',nj=$('#fJ').value==='__new';
 const name=(np?$('#fPN').value:$('#fP').value).trim(),proj=(nj?$('#fJN').value:$('#fJ').value).trim();
 const w1=+$('#fW1').value,w2=+$('#fW2').value,d=+$('#fD').value;
 let role=np?$('#fPR').value.trim():(P.DATA.find(x=>x.name===name)||{}).role;
 if(!name)return msg('Enter the person’s name.','err');
 if(np&&P.DATA.some(x=>x.name.toLowerCase()===name.toLowerCase()))return msg('That person already exists; pick them from the list.','err');
 if(!role)return msg('Enter a role for the new person.','err');
 if(!proj)return msg('Enter the project name.','err');
 if(nj&&P.DATA.some(x=>x.initiative.toLowerCase()===proj.toLowerCase()))return msg('That project already exists; pick it from the list.','err');
 if(!(w1>=1&&w2<=NW&&w1<=w2))return msg('Weeks must be between 1 and 53, and From must not be after To.','err');
 if(!(d>=1&&d<=5))return msg('Days per week must be between 1 and 5.','err');
 let row=P.DATA.find(x=>x.name===name&&x.initiative===proj);
 if(!row){row={initiative:proj,name:name,role:role,days:Array(NW).fill(0)};P.DATA.push(row)}
 for(let w=w1;w<=w2;w++)row.days[w-1]=d;
 const over=[];
 for(let w=w1;w<=w2;w++){const tot=P.DATA.filter(x=>x.name===name).reduce((a,x)=>a+x.days[w-1],0);const a=avail(w);if(tot>a)over.push(w)}
 $('#edForm').classList.remove('show');
 refresh();
 msg('Added '+name+' to '+proj+' for W'+w1+'–W'+w2+' ('+d+'d/week).'+(over.length?' Note: over-allocated in W'+over.slice(0,6).join(', W')+(over.length>6?'…':'')+'.':''),over.length?'err':'ok');
 P.open('P',name);
}
function avail(w){return P.CFG.daysPerWeek}
function onDetail(d,sel,items,W){
 const key=sel.t+':'+sel.k;if(key!==peKey){peKey=key;pe=false;window.EDIT=on}
 const Pn=sel.t==='P';
 if(pe)d.querySelectorAll('.strip tbody tr').forEach((tr,i)=>{
  const o=items[i];if(!o)return;
  const match=x=>Pn?(x.name===sel.k&&x.initiative===o.k):(x.initiative===sel.k&&x.name===o.k);
  tr.querySelectorAll('td.c').forEach((td,j)=>{
   const w=W[j];const inp=document.createElement('input');inp.type='number';inp.min=0;inp.max=5;inp.step=1;inp.value=o.days[w-1]||'';
   td.textContent='';td.style.background='transparent';td.appendChild(inp);
   inp.onchange=()=>{const v=Math.max(0,Math.min(5,Math.round(+inp.value||0)));const rs=P.DATA.filter(match);if(rs.length){rs[0].days[w-1]=v;rs.slice(1).forEach(r=>r.days[w-1]=0)}refresh();const nm=Pn?sel.k:o.k;const tot=P.DATA.filter(x=>x.name===nm).reduce((a,x)=>a+x.days[w-1],0);msg(tot>avail(w)?nm+' is over-allocated in W'+w+' ('+tot+'d of '+avail(w)+'d available).':'Updated W'+w+'.',tot>avail(w)?'err':'ok')};
  });
  const nc=tr.querySelector('td.n');const b=document.createElement('button');b.className='rm';b.textContent='✕';b.title='Remove '+o.k+' from this '+(Pn?'person':'project');
  b.onclick=()=>{P.DATA=P.DATA.filter(x=>!match(x));refresh();msg('Removed '+o.k+'.','ok')};nc.appendChild(b);
 });
 const f=document.createElement('div');f.className='pf';f.style.cssText='display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px';
 f.innerHTML='<button id="pfEdit" class="'+(pe?'on':'')+'">'+(pe?'Done editing':'Edit allocation')+'</button><button id="pfSave" class="on"'+(dirty()?'':' hidden')+'>Save to GitHub</button><button id="pfDisc"'+(dirty()?'':' hidden')+'>Discard</button><span id="pfMsg">'+(pe?'Change days per week (0\u20135), then click Done editing.':'')+'</span>';
 d.appendChild(f);
 $('#pfEdit').onclick=()=>{pe=!pe;window.EDIT=on||pe;P.render()};
 $('#pfSave').onclick=save;$('#pfDisc').onclick=discard;
}
function exportJson(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(P.DATA)],{type:'application/json'}));a.download='allocations.json';a.click();msg('Exported allocations.json. Replace the file in the repo and commit.','ok')}
async function save(){
 const tok=$('#edTok').value.trim();
 if(!dirty())return msg('No changes to save.');
 if(!tok){$('#edBar').classList.add('show');$('#edTok').scrollIntoView({behavior:'smooth',block:'center'});$('#edTok').focus();return msg('Paste a GitHub token with Contents read/write access to '+REPO+', or use Export JSON.','err')}
 try{sessionStorage.setItem('gh-token',tok)}catch(e){}
 const url='https://api.github.com/repos/'+REPO+'/contents/allocations.json';
 const H={Authorization:'Bearer '+tok,Accept:'application/vnd.github+json'};
 msg('Saving…');
 try{
  const g=await fetch(url+'?ref=main',{headers:H,cache:'no-store'});
  if(!g.ok)return msg(g.status===401||g.status===403||g.status===404?'GitHub rejected the token, or it cannot access '+REPO+'. It needs Contents: read & write on that repo.':'GitHub error '+g.status+' while reading the file.','err');
  const cur=await g.json();
  const body=JSON.stringify(P.DATA);
  const res=await fetch(url,{method:'PUT',headers:H,body:JSON.stringify({message:'Update allocations via planner',content:btoa(unescape(encodeURIComponent(body))),sha:cur.sha,branch:'main'})});
  if(!res.ok)return msg(res.status===409?'The file changed on GitHub since you loaded the page. Reload and redo your edits.':'GitHub error '+res.status+' while saving.','err');
  base=body;$('#edDirty').textContent='';msg('Saved to GitHub. The public site updates in about a minute.','ok');
 }catch(e){msg('Could not reach GitHub: '+e,'err')}
}
if(window.PLANNER)ready();else window.addEventListener('planner-ready',ready);
})();
