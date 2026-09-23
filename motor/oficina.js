/* =========================================================
   Oficina Virtual · motor/oficina.js
   Dibuja una oficina a partir de window.OFICINA_CONFIG
   (definido en areas/<area>/config.js).
   NO editar desde un área: los cambios al motor se proponen
   en un Pull Request aparte (ver ESTILO.md y CLAUDE.md).
   ========================================================= */
(() => {
"use strict";

const CFG = window.OFICINA_CONFIG;
const root = document.getElementById("oficina");
if (!CFG || !root) { console.error("[oficina] Falta window.OFICINA_CONFIG o el <div id=\"oficina\">"); return; }

/* ---------- constantes del estándar (no cambiar por área) ---------- */
const T = 16, W = 30, H = 18;                       // grilla: tiles de 16 px, plano de 30 × 18
const SALAS_POS = [                                 // distribución fija de las 5 salas
  { x:0,  y:0,  w:9,  h:8, a:"#3a2f4f", b:"#41355a" },   // 1 · arriba izquierda
  { x:9,  y:0,  w:12, h:8, a:"#2c3d53", b:"#32455d" },   // 2 · arriba centro
  { x:21, y:0,  w:9,  h:8, a:"#4c3332", b:"#553a38" },   // 3 · arriba derecha
  { x:0,  y:10, w:18, h:8, a:"#56402f", b:"#5e4634" },   // 4 · abajo izquierda (paseo de los "a demanda")
  { x:18, y:10, w:12, h:8, a:"#2d473d", b:"#334f44" },   // 5 · abajo derecha (living)
];
const PASILLO = { x:0, y:8, w:30, h:2, a:"#3a3c48", b:"#3f414e" };
const ESCRITORIOS = {                               // lugares disponibles por sala, en tiles
  1: [[2,3],[6,3]],
  2: [[11,3],[15,3],[19,3]],
  3: [[22,3],[26,3]],
  4: [[2,12],[6,12],[10,12],[14,12],[2,15],[6,15]],
  5: [[20,12],[24,12]],
};
const TONE = { ok:"#5bd19a", warn:"#f2a33a", crit:"#f0605d", info:"#7db4ff", idle:"#7a8098", run:"#c79bff" };
const RIESGO = { alto:["Riesgo alto","crit"], medio:["Riesgo medio","warn"], bajo:["Riesgo bajo","info"], nulo:["Sin riesgo","ok"] };
const RES = { "ok":["Hizo cambios","ok"], "sin novedades":["Sin novedades","idle"], "con avisos":["Con avisos","warn"], "falla":["Falla","crit"], "completada":["Completada","info"] };
const TIPOS = { programado:"Tarea programada", demanda:"A demanda", vacante:"Puesto por cubrir" };

/* ---------- tiempo ---------- */
const OFF = (CFG.zona && typeof CFG.zona.utc === "number" ? CFG.zona.utc : -3) * 3600e3;
const ZONA = (CFG.zona && CFG.zona.nombre) || "Hora local";
const art = d => { const x = new Date(d.getTime() + OFF); return { y:x.getUTCFullYear(), m:x.getUTCMonth(), d:x.getUTCDate(), h:x.getUTCHours(), mi:x.getUTCMinutes(), wd:x.getUTCDay() }; };
const artDate = (y,m,d,h,mi) => new Date(Date.UTC(y,m,d,h,mi) - OFF);
const hhmm = d => { const p = art(d); return String(p.h).padStart(2,"0") + ":" + String(p.mi).padStart(2,"0"); };
const DIAS = ["dom","lun","mar","mié","jue","vie","sáb"];
const fecha = d => { const p = art(d); return DIAS[p.wd] + " " + p.d + "/" + (p.m+1); };
const dayKey = d => { const a = art(d); return a.y+"-"+String(a.m+1).padStart(2,"0")+"-"+String(a.d).padStart(2,"0"); };
function rel(d, now){
  const s = Math.round((now - d)/1000), a = Math.abs(s), fut = s < 0;
  const t = a < 60 ? "segundos" : a < 3600 ? Math.round(a/60)+" min" : a < 86400 ? Math.round(a/3600)+" h" : Math.round(a/86400)+" d";
  return fut ? "en " + t : "hace " + t;
}
function cuando(d, now){
  const k = dayKey(d);
  if (k === dayKey(now)) return "hoy " + hhmm(d);
  if (k === dayKey(new Date(now.getTime()+86400e3))) return "mañana " + hhmm(d);
  if (k === dayKey(new Date(now.getTime()-86400e3))) return "ayer " + hhmm(d);
  return fecha(d) + " " + hhmm(d);
}
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- agentes ---------- */
const AGENTS = (CFG.agentes || []).map(a => ({ toca:[], usa:[], riesgo:"nulo", ...a }));
const byId = Object.fromEntries(AGENTS.map(a => [a.id, a]));
{ // asignar escritorios por sala
  const libres = JSON.parse(JSON.stringify(ESCRITORIOS));
  for (const a of AGENTS){
    const lista = libres[a.sala];
    if (!lista){ console.warn("[oficina] " + a.id + ": sala inválida (usar 1 a 5)"); a.sala = 4; }
    const d = (libres[a.sala] || []).shift();
    if (!d){ console.warn("[oficina] " + a.id + ": no hay más escritorios libres en la sala " + a.sala); a.desk = [14,15]; }
    else a.desk = d;
  }
}

/* bitácora de ejemplo: "haceMin" se convierte en fecha relativa a ahora */
const LOG = (CFG.bitacora || []).map(e => ({ ...e, fecha: e.fecha ? new Date(e.fecha) : new Date(Date.now() - (e.haceMin || 0) * 60e3) }))
  .sort((a,b) => b.fecha - a.fecha);
const ultimaDe = id => LOG.find(e => e.agente === id) || null;

/* ---------- horarios ---------- */
function slotsDay(a, base){
  const h = a.horario; if (!h) return [];
  const p = art(base);
  if (h.dias && !h.dias.includes(p.wd)) return [];
  const list = h.horas ? h.horas.map(x => [x, h.min || 0]) : (h.slots || []);
  return list.map(([hh,mi]) => artDate(p.y,p.m,p.d,hh,mi));
}
function nextRun(a, now){
  for (let k=0;k<8;k++){ const s = slotsDay(a, new Date(now.getTime()+k*86400e3)).find(x => x > now); if (s) return s; }
  return null;
}
function estado(a, now){
  if (a.tipo === "vacante") return { txt:"Por contratar", tone:"idle" };
  if (a.tipo === "demanda") return { txt:"A demanda", tone:"info" };
  if (a.sinUso) return { txt:"Sin uso", tone:"warn" };
  const u = ultimaDe(a.id);
  if (u && u.resultado === "falla") return { txt:"Con fallas", tone:"crit" };
  for (const s of slotsDay(a, now)) { const d = now - s; if (d >= 0 && d < 8*60e3) return { txt:"Trabajando", tone:"run" }; }
  const h = a.horario;
  if (h && h.horas){ const x = art(now).h; return (x >= h.horas[0] && x <= h.horas[h.horas.length-1]) ? { txt:"En turno", tone:"ok" } : { txt:"Fuera de turno", tone:"idle" }; }
  return { txt:"Programado", tone:"ok" };
}

/* ---------- maquetado ---------- */
const persona = (CFG.area && CFG.area.responsable) || { nombre:"Responsable", rol:"", look:{hair:"#3b2418",skin:"#eab894",shirt:"#f2b544",pants:"#2c3346"} };
root.innerHTML = `
<div class="wrap">
  <header class="top">
    <div class="brand">
      <canvas class="logo" id="logo" width="16" height="16" aria-hidden="true"></canvas>
      <div>
        <h1>${esc(CFG.area && CFG.area.nombre || "Oficina de Agentes")}${CFG.demo === false ? "" : '<span class="demo">DEMO</span>'}</h1>
        <p>${esc(CFG.area && CFG.area.subtitulo || "")}</p>
      </div>
    </div>
    <div class="topr">
      <div class="clock" id="clock">${esc(ZONA)} <b>--:--</b></div>
      <div class="seg" role="group" aria-label="Luz de la oficina" id="luz">
        <button type="button" data-l="auto" aria-pressed="true">Auto</button>
        <button type="button" data-l="dia" aria-pressed="false">Día</button>
        <button type="button" data-l="tarde" aria-pressed="false">Tarde</button>
        <button type="button" data-l="noche" aria-pressed="false">Noche</button>
      </div>
    </div>
  </header>
  <nav class="tabs" role="tablist" id="tabs">
    <button role="tab" id="tab-oficina" data-t="oficina" aria-selected="true">Oficina</button>
    <button role="tab" id="tab-org" data-t="org" aria-selected="false">Organigrama</button>
    <button role="tab" id="tab-grid" data-t="grid" aria-selected="false">Equipo</button>
    <button role="tab" id="tab-bit" data-t="bit" aria-selected="false">Bitácora</button>
  </nav>

  <section id="v-oficina" role="tabpanel" aria-labelledby="tab-oficina">
    <div class="office">
      <div class="col">
        <div class="panel">
          <p class="eyebrow">Agenda de hoy · corridas programadas</p>
          <svg class="tl" id="timeline" viewBox="0 0 800 118" role="img" aria-label="Corridas programadas de hoy por agente"></svg>
          <div class="kpis" id="kpis"></div>
        </div>
        <div>
          <div class="stage">
            <canvas id="map" width="${W*T}" height="${H*T}" aria-label="Plano de la oficina con los agentes en sus escritorios"></canvas>
            <div class="tags" id="tags"></div>
          </div>
          <div class="legend">
            <span><i style="background:var(--run)"></i>Trabajando</span>
            <span><i style="background:var(--ok)"></i>En turno / programado</span>
            <span><i style="background:var(--info)"></i>A demanda</span>
            <span><i style="background:var(--warn)"></i>Atrasado o sin uso</span>
            <span><i style="background:var(--idle)"></i>Fuera de turno · vacante</span>
            <span><i style="background:var(--crit)"></i>Con fallas</span>
          </div>
        </div>
      </div>
      <aside class="col">
        <div class="panel">
          <p class="eyebrow">La oficina ahora</p>
          <div class="now" id="nowBox"></div>
          <div class="next" id="nextRun"></div>
        </div>
        <div class="panel" id="detail"></div>
      </aside>
    </div>
  </section>

  <section id="v-org" role="tabpanel" aria-labelledby="tab-org" hidden>
    <div class="panel">
      <p class="eyebrow">Quién responde a quién</p>
      <div class="org"><ul class="tree" id="tree"></ul></div>
      <div class="orgnote" id="orgnote"></div>
    </div>
  </section>

  <section id="v-grid" role="tabpanel" aria-labelledby="tab-grid" hidden>
    <div class="filters" id="filters" role="group" aria-label="Filtrar equipo">
      <button type="button" data-f="all" aria-pressed="true">Todos</button>
      <button type="button" data-f="programado" aria-pressed="false">Programados</button>
      <button type="button" data-f="demanda" aria-pressed="false">A demanda</button>
      <button type="button" data-f="vacante" aria-pressed="false">Por contratar</button>
    </div>
    <div class="cards" id="cards"></div>
  </section>

  <section id="v-bit" role="tabpanel" aria-labelledby="tab-bit" hidden>
    <div class="bitbar">
      <select id="bitAgente" aria-label="Filtrar por agente"><option value="">Todos los agentes</option></select>
      <select id="bitRango" aria-label="Filtrar por fecha">
        <option value="hoy">Hoy</option><option value="ayer">Ayer</option><option value="7" selected>Últimos 7 días</option><option value="todo">Todo</option>
      </select>
      <select id="bitRes" aria-label="Filtrar por resultado"><option value="">Cualquier resultado</option><option value="ok">Hizo cambios</option><option value="sin novedades">Sin novedades</option><option value="con avisos">Con avisos</option><option value="falla">Con falla</option></select>
      <span class="count" id="bitCount"></span>
    </div>
    <div id="bitList"></div>
  </section>

  <p class="foot">${esc(CFG.pie || "Maqueta de la Oficina Virtual · datos de ejemplo")}</p>
</div>`;

const $ = id => document.getElementById(id);

/* ---------- sprites (12 × 16) ---------- */
const SPR = [
"...HHHHHH...",
"..HHHHHHHH..",
"..HSSSSSSH..",
"..SSESSESS..",
"..SSSSSSSS..",
"...SSMMSS...",
"....SSSS....",
"..CCCCCCCC..",
".CCCCCCCCCC.",
".SCCCCCCCCS.",
".SCCCCCCCCS.",
"..CCCCCCCC..",
"..PPPPPPPP..",
"..PPP..PPP..",
"..PPP..PPP..",
"..BBB..BBB.."];
function drawSprite(g, x, y, look, opts={}){
  const map = { H:look.hair, S:look.skin, E:"#1a1a22", M:"#b0584a", C:look.shirt, P:look.pants, B:"#15161c" };
  const walk = opts.walk || 0;
  g.globalAlpha = opts.ghost ? .35 : 1;
  for (let r=0;r<SPR.length;r++){
    let row = SPR[r];
    if (r >= 13 && walk === 1) row = r===15 ? "..BBB...BBB." : "..PPP...PPP.";
    if (r >= 13 && walk === 2) row = r===15 ? ".BBB..BBB..." : ".PPP..PPP...";
    for (let c=0;c<row.length;c++){ const ch=row[c]; if (ch===".") continue; g.fillStyle = opts.ghost ? "#9aa3c0" : map[ch]; g.fillRect(x+c, y+r, 1, 1); }
  }
  g.globalAlpha = 1;
}
function avatar(a, size){
  const c = document.createElement("canvas"); c.width = 16; c.height = 18;
  drawSprite(c.getContext("2d"), 2, 1, a.look, { ghost: a.tipo==="vacante" });
  c.style.width = size+"px"; c.style.height = size+"px"; c.setAttribute("aria-hidden","true");
  return c;
}

/* ---------- plano ---------- */
const cv = $("map"), g = cv.getContext("2d");
const salaNombre = i => ((CFG.salas || [])[i-1] || "SALA " + i).toUpperCase();
let luz = "auto";
function luzActual(now){ if (luz !== "auto") return luz; const h = art(now).h; return (h < 7 || h >= 20) ? "noche" : (h >= 18 ? "tarde" : "dia"); }
function plant(x,y){ g.fillStyle="#6b4a2f"; g.fillRect(x+4,y+10,8,5); g.fillStyle="#3f8a4f"; g.fillRect(x+3,y+3,10,8); g.fillStyle="#56a865"; g.fillRect(x+5,y+1,6,5); g.fillRect(x+2,y+6,3,3); g.fillRect(x+11,y+5,3,3); }
function desk(dx,dy,on,tone){
  const x=dx*T, y=dy*T;
  g.fillStyle="#b07a45"; g.fillRect(x,y+6,2*T,10); g.fillStyle="#8e5f33"; g.fillRect(x,y+14,2*T,2);
  g.fillStyle="#22252f"; g.fillRect(x+9,y-4,14,10); g.fillStyle = on ? (tone||"#7db4ff") : "#3b4050"; g.fillRect(x+10,y-3,12,7);
  g.fillStyle="#22252f"; g.fillRect(x+15,y+6,2,2);
  g.fillStyle="#d8d2c4"; g.fillRect(x+3,y+8,5,3);
}
const encendido = (a, st) => a.tipo==="demanda" || (a.tipo==="programado" && (st.tone==="ok" || st.tone==="run"));
function drawBase(now){
  for (const r of [...SALAS_POS, PASILLO]) for (let i=0;i<r.w;i++) for (let j=0;j<r.h;j++){ g.fillStyle = (i+j)%2 ? r.a : r.b; g.fillRect((r.x+i)*T,(r.y+j)*T,T,T); }
  g.fillStyle="#1a1c25";
  g.fillRect(0,0,W*T,3);
  g.fillRect(9*T-2,0,3,8*T); g.fillRect(21*T-2,0,3,8*T);
  const doorsTop=[[4,5],[14,16],[25,26]], doorsBot=[[4,5],[24,25]];
  for (let x=0;x<W;x++){ if (!doorsTop.some(([a,b])=>x>=a&&x<=b)) g.fillRect(x*T,8*T-2,T,3); }
  for (let x=0;x<W;x++){ if (!doorsBot.some(([a,b])=>x>=a&&x<=b)) g.fillRect(x*T,10*T-1,T,3); }
  g.fillRect(18*T-2,10*T,3,8*T);
  // mobiliario fijo del estándar
  plant(0.2*T,6.6*T); plant(7.8*T,0.4*T); plant(19.8*T,6.6*T); plant(28.8*T,6.6*T); plant(16.6*T,16.6*T); plant(28.6*T,16.4*T); plant(9.3*T,6.6*T);
  g.fillStyle="#e9e6dc"; g.fillRect(17.6*T,0.5*T,3*T,1.4*T); g.fillStyle="#7db4ff"; g.fillRect(18*T,0.9*T,20,2); g.fillStyle="#f2b544"; g.fillRect(18*T,1.3*T,30,2); g.fillStyle="#5bd19a"; g.fillRect(18*T,1.7*T,14,2);
  const bx=21.6*T, by=0.5*T; g.fillStyle="#2a2d38"; g.fillRect(bx,by,7*T,1.9*T);
  for (let i=0;i<8;i++){ g.fillStyle = ["#f0605d","#f2a33a","#5bd19a","#7db4ff"][i%4]; g.fillRect(bx+4+(i%9)*12, by+4+Math.floor(i/9)*13, 9, 9); }
  g.fillStyle="#6a3b4a"; g.fillRect(22*T,15*T,4*T,T); g.fillStyle="#7d4757"; g.fillRect(22*T,14.4*T,4*T,0.7*T);
  g.fillStyle="#2a2d38"; g.fillRect(27*T,10.6*T,1.4*T,1.8*T); g.fillStyle="#f0605d"; g.fillRect(27.3*T,11*T,6,3); g.fillStyle="#d8d2c4"; g.fillRect(27.5*T,11.9*T,6,5);
  g.fillStyle="#b07a45"; g.fillRect(10*T,15.6*T,5*T,1.2*T);
  for (const a of AGENTS){
    const st = estado(a, now);
    desk(a.desk[0], a.desk[1], encendido(a, st), st.tone==="run" ? "#c79bff" : null);
    if (a.tipo==="vacante"){ g.fillStyle="#f2b544"; g.fillRect(a.desk[0]*T+1,a.desk[1]*T+7,7,5); g.fillStyle="#1a1405"; g.fillRect(a.desk[0]*T+3,a.desk[1]*T+8,3,1); g.fillRect(a.desk[0]*T+3,a.desk[1]*T+10,3,1); }
  }
  g.font = "8px Silkscreen, monospace"; g.textBaseline="top";
  SALAS_POS.forEach((r,i) => { const label = salaNombre(i+1); g.fillStyle="rgba(10,12,18,.55)"; const w=g.measureText(label).width+6; g.fillRect(r.x*T+4, r.y*T+(r.y?5:6), w, 11); g.fillStyle="#cfcabd"; g.fillText(label, r.x*T+7, r.y*T+(r.y?7:8)); });
}

/* personajes y paseos */
const actors = AGENTS.map(a => ({ a, x:a.desk[0]*T+10, y:a.desk[1]*T+18, hx:a.desk[0]*T+10, hy:a.desk[1]*T+18, path:[], wait:0 }));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function planWalk(ac){ // solo sala 4 → living (sala 5) y vuelta
  const sx=ac.hx, sy=ac.hy, door=4.6*T, cor=9*T, lx=(22.4+Math.random()*3)*T, ly=13.6*T;
  ac.path = [[sx,11*T],[door,11*T],[door,cor],[24.6*T,cor],[24.6*T,11.4*T],[lx,ly],"pausa",[24.6*T,11.4*T],[24.6*T,cor],[door,cor],[door,11*T],[sx,11*T],[sx,sy]];
}
let selected = (AGENTS.find(a => a.tipo==="programado") || AGENTS[0] || {}).id;
function frame(t){
  const now = new Date();
  drawBase(now);
  for (const ac of actors){
    const a = ac.a, st = estado(a, now);
    let walk = 0, bob = 0;
    if (ac.path.length){
      const p = ac.path[0];
      if (p === "pausa"){ if (++ac.wait > 360){ ac.path.shift(); ac.wait=0; } }
      else { const dx=p[0]-ac.x, dy=p[1]-ac.y, d=Math.hypot(dx,dy); if (d<0.8){ ac.x=p[0]; ac.y=p[1]; ac.path.shift(); } else { ac.x+=dx/d*0.55; ac.y+=dy/d*0.55; walk = Math.floor(t/140)%2 ? 1 : 2; } }
    } else if (st.tone==="run") bob = Math.floor(t/160)%2;
    if (a.id === selected){ g.fillStyle="rgba(242,181,68,.35)"; g.beginPath(); g.ellipse(ac.x+6, ac.y+16, 9, 3, 0, 0, Math.PI*2); g.fill(); }
    drawSprite(g, Math.round(ac.x), Math.round(ac.y) - bob, a.look, { walk, ghost: a.tipo==="vacante" });
    if (st.tone==="run" && !ac.path.length){ g.fillStyle="#fff"; for (let i=0;i<3;i++) if (Math.floor(t/300)%4 > i) g.fillRect(ac.x+2+i*3, ac.y-5, 2, 2); }
  }
  const L = luzActual(now);
  if (L === "noche"){ g.fillStyle="rgba(8,14,48,.5)"; g.fillRect(0,0,W*T,H*T);
    for (const a of AGENTS){ if (!encendido(a, estado(a,now))) continue;
      const x=a.desk[0]*T+16, y=a.desk[1]*T; const gr=g.createRadialGradient(x,y,1,x,y,26); gr.addColorStop(0,"rgba(125,180,255,.35)"); gr.addColorStop(1,"rgba(125,180,255,0)"); g.fillStyle=gr; g.fillRect(x-26,y-26,52,52); } }
  if (L === "tarde"){ g.fillStyle="rgba(255,130,50,.13)"; g.fillRect(0,0,W*T,H*T); }
  placeTags();
  if (!reduce) requestAnimationFrame(frame);
}
if (!reduce) setInterval(() => {
  const idle = actors.filter(ac => ac.a.tipo==="demanda" && ac.a.sala===4 && !ac.path.length);
  if (idle.length && Math.random() < .6) planWalk(idle[Math.floor(Math.random()*idle.length)]);
}, 14000);

const tagEls = {};
for (const ac of actors){
  const b = document.createElement("button"); b.type="button"; b.className="tag"; b.id = "tag-"+ac.a.id;
  b.setAttribute("aria-label", ac.a.nombre + ", " + ac.a.puesto);
  b.innerHTML = '<span class="hit"></span><span class="nm">'+esc(ac.a.corto||ac.a.nombre)+'</span><span class="dot"></span>';
  b.addEventListener("click", () => select(ac.a.id));
  $("tags").appendChild(b); tagEls[ac.a.id] = b;
}
function placeTags(){
  const now = new Date();
  for (const ac of actors){
    const el = tagEls[ac.a.id];
    el.style.left = ((ac.x+6)/(W*T)*100)+"%"; el.style.top = ((ac.y+30)/(H*T)*100)+"%";
    el.setAttribute("aria-pressed", ac.a.id===selected ? "true" : "false");
    el.querySelector(".dot").style.background = TONE[estado(ac.a, now).tone];
  }
}

/* ---------- ficha del agente ---------- */
const resTxt = r => (RES[r]||[r||"—"])[0];
const resTone = r => (RES[r]||[0,"info"])[1];
function renderDetail(){
  const a = byId[selected], box = $("detail"); box.innerHTML = "";
  if (!a){ box.innerHTML = '<div class="state">Esta oficina todavía no tiene agentes.</div>'; return; }
  const now = new Date(), st = estado(a, now), u = ultimaDe(a.id), nr = nextRun(a, now), rk = RIESGO[a.riesgo] || RIESGO.nulo;
  const who = document.createElement("div"); who.className="who";
  who.appendChild(avatar(a, 52));
  who.insertAdjacentHTML("beforeend", "<div><h2>"+esc(a.nombre)+"</h2><p>"+esc(a.puesto)+"</p></div>");
  box.appendChild(who);
  let rows = '<dl class="rows">';
  rows += '<dt>Estado</dt><dd><span class="pill t-'+st.tone+'">'+st.txt+'</span></dd>';
  rows += '<dt>Tipo</dt><dd>'+(TIPOS[a.tipo]||a.tipo)+'</dd>';
  if (a.tipo==="programado"){
    rows += '<dt>Horario</dt><dd>'+esc(a.horarioTxt||"—")+'</dd>';
    rows += '<dt>Última</dt><dd>'+(u ? cuando(u.fecha, now)+' <span class="muted">· '+esc(resTxt(u.resultado))+'</span>' : '—')+'</dd>';
    rows += '<dt>Próxima</dt><dd>'+(nr ? cuando(nr, now)+' <span class="muted">('+rel(nr, now)+')</span>' : '—')+'</dd>';
  }
  if (a.toca.length) rows += '<dt>Qué toca</dt><dd><div class="chips">'+a.toca.map(x=>'<span class="chip">'+esc(x)+'</span>').join("")+'</div></dd>';
  if (a.usa.length) rows += '<dt>Usa</dt><dd><div class="chips">'+a.usa.map(x=>'<span class="chip">'+esc(x)+'</span>').join("")+'</div></dd>';
  rows += '<dt>Riesgo</dt><dd><span class="pill t-'+rk[1]+'">'+rk[0]+'</span></dd></dl>';
  box.insertAdjacentHTML("beforeend", rows);
  if (a.hace) box.insertAdjacentHTML("beforeend", '<p class="desc">'+esc(a.hace)+'</p>');
  if (a.tipo!=="vacante"){
    const mine = LOG.filter(e => e.agente===a.id).slice(0,5);
    let hh = '<div class="hist"><p class="eyebrow">Últimas ejecuciones</p>';
    hh += mine.length ? '<ol>'+mine.map(e => '<li><span class="w">'+cuando(e.fecha, now)+'</span><span><span class="pill t-'+resTone(e.resultado)+'" style="font-size:11px;padding:0 7px">'+esc(resTxt(e.resultado))+'</span></span><span class="r">'+esc(e.resumen)+'</span></li>').join("")+'</ol>'
                      : '<p class="desc" style="margin:0">Todavía no registró nada en la bitácora.</p>';
    hh += '<button type="button" class="linkbtn" id="verBit">Ver toda su bitácora →</button></div>';
    box.insertAdjacentHTML("beforeend", hh);
    $("verBit").addEventListener("click", () => { $("bitAgente").value = a.id; $("bitRango").value = "todo"; go("bit"); renderBit(); });
  }
}
function select(id){ selected = id; renderDetail(); placeTags(); if (reduce) frame(0); }

/* ---------- "la oficina ahora" ---------- */
function renderNow(){
  const now = new Date(), c = { run:0, prog:0, dem:0, vac:0, fail:0 };
  for (const a of AGENTS){ const st=estado(a,now); if (st.tone==="run") c.run++; if (st.tone==="crit") c.fail++; if (a.tipo==="programado") c.prog++; if (a.tipo==="demanda") c.dem++; if (a.tipo==="vacante") c.vac++; }
  $("nowBox").innerHTML =
    '<div><b>'+AGENTS.length+'</b><span>agentes</span></div>'+
    '<div><b class="t-run">'+c.run+'</b><span>trabajando</span></div>'+
    '<div><b>'+c.prog+'</b><span>programados</span></div>'+
    '<div><b class="t-info">'+c.dem+'</b><span>a demanda</span></div>'+
    '<div><b class="t-idle">'+c.vac+'</b><span>por contratar</span></div>'+
    '<div><b class="'+(c.fail?"t-crit":"t-ok")+'">'+c.fail+'</b><span>fallas</span></div>';
  let best=null; for (const a of AGENTS){ if (a.tipo!=="programado"||a.sinUso) continue; const n=nextRun(a,now); if (n && (!best||n<best.n)) best={a,n}; }
  $("nextRun").innerHTML = best ? 'Próxima corrida: <b>'+esc(best.a.nombre)+'</b> a las <b class="mono">'+hhmm(best.n)+'</b> ('+rel(best.n,now)+')' : '';
  $("clock").innerHTML = esc(ZONA)+' <b>'+hhmm(now)+'</b>';
}

/* ---------- agenda del día ---------- */
function renderTimeline(){
  const now = new Date(), rows = AGENTS.filter(a => a.tipo==="programado" && a.horario);
  const X0=78, X1=790, y0=18, rh=28, x = h => X0 + (X1-X0)*h/24;
  $("timeline").setAttribute("viewBox", "0 0 800 " + Math.max(60, y0 + rows.length*rh + 14));
  let s = "";
  for (let h=0; h<=24; h+=3){ s += '<line x1="'+x(h)+'" x2="'+x(h)+'" y1="'+(y0-6)+'" y2="'+(y0+rows.length*rh-10)+'" stroke="#2e3447" stroke-width="1"/><text x="'+x(h)+'" y="'+(y0+rows.length*rh+6)+'" fill="#9097ab" font-size="11" font-family="JetBrains Mono, monospace" text-anchor="middle">'+String(h).padStart(2,"0")+'</text>'; }
  const n = art(now), nowH = n.h + n.mi/60;
  rows.forEach((a,i) => {
    const cy = y0 + i*rh + 6;
    s += '<text x="0" y="'+(cy+4)+'" fill="#ece8dd" font-size="12.5" font-family="Figtree, sans-serif" font-weight="600">'+esc(a.corto||a.nombre)+'</text>';
    s += '<line x1="'+X0+'" x2="'+X1+'" y1="'+cy+'" y2="'+cy+'" stroke="#2e3447" stroke-width="2" stroke-linecap="round"/>';
    for (const sl of slotsDay(a, now)){
      const p = art(sl), hx = x(p.h + p.mi/60), key = hhmm(sl);
      const e = LOG.find(e => e.agente===a.id && e.fecha >= new Date(sl-60e3) && e.fecha < new Date(+sl+30*60e3));
      if (sl > now) s += '<circle cx="'+hx+'" cy="'+cy+'" r="5" fill="#12141c" stroke="#9097ab" stroke-width="1.5"><title>'+esc(a.nombre)+' · '+key+' · programada</title></circle>';
      else if (e) s += '<circle cx="'+hx+'" cy="'+cy+'" r="6" fill="'+TONE[resTone(e.resultado)==="idle"?"ok":resTone(e.resultado)]+'"><title>'+esc(a.nombre)+' · '+key+' · '+esc(resTxt(e.resultado))+'</title></circle>';
      else s += '<circle cx="'+hx+'" cy="'+cy+'" r="4.5" fill="#666d84"><title>'+esc(a.nombre)+' · '+key+' · sin registro</title></circle>';
    }
  });
  s += '<line x1="'+x(nowH)+'" x2="'+x(nowH)+'" y1="'+(y0-10)+'" y2="'+(y0+rows.length*rh-6)+'" stroke="#f2b544" stroke-width="2"/><text x="'+Math.min(x(nowH)+4, X1-30)+'" y="'+(y0-1)+'" fill="#f2b544" font-size="11" font-family="JetBrains Mono, monospace">'+hhmm(now)+'</text>';
  $("timeline").innerHTML = s;
  const perDay = rows.reduce((t,a)=>t+slotsDay(a,now).length,0), hoy = LOG.filter(e => dayKey(e.fecha)===dayKey(now));
  $("kpis").innerHTML = '<span><b>'+perDay+'</b> corridas hoy</span><span><b>'+rows.length+'</b> agentes con horario</span><span><b>'+hoy.length+'</b> registros en la bitácora hoy</span><span><b>'+hoy.filter(e=>e.validado===true).length+'</b> validados</span>';
}

/* ---------- organigrama ---------- */
function nodeHTML(a){
  const rk = RIESGO[a.riesgo] || RIESGO.nulo;
  return '<button type="button" class="node'+(a.tipo==="vacante"?" vac":"")+'" data-id="'+esc(a.id)+'"><span class="av"></span><span><b>'+esc(a.nombre)+'</b><small>'+esc(a.puesto)+'</small><small class="rk t-'+rk[1]+'">'+rk[0]+(a.tipo==="vacante"?' · por contratar':'')+'</small></span></button>';
}
function nodo(n){
  const kids = (n.hijos||[]).map(nodo).join("");
  const sub = kids ? '<ul>'+kids+'</ul>' : '';
  if (n.agente){ const a = byId[n.agente]; if (!a){ console.warn("[oficina] organigrama: no existe el agente " + n.agente); return ""; } return '<li>'+nodeHTML(a)+sub+'</li>'; }
  return '<li><div class="node" style="cursor:default"><span><b>'+esc(n.grupo||"Grupo")+'</b><small>'+esc(n.detalle||"")+'</small></span></div>'+sub+'</li>';
}
function renderOrg(){
  const top = '<div class="node human"><span class="av"></span><span><b>'+esc(persona.nombre)+'</b><small>'+esc(persona.rol||"")+'</small><small class="rk t-ok">Aprueba cambios</small></span></div>';
  $("tree").innerHTML = '<li>'+top+'<ul>'+(CFG.organigrama||[]).map(nodo).join("")+'</ul></li>';
  $("tree").querySelectorAll("button.node").forEach(b => { b.querySelector(".av").replaceWith(avatar(byId[b.dataset.id], 30)); b.addEventListener("click", () => { go("oficina"); select(b.dataset.id); }); });
  $("tree").querySelector(".node.human .av").replaceWith(avatar({ look: persona.look, tipo:"humano" }, 30));
  $("orgnote").innerHTML = (CFG.notasOrganigrama||[]).map(n => '<p><b>'+esc(n.titulo)+'</b> '+esc(n.texto)+'</p>').join("");
}

/* ---------- equipo ---------- */
let filtro = "all";
function renderCards(){
  const now = new Date(), box = $("cards"); box.innerHTML="";
  for (const a of AGENTS){
    if (filtro!=="all" && a.tipo!==filtro) continue;
    const st = estado(a, now), rk = RIESGO[a.riesgo] || RIESGO.nulo, u = ultimaDe(a.id), nr = nextRun(a, now);
    const c = document.createElement("button"); c.type="button"; c.className="card";
    c.innerHTML = '<div class="hd"><span class="av"></span><div><h3>'+esc(a.nombre)+'</h3><div class="sub">'+esc(a.puesto)+'</div></div></div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="pill t-'+st.tone+'">'+st.txt+'</span><span class="pill t-'+rk[1]+'">'+rk[0]+'</span></div>'+
      '<div class="mini"><div><span>HORARIO</span>'+esc(a.horarioTxt||(a.tipo==="demanda"?"Cuando lo llamás":"—"))+'</div><div><span>PRÓXIMA</span>'+(nr?cuando(nr,now):"—")+'</div><div><span>ÚLTIMA</span>'+(u?cuando(u.fecha,now):"—")+'</div><div><span>TOCA</span>'+esc(a.toca[0]||"—")+'</div></div>';
    c.querySelector(".av").replaceWith(avatar(a,38));
    c.addEventListener("click", () => { go("oficina"); select(a.id); });
    box.appendChild(c);
  }
}
$("filters").addEventListener("click", e => { const b=e.target.closest("button"); if(!b) return; filtro=b.dataset.f; document.querySelectorAll("#filters button").forEach(x=>x.setAttribute("aria-pressed", x===b?"true":"false")); renderCards(); });

/* ---------- bitácora ---------- */
for (const a of AGENTS) if (a.tipo!=="vacante"){ const o=document.createElement("option"); o.value=a.id; o.textContent=a.nombre+" · "+a.puesto; $("bitAgente").appendChild(o); }
function dayTitle(k){ const now=new Date(); if (k===dayKey(now)) return "Hoy"; if (k===dayKey(new Date(now-86400e3))) return "Ayer"; const [y,m,d]=k.split("-").map(Number); return fecha(artDate(y,m-1,d,12,0)); }
function renderBit(){
  const ag=$("bitAgente").value, rg=$("bitRango").value, rs=$("bitRes").value, now=new Date();
  const list = LOG.filter(e => {
    if (ag && e.agente!==ag) return false;
    if (rs && e.resultado!==rs) return false;
    const k = dayKey(e.fecha);
    if (rg==="hoy") return k===dayKey(now);
    if (rg==="ayer") return k===dayKey(new Date(now-86400e3));
    if (rg==="7") return now-e.fecha < 7*86400e3;
    return true;
  });
  $("bitCount").textContent = list.length + (list.length===1?" ejecución":" ejecuciones");
  const box=$("bitList"); box.innerHTML="";
  if (!list.length){ box.innerHTML='<div class="state">No hay ejecuciones registradas con estos filtros.</div>'; return; }
  let cur=null;
  for (const e of list){
    const a = byId[e.agente] || { nombre:e.agente, puesto:"", look:{hair:"#888",skin:"#ccc",shirt:"#999",pants:"#555"}, tipo:"x" }, k = dayKey(e.fecha);
    if (k!==cur){ cur=k; box.insertAdjacentHTML("beforeend",'<div class="day">'+dayTitle(k)+'</div>'); }
    const acc = Array.isArray(e.acciones) ? e.acciones : [];
    const v = e.validado===true ? '<span class="val ok">✓ validado</span>' : e.validado===false ? '<span class="val bad">✗ observado</span>' : '<span class="val">sin validar</span>';
    const el=document.createElement("div"); el.className="entry";
    el.innerHTML='<span class="hr">'+hhmm(e.fecha)+'</span><span class="av"></span><div class="tx"><b>'+esc(a.nombre)+'</b> <span class="muted" style="font-size:12.5px">· '+esc(a.puesto)+(e.turno?' · turno '+esc(e.turno):'')+'</span><p>'+esc(e.resumen)+'</p>'+
      (acc.length?'<details><summary>'+acc.length+(acc.length===1?' acción':' acciones')+'</summary><ul>'+acc.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></details>':'')+
      (e.notaValidacion?'<p style="font-size:12px;margin-top:4px;color:'+(e.validado===false?'var(--crit)':'var(--ok)')+'">Validadora: '+esc(e.notaValidacion)+'</p>':'')+
      '</div><div class="rt"><span class="pill t-'+resTone(e.resultado)+'">'+esc(resTxt(e.resultado))+'</span>'+v+'</div>';
    el.querySelector(".av").replaceWith(avatar(a,30));
    box.appendChild(el);
  }
}
["bitAgente","bitRango","bitRes"].forEach(id => $(id).addEventListener("change", renderBit));

/* ---------- navegación ---------- */
const VISTAS = ["oficina","org","grid","bit"];
const KEY = "oficina-tab-" + ((CFG.area && CFG.area.id) || "area");
function go(t){
  document.querySelectorAll("#tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.t===t ? "true":"false"));
  VISTAS.forEach(k => $("v-"+k).hidden = k!==t);
  try { localStorage.setItem(KEY, t); } catch(e){}
}
$("tabs").addEventListener("click", e => { const b=e.target.closest("button"); if (b) go(b.dataset.t); });
$("luz").addEventListener("click", e => { const b=e.target.closest("button"); if(!b) return; luz=b.dataset.l; document.querySelectorAll("#luz button").forEach(x=>x.setAttribute("aria-pressed", x===b?"true":"false")); if (reduce) frame(0); });

// logo
(() => { const x=$("logo").getContext("2d"); x.fillStyle="#1a1405"; [[3,3,10,2],[3,5,2,8],[11,5,2,8],[3,11,10,2],[6,7,4,2]].forEach(r=>x.fillRect(...r)); })();

// arranque
try { const t = localStorage.getItem(KEY); if (VISTAS.includes(t)) go(t); } catch(e){}
renderOrg(); renderNow(); renderTimeline(); renderDetail(); renderCards(); renderBit();
requestAnimationFrame(frame);
setInterval(() => { renderNow(); renderTimeline(); }, 30000);
setInterval(renderDetail, 60000);
if (document.fonts) document.fonts.ready.then(() => { if (reduce) frame(0); });
})();
