document.getElementById("mb")?.addEventListener("click",()=>document.getElementById("nv").classList.toggle("on"));
document.querySelectorAll("#nv a").forEach(a=>a.addEventListener("click",()=>document.getElementById("nv").classList.remove("on")));
