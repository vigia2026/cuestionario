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
const alg=L.filter(d=>d.p2).sort((a,b)=>b.p2-a.p2).slice(0,10);
chart("c6","bar",alg.map(d=>d.colonia),alg.map(d=>d.p2),"#f5b81c",true);
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

const xl=$("xl");if(xl)xl.onclick=async()=>{if(typeof ExcelJS==="undefined")return alert("No se pudo cargar el generador de Excel. Revisa tu conexión.");
xl.disabled=true;
try{
const L=Object.values(T),tot=L.reduce((a,d)=>a+d.total,0),P=sum(L,"p","pasa"),G="FF14532D";
const fill=c=>({type:"pattern",pattern:"solid",fgColor:{argb:c}});
const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet("Observatorio",{views:[{showGridLines:false}]});
ws.columns=[28,12,12,12,14,12,12,16,26,6].map(width=>({width}));
ws.mergeCells("A1:J1");const t=ws.getCell("A1");t.value="OBSERVATORIO CIUDADANO VIGÍA · Ciudad Valles, S.L.P.";t.font={bold:true,size:16,color:{argb:"FFFFFFFF"}};t.fill=fill(G);t.alignment={vertical:"middle",horizontal:"center"};ws.getRow(1).height=34;
ws.mergeCells("A2:J2");ws.getCell("A2").value="Exportado el "+new Date().toLocaleString("es-MX")+" · Basado en "+tot+" encuestas ciudadanas";ws.getCell("A2").font={italic:true,color:{argb:"FF555555"}};
[["Encuestas recibidas",tot],["Colonias participantes",L.length],["Sí pasa",pct(P[0],tot)+"%"],["No pasa",pct(P[1],tot)+"%"],["Pasa algunas veces",pct(P[2],tot)+"%"]].forEach(([l,v],i)=>{const c=i*2+1;ws.mergeCells(4,c,4,c+1);ws.mergeCells(5,c,5,c+1);
const a=ws.getCell(4,c),b=ws.getCell(5,c);a.value=v;a.font={bold:true,size:20,color:{argb:G}};b.value=l;b.font={size:10};
[a,b].forEach(x=>{x.fill=fill("FFF1F4F2");x.alignment={horizontal:"center",vertical:"middle"}})});
ws.getRow(4).height=34;
[["c1",1,6,"¿El camión pasa?"],["c2",6,6,"Colonias con más reportes: No pasa"],["c6",1,23,"Colonias con más reportes: Pasa algunas veces"],["c3",6,23,"Frecuencia del servicio"],["c4",1,40,"Satisfacción"],["c5",6,40,"Tiempo sin recibir el servicio"]].forEach(([id,c,r,tt])=>{
const h=ws.getCell(r,c);h.value=tt;h.font={bold:true,size:12,color:{argb:G}};
if(!ch[id])return;const img=wb.addImage({base64:ch[id].toBase64Image("image/png",1),extension:"png"});ws.addImage(img,{tl:{col:c-1,row:r},ext:{width:480,height:300}})});
const r0=57;ws.getCell(r0,1).value="Situación del servicio por colonia";ws.getCell(r0,1).font={bold:true,size:14,color:{argb:G}};
const hr=ws.getRow(r0+1);["Colonia","Encuestas","Sí pasa","No pasa","Algunas veces","% Sí","% No","% Algunas veces","Estado"].forEach((h,i)=>{const c=hr.getCell(i+1);c.value=h;c.font={bold:true,color:{argb:"FFFFFFFF"}};c.fill=fill(G)});
const CL={verde:"FF22A05A",amarillo:"FFF5B81C",rojo:"FFD64545",gris:"FF8A948E"};
rows.slice().sort((a,b)=>pct(b.no,b.n)-pct(a.no,a.n)||b.n-a.n).forEach((x,k)=>{const rw=ws.getRow(r0+2+k),[cl,tx]=est(x);
[x.c,x.n,x.si,x.no,x.al,pct(x.si,x.n)/100,pct(x.no,x.n)/100,pct(x.al,x.n)/100,tx].forEach((v,i)=>{rw.getCell(i+1).value=v});
[6,7,8].forEach(i=>{rw.getCell(i).numFmt="0.0%"});
const e=rw.getCell(9);e.fill=fill(CL[cl]);e.font={bold:true,color:{argb:cl==="amarillo"?"FF3A2D00":"FFFFFFFF"}}});
const w2=wb.addWorksheet("Distribuciones");w2.columns=[{width:30},{width:42},{width:14}];
const h2=w2.addRow(["Pregunta","Opción","Respuestas"]);h2.font={bold:true};
[["¿El camión pasa?","pasa","p"],["Frecuencia","frec","f"],["Tiempo sin pasar","tiempo","t"],["Horario","horario","h"],["Satisfacción","sat","s"],["Acumulación de basura","acum","a"],["Principal problema","prob","r"]].forEach(([q,k,p])=>sum(L,p,k).forEach((v,i)=>w2.addRow([q,OP[k][i],v])));
const buf=await wb.xlsx.writeBuffer();const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));a.download="vigia_estadisticas.xlsx";a.click();
}catch(e){alert("No se pudo generar el Excel.")}
xl.disabled=false};
