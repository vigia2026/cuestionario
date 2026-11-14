import{db,auth}from"./firebase.js";import{onAuthStateChanged}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";import{OP,MIN,pct,catalogo}from"./opciones.js";
import{collection,onSnapshot}from"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const $=id=>document.getElementById(id),ch={};let rows=[],T={},cat=[];
const sum=(L,p,k)=>OP[k].map((_,i)=>L.reduce((a,d)=>a+(d[p+i]||0),0));
const est=r=>{if(r.n<MIN)return["gris","Sin suficientes respuestas"];const m=Math.max(r.si,r.no,r.al);
return m===r.no?["rojo","No pasa"]:m===r.al?["amarillo","Servicio irregular"]:["verde","Pasa con regularidad"]};
function chart(id,type,labels,data,colors,horiz){ch[id]?.destroy();
ch[id]=new Chart($(id),{type,data:{labels,datasets:[{data,backgroundColor:colors}]},
options:{responsive:true,maintainAspectRatio:false,indexAxis:horiz?"y":"x",plugins:{legend:{display:type!=="bar",position:"bottom"}},scales:type==="bar"?{[horiz?"x":"y"]:{beginAtZero:true,ticks:{precision:0}}}:{}}})}
async function init(){cat=await catalogo();onSnapshot(collection(db,"resumen"),s=>{T={};s.forEach(d=>T[d.data().colonia]=d.data());render()},()=>{$("base").textContent="No se pudieron cargar los datos. Revisa la configuración de Firebase."})}
function render(){const L=Object.values(T);const tot=L.reduce((a,d)=>a+d.total,0);
const P=sum(L,"p","pasa");$("k1").textContent=tot;$("k2").textContent=L.length;
[0,1,2].forEach(i=>$("k"+(3+i)).textContent=pct(P[i],tot)+"%");$("base").textContent=tot?`Basado en ${tot} encuestas ciudadanas (opinión de quienes respondieron, no de todos los hogares).`:"Aún no hay encuestas registradas.";
chart("c1","doughnut",OP.pasa,P,["#22a05a","#d64545","#f5b81c"]);
const top=L.filter(d=>d.p1).sort((a,b)=>b.p1-a.p1).slice(0,10);
chart("c2","bar",top.map(d=>d.colonia),top.map(d=>d.p1),"#d64545",true);
chart("c3","bar",OP.frec,sum(L,"f","frec"),"#22a05a");chart("c4","doughnut",OP.sat,sum(L,"s","sat"),["#22a05a","#5bc08a","#f5b81c","#d64545"]);chart("c5","bar",OP.tiempo,sum(L,"t","tiempo"),"#14532d");
const mk=(c,d)=>({c,n:d.total||0,si:d.p0||0,no:d.p1||0,al:d.p2||0,d});
rows=cat.map(c=>mk(c,T[c]||{}));L.forEach(d=>{if(!cat.includes(d.colonia))rows.push(mk(d.colonia,d))});table()}
function table(){const q=$("q").value.toLowerCase(),f=$("f").value;
const R=rows.filter(r=>r.c.toLowerCase().includes(q)&&(!f||est(r)[0]===f)).sort((a,b)=>pct(b.no,b.n)-pct(a.no,a.n)||b.n-a.n);
$("tb").innerHTML=R.map(r=>{const[k,t]=est(r);return`<tr class="cl" data-i="${rows.indexOf(r)}"><td>${r.c}</td><td>${r.n}</td><td>${pct(r.si,r.n)}% <small>(${r.si}/${r.n})</small></td><td>${pct(r.no,r.n)}% <small>(${r.no}/${r.n})</small></td><td>${pct(r.al,r.n)}% <small>(${r.al}/${r.n})</small></td><td><span class="tag ${k}">${t}</span></td></tr>`}).join("")||'<tr><td colspan="6">Sin resultados.</td></tr>'}
$("tb").onclick=e=>{const tr=e.target.closest("tr.cl");if(!tr)return;const r=rows[tr.dataset.i],d=r.d;
const blk=(t,k,p)=>`<h4>${t}</h4>`+OP[k].map((o,i)=>`<div>${o}: <b>${d[p+i]||0}</b></div>`).join("");
$("dt").innerHTML=`<h3>${r.c}</h3><p>${r.n} encuestas. ${r.n<MIN?"Menos de "+MIN+": aún no se clasifica.":""}</p>`+(r.n?blk("Frecuencia","frec","f")+blk("Tiempo sin servicio","tiempo","t")+blk("Satisfacción","sat","s")+blk("Acumulación de basura","acum","a")+blk("Principal problema","prob","r"):"")+'<form method="dialog"><button class="btn">Cerrar</button></form>';$("dg").showModal()};
["q","f"].forEach(i=>$(i).addEventListener("input",table));let on=0;onAuthStateChanged(auth,u=>{if(!u)location.replace("admin.html");else if(!on){on=1;init()}});
