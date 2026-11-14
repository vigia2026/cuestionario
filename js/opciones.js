export const OP={
pasa:["Sí","No","Algunas veces"],
frec:["Todos los días","Cada dos días","Tres veces por semana","Dos veces por semana","Una vez por semana","Cada quince días","No tiene una frecuencia establecida","Nunca pasa"],
tiempo:["Menos de tres días","De tres a siete días","De una a dos semanas","De dos a tres semanas","Más de un mes","Actualmente pasa con regularidad","Nunca ha pasado por mi calle"],
horario:["Siempre","Casi siempre","Algunas veces","Nunca","No conozco los horarios"],
sat:["Muy satisfecho","Satisfecho","Poco satisfecho","Nada satisfecho"],
acum:["Frecuentemente","Algunas veces","Rara vez","Nunca"],
prob:["El camión no pasa por mi colonia.","Pasa con poca frecuencia.","No respeta los horarios.","Deja basura sin recoger.","Existen demasiados puntos de acumulación.","Otro."]};
export const MIN=5; // mínimo de encuestas para clasificar una colonia
export const slug=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
export const pct=(n,t)=>t?Math.round(n/t*1000)/10:0;
// Contadores agregados de una respuesta, por índice de opción
export function incs(d,inc){const o={total:inc(1)};
const add=(p,l,v)=>{const i=OP[l].indexOf(v);if(i>=0)o[p+i]=inc(1)};
add("p","pasa",d.pasaCamion);add("f","frec",d.frecuencia);add("t","tiempo",d.tiempoSinPasar);add("h","horario",d.horario);add("s","sat",d.satisfaccion);add("a","acum",d.acumulacionBasura);add("r","prob",d.problemaPrincipal);return o}
export async function catalogo(){const j=await(await fetch("data/colonias.json")).json();return[...new Set(j.colonias)].sort((a,b)=>a.localeCompare(b,"es"))}
