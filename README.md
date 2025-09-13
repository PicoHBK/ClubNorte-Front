# � Paleta de Colores y Estilos para la Web

Este documento describe la paleta de colores, fuentes y estilos principales utilizados en la web, basada en **Tailwind CSS**.

---

## � Colores Principales

- **Color primario (Primary):** `indigo-600`  
  - Uso: botones principales, elementos destacados, links importantes.
- **Color secundario (Secondary):** `emerald-500`  
  - Uso: resaltar información, estados de éxito, enlaces secundarios.

---

## � Colores Tailwind

- **Fondo principal (gradiente):**
  - `from-slate-900`
  - `via-slate-800`
  - `to-slate-900`

- **Tarjeta (formulario / glassmorphism):**
  - Fondo: `bg-white/10` (transparencia tipo glassmorphism)
  - Borde: `border-white/20`
  - Sombra: `shadow-2xl`

- **Textos:**
  - Principal: `text-white`
  - Secundario: `text-slate-300`
  - Labels: `text-slate-200`
  - Placeholders / íconos: `text-slate-400`

- **Inputs:**
  - Fondo: `bg-slate-800`
  - Texto: `text-white`
  - Placeholder: `placeholder-slate-400`
  - Borde: `border-slate-700`
  - Focus: `focus:ring-2 focus:ring-indigo-500`

- **Botón principal:**
  - Fondo: `bg-indigo-600`
  - Hover: `hover:bg-indigo-500`
  - Texto: `text-white`

---

## �️ Fuente

- **Inter** (fuente por defecto en Tailwind)

---

## � Recomendaciones de uso

- Usa el **color primario** para acciones importantes y elementos que quieras que destaquen.  
- Usa el **color secundario** para información complementaria o estados positivos (success).  
- Mantén los fondos oscuros (`slate-900 / slate-800`) para un contraste óptimo con los textos claros.  
- Aprovecha la transparencia (`/10`, `/20`) en tarjetas y modales para crear un efecto glassmorphism moderno.  

