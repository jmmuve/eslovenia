# Pipeline de Generación — Análisis de Tiempos y Cuellos de Botella

> Observaciones basadas en la ejecución real del agente para el viaje a Suiza (14 abril 2026).

---

## Resumen de fases y tiempos observados

| Fase | Tarea | Tiempo estimado | Cuello de botella |
|------|-------|-----------------|-------------------|
| FASE 0 | `requerimientos.yaml` → `datos-base.md` | ~10 min | Bajo (sin búsquedas) |
| FASE 1 | `datos-base.md` → `datos-enriquecidos.md` | ~10 min | Medio (38 WebSearch/WebFetch) |
| FASE 2 | `datos-enriquecidos.md` → `draft.html` | **>15 min (en curso)** | **ALTO** — ver desglose abajo |

---

## FASE 2 — Desglose del cuello de botella

### Problema principal: tamaño de los ficheros de entrada

El agente de FASE 2 necesita leer dos ficheros grandes antes de poder escribir:

| Fichero | Líneas | Tokens aprox. | Problema |
|---------|--------|---------------|---------|
| `datos-enriquecidos.md` | 1.064 líneas | ~69.700 tokens | **Supera el límite de lectura** del tool Read (10.000 tokens) → el agente tuvo que hacer ~7 lecturas en chunks con `offset/limit` |
| `Eslovenia/index.html` (referencia) | 3.562 líneas | ~50.000 tokens | Mismo problema: lectura fragmentada |
| **Total input** | ~4.600 líneas | **~120.000 tokens** | El agente consume casi toda su ventana de contexto solo en lecturas |

**Observado en logs**: El primer intento de leer `datos-enriquecidos.md` devolvió:
```
Error: File content (69,742 tokens) exceeds maximum allowed tokens (10,000).
Use offset and limit parameters...
```
→ El agente recuperó el error, pero tuvo que reiniciar con lecturas fragmentadas (14 llamadas Read registradas hasta el momento del diagnóstico, más 1 Grep).

---

### Problema secundario: generación de 3.000+ líneas de HTML

El agente escribe el HTML completo en una sola llamada `Write`. Para llegar a ese punto necesita:

| Subtarea | Tiempo típico | Por qué tarda |
|----------|--------------|---------------|
| Lecturas fragmentadas de datos-enriquecidos.md | ~2–3 min | 7–10 llamadas Read con pausa LLM entre cada una |
| Lecturas fragmentadas de index.html (referencia) | ~2–3 min | 5–8 llamadas Read |
| WebSearch × 10 (IDs Pexels) | ~3–5 min | 1 llamada de red por lugar + parse del resultado |
| Síntesis + generación del HTML completo | ~5–8 min | El modelo necesita generar ~3.500 tokens de HTML de una vez |
| Llamada Write (escritura del fichero) | ~10 seg | No es el problema |

**Total estimado FASE 2**: 12–20 minutos para un viaje de 10 días.

---

## Comparativa por número de días del itinerario

| Viaje | Días | Lugares | Tokens datos-enriquecidos | Tiempo FASE 2 estimado |
|-------|------|---------|--------------------------|----------------------|
| Eslovenia | 7 días | ~20 lugares | ~45.000 tokens | ~8–12 min |
| **Suiza** | **10 días** | **~28 lugares** | **~70.000 tokens** | **~15–22 min** |
| Japón (hipotético 14 días) | 14 días | ~40 lugares | ~100.000 tokens | ~25–35 min |

La relación es **aproximadamente lineal** con el número de días y lugares del itinerario.

---

## Causas raíz y posibles mejoras

### Causa 1 — `datos-enriquecidos.md` demasiado grande para una sola lectura

**Por qué ocurre**: El tool `Read` tiene un límite de ~10.000 tokens por llamada. `datos-enriquecidos.md` tiene ~70.000 tokens → requiere mínimo 7 lecturas fragmentadas.

**Mejora posible**: Estructurar `datos-enriquecidos.md` en ficheros más pequeños por zona geográfica:
```
datos-enriquecidos/
  00-logistica.md      (~5.000 tokens)
  01-lucerna.md        (~15.000 tokens)
  02-grindelwald.md    (~18.000 tokens)
  03-berna.md          (~8.000 tokens)
  04-ginebra.md        (~12.000 tokens)
  05-resumen.md        (~5.000 tokens)
```
→ Cada fichero cabe en una sola lectura. El agente HTML puede leerlos selectivamente sin cargar todo.

---

### Causa 2 — El agente HTML lee `index.html` de Eslovenia como referencia

**Por qué ocurre**: El prompt le pide que lea el index.html de Eslovenia (~3.500 líneas) para copiar la estructura CSS/JS. Es el fichero más grande del proceso.

**Mejora posible**: Extraer el CSS base en un fichero `template-base.css` y el JS base en `template-base.js`, ambos de ~200 líneas. El agente los lee una vez (caben en una lectura) en lugar de parsear 3.500 líneas de HTML.

---

### Causa 3 — WebSearch para IDs de Pexels dentro del agente HTML

**Por qué ocurre**: El agente de FASE 2 hace 8–12 búsquedas de imágenes mientras genera el HTML.

**Mejora posible**: Mover la búsqueda de IDs de Pexels a **FASE 1**. Ya que el agente de `datos-enriquecidos.md` visita cada lugar, puede buscar el ID de Pexels en ese momento y guardarlo en el fichero. El agente HTML simplemente lo lee, sin búsquedas adicionales.

En `datos-enriquecidos.md`, añadir una sección:
```markdown
## 🖼️ IDs de Pexels verificados
| Lugar | ID Pexels | Uso | URL verificada |
|-------|-----------|-----|----------------|
| Hero Suiza | 2363217 | Hero 1920×1080 | ✅ |
| Lucerna | 1388069 | Día 1-3 header | ✅ |
| Jungfraujoch | 691668 | Día 5 header | ✅ |
...
```

---

### Causa 4 — Generación del HTML completo en memoria antes de escribir

**Por qué ocurre**: El agente construye todo el HTML en su contexto antes de llamar a `Write`. Para 3.500 líneas, el modelo necesita mantener el HTML generado en la ventana de contexto mientras sigue generando.

**Mejora implementada**: Generación incremental día a día (SPECS.md §2.0):
- PASO A: leer `logistica.md` → generar `_draft/base.html`
- PASO B.N: leer `dia-NN.md` (solo ese) → generar `_draft/dia-NN.html`
- PASO C: leer `resumen.md` → generar `_draft/end.html`
- PASO D: `cat` de todos los fragmentos → `draft.html`

Cada paso tiene contexto mínimo (~2 ficheros leídos, ~200-400 líneas generadas). La ventana de contexto del agente nunca se satura.

---

## Resumen de mejoras por impacto

| Mejora | Tiempo ahorrado estimado | Complejidad | Estado |
|--------|--------------------------|-------------|--------|
| IDs Pexels en FASE 1 | ~3–5 min | Baja | ✅ Implementado — SPECS.md §1.2, §1.3, §1.5 |
| Template CSS/JS extraído | ~2–3 min | Baja | ✅ Implementado — `_templates/base-styles.css` + `base-scripts.js` |
| Datos por día (un fichero por día) | ~3–4 min | Baja | ✅ Documentado — SPECS.md §1.6 |
| Generación HTML incremental día a día | ~5–8 min | Baja | ✅ Documentado — SPECS.md §2.0 + §2.13 |
| **Total mejoras** | **~13–20 min** | — | — |

Con todas las mejoras, FASE 2 pasaría de **~18 min monolíticos** a **~2–3 min por paso** (base + N días + cierre + ensamblado). Para un viaje de 10 días: ~15 pasos de 2 min = mismo tiempo total, pero con **control granular**, **reiniciabilidad** y **posibilidad de paralelizar días**.

---

## Nota sobre FASE 3

FASE 3 (búsqueda de datos reales de vuelos, hoteles, vehículo) tiene una naturaleza diferente: son pocas búsquedas web pero cada una puede tardar si la web no responde. El fichero de salida es pequeño (reemplazar placeholders). El tiempo estimado de FASE 3 es **5–10 min**, y no tiene los mismos cuellos de botella que FASE 2.
