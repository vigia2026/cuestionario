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
const A={},root=document.getElementById("form");let i=0,cols=[],sending=false;
const sid=()=>sessionStorage.vgId||(sessionStorage.vgId=crypto.randomUUID());
if(localStorage.vgDone)root.innerHTML='<div class="ok"><h3>Ya registraste tu opinión</h3><p>Gracias por participar. </p></div>';
else catalogo().then(c=>{cols=c;draw()});
function draw(){const q=Q[i],last=i===Q.length;
let h=`<div class="bar"><i style="width:${i/Q.length*100}%"></i></div><p>${last?"Resumen":`Pregunta ${i+1} de ${Q.length}`} ${!last&&!q.opt?'<span class="req">* obligatoria</span>':""}</p>`;
if(last){h+='<dl class="res">'+Q.map(x=>`<dt>${x.t}</dt><dd>${esc(A[x.k]||"—")}</dd>`).join("")+'</dl><p class="warn">No se solicitan datos personales. Tus respuestas se guardan con fecha y hora.</p>'}
else{h+=`<h3>${q.t}</h3>`;
if(q.type==="col")h+=`<input type="text" id="in" list="cl" placeholder="Escribe para buscar tu colonia" autocomplete="off" value="${esc(A.colonia||"")}"><datalist id="cl">${cols.map(c=>`<option value="${esc(c)}">`).join("")}</datalist>`;
else if(q.type==="txt")h+=`<textarea id="in" rows="5" maxlength="800" placeholder="Escribe aquí...">${esc(A[q.k]||"")}</textarea>`;
else h+=q.o.map(o=>`<label class="opt"><input type="radio" name="r" value="${esc(o)}" ${A[q.k]===o?"checked":""}>${o}</label>`).join("")}
h+=`<p class="err" id="er"></p><div class="nav"><button class="btn sec" id="bk" ${i?"":"disabled"}>← Atrás</button><button class="btn" id="nx">${last?"Enviar respuestas":"Siguiente →"}</button></div>`;
root.innerHTML=h;
document.getElementById("bk").onclick=()=>{if(!last)save();i--;draw()};
document.getElementById("nx").onclick=()=>last?send():next()}
function save(){const q=Q[i],e=document.getElementById("in")||document.querySelector("input[name=r]:checked");if(e)A[q.k]=e.value.trim()}
function next(){const q=Q[i];save();const v=A[q.k]||"";
if(!v&&!q.opt)return err("Esta pregunta es obligatoria.");
if(q.type==="col"&&!cols.includes(v))return err("Elige una colonia de la lista.");
i++;draw()}
const err=m=>document.getElementById("er").textContent=m;
async function send(){if(sending)return;sending=true;const b=document.getElementById("nx");b.disabled=true;b.textContent="Enviando...";
const d={colonia:A.colonia,pasaCamion:A.pasaCamion,frecuencia:A.frecuencia,tiempoSinPasar:A.tiempoSinPasar,horario:A.horario,satisfaccion:A.satisfaccion,acumulacionBasura:A.acumulacionBasura,problemaPrincipal:A.problemaPrincipal,mejoras:A.mejoras,comentario:A.comentario||"",fechaRegistro:serverTimestamp()};
try{const bt=writeBatch(db);bt.set(doc(db,"encuestas",sid()),d);
bt.set(doc(db,"resumen",slug(A.colonia)),{colonia:A.colonia,...incs(A,increment)},{merge:true});await bt.commit();done()}
catch(e){sending=false;b.disabled=false;b.textContent="Enviar respuestas";err("No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.")}}
function done(){localStorage.vgDone=1;sessionStorage.removeItem("vgId");root.innerHTML='<div class="ok"><h2>¡Gracias por participar!</h2><p>Tu colonia cuenta y tu opinión transforma.</p></div>'}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
