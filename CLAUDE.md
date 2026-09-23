# Instrucciones para la IA (Claude u otra)

Este repo es la **maqueta gráfica estándar** de la Oficina Virtual de agentes de AIT. Tu trabajo es ayudar a armar o ajustar la oficina de **un área**, respetando el estándar al pie de la letra.

## Antes de hacer nada

1. Leé `ESTILO.md` completo. Es obligatorio.
2. Mirá `areas/clientes/config.js`: es la versión de referencia.
3. Preguntale a la persona para qué área es la oficina, si no lo dijo.

## Qué podés tocar

- ✅ `areas/<area>/config.js` y `areas/<area>/index.html` del área que te pidieron.
- ✅ Crear un área nueva copiando `areas/_plantilla/` a `areas/<area>/`, con el `id` en minúsculas y sin espacios.
- ✅ Agregar el link del área en `index.html` (raíz), con el mismo formato que las demás.

## Qué NO podés tocar

- ❌ `motor/oficina.js` ni `motor/oficina.css`, salvo que la persona pida explícitamente un cambio al motor. En ese caso, avisale que va en un Pull Request aparte y que lo tienen que acordar todas las áreas.
- ❌ `ESTILO.md`, con la misma regla.
- ❌ Las carpetas de otras áreas.
- ❌ Colores, tipografías, tamaños, posiciones de salas o forma de los personajes. Solo se configuran los datos permitidos en `config.js`.

## Datos: nunca reales

Este repo es solo gráfico. **No agregues nunca:**

- Prompts reales de agentes, instrucciones internas ni lógica de automatizaciones.
- Tokens, claves, IDs de tareas programadas, IDs de listas, de canales o de usuarios.
- Nombres de clientes, mails, teléfonos o links internos.

Si la persona te pasa datos reales, convertilos en ejemplos genéricos ("Cliente Ejemplo SA", "Gestor de tareas", "Chat") y avisale que lo hiciste.

## Cómo describir un agente

```js
{ id: "gema", nombre: "Gema", puesto: "Archivista de grabaciones",
  tipo: "programado",            // "programado" | "demanda" | "vacante"
  sala: 2,                       // 1 a 5 (ver ESTILO.md §4)
  horario: { horas: [9,10,11], min: 0 },   // o { slots: [[10,0],[17,30]], dias: [1,2,3,4,5] }
  horarioTxt: "Cada hora de 9 a 11",
  hace: "Una oración en presente.",
  toca: ["Qué modifica"], usa: ["Herramientas genéricas"],
  riesgo: "alto",                // "alto" | "medio" | "bajo" | "nulo"
  look: { hair: "#8a3b2a", skin: "#f0c7a4", shirt: "#7db4ff", pants: "#33384d" } }
```

- Respetá la capacidad de cada sala: 1 → 2 · 2 → 3 · 3 → 2 · 4 → 6 · 5 → 2.
- Los agentes a demanda van en la sala 4.
- Usá los colores de `look` permitidos en `ESTILO.md` §5.

## Antes de terminar

Recorré el checklist de `ESTILO.md` §9 y decile a la persona qué archivos cambiaste.
