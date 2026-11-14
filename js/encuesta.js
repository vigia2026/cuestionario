import{db}from"./firebase.js";import{OP,slug,incs,catalogo}from"./opciones.js";
import{doc,writeBatch,increment,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const Q=[{k:"colonia",t:"¿En qué colonia de Ciudad Valles resides?",type:"col"},
{k:"pasaCamion",t:"¿El camión recolector pasa por tu colonia?",o:OP.pasa},
{k:"frecuencia",t:"¿Con qué frecuencia pasa el camión recolector?",o:OP.frec},
{k:"tiempoSinPasar",t:"¿Cuánto tiempo lleva sin pasar el camión recolector?",o:OP.tiempo},
{k:"horario",t:"¿El camión pasa en los horarios habituales?",o:OP.horario},
{k:"satisfaccion",t:"¿Qué tan satisfecho estás con el servicio de recolección?",o:OP.sat},
{k:"acumulacionBasura",t:"¿Se acumula basura en las calles de tu colonia por falta de recolección?",o:OP.acum},
{k:"problemaPrincipal",t:"¿Cuál consideras que es el principal problema del servicio?",o:OP.prob},
{k:"mejoras",t:"¿Qué mejorarías del servicio de recolección?",type:"txt"},
{k:"comentario",t:"¿Deseas agregar algún comentario adicional?",type:"txt",opt:1}];
const NOFIND="📍 No encuentro mi colonia";
const $=id=>document.getElementById(id);
const A={},root=$("form");let i=0,cols=[],sending=false,otra=false;
const sid=()=>sessionStorage.vgId||(sessionStorage.vgId=crypto.randomUUID());
document.addEventListener("click",e=>{const l=$("ls");if(l&&!e.target.closest(".cb"))l.hidden=true});
if(localStorage.vgDone)root.innerHTML='<div class="ok"><h3>Ya registraste tu opinión</h3><p>Gracias por participar.</p></div>';
else catalogo().then(c=>{cols=c;draw()});
function draw(){const q=Q[i],last=i===Q.length;
let h=`<div class="bar"><i style="width:${i/Q.length*100}%"></i></div><p>${last?"Resumen":`Pregunta ${i+1} de ${Q.length}`} ${!last&&!q.opt?'<span class="req">* obligatoria</span>':""}</p>`;
if(last){h+='<dl class="res">'+Q.map(x=>`<dt>${x.t}</dt><dd>${esc(A[x.k]||"—")}</dd>`).join("")+'</dl><p class="warn">No se solicitan datos personales. Tus respuestas se guardan con fecha y hora.</p>'}
else{h+=`<h3>${q.t}</h3>`;
if(q.type==="col")h+=`<div class="cb"><input type="text" id="in" placeholder="Toca para elegir o escribe para buscar" autocomplete="off" value="${esc(otra?NOFIND:A.colonia||"")}"><button type="button" class="cbt" id="tg" aria-label="Abrir lista">▾</button><ul class="cl" id="ls" hidden></ul></div><div id="ot" ${otra?"":"hidden"}><input type="text" id="ni" maxlength="80" placeholder="Escribe el nombre de tu colonia" value="${esc(A.otra||"")}"></div>`;
else if(q.type==="txt")h+=`<textarea id="in" rows="5" maxlength="800" placeholder="Escribe aquí...">${esc(A[q.k]||"")}</textarea>`;
else h+=q.o.map(o=>`<label class="opt"><input type="radio" name="r" value="${esc(o)}" ${A[q.k]===o?"checked":""}>${o}</label>`).join("")}
h+=`<p class="err" id="er"></p><div class="nav"><button class="btn sec" id="bk" ${i?"":"disabled"}>← Atrás</button><button class="btn" id="nx">${last?"Enviar respuestas":"Siguiente →"}</button></div>`;
root.innerHTML=h;
if(!last&&q.type==="col")combo();
$("bk").onclick=()=>{if(!last)save();i--;draw()};
$("nx").onclick=()=>last?send():next()}
function combo(){const inp=$("in"),ls=$("ls"),ot=$("ot");
const fill=t=>{const f=cols.filter(c=>c.toLowerCase().includes(t.toLowerCase()));
ls.innerHTML=`<li class="no" data-o="1">${NOFIND}</li>`+f.map(c=>`<li data-v="${esc(c)}">${esc(c)}</li>`).join("")+(f.length?"":'<li class="vac">Sin coincidencias. Usa «No encuentro mi colonia».</li>');ls.hidden=false};
inp.onfocus=()=>{inp.select();fill("")};
inp.oninput=()=>{A.colonia="";otra=false;ot.hidden=true;fill(inp.value)};
$("tg").onclick=()=>{if(ls.hidden){fill("");inp.focus()}else ls.hidden=true};
ls.onmousedown=e=>e.preventDefault();
ls.onclick=e=>{const li=e.target.closest("li");if(!li||li.classList.contains("vac"))return;
if(li.dataset.o){otra=true;A.colonia="";inp.value=NOFIND;ot.hidden=false;$("ni").focus()}
else{otra=false;A.colonia=li.dataset.v;inp.value=li.dataset.v;ot.hidden=true}
ls.hidden=true}}
function save(){const q=Q[i];
if(q.type==="col"){const inp=$("in"),n=$("ni");if(!inp)return;
if(otra){A.otra=n?n.value.trim():"";A.colonia=A.otra.length>=3?"Otra colonia: "+A.otra:""}
else{const v=inp.value.trim().toLowerCase(),m=cols.find(c=>c.toLowerCase()===v);A.colonia=m||""}return}
const e=$("in")||document.querySelector("input[name=r]:checked");if(e)A[q.k]=e.value.trim()}
function next(){const q=Q[i];save();const v=A[q.k]||"";
if(q.type==="col"&&!v)return err(otra?"Escribe el nombre de tu colonia (mínimo 3 letras).":"Elige tu colonia de la lista o toca «No encuentro mi colonia».");
if(!v&&!q.opt)return err("Esta pregunta es obligatoria.");
i++;draw()}
const err=m=>$("er").textContent=m;
async function send(){if(sending)return;sending=true;const b=$("nx");b.disabled=true;b.textContent="Enviando...";
const d={colonia:A.colonia,pasaCamion:A.pasaCamion,frecuencia:A.frecuencia,tiempoSinPasar:A.tiempoSinPasar,horario:A.horario,satisfaccion:A.satisfaccion,acumulacionBasura:A.acumulacionBasura,problemaPrincipal:A.problemaPrincipal,mejoras:A.mejoras,comentario:A.comentario||"",fechaRegistro:serverTimestamp()};
try{const bt=writeBatch(db);bt.set(doc(db,"encuestas",sid()),d);
bt.set(doc(db,"resumen",slug(A.colonia)),{colonia:A.colonia,...incs(A,increment)},{merge:true});await bt.commit();done()}
catch(e){sending=false;b.disabled=false;b.textContent="Enviar respuestas";err("No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.")}}
function done(){localStorage.vgDone=1;sessionStorage.removeItem("vgId");root.innerHTML='<div class="ok"><h2>¡Gracias por participar!</h2><p>Tu colonia cuenta y tu opinión transforma.</p></div>'}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
