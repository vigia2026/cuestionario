import{db,auth}from"./firebase.js";import{OP,slug,incs,pct}from"./opciones.js";
import{signInWithEmailAndPassword,signOut,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import{collection,getDocs,deleteDoc,doc,query,orderBy,limit,writeBatch}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const $=id=>document.getElementById(id);let all=[];
$("lf").onsubmit=async e=>{e.preventDefault();$("le").textContent="";try{await signInWithEmailAndPassword(auth,$("em").value,$("pw").value)}catch{$("le").textContent="Credenciales incorrectas."}};
$("out").onclick=()=>signOut(auth);
onAuthStateChanged(auth,u=>{$("login").style.display=u?"none":"block";$("panel").style.display=u?"block":"none";if(u)load()});
async function load(){try{$("pe").textContent="";const s=await getDocs(query(collection(db,"encuestas"),orderBy("fechaRegistro","desc"),limit(3000)));
all=s.docs.map(d=>({id:d.id,...d.data(),f:d.data().fechaRegistro?.toDate()}));show()}
catch{$("pe").textContent="Sin permiso: tu usuario no está en la colección admins (ver README)."}}
const filt=()=>{const q=$("fc").value.toLowerCase(),a=$("fa").value?new Date($("fa").value+"T00:00"):0,b=$("fb").value?new Date($("fb").value+"T23:59"):0;
return all.filter(r=>r.colonia.toLowerCase().includes(q)&&(!a||r.f>=a)&&(!b||r.f<=b))};
function show(){const R=filt();$("tot").textContent=R.length;const c={};R.forEach(r=>{if(r.pasaCamion!=="Sí")c[r.colonia]=(c[r.colonia]||0)+1});
$("top").innerHTML=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>`<li>${k}: <b>${v}</b></li>`).join("")||"<li>Sin reportes.</li>";
const P=OP.pasa.map(o=>R.filter(r=>r.pasaCamion===o).length);$("gen").textContent=OP.pasa.map((o,i)=>`${o}: ${pct(P[i],R.length)}%`).join(" · ");
const S=R.slice(0,300);$("tb").innerHTML=S.map(r=>`<tr><td>${r.f?r.f.toLocaleString("es-MX"):""}</td><td>${r.colonia}</td><td>${r.pasaCamion}</td><td>${r.frecuencia}</td><td>${r.satisfaccion}</td><td>${r.problemaPrincipal}</td><td></td><td><button class="btn red" data-id="${r.id}">Eliminar</button></td></tr>`).join("");
[...$("tb").rows].forEach((tr,i)=>tr.cells[6].textContent=S[i].mejoras)}
["fc","fa","fb"].forEach(i=>$(i).addEventListener("input",show));
$("tb").onclick=async e=>{const id=e.target.dataset.id;if(!id||!confirm("¿Eliminar esta respuesta? Después usa «Recalcular estadísticas»."))return;await deleteDoc(doc(db,"encuestas",id));all=all.filter(r=>r.id!==id);show()};
$("csv").onclick=()=>{const k=["colonia","pasaCamion","frecuencia","tiempoSinPasar","horario","satisfaccion","acumulacionBasura","problemaPrincipal","mejoras","comentario"];
const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;const t=[[...k,"fecha"].join(",")].concat(filt().map(r=>[...k.map(x=>q(r[x])),q(r.f?r.f.toISOString():"")].join(","))).join("\n");
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+t],{type:"text/csv;charset=utf-8"}));a.download="vigia_encuestas.csv";a.click()};
// Reconstruye la colección resumen (usada por estadisticas.html) desde las encuestas vigentes
$("rc").onclick=async()=>{if(!confirm("Se recalcularán las estadísticas públicas con todas las encuestas actuales."))return;$("rc").disabled=true;
const g={};all.forEach(r=>{const s=slug(r.colonia);g[s]??={colonia:r.colonia};const o=incs(r,()=>1);for(const k in o)g[s][k]=(g[s][k]||0)+1});
const old=await getDocs(collection(db,"resumen"));
let b=writeBatch(db),n=0;const flush=async()=>{await b.commit();b=writeBatch(db);n=0};
for(const d of old.docs){if(!g[d.id]){b.delete(d.ref);if(++n>=400)await flush()}}
for(const[s,v]of Object.entries(g)){b.set(doc(db,"resumen",s),v);if(++n>=400)await flush()}await flush();$("rc").disabled=false;alert("Estadísticas recalculadas.")};
