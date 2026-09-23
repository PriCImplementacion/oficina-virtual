/* =========================================================
   PLANTILLA · copiá esta carpeta como areas/<tu-area>/ y editá SOLO este archivo.
   Reglas: leé ESTILO.md. Nada de datos reales (IDs, tokens, canales, clientes, mails).
   ========================================================= */
window.OFICINA_CONFIG = {
  area: {
    id: "mi-area",                       // igual al nombre de la carpeta, en minúsculas y sin espacios
    nombre: "Oficina de Agentes · Mi área",
    subtitulo: "Equipo de Mi área · AIT",
    responsable: { nombre: "Nombre", rol: "Equipo de Mi área",
      look: { hair: "#3b2418", skin: "#eab894", shirt: "#f2b544", pants: "#2c3346" } },
  },

  zona: { nombre: "Córdoba", utc: -3 },

  // 5 salas en orden fijo: 1 arriba izq · 2 arriba centro · 3 arriba der · 4 abajo izq · 5 abajo der
  // Lugares: sala 1 → 2 · sala 2 → 3 · sala 3 → 2 · sala 4 → 6 · sala 5 → 2
  salas: ["Dirección", "Operación", "Seguimiento", "A demanda", "Laboratorio"],

  agentes: [
    // tipo: "programado" (corre solo, con horario) · "demanda" (se llama) · "vacante" (puesto por cubrir)
    // riesgo: "alto" (escribe solo con criterio) · "medio" · "bajo" · "nulo" (solo lee)
    // horario: { slots: [[hora, minuto], ...], dias: [1..5] }  o  { horas: [9,10,...], min: 0 }
    { id: "director", nombre: "Nombre", puesto: "Coordinador · Director", tipo: "vacante", sala: 1,
      hace: "Qué hace este agente, en una oración.",
      toca: ["Qué modifica"], usa: ["Qué herramientas usa"], riesgo: "medio",
      look: { hair: "#d9d4c7", skin: "#e8b996", shirt: "#f2b544", pants: "#3a3f55" } },

    { id: "agente1", nombre: "Nombre", puesto: "Puesto", tipo: "programado", sala: 2,
      horario: { slots: [[10, 0], [16, 0]], dias: [1, 2, 3, 4, 5] }, horarioTxt: "Lun a vie 10:00 · 16:00",
      hace: "Qué hace este agente, en una oración.",
      toca: ["Solo lee"], usa: ["Gestor de tareas"], riesgo: "nulo",
      look: { hair: "#1c1c24", skin: "#b97c56", shirt: "#5bd19a", pants: "#2a2e3f" } },

    { id: "agente2", nombre: "Nombre", puesto: "Puesto", tipo: "demanda", sala: 4,
      hace: "Qué hace este agente, en una oración.",
      toca: ["Crea tareas"], usa: ["Gestor de tareas"], riesgo: "medio",
      look: { hair: "#5a2e1e", skin: "#f2c9a8", shirt: "#e98fb0", pants: "#343a50" } },
  ],

  organigrama: [
    { agente: "director", hijos: [ { agente: "agente1" } ] },
    { grupo: "A demanda", detalle: "Trabajan con la persona presente", hijos: [ { agente: "agente2" } ] },
  ],

  notasOrganigrama: [
    { titulo: "La persona aprueba.", texto: "Ningún agente cambia las instrucciones de otro sin su OK." },
  ],

  // Ejemplos: "haceMin" = hace cuántos minutos. resultado: "ok" · "sin novedades" · "con avisos" · "falla"
  bitacora: [
    { agente: "agente1", haceMin: 30, resultado: "ok", resumen: "Resumen de una línea.", acciones: ["Acción de ejemplo"], validado: null },
  ],

  pie: "Oficina Virtual · área Mi área · datos de ejemplo",
};
