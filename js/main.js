document.getElementById("mb")?.addEventListener("click",()=>document.getElementById("nv").classList.toggle("on"));
document.querySelectorAll("#nv a").forEach(a=>a.addEventListener("click",()=>document.getElementById("nv").classList.remove("on")));
const tc=getComputedStyle(document.documentElement).getPropertyValue("--g1").trim();
let mt=document.querySelector("meta[name=theme-color]");
if(!mt){mt=document.createElement("meta");mt.name="theme-color";document.head.appendChild(mt)}
mt.content=tc;
