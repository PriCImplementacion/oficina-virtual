# 🎨 ESTILO · Estándar visual de la Oficina Virtual

Este documento define cómo se ve **toda** oficina de agentes de AIT. Es obligatorio para todas las áreas. La versión de referencia es `areas/clientes/`: si algo no está escrito acá, se sigue lo que hace esa versión.

**Regla de oro:** cada área cambia **datos** (nombres, puestos, salas, horarios, colores de ropa), nunca el **estilo**. El estilo vive en `motor/` y se cambia solo con un Pull Request acordado entre todos.

---

## 1. Identidad

- **Concepto:** una oficina pixel vista desde arriba, de noche azulada y de día cálida, donde cada agente es un personaje con escritorio propio.
- **Tema:** oscuro, único. No hay versión clara.
- **Tono:** cercano y claro, en español rioplatense (voseo): "Tocá un agente", "Ver toda su bitácora".

## 2. Colores

### Base (no cambiar)

| Token | Hex | Uso |
|---|---|---|
| `--ground` | `#12141c` | Fondo de la página |
| `--panel` | `#1b1f2b` | Paneles y tarjetas |
| `--panel2` | `#222736` | Paneles internos, chips |
| `--line` | `#2e3447` | Bordes |
| `--line2` | `#3a4158` | Bordes de controles |
| `--text` | `#ece8dd` | Texto principal |
| `--muted` | `#9097ab` | Texto secundario |
| `--faint` | `#666d84` | Texto terciario |
| `--accent` | `#f2b544` | Acento: selección, botones principales, hora actual |

### Estados (semánticos, iguales en todas las áreas)

| Token | Hex | Significa |
|---|---|---|
| `--run` | `#c79bff` | Trabajando ahora |
| `--ok` | `#5bd19a` | En turno / programado / validado |
| `--info` | `#7db4ff` | A demanda |
| `--warn` | `#f2a33a` | Atrasado, sin uso, con avisos |
| `--idle` | `#7a8098` | Fuera de turno, vacante, sin novedades |
| `--crit` | `#f0605d` | Falla u observado |

Un color de estado **nunca** se usa como decoración.

### Niveles de riesgo

| Valor | Etiqueta | Color |
|---|---|---|
| `alto` | Riesgo alto: escribe solo, con criterio propio | `--crit` |
| `medio` | Riesgo medio: escribe con la persona presente o con reglas fijas | `--warn` |
| `bajo` | Riesgo bajo: postea o marca, sin cambiar datos | `--info` |
| `nulo` | Sin riesgo: solo lee o genera texto | `--ok` |

## 3. Tipografías

| Rol | Familia | Uso |
|---|---|---|
| Display / etiquetas | **Silkscreen** | Título de la oficina, etiquetas de salas, nombres sobre los personajes, eyebrows en MAYÚSCULAS |
| Texto | **Figtree** 400–700 | Todo el texto de lectura |
| Datos | **JetBrains Mono** | Horas, números, contadores |

No se agregan otras familias.

## 4. El plano

- Grilla de **16 px**. Plano de **30 × 18** tiles (480 × 288 px), escalado con `image-rendering: pixelated`.
- **5 salas en posiciones fijas** más un pasillo. Cada área solo elige el **nombre** de cada sala:

```
┌─────────┬────────────┬─────────┐
│ Sala 1  │  Sala 2    │ Sala 3  │   arriba
│ 2 lug.  │  3 lug.    │ 2 lug.  │
├─────────┴────────────┴─────────┤
│            pasillo             │
├──────────────────┬─────────────┤
│     Sala 4       │   Sala 5    │   abajo
│   6 lugares      │  2 lugares  │
└──────────────────┴─────────────┘
```

- **Convención de salas:**
  - Sala 1: dirección (orquestador y validador).
  - Salas 2 y 3: agentes programados, por tema.
  - Sala 4: agentes a demanda. Son los únicos que salen a caminar.
  - Sala 5: laboratorio o living (pruebas, agentes sin uso).
- Los colores del piso, las plantas, la pizarra, el tablero, el sillón y la cafetera son parte del estándar y no se cambian.

## 5. Personajes

- Sprite de **12 × 16 px**, con una forma única para todos.
- Cada área solo elige los 4 colores de su `look`:

| Parte | Clave | Ejemplos permitidos |
|---|---|---|
| Pelo | `hair` | `#1c1c24` `#2b1d16` `#3b2c22` `#4a3524` `#5a2e1e` `#8a3b2a` `#e0a93a` `#c9c2b5` `#d9d4c7` |
| Piel | `skin` | `#f2c9a8` `#f0c7a4` `#eab894` `#e2a982` `#d9a07a` `#c98f6b` `#b97c56` `#a86f4c` |
| Remera | `shirt` | Cualquier color medio o claro, que se distinga del piso de su sala |
| Pantalón | `pants` | Azules oscuros: `#2a2e3f` `#2c3346` `#30354a` `#343a50` `#3a3f55` |

- Los **vacantes** se dibujan como fantasma gris translúcido, con una notita amarilla en el escritorio.
- Los que están **trabajando** muestran "…" arriba de la cabeza y se mueven apenas.
- El personaje seleccionado lleva una sombra dorada (`--accent`).

## 6. Luz

| Modo | Cuándo (en automático) | Efecto |
|---|---|---|
| Día | de 7:00 a 17:59 | Sin filtro |
| Tarde | de 18:00 a 19:59 | Velo naranja suave |
| Noche | de 20:00 a 6:59 | Velo azul y brillo en los monitores encendidos |

## 7. Nombres y textos

- Cada agente tiene **nombre de persona + puesto**: "Gema · Archivista de grabaciones".
- Los nombres no pueden coincidir con personas reales del equipo.
- Si el nombre es largo, se agrega un `corto` para la etiqueta del plano (máximo unos 18 caracteres).
- `hace`: una sola oración, con el verbo en presente ("Vincula…", "Avisa…").
- `toca`: qué modifica, de 1 a 3 chips cortos.

## 8. Qué NO se hace

- ❌ Cambiar colores, tipografías, radios o sombras desde un área.
- ❌ Agregar salas, mover salas o cambiar el tamaño del plano.
- ❌ Usar emojis como decoración en la interfaz (en los textos de la bitácora sí: ✅ ⚠️ ❌).
- ❌ Poner datos reales: IDs de tareas, tokens, mails, canales, nombres de clientes, links internos.
- ❌ Crear versiones "claras" o variantes de marca por área.

## 9. Checklist antes del Pull Request

- [ ] Solo cambié archivos dentro de `areas/<mi-area>/` (y el link en `index.html`).
- [ ] Cada agente tiene `id`, `nombre`, `puesto`, `tipo`, `sala`, `riesgo`, `look` y `hace`.
- [ ] No hay más agentes por sala que lugares disponibles.
- [ ] Todos los `id` del organigrama existen en `agentes`.
- [ ] La bitácora es de ejemplo, sin clientes ni datos reales.
- [ ] Abrí mi `index.html` en el navegador y no hay errores en la consola.
