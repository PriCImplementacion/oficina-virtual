/* =========================================================
   Área: Clientes · versión de referencia
   Solo datos de maqueta: sin IDs, tokens, canales ni clientes reales.
   ========================================================= */
window.OFICINA_CONFIG = {
  area: {
    id: "clientes",
    nombre: "Oficina de Agentes · Clientes",
    subtitulo: "Equipo de Clientes · AIT Boxer",
    responsable: { nombre: "Pri", rol: "Equipo de Clientes",
      look: { hair: "#3b2418", skin: "#eab894", shirt: "#f2b544", pants: "#2c3346" } },
  },

  zona: { nombre: "Córdoba", utc: -3 },

  // Nombres de las 5 salas, en orden fijo:
  // 1 arriba izq · 2 arriba centro · 3 arriba der · 4 abajo izq · 5 abajo der
  salas: ["Dirección", "Implementación", "Batallas", "A demanda", "Laboratorio"],

  agentes: [
    { id: "atlas", nombre: "Atlas", puesto: "Super Agente · Director", tipo: "programado", sala: 1,
      horario: { slots: [[10, 0], [17, 30]], dias: [1, 2, 3, 4, 5] }, horarioTxt: "Lun a vie 10:00 · 17:30",
      hace: "Coordina al equipo: lee la validación de Vera y la bitácora, detecta patrones y manda el informe diario.",
      toca: ["Envía el informe"], usa: ["Bitácora", "Chat"], riesgo: "medio",
      look: { hair: "#d9d4c7", skin: "#e8b996", shirt: "#f2b544", pants: "#3a3f55" } },

    { id: "vera", nombre: "Vera", puesto: "Validadora · QA", tipo: "programado", sala: 1,
      horario: { slots: [[9, 30], [17, 0]], dias: [1, 2, 3, 4, 5] }, horarioTxt: "Lun a vie 9:30 · 17:00",
      hace: "Revisa cada registro de la bitácora contra los sistemas, lo marca ✓ o ✗ y le deja el resumen a Atlas.",
      toca: ["Solo lee", "Marca la bitácora"], usa: ["Gestor de tareas", "Chat", "Bitácora"], riesgo: "bajo",
      look: { hair: "#2b1d16", skin: "#c98f6b", shirt: "#9ad1c4", pants: "#2c3346" } },

    { id: "gema", nombre: "Gema", puesto: "Archivista de grabaciones", tipo: "programado", sala: 2,
      horario: { horas: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18], min: 0 }, horarioTxt: "Cada hora de 9 a 18",
      hace: "Vincula las grabaciones de capacitaciones con la tarea de cada cliente y avanza su estado.",
      toca: ["Comenta tareas", "Cierra subtareas", "Cambia estados"], usa: ["Drive", "Gestor de tareas"], riesgo: "alto",
      look: { hair: "#8a3b2a", skin: "#f0c7a4", shirt: "#7db4ff", pants: "#33384d" } },

    { id: "tomas", nombre: "Tomás", puesto: "Agenda de capacitaciones", tipo: "programado", sala: 2,
      horario: { slots: [[17, 55]] }, horarioTxt: "Todos los días 17:55",
      hace: "Arma el listado de clientes pendientes de agendar, agrupados por capacitación.",
      toca: ["Solo lee"], usa: ["Gestor de tareas"], riesgo: "nulo",
      look: { hair: "#1c1c24", skin: "#b97c56", shirt: "#5bd19a", pants: "#2a2e3f" } },

    { id: "bruno", nombre: "Bruno", puesto: "Vigía de Batallas", tipo: "programado", sala: 3,
      horario: { slots: [[10, 0], [13, 15], [17, 50]] }, horarioTxt: "10:00 · 13:15 · 17:50",
      hace: "Avisa en el canal del equipo qué casos están esperando respuesta y menciona a los responsables.",
      toca: ["Postea en el chat"], usa: ["Gestor de tareas", "Chat"], riesgo: "bajo",
      look: { hair: "#4a3524", skin: "#e2a982", shirt: "#f0605d", pants: "#2d3244" } },

    { id: "olga", nombre: "Olga", puesto: "Técnica de pruebas", tipo: "programado", sala: 5, sinUso: true,
      horario: null, horarioTxt: "Sin horario (prueba)",
      hace: "Agente de diagnóstico para probar conexiones. Sin uso.",
      toca: ["Mensaje privado"], usa: ["Chat"], riesgo: "bajo",
      look: { hair: "#c9c2b5", skin: "#d9a07a", shirt: "#8c93a8", pants: "#30354a" } },

    { id: "maria", nombre: "María de los Ángeles", corto: "Ma. de los Ángeles", puesto: "Encargada de las cards · Altas", tipo: "demanda", sala: 4,
      hace: "Cuando entra un cliente nuevo, crea su tarea de alta y avisa a los equipos.",
      toca: ["Crea tareas", "Postea en el chat"], usa: ["Chat", "Gestor de tareas"], riesgo: "medio",
      look: { hair: "#5a2e1e", skin: "#f2c9a8", shirt: "#e98fb0", pants: "#343a50" } },

    { id: "sol", nombre: "Sol", puesto: "Sugerencias de producto", tipo: "demanda", sala: 4,
      hace: "Convierte un pedido de cliente en una sugerencia para el equipo de producto.",
      toca: ["Crea tareas"], usa: ["Gestor de tareas"], riesgo: "medio",
      look: { hair: "#e0a93a", skin: "#e9b48e", shirt: "#f2d06b", pants: "#373c52" } },

    { id: "walter", nombre: "Walter", puesto: "Auditor de SLA", tipo: "demanda", sala: 4,
      hace: "Prepara la medición semanal de tiempos de respuesta por plan.",
      toca: ["Solo genera texto"], usa: [], riesgo: "nulo",
      look: { hair: "#262129", skin: "#a86f4c", shirt: "#6fc3d9", pants: "#2b3043" } },

    { id: "ivan", nombre: "Iván", puesto: "Integraciones", tipo: "demanda", sala: 4,
      hace: "Explica cómo conectar una app externa con el sistema.",
      toca: ["Solo explica"], usa: [], riesgo: "nulo",
      look: { hair: "#3b2c22", skin: "#dba27c", shirt: "#b89cf0", pants: "#2e3348" } },

    { id: "mora", nombre: "Mora", puesto: "Brief matutino", tipo: "demanda", sala: 4,
      hace: "Arma el resumen de la mañana cuando se lo piden.",
      toca: ["Solo lee"], usa: ["Calendario", "Chat"], riesgo: "nulo",
      look: { hair: "#101014", skin: "#f0c09c", shirt: "#f29f6b", pants: "#353a4f" } },
  ],

  organigrama: [
    { agente: "atlas", hijos: [
      { agente: "vera", hijos: [ { agente: "gema" }, { agente: "tomas" }, { agente: "bruno" }, { agente: "olga" } ] },
    ] },
    { grupo: "A demanda", detalle: "Trabajan con la persona presente", hijos: [
      { agente: "maria" }, { agente: "sol" }, { agente: "walter" }, { agente: "ivan" }, { agente: "mora" },
    ] },
  ],

  notasOrganigrama: [
    { titulo: "La persona aprueba.", texto: "Ningún agente cambia las instrucciones de otro sin su OK." },
    { titulo: "Atlas coordina.", texto: "Lee a Vera, la bitácora y el estado de cada agente, e informa." },
    { titulo: "Vera valida a todos.", texto: "Revisa lo que hizo cada agente, lo marca ✓ o ✗ y le avisa a Atlas." },
    { titulo: "El personal a demanda", texto: "trabaja solo cuando lo llaman." },
  ],

  // Bitácora de EJEMPLO. "haceMin" = hace cuántos minutos ocurrió (así la demo siempre se ve al día).
  bitacora: [
    { agente: "gema", haceMin: 20, resultado: "ok", resumen: "Vinculó 1 grabación: Cliente Ejemplo SA · Capacitación 2.",
      acciones: ["✅ Cliente Ejemplo SA — Capacitación 2 vinculada, subtarea cerrada, estado a 2do seguimiento"], validado: null },
    { agente: "gema", haceMin: 80, resultado: "sin novedades", resumen: "Sin grabaciones nuevas.", acciones: [], validado: true, notaValidacion: "No había grabaciones sin vincular." },
    { agente: "vera", haceMin: 150, turno: "9:30", resultado: "con avisos", resumen: "6 revisadas · 5 ✓ · 1 ✗ · 0 faltantes",
      acciones: ["✗ Gema: falta el comentario de la grabación en Demo Repuestos"], validado: null },
    { agente: "atlas", haceMin: 120, turno: "10:00", resultado: "con avisos", resumen: "8 de 8 corridas ok · Vera: 5 ✓ · 1 ✗",
      acciones: ["Informe enviado", "Sugerencia: revisar Demo Repuestos"], validado: null },
    { agente: "bruno", haceMin: 125, turno: "10:00", resultado: "ok", resumen: "Avisó 2 casos esperando respuesta.",
      acciones: ["Caso Ejemplo 1 · 2 responsables", "Caso Ejemplo 2 · 1 responsable"], validado: true, notaValidacion: "El mensaje está en el canal." },
    { agente: "maria", haceMin: 200, resultado: "ok", resumen: "Alta de Nuevo Cliente SRL.", acciones: ["Tarea de alta creada", "Aviso en el hilo del vendedor"], validado: true, notaValidacion: "La tarea existe." },
    { agente: "tomas", haceMin: 1100, resultado: "ok", resumen: "18 clientes por agendar.",
      acciones: ["2da capacitación: 5", "3er capacitación: 8", "4ta capacitación: 5"], validado: true, notaValidacion: "Coincide con el gestor de tareas." },
    { agente: "gema", haceMin: 1250, resultado: "con avisos", resumen: "1 grabación sin tarea encontrada.",
      acciones: ["❌ Cliente Demo — tarea no encontrada"], validado: false, notaValidacion: "La tarea existe con otro nombre: revisar." },
  ],

  pie: "Oficina Virtual · área Clientes (versión de referencia) · datos de ejemplo",
};
