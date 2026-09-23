# 🏢 Oficina Virtual

Maqueta gráfica estándar para mostrar los agentes de IA de cada área de AIT como una **oficina pixel**. Los agentes aparecen como personajes en sus escritorios y caminan por las salas. La luz cambia según la hora del día. Cada agente tiene una ficha con su estado, horario y últimas ejecuciones.

La idea es que **todas las áreas usen la misma base y el mismo estilo**, y que cada una configure solo su propia oficina.

> ⚠️ Este repo tiene **solo la parte gráfica**, con datos de ejemplo. No incluye agentes reales, prompts, tokens, IDs de tareas, conectores ni datos de clientes.

---

## 👀 Cómo verla

1. Descargá o cloná el repo.
2. Abrí `index.html` en el navegador.
3. Elegí el área que querés ver.

No hace falta instalar nada.

---

## 📁 Estructura

```
oficina-virtual/
├── README.md          → este archivo
├── ESTILO.md          → el estándar visual (obligatorio para todas las áreas)
├── CLAUDE.md          → instrucciones para la IA que arme o modifique una oficina
├── index.html         → selector de áreas
├── motor/             → código común: plano, personajes, fichas, organigrama, bitácora
└── areas/
    ├── clientes/      → versión de referencia (Equipo de Clientes)
    └── _plantilla/    → base para crear un área nueva
```

---

## ➕ Cómo sumar tu área

1. Copiá la carpeta `areas/_plantilla/` y renombrala con tu área (por ejemplo, `areas/adquisicion/`).
2. Editá **solo** el archivo `config.js` de tu carpeta:
   - el nombre del área
   - las salas
   - los personajes: nombre, puesto, sala, horario y colores de ropa
   - los datos de ejemplo de la bitácora
3. Agregá tu área al listado de `index.html`.
4. Abrí un Pull Request.

**No modifiques** los archivos de `motor/` ni el estilo desde tu área. Si necesitás algo nuevo, proponelo en un Pull Request aparte para que lo aprovechen todas las oficinas.

Si armás tu área con Claude u otra IA, pedile que lea primero `CLAUDE.md` y `ESTILO.md`.

---

## 🎨 Estándar visual

Todas las oficinas comparten la misma paleta, las mismas tipografías, la grilla de 16 px, los personajes de 12×16 px y los mismos colores de estado:

| Color | Estado |
|---|---|
| 🟣 Violeta | Trabajando |
| 🟢 Verde | En turno / programado |
| 🔵 Azul | A demanda |
| 🟠 Naranja | Atrasado o sin uso |
| ⚪ Gris | Fuera de turno / vacante |
| 🔴 Rojo | Con fallas |

El detalle completo está en [`ESTILO.md`](ESTILO.md).

---

## 🗂️ Áreas

| Área | Carpeta | Responsable |
|---|---|---|
| Clientes (referencia) | `areas/clientes/` | Pri |
| Adquisición | `areas/adquisicion/` | Joana |
| AI Team | `areas/aiteam/` | a definir |

---

## 🤝 Cómo colaborar

- Cada área trabaja en su propia carpeta.
- Los cambios al motor o al estilo se proponen con un Pull Request y se acuerdan entre todos.
- La versión del área **Clientes** es la referencia por defecto: si hay dudas de estilo, se sigue esa.
