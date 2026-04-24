# SPECS.md — Sistema de Generación de Guías de Viaje Web

> **Propósito**: Documento operativo completo para que Claude pueda generar desde cero una guía de viaje interactiva para cualquier destino. Define el pipeline de cuatro fases, los procesos de transformación de datos, y la especificación técnica completa del HTML resultante.
>
> **Fuentes de datos e imágenes**: centralizadas en **[`FUENTES.md`](./FUENTES.md)**. Este documento las referencia pero no las duplica. Actualizar `FUENTES.md` para añadir o sustituir fuentes sin tocar este fichero.
>
> **Referencia de implementación**: El viaje a Eslovenia (julio 2026) es el caso base. Los ficheros resultantes son `datos-enriquecidos.md`, `draft.html` e `index.html`.

---

## El Pipeline

```
requerimientos.yaml
    │
    │  FASE 0: Generación del datos-base.md
    │  (Claude interpreta los requisitos mínimos y genera el fichero base)
    ▼
datos-base.md
    │
    │  FASE 1: Investigación y enriquecimiento
    │  (Claude busca, expande y estructura los datos)
    │  ✦ Incluye IDs de Pexels verificados al final del fichero
    ▼
datos-enriquecidos.md  ←── para viajes 8+ días: ficheros por zona (ver §1.6)
    │
    │  FASE 2: Generación del borrador HTML
    │  (Claude produce draft.html ensamblando _draft/*.html con _templates/ como referencia)
    │  ✦ Lee _templates/base-styles.css, base-scripts.js y mapa-template.html
    │  ✦ Ensamblado: cat base.html mapa.html dias-*.html end.html > draft.html
    ▼                                    ↑
draft.html              _templates/base-styles.css
    │                   _templates/base-scripts.js
    │                   _templates/mapa-template.html
    │  FASE 3: Datos reales + presupuesto
    │  (Claude busca vuelos, hoteles y actividades reales y genera index.html)
    ▼
index.html
```

Cada fase tiene entradas, procesos y salidas definidos. Este documento los especifica en detalle.

---

## Índice

- [FASE 0 — requerimientos.yaml → datos-base.md](#fase-0--requerimientosyaml--datos-basemd)
- [FASE 1 — datos-base.md → datos-enriquecidos.md](#fase-1--datos-basemd--datos-enriquecidosmd)
  - [1.1 Proceso general de enriquecimiento](#11-proceso-general-de-enriquecimiento)
  - [1.2 Fuentes de información por tipo de dato](#12-fuentes-de-información-por-tipo-de-dato)
  - [1.3 Schema del fichero enriquecido](#13-schema-del-fichero-enriquecido)
  - [1.4 Transformaciones sección a sección](#14-transformaciones-sección-a-sección)
- [FASE 2 — datos-enriquecidos.md → draft.html](#fase-2--datos-enriquecidosmd--drafthtml)
- [FASE 3 — draft.html → index.html (datos reales + presupuesto)](#fase-3--drafthtml--indexhtml-datos-reales--presupuesto)
  - [2.1 Stack técnico](#21-stack-técnico)
  - [2.2 Paleta de colores](#22-paleta-de-colores)
  - [2.3 Tipografías](#23-tipografías)
  - [2.4 Estructura general de la página](#24-estructura-general-de-la-página)
  - [2.5 Secciones — especificación completa](#25-secciones--especificación-completa)
  - [2.6 Componentes CSS — clases y estilos](#26-componentes-css--clases-y-estilos)
  - [2.7 Mapa Leaflet interactivo](#27-mapa-leaflet-interactivo)
  - [2.8 JavaScript — funcionalidades](#28-javascript--funcionalidades)
  - [2.9 Imágenes — fuente y formato](#29-imágenes--fuente-y-formato)
  - [2.10 Responsive design](#210-responsive-design)
  - [2.11 Animaciones y microinteracciones](#211-animaciones-y-microinteracciones)
  - [2.12 Accesibilidad](#212-accesibilidad)
  - [2.13 Checklist de implementación](#213-checklist-de-implementación)

---

---

# FASE 0 — `requerimientos.yaml` → `datos-base.md`

`requerimientos.yaml` es el punto de entrada mínimo del pipeline. Contiene únicamente los datos que el usuario conoce antes de planificar el viaje. A partir de él, Claude genera `datos-base.md`, que será la entrada de la Fase 1.

## 0.1 Estructura de requerimientos.yaml

```yaml
zona: [descripción libre de la zona o tipo de viaje]

fechas: DD/MM/AAAA - DD/MM/AAAA   # la duración se calcula a partir de aquí

viajeros:
  - [Nombre 1]
  - [Nombre 2]
  - ...

vuelos:
  directos: si / no
  evitar_low_cost: si / no
  horario_salida: HH:MM - HH:MM
  horario_llegada: HH:MM - HH:MM
  preferencia: barato / rapido

vehiculo:
  alquiler: si / no
  plazas: [número]
  con_equipaje: si / no

preferencias:
  - [condicionante libre]
  - [condicionante libre]
```

### Ejemplo real (Suiza)

```yaml
zona: Naturaleza alpina y ciudades emblemáticas

fechas: 02/08/2026 - 11/08/2026

viajeros:
  - Juanma
  - Neli
  - Alicia
  - Diego
  - Gemma
  - Paco

vuelos:
  directos: si
  evitar_low_cost: si
  horario_salida: 10:00 - 14:00
  horario_llegada: 18:00 - 20:00
  preferencia: barato

vehiculo:
  alquiler: si
  plazas: 9
  con_equipaje: si

preferencias:
  - parking incluido
  - vignette de autopista suiza obligatoria
  - francos suizos o tarjeta sin comisiones
```

## 0.2 Proceso de generación de datos-base.md

A partir de `requerimientos.yaml`, Claude debe:

1. **Calcular la duración** del viaje a partir del rango de fechas
2. **Proponer un itinerario** día a día coherente con la zona descrita, las fechas y el número de viajeros
3. **Proponer aeropuertos** de origen (MAD) y destino más lógicos para la zona, respetando los filtros de vuelo indicados
4. **Proponer alojamientos por zona** distribuidos según el itinerario (sin nombres concretos, solo ciudad/zona y número de noches)
5. **Traducir las preferencias de vehículo** al formato de datos-base.md (tipo, recogida, devolución)
6. **Incluir las preferencias** como notas adicionales

> Los vuelos en `datos-base.md` generado desde `requerimientos.yaml` se marcan como `(por confirmar)` hasta que el usuario los concrete.

## Qué debe contener datos-base.md

### Template

```markdown
# Viaje a [DESTINO] — Datos Base

## Viajeros
- [Nombre 1]
- [Nombre 2]
- [Nombre 3]
- ...
Total: N personas

## Vuelos
### IDA
- Compañía: [aerolínea]
- Número de vuelo: [código]
- Origen: [ciudad, aeropuerto, terminal]
- Destino: [ciudad, aeropuerto, terminal]
- Fecha salida: [día, fecha, hora]
- Fecha llegada: [día, fecha, hora]

### VUELTA
- Compañía: [aerolínea]
- Número de vuelo: [código]
- Origen: [ciudad, aeropuerto, terminal]
- Destino: [ciudad, aeropuerto, terminal]
- Fecha salida: [día, fecha, hora]
- Fecha llegada: [día, fecha, hora]

## Itinerario (días y lugares)

### Día 1 — [fecha]
- Llegada a [ciudad de llegada]
- Traslado a [alojamiento base]
- Visitar: [lista de lugares separados por coma]

### Día 2 — [fecha]
- Base: [ciudad donde se duerme]
- Visitar: [lista de lugares]

[... un bloque por cada día ...]

### Día N — [fecha] — Regreso
- Salida hacia aeropuerto de [ciudad]

## Alojamientos
- [Fechas]: [ciudad/zona], [N] noches
- [Fechas]: [ciudad/zona], [N] noches
- [Fechas]: [ciudad/zona], [N] noches

## Vehículo
- Tipo: [furgoneta 9 plazas / coche / etc]
- Recogida: [aeropuerto/ciudad]
- Devolución: [aeropuerto/ciudad]

## Notas adicionales del usuario
[Cualquier información que el usuario quiera añadir: restricciones, preferencias, advertencias conocidas]
```

> **Qué NO incluir en datos-base.md**: clima, moneda, idioma, capital, peajes, restaurantes, parkings, coordenadas GPS, historia de los lugares. Todo eso lo investiga Claude en FASE 1.

### Ejemplo real (Eslovenia)

```markdown
# Viaje a Eslovenia — Datos Base

## Viajeros
- Juanma, Neli, Alicia, Diego, Gemma, Paco
Total: 6 personas

## Vuelos
### IDA
- Compañía: Iberia — IB0677
- Origen: Madrid T4 (MAD)
- Destino: Venecia Marco Polo (VCE)
- Salida: lunes 13 julio 2026, 08:50
- Llegada: lunes 13 julio 2026, 11:15 (2h 25min)

### VUELTA
- Compañía: Iberia — IB0678
- Origen: Venecia Marco Polo (VCE)
- Destino: Madrid T4 (MAD)
- Salida: domingo 19 julio 2026, 12:00
- Llegada: domingo 19 julio 2026, 14:40 (2h 40min)

## Itinerario
### Día 1 — lunes 13 julio: Venecia → Lago Bled
- Llegada al aeropuerto de Venecia a las 11:15
- Recoger furgoneta, comprar vinjeta en gasolinera
- Llegar a Bled (~220 km, 2h 30min)
- Visitar: Lago Bled, Castillo de Bled, Isla de Bled, Mirador Ojstrica

### Día 2 — martes 14 julio: Base Bled — Vintgar + Bohinj
- Visitar: Garganta de Vintgar (mañana temprano), Lago Bohinj (tarde)

### Día 3 — miércoles 15 julio: Excursión Valle del Soča
- Salida 8:00 AM desde Bled, regreso a dormir en Bled
- Visitar: Paso de Vršič, Gran Cañón del Soča, Cascada Kozjak, Kobarid

### Día 4 — jueves 16 julio: Predjama → Liubliana
- Castillo de Predjama (mañana), Liubliana (tarde-noche)

### Día 5 — viernes 17 julio: Škocjan → Piran
- Cuevas de Škocjan (mañana), llegar a Piran (tarde)

### Día 6 — sábado 18 julio: Día libre en la costa
- Piran, Izola, Salinas de Sečovlje

### Día 7 — domingo 19 julio: Regreso
- Salida 08:30 desde Portorož, ~190 km al aeropuerto de Venecia

## Alojamientos
- lun 13 – mié 15 jul: Zona Bled/Bohinj (Alpes), 3 noches
- jue 16 jul: Liubliana, 1 noche
- vie 17 – sáb 18 jul: Piran/Portorož (costa), 2 noches

## Vehículo
- Tipo: furgoneta 9 plazas (Mercedes Vito o similar)
- Recogida: Aeropuerto Marco Polo, Venecia
- Devolución: Aeropuerto Marco Polo, Venecia

## Notas adicionales
- Grupo de 6 adultos, preferencia por apartamentos o casas rurales enteras
- Priorizar parking incluido (furgoneta grande)
- Conducir con seguridad en las 50 curvas del Paso Vršič
```

> **Nota**: Los datos básicos del país (moneda, idioma, capital, peaje, emergencias, propinas…) los investiga Claude en FASE 1. El usuario no necesita aportarlos.

---

---

# FASE 1 — `datos-base.md` → `datos-enriquecidos.md`

La Fase 1 convierte el fichero mínimo en un documento de datos completo y enriquecido. Claude debe investigar, buscar y estructurar toda la información necesaria para generar el HTML.

**Nombre del fichero de salida**: `datos-enriquecidos.md` (genérico para cualquier destino)

---

## 1.0 Herramientas que Claude debe usar en FASE 1

Claude no puede abrir un navegador ni interactuar visualmente con webs. Para acceder a la información externa, debe usar exclusivamente estas dos herramientas:

### WebSearch — para encontrar páginas

Usar cuando se necesita localizar una URL concreta o cuando la URL exacta no se conoce de antemano.

```
Ejemplos de uso:
WebSearch("clima julio Lago Bled Eslovenia temperatura")
WebSearch("parking Liubliana precio 2024")
WebSearch("Hiša Franko Kobarid precio menú")
WebSearch("pexels lago bled photo site:pexels.com")
WebSearch("coordenadas GPS Castillo Predjama latitud longitud")
WebSearch("gastronomía típica Eslovenia platos tradicionales")
```

**Cuándo usarlo**: siempre que el SPEC indique "buscar en Google [término]", o cuando la URL de la fuente no se conoce exactamente (código de ciudad en TripAdvisor, nombre exacto del artículo en Wikipedia, etc.).

---

### WebFetch — para leer el contenido de una URL concreta

Usar cuando la URL exacta ya se conoce (construida siguiendo los patrones del SPEC) o fue encontrada con WebSearch.

```
Ejemplos de uso:
WebFetch("https://es.wikipedia.org/wiki/Lago_Bled")
WebFetch("https://es.climate-data.org/europa/eslovenia/bled/")
WebFetch("https://www.pexels.com/search/bled+lake/")
WebFetch("https://guide.michelin.com/es/es/restaurants?location=slovenia")
WebFetch("https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-de-pais.aspx?IdPais=ESV")
```

**Cuándo usarlo**: cuando el SPEC indica una URL con patrón conocido (Wikipedia, Climate-data, Pexels, Michelin...). Construir la URL con los datos del destino y hacer fetch directamente.

---

### Reglas de uso combinado

1. **Primero construir la URL** siguiendo los patrones de la sección 1.2. Si la URL funciona, usar WebFetch directamente sin pasar por WebSearch.
2. **Si la URL falla o devuelve contenido vacío**, usar WebSearch para encontrar la URL correcta y luego WebFetch sobre el resultado.
3. **Para datos que Claude ya conoce con certeza** (coordenadas de lugares muy conocidos, platos típicos de un país, código IATA de aeropuertos), usar el conocimiento propio sin hacer fetch — siempre que el dato sea inequívoco y poco susceptible de cambiar.
4. **Para precios, horarios y disponibilidad**, hacer siempre WebFetch — estos datos cambian y el conocimiento de entrenamiento puede estar desactualizado.
5. **Nunca inventar** un precio, horario, coordenada o ID de Pexels. Si no se puede obtener el dato, marcarlo como `[PENDIENTE DE VERIFICAR]` en el markdown.

---

## 1.1 Orden de ejecución de FASE 1

Seguir este orden estrictamente. Cada paso puede completarse con la información ya recopilada de pasos anteriores.

```
PASO 1 — Datos del país (una sola vez)
   → Investigar datos básicos, moneda, peajes, emergencias, apps útiles
   → Fuente: Wikipedia, Lonely Planet, Exteriores.gob.es

PASO 2 — Clima por zonas (una sola vez)
   → Identificar microclimas del itinerario (montaña, costa, interior)
   → Fuente: Climate-data.org, WeatherSpark

PASO 3 — Imagen hero del destino (una sola vez)
   → Comprobar _cache/pexels-ids.md primero — si hay un ID para el destino, usarlo
   → Si no está en caché: WebFetch("https://www.pexels.com/search/[destino en inglés]/")
   → Extraer ID del HTML y verificar que la URL de producción carga correctamente
   → ⛔ BLOQUEANTE: No pasar a PASO 4 sin al menos 1 ID de hero verificado (✅)
   → Añadir el ID verificado a _cache/pexels-ids.md

PASO 4 — Para cada DÍA del itinerario, en orden cronológico:
   4a. Imagen del día (Pexels ID para el header de la sección)
       ⛔ BLOQUEANTE: buscar y verificar el ID ANTES de continuar con 4b–4e
       → Comprobar _cache/pexels-ids.md — si hay un ID para el lugar principal del día, usarlo
       → Si no está en caché: buscar por lugar exacto → zona → región → tipo de paisaje
       → Verificar el ID con la URL de producción (w=1200&h=400&fit=crop)
       → Si después de 3 intentos no hay ID válido, registrar "GRADIENTE" en la tabla
       → Nunca omitir este paso ni marcarlo como pendiente — decidir ya (ID ✅ o GRADIENTE)
   4b. Distancia y tiempo del tramo del día (Google Maps)
   4c. Para cada LUGAR del día:
       - Historia (Wikipedia + Lonely Planet)
       - Qué ver y hacer (TripAdvisor Atracciones + Google Maps)
       - Entradas, precios y horarios (web oficial + GetYourGuide)
       - Parkings (Google Maps + ParkMe)
       - Coordenadas GPS de cada punto de interés
       - URLs de Google Maps de cada punto
       - Imagen del lugar (Pexels ID)
   4d. Gastronomía de la zona (Wikipedia + blogs)
   4e. Restaurantes recomendados (TripAdvisor + Michelin)

PASO 5 — Resumen de kilómetros (una sola vez)
   → Compilar todos los tramos calculados en el paso 4b en una tabla

PASO 6 — Gastronomía general del destino (una sola vez)
   → Platos imprescindibles del país/región

PASO 7 — Presupuesto estimado (una sola vez)
   → Vuelos (dato del usuario) + alojamiento + actividades + gasolina + restaurantes

PASO 8 — Checklist pre-viaje (una sola vez)
   → Reservas pendientes, apps a descargar, documentos, compras previas al viaje
```

**Bloques de información por lugar** (lo que debe quedar documentado de cada lugar):
```
1. Historia del lugar (2–4 párrafos narrativos)
2. Qué ver y hacer (lista detallada con descripción de cada punto)
3. Datos prácticos (entradas con precios, horarios, duración visita)
4. Parkings (nombre, precio, Google Maps URL)
5. Restaurantes recomendados (nombre, descripción breve, rango de precio)
6. Gastronomía típica de la zona (tabla plato/descripción)
7. Clima (temperatura máx/mín, condiciones, lluvia)
8. Coordenadas GPS (lat/lng para el mapa)
9. Google Maps URLs (para cada punto de interés)
10. ID de imagen en Pexels (para hero, header día, acordeón, thumbnail)
```

**Regla de calidad**: Cada lugar debe tener suficiente contenido para que un viajero que no conoce el destino pueda entender por qué vale la pena visitarlo y cómo hacerlo de forma práctica.

---

## 1.2 Fuentes de información por tipo de dato

> Las URLs, patrones de búsqueda y notas de uso de cada fuente están centralizadas en **[`FUENTES.md`](./FUENTES.md)**. Este documento solo describe el proceso y los criterios de uso. Actualizar `FUENTES.md` cuando se añadan o sustituyan fuentes.

Los datos del fichero enriquecido tienen dos orígenes distintos:

| Tipo | Qué es | Ejemplos |
|---|---|---|
| **🔍 Investigado** | Datos factuales que Claude debe buscar en fuentes externas. No inventar ni estimar sin fuente. | Precios, horarios, coordenadas GPS, IDs de Pexels, nombres de restaurantes, precios de parking |
| **✍️ Generado** | Contenido que Claude produce a partir de su conocimiento y de los datos ya recopilados. Requiere criterios claros, no URLs. | Textos narrativos, horario del día, mapa ASCII, presupuesto calculado, checklist pre-viaje, consejos de grupo |

Las subsecciones siguientes especifican cómo trabajar con cada tipo.

---

### ✍️ Textos narrativos — Historia y descripción de lugares

**Origen**: Conocimiento de Claude, contrastado con Wikipedia.

**Cuándo**: Una vez leída la Wikipedia del lugar, redactar en español propio. No copiar párrafos literales.

**Criterios de redacción**:
- Longitud: 2–4 párrafos por lugar. Más largo no es mejor.
- Tono: accesible, evocador, como un amigo que ha estado allí. Evitar el tono de enciclopedia.
- Estructura: párrafo 1 → qué es y por qué es especial; párrafo 2 → historia/contexto; párrafo 3 → dato curioso o conexión emotiva; párrafo 4 (opcional) → contexto geográfico o cómo encaja en el itinerario.
- Incluir: fechas de fundación, hechos clave, datos curiosos (películas, récords, leyendas).
- Evitar: superlativos vacíos ("el más impresionante de Europa"), listas dentro de los párrafos, repetir el nombre del lugar en cada frase.
- Si hay incertidumbre sobre un dato (fecha, cifra), usar "aproximadamente" o "según fuentes" en lugar de inventar.

**Ejemplo de estructura** (no copiar, solo como guía de tono):
> "El lago Bled lleva siglos hipnotizando a viajeros. Lo que hoy es un destino turístico consolidado fue durante siglos tierra de monjes y señores feudales..."

---

### ✍️ Horario sugerido del día

**Origen**: Generado por Claude a partir de distancias, horarios de apertura y sentido común logístico.

**Criterios**:
- Respetar los horarios de apertura investigados (no poner "visita al museo" cuando abre a las 10 y hay que llegar a las 8)
- Dejar tiempo real de conducción entre puntos (usar los km calculados, no estimaciones)
- Grupos de 6+ personas tardan un 20–30% más en entrar, aparcar y organizarse que un viajero solo
- No meter más de 3–4 visitas en un día si alguna es larga (>2h)
- Incluir pausa de comida (1–1,5h) en el punto medio del día
- Madrugones son aceptables para evitar aglomeraciones en sitios populares (Bled, Vintgar)
- Formato: lista de horas con descripción breve. Ejemplo: `09:00 — Llegada al parking de Vintgar. Acceso antes de la oleada turística.`

---

### ✍️ Mapa ASCII del recorrido

**Origen**: Generado por Claude a partir del itinerario del día o del recorrido total.

**Criterios**:
- Usar caracteres ASCII simples: `→`, `─`, `│`, `┌`, `└`, `↓`, `·`
- Mostrar puntos en orden cronológico de visita, de arriba abajo
- Incluir distancias/tiempos entre puntos si el día tiene varios tramos de conducción
- Para el mapa general del viaje: mostrar la ruta completa con las bases de alojamiento diferenciadas
- Ejemplo de formato por día:
```
Bled (base)
  │ 6 km · 12 min
  ↓
Vintgar (mañana)
  │ 35 km · 45 min
  ↓
Bohinj (tarde)
  │ 35 km · 45 min
  ↓
Bled (vuelta a base)
```

---

### ✍️ Consejos para grupos

**Origen**: Generado por Claude a partir del tamaño del grupo, tipo de vehículo y logística del destino.

**Criterios**:
- Adaptar siempre al tamaño y perfil del grupo (familias, amigos adultos, mixto)
- Cubrir estas categorías: transporte (turnos de conducción, navegador), alojamiento (reparto de habitaciones, check-in), entradas y reservas (quién gestiona, si conviene dividirse), dinero (cómo dividir gastos, app recomendada), logística diaria (hora de salida, quién lleva el parking, punto de encuentro si se separan)
- Tono práctico y directo. No repetir consejos genéricos que aplican a cualquier viaje.
- Incluir al menos un consejo específico del destino (ej. "en Piran el centro es peatonal: acordar punto de encuentro antes de entrar")

---

### ✍️ Notas importantes y advertencias

**Origen**: Generado por Claude a partir de todo lo investigado. Son los riesgos o particularidades que el grupo podría pasar por alto.

**Criterios**:
- Incluir solo advertencias relevantes y específicas del destino, no genéricas
- Ordenar por impacto: primero las que pueden arruinar el día (parking cerrado, atracción sin reserva, carretera cortada), luego las de menor impacto (propinas, idioma)
- Máximo 8–10 puntos. Si hay más, priorizar.
- Formato: lista numerada, cada punto en una línea, directo al grano
- Ejemplos de qué incluir: restricciones de circulación, atracciones que cierran lunes, parkings con altura máxima, reserva obligatoria, zonas peatonales donde no puede entrar la furgoneta, diferencias horarias con España

---

### ✍️ Presupuesto estimado del viaje

**Origen**: Calculado por Claude a partir de los datos investigados (precios de entradas, restaurantes, parkings, alojamiento) más los datos del usuario (vuelos).

**Categorías a cubrir**:

| Categoría | Fuente del dato | Cómo calcular |
|---|---|---|
| Vuelos | datos-base.md (dato del usuario) | Precio real si lo sabe; si no, buscar en Google Flights para las fechas |
| Alojamiento | Investigado en Booking/Airbnb | Precio/noche × noches. Indicar rango (económico / medio / alto) |
| Alquiler de vehículo | Estimación Claude | Buscar en Google `alquiler furgoneta [aeropuerto] [fechas]`; rango orientativo |
| Gasolina | Cálculo Claude | km totales ÷ 10 L/100km × precio gasolina del país |
| Entradas y actividades | Investigado (precios por lugar) | Sumar todas las entradas por persona; multiplicar por N personas |
| Restaurantes | Investigado (rango por restaurante) | Asumir 1 comida/día en restaurante × precio medio × personas × días |
| Parkings | Investigado | Sumar los precios de parking por día |
| Varios (propinas, souvenirs, imprevistos) | Estimación Claude | ~10–15% del total anterior |

**Formato de salida**: tabla con columna por persona y columna total del grupo. Indicar siempre si es estimación optimista, media o conservadora.

---

### ✍️ Checklist pre-viaje

**Origen**: Generado por Claude a partir de todos los datos recopilados. Es la lista de acciones que el grupo debe completar antes de salir.

**Categorías a cubrir**:
- **Reservas pendientes**: restaurantes que requieren reserva (anotar cuándo abren reservas y el teléfono/web), entradas de atracciones con aforo limitado, alquiler de vehículo
- **Compras previas**: vinjeta/peaje online si se puede comprar antes, seguro de viaje, adaptadores si aplica
- **Descargas**: mapas offline de Google Maps (qué área descargar), idioma local en Google Translate, apps recomendadas
- **Documentación**: DNI o pasaporte vigente, tarjeta sanitaria europea (EHIC), carné de conducir, póliza del seguro del coche
- **Logística del grupo**: quién conduce (y días), quién gestiona el parking, app de gastos compartidos configurada con todos los miembros
- **Contingencias**: número de asistencia en carretera, número del alquiler de coche, teléfono del alojamiento

**Formato**: lista de checkboxes `- [ ]` agrupada por categoría. Debe ser directamente utilizable por el grupo.

---

### 🔍 Datos básicos del país

**Cuándo**: Hacer esto primero, antes de enriquecer lugar por lugar. Establece el contexto general del destino.

**Cómo encontrar la web de turismo oficial de cualquier país**:
1. Buscar en Google: `"turismo oficial" [país]` o `"[país] tourism" site:.gov o site:.org`
2. O buscar directamente: `visit[país].com` / `[país].travel` / `[país]tourism.com`
3. Verificar que es la web del gobierno o entidad nacional (no una agencia privada)

> Fuentes y URLs: ver **[FUENTES.md](./FUENTES.md)** → Información general del país

**Datos a recopilar**:
- País, capital, moneda, idioma oficial
- ¿Zona euro? ¿Tarjetas aceptadas generalmente o mejor llevar efectivo?
- Número de emergencias local (además del 112 europeo)
- Peajes especiales o vinjetas: nombre, precio, dónde comprar, URL oficial
- Propinas: ¿es costumbre? ¿qué porcentaje? ¿va ya incluida en la cuenta?
- Idiomas con los que manejarse en zonas turísticas
- Velocidad máxima en autopista, carretera secundaria y ciudad
- Adaptador de corriente necesario (si aplica)
- Datos curiosos o diferencias culturales relevantes para el viajero español

**Dónde colocar en `[destino]_datos.md`**: Sección `## 🚐 Logística General` → subsección `### Consejos Prácticos`. En el HTML se renderiza como acordeón "Información del país".

---

### 🏛️ Historia e información turística de cada lugar

**Cuándo**: Una vez por cada lugar del itinerario. Primero Wikipedia, luego completar con fuentes turísticas.

**Proceso paso a paso**:
1. Buscar `https://es.wikipedia.org/wiki/[Lugar]` — leer la introducción y las secciones de Historia, Geografía y Datos de interés
2. Si el artículo en español es escaso, leer la versión inglesa `https://en.wikipedia.org/wiki/[Place]` y traducir los fragmentos relevantes
3. Buscar `https://www.lonelyplanet.com/[pais]/[region]/[lugar]` para descripciones más narrativas y orientadas al viajero
4. Buscar en Google `[lugar] historia curiosidades turismo` para encontrar artículos de blogs de viaje con datos más locales
5. Consultar la web de turismo oficial del país (encontrada en el paso anterior) para descripciones oficiales

> Fuentes y URLs: ver **[FUENTES.md](./FUENTES.md)** → Historia e información turística

**Qué extraer**:
- Fecha de fundación o construcción (si es un monumento o ciudad histórica)
- Hechos históricos relevantes (batallas, personajes, épocas clave)
- Datos curiosos: películas rodadas allí, récords, leyendas locales, conexiones con España
- Contexto geográfico: por qué está donde está, qué lo hace especial
- Redactar en 2–4 párrafos narrativos en español, tono accesible y evocador

---

### 👁️ Qué ver y hacer (puntos de interés)

**Cuándo**: Inmediatamente después de la historia, para cada lugar del itinerario.

**Proceso paso a paso**:
1. Recopilar la lista inicial del `datos-base.md` (los lugares que el usuario ya mencionó)
2. Ampliarla buscando en TripAdvisor `https://www.tripadvisor.es/Attractions-[código]-[Ciudad].html` → filtro "Lo más visto"
3. Verificar en Google Maps buscando el nombre del lugar → ver el panel de "Lugares de interés cercanos"
4. Consultar Lonely Planet y la web de turismo oficial para lugares que no aparecen en TripAdvisor
5. Para cada punto de interés: buscar una descripción de 2–4 líneas que explique qué es y por qué merece la pena
6. Incluir solo los puntos que encajan con el tiempo disponible ese día (no añadir más de lo que el grupo puede visitar)

> Fuentes y URLs: ver **[FUENTES.md](./FUENTES.md)** → Qué ver y hacer

**Qué registrar por punto de interés**:
- Nombre oficial (en el idioma local y en español si difiere)
- Descripción breve (1–3 líneas): qué es, cuándo se construyó, por qué es especial
- Tiempo estimado de visita
- Si requiere entrada o es gratuito (enlazar a la sección de datos prácticos)
- Coordenadas GPS (ver sección correspondiente)
- URL de Google Maps

---

### 🎟️ Entradas, precios y horarios

**Cuándo**: Para cada punto de interés que requiera entrada o tenga acceso restringido.

**Proceso paso a paso**:
1. Buscar la **web oficial** del lugar: buscar `[nombre del lugar] official website tickets` en Google
2. En la web oficial, localizar la sección "Visita", "Tickets", "Plan your visit" o equivalente
3. Si no hay web oficial, buscar el precio en GetYourGuide o Civitatis (suelen tener los precios de entrada además del tour)
4. Verificar con TripAdvisor (pestaña "Info" del lugar) como contraste — los precios en foros se desactualizan
5. Para horarios de temporada alta/baja: buscar `[lugar] horarios [mes del viaje]`
6. Anotar si necesita reserva previa (muchos sitios importantes requieren reserva online)

> Fuentes y URLs: ver **[FUENTES.md](./FUENTES.md)** → Entradas, precios y horarios

**Datos a recopilar**:
- Precio de entrada adultos (€), precio reducido si existe (niños, jubilados, estudiantes)
- Horario de apertura en el mes del viaje
- Días de cierre (muchos museos cierran lunes)
- Si requiere reserva previa y cómo hacerla (URL directa)
- Duración estimada de la visita
- Observaciones: última entrada, acceso con silla de ruedas, audioguía disponible

---

### 🌡️ Clima

**Cuándo**: Una vez por destino, desglosado por zonas geográficas si el itinerario cruza distintos microclimas (montaña, costa, interior).

**Proceso paso a paso**:
1. Identificar las zonas climáticas del itinerario (ej. Alpes, costa mediterránea, capital continental)
2. Para cada zona, buscar en Climate-data.org: `https://es.climate-data.org/` + nombre de la ciudad principal de esa zona
3. Anotar los datos del mes del viaje (temperatura media, máx/mín, días de lluvia)
4. Contrastar con WeatherSpark para confirmar el patrón: `https://es.weatherspark.com/y/[codigo]/Tiempo-en-[Ciudad]`
5. Redactar una descripción breve de las condiciones esperadas (no solo números)

> Fuentes y URLs: ver **[FUENTES.md](./FUENTES.md)** → Clima

**Datos a extraer por zona**:
- Temperatura media, máxima y mínima en el mes del viaje
- Precipitación mensual media en mm
- Número de días de lluvia esperados
- Descripción de condiciones (soleado, variable, posibles tormentas de tarde en montaña, etc.)
- Consejo de ropa o equipo (ej. "llevar impermeable ligero para las tardes en los Alpes")

---

### 🖼️ Imágenes (IDs de Pexels)

**Cuándo**: Buscar el ID de cada lugar **en el mismo momento** en que se investiga ese lugar (dentro del Paso 4 del orden de ejecución). No dejarlo para el final. Al terminar FASE 1, rellenar la tabla `## 🖼️ IDs de Pexels verificados` del schema con todos los IDs encontrados.

> **Por qué importa el momento**: si se buscan los IDs al final se pierde el contexto de cada lugar. Además, tenerlos en `datos-enriquecidos.md` evita que el agente de FASE 2 tenga que hacer búsquedas adicionales, reduciendo el tiempo de generación HTML en ~3–5 minutos.

**Proceso paso a paso**:

Claude no puede navegar visualmente Pexels. Usar este proceso:

1. **WebFetch sobre la página de búsqueda de Pexels** (en inglés, mejores resultados):
   ```
   WebFetch("https://www.pexels.com/search/[lugar en inglés]/")
   ```
   Ejemplo: `WebFetch("https://www.pexels.com/search/lake+bled/")`

2. **Extraer IDs del HTML devuelto**: buscar en el HTML patrones como:
   - URLs de foto: `href="/photo/descripcion-XXXXXXX/"` — el ID es el número al final
   - O directamente en `src` de imágenes: `photos/XXXXXXX/pexels-photo-XXXXXXX.jpeg`
   - Tomar el primer resultado que parezca una fotografía de paisaje (no retrato, no interior)

3. **Si WebFetch de Pexels no devuelve resultados útiles**, usar WebSearch:
   ```
   WebSearch("pexels [lugar en inglés] landscape photo site:pexels.com")
   ```
   Los resultados de Google suelen incluir la URL con el ID numérico visible.

4. **Verificar el ID obtenido** — la presencia del tag `<img>` no es suficiente. Verificar que la URL devuelve una imagen real (>5 KB):
   ```
   https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop
   ```
   Un ID válido devuelve una imagen JPEG de al menos 10 KB. Pexels puede devolver HTTP 200 con un placeholder de ~600 bytes para IDs inválidos o eliminados — ese caso también es un fallo. Si el tamaño es <5 KB, el ID no es válido: intentar con el siguiente.

5. **Si no hay fotos del lugar exacto**, buscar por términos más generales en este orden: nombre de la región → nombre del país → tipo de paisaje (mountain lake, alpine village, mediterranean coast...).

6. **Último recurso**: usar gradiente CSS como fallback — no inventar un ID que no se ha verificado.

> Fuentes, URL de producción y tamaños por uso: ver **[FUENTES.md](./FUENTES.md)** → Imágenes

**Fallback si no hay imagen válida**: Usar gradiente CSS `linear-gradient(135deg, var(--primary), var(--turquoise))`. Añadir siempre `onerror="this.style.opacity='0'"` a cada `<img>`.

---

### 🗺️ Coordenadas GPS y URLs de Google Maps

**Cuándo**: Para todos los puntos de interés que aparecerán en el mapa Leaflet y en los pins de "Qué ver".

**Cómo obtener coordenadas**:

Claude no puede interactuar con Google Maps visualmente. Usar este proceso en orden:

1. **Primero: conocimiento propio** — para lugares muy conocidos (capitales, lagos famosos, castillos turísticos), Claude puede usar sus coordenadas de entrenamiento si las conoce con precisión de al menos 4 decimales. Verificar mentalmente que tienen sentido geográfico (ej. Eslovenia está entre 45.4–46.9°N y 13.4–16.6°E).

2. **Si no se conocen con certeza: WebFetch sobre Wikipedia**
   ```
   WebFetch("https://es.wikipedia.org/wiki/[Nombre_del_Lugar]")
   ```
   La infobox de Wikipedia incluye coordenadas en formato `{{coord|lat|lng}}` o como enlace GeoHack. Extraer latitud y longitud del HTML.

3. **Si Wikipedia no tiene el lugar: WebSearch**
   ```
   WebSearch("coordenadas GPS [nombre del lugar] [país] latitud longitud")
   ```
   Los resultados suelen incluir la coordenada directamente en el snippet o en páginas como coordinates.org, mapcarta.com o el propio Google.

4. **Formato final requerido**: 6 decimales, punto como separador decimal (ej. `46.363200, 14.093600`). Nunca usar comas como separador decimal.

> Fuentes y formatos de URL de Google Maps: ver **[FUENTES.md](./FUENTES.md)** → Coordenadas GPS y mapas

**Qué registrar**:
- Latitud (6 decimales) y longitud (6 decimales) de cada punto de interés
- URL de Google Maps de cada punto (para el pin SVG de "Qué ver" y el marcador del mapa)
- Organizar en tabla: `| Lugar | Latitud | Longitud | Día |`

---

### 🍽️ Gastronomía y restaurantes

**Cuándo**: Una vez por zona geográfica (no por cada lugar). Identificar la gastronomía regional y seleccionar 3–5 restaurantes por zona.

**Proceso para platos típicos**:
1. Buscar en Wikipedia: `https://es.wikipedia.org/wiki/Gastronomía_de_[País]` o `Cocina_[región]`
2. Buscar en Google `gastronomía típica [región/zona] qué comer` para completar con fuentes de blogs
3. Para cada plato: nombre en idioma local, traducción al español, descripción breve, zona donde es típico

**Proceso para restaurantes**:
1. Buscar en TripAdvisor: `https://www.tripadvisor.es/Restaurants-[código]-[Ciudad].html` → ordenar por "Valoración de viajeros"
2. Filtrar por precio: buscar restaurantes en rango medio ($$) para dar variedad al grupo
3. Verificar en Google Maps que el restaurante sigue abierto y tiene buenas valoraciones recientes (últimos 6 meses)
4. Buscar si hay restaurantes con reconocimiento especial: `https://guide.michelin.com/es/es/restaurants?location=[ciudad]`
5. Consultar artículos de 2023–2024: buscar `mejores restaurantes [ciudad] [año]` para listas curadas recientes

> Fuentes y URLs: ver **[FUENTES.md](./FUENTES.md)** → Gastronomía y restaurantes

**Datos a recopilar por restaurante**:
- Nombre completo
- Ubicación: barrio o referencia geográfica del día
- Tipo de cocina y especialidad destacada
- Rango de precio por persona en euros (ej. ~15–25€)
- Reconocimiento especial si lo tiene (estrella Michelin ⭐, Bib Gourmand, etc.)
- URL de reserva si requiere (muchos restaurantes populares hay que reservar con semanas de antelación)

---

### 🅿️ Parkings

**Cuándo**: Para cada lugar donde el grupo llegará en vehículo. Especialmente importante en ciudades históricas y parques naturales donde el aparcamiento es complicado.

**Proceso paso a paso**:
1. Buscar en Google Maps `parking [ciudad o lugar]` — los parkings municipales suelen tener ficha propia
2. Ver si la ciudad tiene app de parkings propia o usa EasyPark: buscar `[ciudad] EasyPark` o `[ciudad] parking app`
3. Buscar en ParkMe `https://www.parkme.com` para ver precios y disponibilidad
4. Complementar con foros: buscar en Google `aparcar [lugar] foro viaje` o `parking [lugar] reddit` para consejos de viajeros
5. Para vehículos grandes (furgoneta): verificar altura máxima de los parkings cubiertos (suelen ser 1,9–2,1m)
6. Identificar siempre una opción P+R si existe (parking periférico con transporte al centro)

> Fuentes y URLs: ver **[FUENTES.md](./FUENTES.md)** → Parkings

**Datos a recopilar**:
- Nombre del parking o descripción (ej. "Parking municipal junto al puerto")
- Precio por hora / por día (indicar moneda)
- Si es gratuito, especificarlo
- URL de Google Maps con la ubicación exacta del parking
- Altura máxima si es cubierto (crítico para furgonetas)
- Si es recomendado para vehículos grandes o tiene plazas XXL

---

### 🏨 Alojamientos

**Cuándo**: Para cada base de alojamiento definida en `datos-base.md`. El objetivo no es hacer la reserva, sino recomendar la zona óptima y dar una referencia de precios.

**Proceso paso a paso**:
1. Identificar las restricciones del grupo (número de personas, necesidad de parking, cocina, presupuesto)
2. Buscar en Airbnb con filtros: `https://www.airbnb.es/s/[Ciudad]/homes?adults=[N]` — filtrar por "Casa/apartamento entero", parking
3. Buscar en Booking con filtros de grupo: `https://www.booking.com/searchresults.es.html?ss=[Ciudad]&group_adults=[N]`
4. Investigar qué zonas evitar y qué zonas priorizar: buscar `dónde alojarse [ciudad] consejo` o `best area to stay [city]`
5. Para grupos grandes: buscar casas rurales o villas cerca del destino (suelen ser más económicas que varios hoteles)
6. Anotar alternativas más económicas en pueblos cercanos al punto de interés principal

> Fuentes y URLs: ver **[FUENTES.md](./FUENTES.md)** → Alojamientos

**Datos a incluir en el markdown**:
- Zona recomendada y por qué (proximidad, precio, parking)
- Zonas a evitar y por qué (demasiado caras, sin parking, lejos del itinerario)
- Tipo de alojamiento recomendado para el grupo (apartamento entero, casa rural, hotel)
- Precio estimado por noche para el grupo completo (no por persona)
- Consejos de reserva: antelación recomendada, si conviene cancelación gratuita, política de parking

---

### 📏 Distancias y tiempos de conducción

**Cuándo**: Al finalizar el enriquecimiento de todos los días, calcular todos los tramos de conducción del itinerario.

**Proceso paso a paso**:
1. En Google Maps, introducir origen y destino exactos (no solo ciudades, sino puntos de salida/llegada reales)
2. Seleccionar la ruta en coche, anotar km y tiempo estimado por Google
3. Añadir un 15–20% al tiempo si el grupo es grande (paradas, furgoneta más lenta en montaña)
4. Para rutas de montaña: verificar si la carretera está abierta en el mes del viaje (algunas cierran en invierno)
5. Verificar en Rome2Rio si hay alternativas de transporte relevantes (tren, ferry, autobús)
6. Identificar tramos donde existe tren panorámico o autotren que valga la pena mencionar

> Fuentes y URLs: ver **[FUENTES.md](./FUENTES.md)** → Distancias y conducción

**Datos a recopilar**:
- Tramo (origen → destino)
- Distancia en km
- Tiempo estimado (con el ajuste de grupo)
- Notas especiales: carreteras de montaña, peajes, restricciones de vehículos grandes

---

### 📱 Apps y logística específica del destino

**Cuándo**: Al final del enriquecimiento, una vez conocida la logística completa del viaje.

**Proceso para identificar las apps relevantes**:
1. Buscar en Google `apps útiles viaje [país]` o `best apps traveling [country]` para ver recomendaciones específicas del destino
2. Verificar siempre: ¿hay app de parkings local? ¿app de transporte público? ¿app oficial del país para mapas offline?
3. Para cualquier destino con conducción: confirmar si EasyPark tiene cobertura (`https://www.easypark.es/cobertura`)
4. Para grupos con gastos compartidos: Splitwise o Splid son universales, pero verificar si hay app local más popular
5. Descargar mapas offline de Google Maps o Maps.me para zonas con cobertura limitada (montaña, zonas rurales)

| Categoría | App recomendada | Cuándo usar |
|---|---|---|
| Parkings | EasyPark (si tiene cobertura) / app local de la ciudad | Al aparcar en zona de pago |
| Gastos compartidos | Splid o Splitwise | Durante todo el viaje |
| Mapas offline | Google Maps (descargar área) / Maps.me | Zonas sin cobertura móvil |
| Traducción | Google Translate (descargar idioma local) | En restaurantes, tiendas, señales |
| Transporte local | App oficial de transporte del país (buscar `[país] public transport app`) | Si se usa transporte público |
| Reservas de actividades | GetYourGuide / Civitatis | Para entradas y excursiones con reserva |
| Emergencias | Número local + app de la embajada española si existe | En caso de urgencia |

**Logística específica a investigar**:
- ¿Existe algún servicio especial en el itinerario? (autotren, ferry, teleférico, funicular)
- ¿Hay pasos de frontera en el itinerario? ¿Requieren documentación especial?
- ¿El destino tiene app oficial de turismo con mapas y guías offline?
- ¿Qué seguro de alquiler de coche se llama diferente en este país (equivalente al SCDW español)?

---

## 1.3 Schema del fichero enriquecido

El fichero `datos-enriquecidos.md` debe seguir esta estructura. Reemplazar `[DESTINO]` con el nombre real.

```markdown
# 🏳️ Viaje a [DESTINO] — Datos del Itinerario
### Del [fecha inicio] al [fecha fin] · N personas · N días · ~XXX km

---

## 👥 Los Viajeros
[tabla con nombre e inicial]

---

## ✈️ Vuelos
[tabla con IDA y VUELTA: vuelo, origen, destino, salida, llegada, duración]

---

## 🚐 Logística General

### Vehículo recomendado
[descripción del vehículo, pros para el grupo, dónde recoger]

### Seguro del vehículo
[explicación del tipo de seguro recomendado, cómo se llama en el país]

### Peaje / tasa de circulación (si aplica)
[nombre, precio, dónde comprar, URL]

### Estructura de alojamientos
[tabla: noches, zona, duración, precio estimado]
[consejos específicos por zona]

### Consejos Prácticos
[lista de ítems: moneda, gasolina, propinas, idioma, emergencias, apps, reservas]

---

## 🌡️ Clima en [mes] por Zona
[tabla: zona, temp media, máx/mín, condiciones, lluvia]

---

## 🗓️ Día N — [día semana] [fecha]
### [Lugar A] → [Lugar B] *(aprox. X km / Xh)*

### Recorrido del día
[bloque de código ASCII con el itinerario del día]

[Horario sugerido en lista]

---

### [Nombre del lugar 1]

**Historia:** [2–4 párrafos]

**Qué ver:**
[lista con descripción de cada elemento]

**Datos prácticos:**
[entradas con precios, horarios, duración visita]

**Datos prácticos — Parking:**
[lista de parkings con precios y URLs de Google Maps]

**Google Maps:**
[lista de URLs por punto de interés]

---

### Gastronomía — [Zona del día]

[tabla: plato, descripción]

**Restaurantes recomendados:**
[tabla: restaurante, descripción, precio/persona]

---

[... repetir para cada día ...]

---

## 📏 Resumen de Kilómetros y Tiempos de Conducción
[tabla: tramo, km, tiempo]

---

## 🍽️ Gastronomía [Destino] — Platos Imprescindibles

### Platos principales
[tabla: plato, descripción, zona]

### Bebidas
[tabla: bebida, descripción]

---

## 👥 Consejos para un Grupo de N Personas
[secciones: transporte, alojamiento, entradas y reservas, dinero y practicidades, logística de grupo]

---

## 🗺️ Mapa General del Recorrido
[bloque de código ASCII con el mapa del recorrido completo]

---

## ⚠️ Notas Importantes y Advertencias
[lista numerada de advertencias específicas del destino]

---

## 📍 Coordenadas GPS — Todos los puntos del mapa
[tabla: lugar, latitud, longitud, día]

---

## 🖼️ IDs de Pexels verificados

| Uso | Lugar | ID Pexels | URL verificada |
|-----|-------|-----------|----------------|
| Hero (1920×1080) | [Destino general] | XXXXXXX | ✅ / ❌ |
| Viajeros fondo (1200×600) | [Paisaje secundario] | XXXXXXX | ✅ / ❌ |
| Header Día 1 (1200×400) | [Lugar día 1] | XXXXXXX | ✅ / ❌ |
| Header Día 2 (1200×400) | [Lugar día 2] | XXXXXXX | ✅ / ❌ |
| [... un header por cada día ...] | | | |
| Acordeón [lugar] (800×450) | [Lugar] | XXXXXXX | ✅ / ❌ |

> **Por qué esta sección existe aquí**: buscar IDs de Pexels en FASE 1 (junto con la investigación de cada lugar) evita que el agente de FASE 2 tenga que hacer búsquedas web adicionales, que son el segundo mayor cuello de botella de la generación HTML.

---

## 💰 Presupuesto Estimado

| Categoría | Por persona | Total grupo |
|---|---|---|
| Vuelos (ida + vuelta) | X€ | X€ |
| Alojamiento (N noches) | ~X€ | ~X€ |
| Alquiler de vehículo | ~X€ | ~X€ |
| Gasolina (~XXX km) | ~X€ | ~X€ |
| Entradas y actividades | ~X€ | ~X€ |
| Restaurantes (~X comidas) | ~X€ | ~X€ |
| Parkings | ~X€ | ~X€ |
| Varios e imprevistos (15%) | ~X€ | ~X€ |
| **TOTAL ESTIMADO** | **~X€** | **~X€** |

> Estimación [optimista / media / conservadora]. Los precios de entradas y restaurantes son orientativos basados en datos de [año].

---

## ✅ Checklist Pre-Viaje

### Reservas (hacer con antelación)
- [ ] [Restaurante X] — reservar con N semanas de antelación: [URL o teléfono]
- [ ] [Actividad Y] — aforo limitado, reserva online: [URL]
- [ ] Alquiler de vehículo confirmado en [aeropuerto]: [empresa, localizador]
- [ ] Alojamientos confirmados: [nombres y fechas]

### Compras previas al viaje
- [ ] [Vinjeta / peaje online si aplica]: [URL oficial]
- [ ] Seguro de viaje (médico + cancelación)
- [ ] Adaptador de corriente (si aplica)

### Descargas en el móvil
- [ ] Google Maps — descargar mapa offline de [zona del viaje]
- [ ] Google Translate — descargar idioma [X] para uso sin conexión
- [ ] [App específica del destino]
- [ ] [App de parking del destino]
- [ ] App de gastos compartidos (Splid o Splitwise) — crear grupo con todos

### Documentación
- [ ] DNI o pasaporte vigente (mínimo 6 meses de validez)
- [ ] Tarjeta Sanitaria Europea (EHIC) — renovar si caducó
- [ ] Carné de conducir (todos los conductores del grupo)
- [ ] Póliza del seguro del vehículo (enviar al móvil)
- [ ] Seguro de viaje (número de póliza y teléfono de asistencia)

### Logística del grupo
- [ ] Decidir turnos de conducción y días de cada conductor
- [ ] Compartir ubicación en tiempo real durante el viaje (Google Maps o similar)
- [ ] Número de contacto de todos los miembros del grupo
- [ ] Número de asistencia en carretera de la empresa de alquiler
```

---

## 1.4 Transformaciones sección a sección

Esta tabla indica, para cada sección del fichero enriquecido, qué datos vienen de `datos-base.md` y cuáles Claude debe investigar:

| Sección | Origen en datos-base | 🔍 Claude investiga | ✍️ Claude genera |
|---|---|---|---|
| Viajeros | Lista de nombres | — | Formatear en tabla con iniciales |
| Vuelos | Todos los datos | — | Formatear en tabla IDA/VUELTA |
| Vehículo | Tipo y lugares de recogida/devolución | — | Pros del vehículo para el grupo, consejos de conducción |
| Seguro | — | Nombre del seguro equivalente en el país (SCDW u otro), qué cubre | Redactar explicación en español |
| Peaje/vinjeta | Nombre si el usuario lo sabe | Precio actualizado, URL de compra oficial | Instrucciones de uso paso a paso |
| Datos básicos del país | — | Moneda, idioma, emergencias, propinas, velocidades (Wikipedia, Exteriores.gob.es) | Redactar sección de Consejos Prácticos |
| Apps útiles | — | Verificar cobertura EasyPark, app de transporte local | Seleccionar y justificar las apps relevantes para el viaje |
| Alojamientos | Zonas y noches | Precios estimados (Booking/Airbnb), zonas concretas a evitar | Consejos específicos por zona, alternativas económicas |
| Clima | — | Temperatura máx/mín, precipitación (Climate-data.org, WeatherSpark) | Descripción de condiciones y consejo de ropa |
| Historia de cada lugar | — | Fechas, hechos clave (Wikipedia) | Texto narrativo 2–4 párrafos, tono accesible |
| Qué ver en cada lugar | Lista de lugares del itinerario | Atracciones adicionales (TripAdvisor), descripciones (Lonely Planet) | Descripción de cada punto en 2–4 líneas |
| Datos prácticos (entradas) | — | Precios, horarios, si necesita reserva (web oficial, GetYourGuide) | — |
| Horario sugerido del día | — | — | Secuencia horaria lógica basada en distancias y aperturas |
| Mapa ASCII del día | — | — | Diagrama con puntos, km y tiempos de conducción |
| Parkings | — | Nombre, precio, altura máxima (Google Maps, ParkMe) | — |
| Gastronomía típica | — | Platos regionales (Wikipedia, blogs) | Descripción de cada plato en español |
| Restaurantes | — | Nombre, valoración, precio (TripAdvisor, Michelin, Google Maps) | Selección curada y justificación de la recomendación |
| Km y tiempos | Lista de lugares en orden | Calcular distancias (Google Maps) | — |
| Coordenadas GPS | — | Lat/lng de cada punto (Google Maps, Wikipedia) | — |
| Google Maps URLs | — | URLs de cada punto | — |
| Imágenes (IDs Pexels) | — | Buscar y verificar IDs (pexels.com) | — |
| Consejos para grupos | Tamaño del grupo, tipo de vehículo | — | Consejos específicos de transporte, dinero, logística |
| Notas importantes | — | Restricciones, cierres, reservas obligatorias | Priorizar por impacto, redactar de forma accionable |
| Presupuesto estimado | Precio de vuelos (si lo sabe) | Precios de entradas, parkings, restaurantes, alojamiento | Calcular totales por categoría y por persona |
| Checklist pre-viaje | — | Reservas que requieren antelación, apps del destino | Compilar lista de acciones agrupada por categoría |

---

---

## 1.5 Validación — El fichero datos.md está completo cuando...

Antes de pasar a FASE 2, verificar que el fichero enriquecido cumple todos estos requisitos:

**Estructura general**
- [ ] Sección de viajeros con tabla nombre/inicial
- [ ] Sección de vuelos con IDA y VUELTA completas
- [ ] Sección de logística con vehículo, seguro, peaje, alojamientos y consejos prácticos
- [ ] Tabla de clima con al menos una fila por zona geográfica del itinerario
- [ ] Sección de presupuesto estimado con totales por persona y grupo
- [ ] Checklist pre-viaje con al menos reservas, descargas y documentación

**Por cada día del itinerario**
- [ ] Cabecera con fecha, tramo y km/tiempo de conducción
- [ ] Horario sugerido con horas reales
- [ ] Mapa ASCII del recorrido del día
- [ ] Al menos un lugar con historia (2+ párrafos), qué ver (3+ puntos), datos prácticos con precios y parkings
- [ ] Al menos un restaurante recomendado para el día
- [ ] Gastronomía de la zona (al menos 3 platos típicos)

**Datos para el mapa Leaflet**
- [ ] Coordenadas GPS (lat/lng) de todos los puntos de interés
- [ ] Al menos 1 punto por día (para que el mapa tenga marcadores en todos los días)
- [ ] URLs de Google Maps de cada punto

**Imágenes — GATE DE BLOQUEO**

> ⛔ Si no se cumplen TODOS los puntos de esta sección, **FASE 2 no puede iniciarse**.
> Resolver los IDs faltantes antes de continuar. Un HTML generado sin imágenes produce
> secciones grises que son difíciles de corregir a posteriori y degradan la experiencia.

- [ ] Tabla `## 🖼️ IDs de Pexels verificados` presente en el fichero con todas las filas
- [ ] ID de Pexels para la imagen hero general marcado ✅ (no GRADIENTE, no vacío)
- [ ] **Un ID por cada día del itinerario** — la tabla debe tener exactamente `N_días + 1` filas (hero + 1 por día) todas con ✅ o con "GRADIENTE" explícito
- [ ] IDs verificados: cada ✅ significa que la URL `https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop` fue comprobada y cargó una imagen real
- [ ] **Ninguna fila vacía o con `[PEXELS_ID_PENDIENTE]`** — si falta algún ID, realizar la búsqueda ahora antes de continuar
- [ ] Si algún día usa "GRADIENTE": está documentado como decisión explícita, no como olvido

**Resumen final**
- [ ] Tabla de km totales con todos los tramos
- [ ] Tabla de coordenadas GPS de todos los puntos
- [ ] Sección de gastronomía general del destino
- [ ] Consejos para grupos
- [ ] Notas importantes y advertencias

> Si algún punto no está cubierto, completarlo antes de iniciar FASE 2. Un HTML generado con datos incompletos produce secciones vacías difíciles de corregir a posteriori.

---

## 1.6 Paralelización y caché — Generación de alta velocidad

### Paralelización en FASE 1

La investigación de zonas geográficas es independiente entre sí. Lanzar **un agente por zona** simultáneamente:

```
[Coordinador]
    ├── Agente Zona A → investiga días 1-3 → busca IDs Pexels para días 1-3 → escribe dia-01.md, dia-02.md, dia-03.md
    ├── Agente Zona B → investiga días 4-6 → busca IDs Pexels para días 4-6 → escribe dia-04.md, dia-05.md, dia-06.md
    ├── Agente Zona C → investiga días 7-8 → busca IDs Pexels para días 7-8 → escribe dia-07.md, dia-08.md
    └── Agente Logística → escribe logistica.md (clima, vehículo, coordenadas, Pexels hero + tabla global IDs)
         ↓ (esperar a que terminen todas las zonas)
    Agente Resumen → lee todos los dia-XX.md → consolida IDs Pexels en logistica.md → escribe resumen.md
```

**Responsabilidad de imágenes por agente**:
- Cada agente de zona busca los IDs Pexels de sus días como parte de Paso 4a (antes de investigar el resto del día)
- El Agente Logística busca el ID hero y crea la tabla global `## 🖼️ IDs de Pexels verificados` en `logistica.md`
- El Agente Resumen verifica que la tabla tiene exactamente `N_días + 1` filas con ✅ o GRADIENTE antes de dar FASE 1 por terminada

**Tiempo FASE 1 con paralelización**: `max(tiempo_zona_más_lenta) + tiempo_resumen` ≈ **4–5 min** (vs ~10 min secuencial)

### Paralelización en FASE 2 (máximo impacto)

Una vez que todos los ficheros de datos existen, FASE 2 es **100% paralelizable**. Todos los pasos pueden lanzarse simultáneamente:

```
[Todos en paralelo]
    ├── Agente Base    → lee logistica.md + templates → escribe _draft/base.html
    ├── Agente Mapa    → lee gps-coords.md + datos-enriquecidos.md → escribe _draft/mapa.html
    ├── Agente Día 1   → lee dia-01.md               → escribe _draft/dia-01.html
    ├── Agente Día 2   → lee dia-02.md               → escribe _draft/dia-02.html
    ├── ...
    ├── Agente Día N   → lee dia-NN.md               → escribe _draft/dia-NN.html
    └── Agente Cierre  → lee resumen.md              → escribe _draft/end.html
         ↓ (esperar a que terminen todos)
    Bash: cat _draft/base.html _draft/mapa.html _draft/dias-*.html _draft/end.html > draft.html
```

**Tiempo FASE 2 con paralelización**: `max(tiempo_agente_más_lento)` ≈ **2–3 min** (vs ~18 min secuencial)

### Tabla de tiempos comparativa

| Fase | Sin mejoras | + Paralelización | + Caché completa |
|------|------------|-----------------|-----------------|
| FASE 0 | ~2 min | ~2 min | **~30 s** |
| FASE 1 | ~10 min | **~5 min** | **~1.5 min** |
| FASE 2 | ~18 min | **~3 min** | **~2.5 min** |
| PASO D | ~2 min | ~1 min | **~30 s** |
| **Total** | **~32 min** | **~11 min** | **~5 min** |

**Target: 5 minutos** — alcanzable con caché completa caliente. WebFetch refresca cachés caducadas sin infraestructura adicional.

---

### Sistema de caché con TTL

Cada dato tiene una vida útil diferente. La caché evita búsquedas web redundantes; el TTL garantiza que los datos no queden obsoletos sin notarlo.

#### Estructura de ficheros

```
_cache/
  gps-coords.md              → GPS de lugares turísticos          TTL: permanente (verificar si hay error)
  pexels-ids.md              → IDs Pexels verificados             TTL: permanente (re-verificar si roto)
  gastronomy/
    suiza.md                 → Gastronomía suiza completa         TTL: 365 días
    eslovenia.md             → Gastronomía eslovena               TTL: 365 días
    [país].md                → Un fichero por país
  suiza/
    precios.md               → Entradas, horarios, parking        TTL: 30 días ⚠️
    restaurantes.md          → Restaurantes recomendados          TTL: 30 días ⚠️
    info-pais.md             → Moneda, idioma, vignette, apps     TTL: 180 días
    clima.md                 → Clima por zona y mes               TTL: 365 días
  eslovenia/
    precios.md               → Entradas, horarios, parking        TTL: 30 días ⚠️
    restaurantes.md          → Restaurantes recomendados          TTL: 30 días ⚠️
    info-pais.md             → Moneda, idioma, vinjeta, apps      TTL: 180 días
    clima.md                 → Clima por zona y mes               TTL: 365 días
  [país]/                    → Añadir directorio por cada destino nuevo
```

#### Formato de cabecera TTL (todas las cachés con TTL < 365 días)

Cada fichero de caché lleva esta cabecera:

```markdown
<!-- cache-meta
last_updated: YYYY-MM-DD
ttl_days: 30
expires: YYYY-MM-DD
sources:
  - https://url-oficial-1.com
  - https://url-oficial-2.com
refresh_tool: webfetch
-->
```

#### Lógica de consulta de caché en FASE 1

```
Para cada dato necesario (precio, horario, restaurante, etc.):

1. Leer el fichero de caché correspondiente
2. Comparar "expires" con la fecha actual
   ├── expires > hoy → dato válido → USAR DIRECTAMENTE, no buscar
   └── expires ≤ hoy → caché CADUCADA → ir al paso 3

3. Caché caducada: refrescar con WebFetch
   └── Leer campo "sources" del fichero
   └── WebFetch(url) para cada source
   └── Actualizar el fichero de caché con los nuevos datos
   └── Actualizar last_updated y expires
   └── Continuar con el dato ya fresco

4. Si WebFetch falla: usar WebSearch para encontrar la URL actualizada, luego WebFetch
5. Si todo falla: usar el dato caducado con nota [DATO CADUCADO - verificar]
```

#### WebFetch — herramienta de scraping

WebFetch está integrado en Claude Code — no requiere Docker ni configuración adicional.

**Orden de prioridad para obtener datos web**:
```
1. Caché local (_cache/) → sin red, instantáneo
2. WebFetch(url)         → para la URL concreta del campo "sources"
3. WebSearch             → si la URL falla o es desconocida, buscar primero
4. Dato caducado         → último recurso, con nota [DATO CADUCADO - verificar]
```

**Cuándo usar WebFetch en FASE 1**:
- Refresco de caché caducada (`precios.md`, `restaurantes.md`)
- Búsqueda de IDs Pexels cuando no están en `catalog.yaml`
- Webs estáticas: Wikipedia, climate-data.org, webs de museos/parques
- Páginas JS-heavy (GetYourGuide, TripAdvisor): intentar WebFetch primero; si el contenido está vacío, usar WebSearch como alternativa

**Limitación**: WebFetch no ejecuta JavaScript pesado. Si una página requiere interacción o login, WebSearch puede encontrar la información en fuentes alternativas (blogs, agregadores).

#### Tabla de coberturas de caché (destino Suiza)

| Categoría | Caché | Estado | Cobertura |
|-----------|-------|--------|-----------|
| Imágenes Pexels | `_images/catalog.yaml` | ✅ caliente | 17 imágenes CH |
| Imágenes local | `_images/suiza/local/` | ✅ descargadas | 16 ficheros |
| GPS coordenadas | `_cache/gps-coords.md` | ✅ caliente | ~20 puntos CH |
| Gastronomía | `_cache/gastronomy/suiza.md` | ✅ caliente | 12 platos + bebidas |
| Precios/horarios | `_cache/suiza/precios.md` | ✅ fresca (30d) | Todos los días 1-10 |
| Restaurantes | `_cache/suiza/restaurantes.md` | ✅ fresca (30d) | Por zona |
| Info país | `_cache/suiza/info-pais.md` | ✅ fresca (180d) | Completa |
| Clima | `_cache/suiza/clima.md` | ✅ fresca (365d) | Por zona y mes |

Con esta caché caliente, **FASE 1 no hace ninguna búsqueda web** para Suiza → se reduce a leer ficheros y formatear datos → **~1.5 min**.

#### Tabla de coberturas de caché (destino Eslovenia)

| Categoría | Caché | Estado | Cobertura |
|-----------|-------|--------|-----------|
| Imágenes Pexels | `_images/catalog.yaml` | ✅ caliente | 1 imagen SI (completar) |
| Imágenes local | `_images/eslovenia/local/` | ✅ descargadas | 1 fichero (completar) |
| GPS coordenadas | `_cache/gps-coords.md` | ✅ caliente | Ver sección SI |
| Gastronomía | `_cache/gastronomy/eslovenia.md` | ✅ caliente | Gastronomía eslovena |
| Precios/horarios | `_cache/eslovenia/precios.md` | ✅ fresca (30d) | Todos los días del itinerario |
| Restaurantes | `_cache/eslovenia/restaurantes.md` | ✅ fresca (30d) | Por zona |
| Info país | `_cache/eslovenia/info-pais.md` | ✅ fresca (180d) | Completa |
| Clima | `_cache/eslovenia/clima.md` | ✅ fresca (365d) | Por zona y mes |

Con esta caché caliente, **FASE 1 no hace ninguna búsqueda web** para Eslovenia → ~1.5 min.

#### Regla de actualización de caché

Al terminar cualquier FASE 1:
1. Si se encontró un dato que no estaba en caché → añadirlo al fichero correspondiente
2. Si se refrescó una caché caducada → actualizar `last_updated` y `expires`
3. Si se encontró un ID Pexels nuevo → añadirlo a `_images/catalog.yaml` con todos los campos
4. Si se descargó una imagen nueva → guardarla en `_images/{país}/local/`

---

## 1.7 Catálogo de imágenes (`_images/`)

El catálogo centraliza todas las imágenes usadas en las guías. Permite reutilizar imágenes entre viajes, buscar por lugar/tags/GPS, y migrar de Pexels a S3 propio sin tocar el HTML.

### Estructura de directorios

```
_images/
  catalog.yaml          → catálogo maestro (todos los viajes, exportable a DB)
  suiza/
    local/              → imágenes descargadas (vacío hasta que se descarguen)
  eslovenia/
    local/
  [país]/
    local/
```

### Schema de cada entrada (`catalog.yaml`)

```yaml
- id: "pexels-26973471"           # clave única: "{source}-{source_id}"
  type: pexels                    # pexels | own | s3
  source_id: "26973471"           # ID en Pexels (o nombre de fichero si own/s3)
  urls:
    original: "https://images.pexels.com/photos/26973471/..."
    cdn: "https://.../{w}/{h}..."  # {w} y {h} se sustituyen al usar
    local: null                   # "suiza/local/26973471.jpeg" al descargar
    s3: null                      # "s3://bucket/suiza/26973471.jpeg" al subir
  place:
    name: "Kapellbrücke"
    locality: "Lucerna"
    region: "Cantón de Lucerna"
    country: "Suiza"
    country_code: "CH"            # ISO 3166-1 alpha-2
  gps:
    lat: 47.050800
    lng: 8.306000
    accuracy: exact               # exact | approx | region
  description: "Puente de la Capilla..."
  orientation: landscape          # landscape | portrait | square
  primary_color: "#0EA5A0"        # color dominante (CSS fallback)
  tags: [lucerna, kapellbrücke, puente, casco-antiguo, suiza]
  usage_types: [day-header, accordion-thumb, accordion-img]
  verified: true
  verified_date: "2026-04-14"
  size_bytes: 58354               # a w=800&h=450, verificado con curl
```

### Reglas de uso en FASE 1

**Orden de consulta obligatorio** para cualquier imagen:

```
1. Leer _images/catalog.yaml
   └─ Buscar por place.locality, place.country_code o tags
   └─ Si hay entrada con verified: true → usar source_id directamente. FIN.

2. Si no está en catálogo → Buscar en Pexels (WebFetch o WebSearch)
   └─ Verificar con curl: tamaño >5 KB (HTTP 200 con <5 KB = placeholder vacío)
   └─ Si válido → añadir entrada completa a _images/catalog.yaml
   └─ Descargar imagen: curl -o _images/{país}/local/{ID}.jpeg "{CDN_URL_1920x1080}"
   └─ Actualizar urls.local en catalog.yaml
   └─ Añadir ID a la tabla 🖼️ del datos-enriquecidos.md correspondiente

3. Si Pexels falla tras 3 intentos → registrar "GRADIENTE" en la tabla (no inventar ID)
```

**Verificación obligatoria** antes de usar cualquier ID del catálogo:
```bash
# Comprobar que el ID sigue siendo válido (los IDs de Pexels pueden eliminarse)
curl -s -o /dev/null -w "%{size_download}" \
  "https://images.pexels.com/photos/ID/pexels-photo-ID.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop"
# Si resultado < 5000 → ID eliminado → buscar reemplazo y actualizar catalog.yaml
```

**Prioridad de URL** en el HTML generado (FASE 2):
```
1. urls.s3     → si existe (imagen propia en S3)
2. urls.local  → si existe (imagen descargada) — usar como src con ruta relativa al HTML
3. urls.cdn    → siempre disponible (Pexels CDN con {w} y {h} sustituidos)
```

Ejemplo de uso en FASE 2 al generar un `<img>`:
```html
<!-- Con local disponible (ruta relativa desde Suiza/draft.html al proyecto root) -->
<img src="../_images/suiza/local/26973471.jpeg"
     data-cdn="https://images.pexels.com/photos/26973471/pexels-photo-26973471.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop"
     alt="Kapellbrücke, Lucerna" loading="lazy" onerror="this.src=this.dataset.cdn">

<!-- Sin local (solo CDN) -->
<img src="https://images.pexels.com/photos/26973471/pexels-photo-26973471.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop"
     alt="Kapellbrücke, Lucerna" loading="lazy" onerror="this.style.opacity='0'">
```

> El atributo `onerror` es obligatorio en todos los `<img>` de Pexels. Si el CDN falla, la imagen se oculta y el gradiente CSS de fondo actúa como fallback visible.

### Exportar a JSON / base de datos

```bash
# Exportar todas las imágenes a JSON
python3 -c "
import yaml, json
data = yaml.safe_load(open('_images/catalog.yaml'))
print(json.dumps(data['images'], indent=2, ensure_ascii=False))
" > _images/catalog.json

# Buscar por país
python3 -c "
import yaml
data = yaml.safe_load(open('_images/catalog.yaml'))
suiza = [img for img in data['images'] if img.get('place',{}).get('country_code') == 'CH']
print(f'{len(suiza)} imágenes de Suiza')
for img in suiza:
    print(f\"  {img['source_id']} — {img['place'].get('name')} — {img['tags'][:3]}\")
"

# Buscar por proximidad GPS (radio ~10 km a Lucerna)
python3 -c "
import yaml, math
def dist(lat1,lng1,lat2,lng2):
    return math.sqrt((lat1-lat2)**2+(lng1-lng2)**2)*111
data = yaml.safe_load(open('_images/catalog.yaml'))
target = (47.0502, 8.3093)  # Lucerna
nearby = [img for img in data['images']
          if img['gps']['lat'] and dist(img['gps']['lat'],img['gps']['lng'],*target)<15]
for img in nearby:
    print(f\"{img['source_id']} — {img['place']['name']} — {img['description'][:50]}\")
"
```

### Migrar a imágenes propias (S3)

Cuando se tengan imágenes propias:
1. Descargar la imagen: `curl -o _images/suiza/local/ID.jpeg "URL_CDN_800x450"`
2. Subir a S3: `aws s3 cp _images/suiza/local/ID.jpeg s3://mi-bucket/travel/suiza/`
3. Actualizar en `catalog.yaml`: `urls.local` y `urls.s3`
4. En el HTML, el agente de FASE 2 debe preferir `urls.s3` si existe, luego `urls.cdn`

---

## 1.8 Estructura de ficheros por día

Para cualquier viaje de más de 4 días, `datos-enriquecidos.md` crece rápidamente por encima del límite de lectura (10.000 tokens). La solución es producir **un fichero por día** desde FASE 1. Esto tiene dos ventajas clave:

1. **Cada fichero cabe en una sola lectura** — sin lecturas fragmentadas con offset/limit.
2. **La generación HTML puede hacerse día a día** — si hay que corregir o regenerar un día concreto, solo se toca ese fichero.

### Estructura de ficheros recomendada

```
[destino]/
  datos-enriquecidos/
    logistica.md          → Viajeros, vuelos, vehículo, alojamientos, clima, consejos,
                            IDs Pexels verificados, coordenadas GPS (tabla completa)
    dia-01.md             → Datos completos del día 1 (historia, qué ver, parkings,
    dia-02.md               gastronomía, restaurantes, horario sugerido, mapa ASCII)
    dia-03.md             → Ídem día 3
    ...                   → Un fichero por cada día del itinerario
    dia-NN.md             → Ídem día N (último día)
    resumen.md            → Km totales, gastronomía general del destino,
                            presupuesto estimado, checklist pre-viaje
```

### Tamaño objetivo por fichero

| Fichero | Líneas objetivo | Tokens aprox. | ¿Cabe en 1 read? |
|---------|----------------|---------------|-----------------|
| `logistica.md` | 80–150 líneas | ~3.000–5.000 | ✅ siempre |
| `dia-XX.md` | 60–120 líneas | ~2.000–4.000 | ✅ siempre |
| `resumen.md` | 100–200 líneas | ~3.000–6.000 | ✅ siempre |

### Cómo genera Claude los ficheros día a día en FASE 1

En el Paso 4 del orden de ejecución (sección 1.1), al terminar de investigar cada día, Claude **escribe inmediatamente** el fichero `dia-XX.md` antes de pasar al siguiente. No acumula todos los días en memoria para escribirlos al final.

```
Paso 4a → investiga Día 1 completo → escribe dia-01.md → pasa a Día 2
Paso 4b → investiga Día 2 completo → escribe dia-02.md → pasa a Día 3
...
```

Esto reduce el riesgo de pérdida de datos si la sesión se interrumpe y permite revisar días individuales antes de que termine toda la FASE 1.

> **Retrocompatibilidad**: Los viajes ya generados con un único `datos-enriquecidos.md` (como Eslovenia y Suiza) siguen siendo válidos. Aplicar la estructura por día a partir del próximo viaje.

---

---

# FASE 2 — `datos-enriquecidos.md` → `draft.html`

La Fase 2 genera un borrador visual completo a partir del fichero de datos enriquecido. El resultado es un único `draft.html` autocontenido con toda la estructura y el diseño definitivos, pero con **datos inventados donde aún no se dispone de información real** (vuelos, precios de hoteles, coste de actividades, etc.).

## Reglas de datos inventados en draft.html

Los datos inventados deben ser **verosímiles** (rangos de precio reales del destino, fechas coherentes con el itinerario) pero están **claramente identificados** mediante dos mecanismos:

### 1. Marca visual en el HTML

Todo dato inventado se envuelve en un elemento con la clase `draft-placeholder`:

```html
<span class="draft-placeholder" title="Dato estimado — pendiente de confirmar en FASE 3">
  ~320 € / persona
</span>
```

El estilo de esta clase debe ser llamativo pero no intrusivo:

```css
.draft-placeholder {
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 200, 0, 0.15),
    rgba(255, 200, 0, 0.15) 4px,
    transparent 4px,
    transparent 8px
  );
  border-bottom: 2px dashed #f59e0b;
  color: inherit;
  cursor: help;
  padding: 0 2px;
}
```

### 2. Aviso global en la página

El `draft.html` debe incluir un banner fijo en la parte superior de la página:

```html
<div class="draft-banner">
  ⚠️ BORRADOR — Los datos marcados en amarillo son estimaciones. Confirmar en FASE 3.
</div>
```

```css
.draft-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: #f59e0b;
  color: #1c1917;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 16px;
  letter-spacing: 0.05em;
}
```

### Qué datos se inventan en FASE 2

| Categoría | Dato inventado | Ejemplo |
|---|---|---|
| Vuelos | Compañía, número de vuelo, horario, precio | `Iberia IB1234 · 10:30 → 13:45 · ~180 €/persona` |
| Hoteles | Nombre, precio por noche | `Hotel Alpen View · ~95 €/noche` |
| Actividades | Precio de entrada | `~15 €/persona` |
| Alquiler de vehículo | Precio total | `~420 € total (7 días)` |
| Presupuesto total | Desglose y total | `~1.800 €/persona` |

> Los textos narrativos, coordenadas GPS, imágenes de Pexels y datos geográficos investigados en FASE 1 son reales y no se marcan como inventados.

---

## 2.0 Generación incremental día a día

FASE 2 no genera el HTML completo de una vez. Lo construye en pasos, cada uno centrado en una unidad mínima de trabajo. Esto permite:
- Regenerar un solo día sin tocar el resto
- Empezar a generar HTML aunque no estén listos todos los días de FASE 1
- Mantener el contexto del agente pequeño en cada paso

### Pasos de generación

**Lanzar los pasos A, B.1…B.N y C todos en paralelo** (un agente por paso). Esperar a que terminen todos antes del ensamblado.

```
┌─ PASO A ──────────────────────────────────────────────────────────────┐
│ Leer: logistica.md + _templates/base-styles.css + base-scripts.js    │
│ Genera: _draft/base.html                                              │
│ Contenido: head, CSS, draft-banner, hero, viajeros, vuelos, nav,     │
│            info general (4 acordeones)                                │
│ ⚠️  NO incluir sección #mapa-ruta ni script Leaflet en base.html.     │
│     El mapa vive completamente en mapa.html (sección + script).      │
└───────────────────────────────────────────────────────────────────────┘
┌─ PASO MAPA ───────────────────────────────────────────────────────────┐
│ Leer: _cache/gps-coords.md + datos-enriquecidos.md                   │
│ Referencia: _templates/mapa-template.html                             │
│ Genera: _draft/mapa.html                                              │
│ Contenido: <section id="mapa-ruta"> + <script> con L.map() completo  │
│ ⚠️  Este es el ÚNICO lugar donde L.map() puede aparecer.              │
│     Validar: grep -c 'L\.map(' _draft/mapa.html → debe ser 1         │
└───────────────────────────────────────────────────────────────────────┘
┌─ PASO B.1 ──────────┐  ┌─ PASO B.2 ──────────┐  ┌─ PASO B.N ───────┐
│ Leer: dia-01.md     │  │ Leer: dia-02.md      │  │ Leer: dia-NN.md  │
│ Genera: dia-01.html │  │ Genera: dia-02.html  │  │ Genera: dia-NN   │
│ ⚠️  TODOS los       │  │ thumbnail IMG con    │  │ thumbnail IMG con │
│ accordion-thumb-    │  │ URL Pexels real,     │  │ URL Pexels real  │
│ wrap deben tener    │  │ NO gradiente solo    │  │                  │
│ <img> con Pexels    │  │                      │  │                  │
└─────────────────────┘  └──────────────────────┘  └──────────────────┘
┌─ PASO C ──────────────────────────────────────────────────────────────┐
│ Leer: resumen.md                                                      │
│ Genera: _draft/end.html                                               │
│ Contenido: </main>, sección km, gastronomía general, footer + mapa   │
│            ASCII, script BLOQUE 2 (acordeones, nav, lazy load)       │
│ ⚠️  end.html NO debe contener L.map() — el mapa va en mapa.html.     │
│     Verificar: grep -c 'L\.map(' _draft/end.html → debe ser 0        │
└───────────────────────────────────────────────────────────────────────┘
         ↓ (todos terminados)
┌─ PASO D — Ensamblado + Validación ────────────────────────────────────┐
│ 1. cat _draft/base.html _draft/mapa.html _draft/dias-*.html \         │
│       _draft/end.html > draft.html                                    │
│ 2. VALIDACIÓN OBLIGATORIA (ver checklist abajo) — NO saltar           │
│ 3. Si la validación falla: corregir el fragmento afectado y repetir  │
│    el ensamblado. No entregar draft.html con fallos conocidos.        │
└───────────────────────────────────────────────────────────────────────┘
```

**Tiempo total**: ~2–3 min (el del agente más lento), independientemente del número de días.

### Checklist de validación post-ensamblado (PASO D obligatorio)

Ejecutar estos checks sobre `draft.html` antes de declarar el paso completado:

```bash
# 0. mapa.html existe y contiene exactamente 1 L.map()
grep -c 'L\.map(' _draft/mapa.html
# Esperado: 1 — si es 0, falta init; si es 2, hay duplicado en mapa.html

# 0b. base.html y end.html NO contienen L.map()
grep -c 'L\.map(' _draft/base.html
# Esperado: 0 — si es ≥1, eliminar el bloque del mapa de base.html
grep -c 'L\.map(' _draft/end.html
# Esperado: 0 — si es ≥1, eliminar el bloque del mapa de end.html

# 1. Un solo script de inicialización Leaflet en el HTML ensamblado (debe ser 1, no 2)
grep -c "L\.map(" draft.html
# Esperado: 1 — el único L.map() viene de mapa.html

# 2. Ningún accordion-thumb-wrap vacío (sin <img> dentro)
python3 -c "
import re
content = open('draft.html').read()
thumbs = re.findall(r'accordion-thumb-wrap[^>]+>(.*?)</div>', content, re.DOTALL)
empty = [i+1 for i,t in enumerate(thumbs) if '<img' not in t]
print(f'Vacíos: {empty} de {len(thumbs)} total')
print('OK' if not empty else 'FALLO — añadir imágenes')
"

# 3. Ningún accordion-img-wrap vacío
python3 -c "
import re
content = open('draft.html').read()
wraps = re.findall(r'accordion-img-wrap[^>]+>(.*?)</div>', content, re.DOTALL)
empty = [i+1 for i,w in enumerate(wraps) if '<img' not in w]
print(f'Vacíos: {empty} de {len(wraps)} total')
print('OK' if not empty else 'FALLO — añadir imágenes')
"

# 4. Todos los day-header-bg tienen URL de Pexels (no solo gradiente)
python3 -c "
import re
content = open('draft.html').read()
headers = re.findall(r'day-header-bg[^>]+style=\"([^\"]+)\"', content)
missing = [i+1 for i,h in enumerate(headers) if 'pexels.com' not in h]
print(f'Sin Pexels: {missing} de {len(headers)} headers')
print('OK' if not missing else 'FALLO — añadir IDs de día')
"

# 5. El div #route-map existe y tiene altura definida
grep -c 'id="route-map"' draft.html
# Esperado: 1

# 6. Leaflet CSS y JS cargados en <head> SIN integrity ni crossorigin
grep -c 'leaflet' draft.html
# Esperado: ≥3 (link CSS + script JS + al menos 1 uso)

# 6b. ⛔ BLOQUEANTE — Los tags de Leaflet NO deben tener integrity ni crossorigin
#     Motivo: cuando el fichero se abre como file://, el origen es null y los navegadores
#     pueden bloquear el script por la política CORS+SRI, haciendo que L quede undefined
#     y el mapa no se inicialice silenciosamente.
python3 -c "
import re
html = open('draft.html').read()
head = html[:html.find('</head>')]
leaflet_tags = re.findall(r'<(?:link|script)[^>]*leaflet[^>]*>', head)
for tag in leaflet_tags:
    if 'integrity' in tag or 'crossorigin' in tag:
        print(f'ERROR: tag Leaflet con integrity/crossorigin: {tag}')
        exit(1)
print(f'OK — {len(leaflet_tags)} tags Leaflet sin integrity/crossorigin')
"

# 7. VERIFICACIÓN REAL DE URLS PEXELS — cada ID debe devolver >5 KB
# ⚠️  Pexels devuelve HTTP 200 con placeholder de ~600 bytes para IDs inválidos.
#     La presencia del tag <img> NO garantiza que la imagen cargue.
python3 -c "
import re, subprocess

# IMPORTANTE: usar curl, no urllib — Pexels bloquea Python urllib con 403
# pero devuelve imágenes reales a curl (navegador simulado)
content = open('draft.html').read()
ids = sorted(set(re.findall(r'pexels\.com/photos/(\d+)/', content)))
print(f'Verificando {len(ids)} IDs únicos...')
broken = []
for id in ids:
    url = f'https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'
    r = subprocess.run(['curl','-s','-o','/dev/null','-w','%{size_download} %{http_code}',url],
                       capture_output=True, text=True, timeout=10)
    size, code = r.stdout.strip().split()
    size = int(size)
    if size < 5000:
        broken.append(id)
        print(f'  ❌ BROKEN ID={id} ({size} bytes, HTTP {code})')
    else:
        print(f'  ✅ OK     ID={id} ({size:,} bytes)')
print()
print('RESULTADO: OK' if not broken else f'FALLO — IDs rotos: {broken}')
"
```

**Regla**: Si cualquier check devuelve FALLO, NO entregar el resultado. Corregir el fragmento `_draft/` correspondiente y reensamblar. El check 7 (URLs reales) es especialmente crítico — HTTP 200 no significa imagen válida.

### Entradas verificadas antes de empezar

| Input | Fichero | Requisito |
|---|---|---|
| Logística | `datos-enriquecidos/logistica.md` | IDs Pexels sin `[PENDIENTE]`, GPS completo |
| Días | `datos-enriquecidos/dia-01.md` … `dia-NN.md` | Un fichero por día |
| Resumen | `datos-enriquecidos/resumen.md` | Km, gastronomía, presupuesto, checklist |
| Estilos base | `_templates/base-styles.css` | NO leer `index.html` de otro viaje |
| Scripts base | `_templates/base-scripts.js` | NO leer `index.html` de otro viaje |

> **Regla de oro**: el agente de cada paso lee **como máximo 2 ficheros** (el del día + los templates). Nunca más. Si necesita datos de otro día, es que el diseño de la sección está mal — revisar.

### Cómo regenerar un día concreto

Si después de revisar el draft.html hay que corregir el Día 5:

```
1. Editar datos-enriquecidos/dia-05.md con los cambios
2. Ejecutar solo PASO B.5 → genera _draft/dia-05.html nuevo
3. Ejecutar PASO D (ensamblado) → draft.html actualizado
```

Sin tocar ningún otro fichero.

---

## 2.1 Stack técnico

| Elemento | Valor |
|---|---|
| Archivo de salida | Un único `draft.html` (borrador) con CSS y JS embebidos |
| Dependencias externas | Google Fonts (Inter + Playfair Display) + Leaflet.js 1.9.4 |
| Leaflet CSS | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css` — ⛔ SIN integrity ni crossorigin |
| Leaflet JS | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` — ⛔ SIN integrity ni crossorigin |
| Iconos | SVGs inline (pin de mapa rojo) + emojis Unicode |
| Imágenes | Pexels — URL: `https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w={W}&h={H}&fit=crop` |
| Tiles del mapa | OpenStreetMap `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |
| Sin frameworks | Vanilla HTML/CSS/JS |
| Idioma | Español — `<html lang="es">` |
| Peso objetivo | <50KB sin imágenes |

### Meta tags requeridas
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Itinerario completo del viaje a [Destino]...">
<meta property="og:title" content="[Destino] [Año] · Itinerario de viaje">
<meta property="og:description" content="N días por [Destino]: [lista de lugares clave]">
<meta property="og:image" content="[URL pexels 1200×630 del destino]">
<title>[Destino] · [Mes] [Año]</title>
```

---

## 2.2 Paleta de colores

Variables CSS en `:root`. **Adaptar `--primary` y `--turquoise` al destino** antes de generar el HTML.

### Cómo elegir la paleta para un nuevo destino

El color `--primary` debe evocar el destino de forma inmediata. Criterios por tipo de destino:

| Tipo de destino | Color primario recomendado | Turquoise / acento | Ejemplo |
|---|---|---|---|
| Costa mediterránea | Azul marino `#1B4F8A` o azul cerúleo `#2563EB` | Aguamarina `#06B6D4` | Croacia, Grecia, Sicilia |
| Montaña y bosques | Verde alpino `#1B6B4A` o verde pino `#166534` | Turquesa glaciar `#0EA5A0` | Eslovenia, Austria, Suiza |
| Desierto o árido | Terracota `#C2501E` o ocre `#B45309` | Arena dorada `#D97706` | Marruecos, Jordania, Namibia |
| Ciudad histórica europea | Burdeos `#7F1D1D` o azul prusiano `#1E3A5F` | Dorado `#D4A853` | Praga, Budapest, Lisboa |
| País nórdico | Azul glaciar `#1E3A5F` o gris acero `#374151` | Azul hielo `#7DD3FC` | Noruega, Islandia, Finlandia |
| Selva o trópico | Verde selva `#14532D` o jade `#065F46` | Lima `#65A30D` | Costa Rica, Vietnam, Tailandia |
| País asiático | Rojo laca `#991B1B` o índigo `#312E81` | Dorado asiático `#D97706` | Japón, Nepal, India |

**Proceso de elección**:
1. Identificar el paisaje dominante del viaje (mar, montaña, desierto, ciudad)
2. Elegir `--primary` de la tabla anterior como punto de partida
3. Generar `--primary-light` sumando ~30% de luminosidad al primary (o usar una herramienta como coolors.co)
4. Generar `--primary-dark` restando ~30% de luminosidad
5. `--accent` dorado `#D4A853` funciona para casi cualquier destino; solo cambiar si el destino lo pide (ej. rojo para Japón, verde lima para selva)
6. `--bg`, `--bg-card`, `--bg-dark`, `--text`, `--text-light` y `--border` son neutros — mantener los valores de Eslovenia salvo que el destino lo justifique

**Colores de días en el mapa Leaflet** (array JavaScript `dayColors`):

El array define el color del marcador y la polilínea de cada día. Tiene 7 entradas para un viaje de 7 días. Ajustar según el número real de días:
```js
const dayColors = [
  '#2563eb', // Día 1 — azul
  '#16a34a', // Día 2 — verde
  '#ea580c', // Día 3 — naranja
  '#9333ea', // Día 4 — púrpura
  '#dc2626', // Día 5 — rojo
  '#0891b2', // Día 6 — cian
  '#6b7280', // Día 7 — gris
  // Añadir más si el viaje tiene más días:
  '#d97706', // Día 8 — ámbar
  '#be185d', // Día 9 — rosa
  '#0f766e', // Día 10 — teal
  '#7c3aed', // Día 11 — violeta
  '#b45309', // Día 12 — marrón dorado
  '#1d4ed8', // Día 13 — azul oscuro
  '#15803d', // Día 14 — verde oscuro
];
```
Usar tantas entradas como días tenga el viaje. Los colores deben ser suficientemente distintos entre sí para que el mapa sea legible.

### Tabla de variables CSS completa

| Variable | Hex (Eslovenia) | Uso |
|---|---|---|
| `--primary` | `#1B6B4A` | Color principal — headers, botones activos, bullets ✦ |
| `--primary-light` | `#2D9B6E` | Hover de botones, acentos |
| `--primary-dark` | `#0F4A33` | Texto sobre fondos claros, títulos H4 |
| `--accent` | `#D4A853` | Dorado — badges de día, separadores, bordes clima |
| `--bg` | `#FAFAF7` | Fondo principal (crema muy suave) |
| `--bg-card` | `#FFFFFF` | Fondo de tarjetas y acordeones |
| `--bg-dark` | `#1A1A2E` | Sección hero y footer (azul muy oscuro) |
| `--text` | `#2C2C2C` | Texto principal |
| `--text-light` | `#6B7280` | Texto secundario, subtítulos, datos |
| `--turquoise` | `#0EA5A0` | Acentos — borde practical-box, enlaces, datos prácticos |
| `--border` | `#E5E7EB` | Bordes sutiles de tarjetas y separadores |

---

## 2.3 Tipografías

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

- **Inter** (300–700): cuerpo de texto, nav, datos prácticos, tablas
- **Playfair Display** (400, 400i, 600, 700): títulos de sección, nombres de lugar, títulos de día

---

## 2.4 Estructura general de la página

La página final se ensambla desde los siguientes ficheros en `_draft/`:

```
cat _draft/base.html _draft/mapa.html _draft/dias-*.html _draft/end.html > draft.html
```

Estructura resultante del HTML ensamblado:

```html
<html lang="es">
<head>
  <!-- Meta tags + OG tags -->
  <!-- Google Fonts -->
  <!-- Leaflet CSS (SIN integrity ni crossorigin) -->
  <!-- Leaflet JS (SIN integrity ni crossorigin) -->
  <!-- <style> con TODO el CSS -->
</head>
<body>
  <header id="hero">                   <!-- Hero full viewport -->
  <section class="travelers-section">  <!-- Viajeros con avatares -->
  <div class="flights-section">        <!-- Boarding passes vuelos -->
  <nav id="main-nav">                  <!-- Navegación sticky -->
  <main>
    <section id="info">                <!-- Info General (4 acordeones) [base.html] -->
    <!-- ↓ mapa.html ─────────────────────────────────────────── -->
    <section id="mapa-ruta">           <!-- Mapa Leaflet + <script> L.map() -->
    <!-- ↑ ÚNICO L.map() de toda la página ──────────────────── -->
    <section id="dia-1">               <!-- Día 1 [dias-01.html] -->
    <section id="dia-2">               <!-- Día 2 [dias-02.html] -->
    ...
    <section id="dia-N">               <!-- Día N [dias-NN.html] -->
    <!-- ↓ end.html ──────────────────────────────────────────── -->
  </main>
    <section id="km">                  <!-- Resumen kilómetros -->
    <section id="gastro">              <!-- Gastronomía general -->
  <footer>
  <script>  <!-- BLOQUE 2: acordeones, nav, lazy load — SIN L.map() -->
</body>
```

**Regla de oro del mapa**: `L.map()` aparece **exactamente una vez** en todo el HTML ensamblado, y esa única ocurrencia viene de `mapa.html`.

---

## 2.5 Secciones — especificación completa

### Hero Section (`<header id="hero">`)

- **Altura**: `100vh`, `min-height: 500px`
- **Fondo**: `background-image` Pexels 1920×1080 + fallback `linear-gradient(135deg, var(--primary-dark), var(--turquoise))`
- **Parallax**: `will-change: transform` en `#hero-bg`, JS aplica `translateY(scrollY * 0.3)`
- **Overlay**: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.15) 100%)`
- **Contenido** (centrado, z-index 2):
  - Emoji bandera del país — `font-size: 2.5rem`, animación `fadeInDown 0.8s`
  - `<h1 class="hero-title">` — nombre del destino, Playfair Display 5rem, blanco, `letter-spacing: 0.06em`
  - `<p class="hero-subtitle">` — "[fechas] · N viajeros · ~XXX km de aventura", Inter 1.2rem, `rgba(255,255,255,0.88)`
  - Botón scroll con flecha bounce infinito `translateY(0→10px)` cada 2s

### Sección Viajeros (`.travelers-section`)

- **Posición**: Entre hero y vuelos, fuera de `<main>`
- **Fondo**: imagen Pexels 1200×600 de paisaje + overlay `rgba(15,74,51,0.75)` + gradiente
- **Padding**: `60px 24px`
- **Título**: "Los viajeros", Playfair Display 2rem, blanco
- **Grid**: `.travelers-grid` — flex wrap, gap 24px, max-width 700px, centrado
- **Cada avatar** (`.traveler-card`):
  - Círculo 72×72px con la inicial del nombre en bold
  - Colores rotativos: `var(--primary)`, `var(--turquoise)`, `var(--accent)`
  - Borde `rgba(255,255,255,0.4)` + box-shadow
  - Nombre debajo en Inter 0.88rem blanco

### Sección Vuelos (`.flights-section`)

- **Fondo**: `var(--bg)`, padding `40px 20px`
- **Título**: `.flights-title` — Playfair Display 1.8rem, centrado, con ✈ como prefijo
- **Grid**: 2 columnas desktop (`1fr 1fr`), 1 columna móvil
- **Cada boarding pass** (`.boarding-pass`):
  - Fondo blanco, `border-radius: 12px`, `border-left: 5px solid #cc0000`
  - `.bp-header`: fondo `#1a1a1a`, texto blanco — número vuelo + badge IDA/VUELTA (fondo `--accent`)
  - `.bp-route`: IATA origen (2.8rem bold) → flecha SVG avión rojo → IATA destino
  - Debajo de la flecha: duración del vuelo en 0.75rem
  - `.bp-footer`: separador dashed, hora SALIDA (izq.) y hora LLEGADA (dcha.) en 1.4rem bold + fecha

### Navegación Sticky (`<nav id="main-nav">`)

- `position: sticky; top: 0; z-index: 100`
- **Fondo**: `rgba(250,250,247,0.88)` + `backdrop-filter: blur(10px)`, borde inferior `1px solid var(--border)`
- Al hacer scroll: añadir clase `.scrolled` con `box-shadow: 0 2px 16px rgba(0,0,0,0.08)`
- **Botones** (`.nav-btn`): Inter 0.82rem, 500, `padding: 14px 16px`, flex-shrink 0
- **Indicador activo**: pseudo-element `::after` con `height: 2px; background: var(--primary)` — animación `left: 50%→16px`, `right: 50%→16px`
- **Botón activo** (`.active`): color `var(--primary)`, font-weight 600
- **Scroll horizontal** en móvil: `overflow-x: auto`, scrollbar oculto con `::-webkit-scrollbar { display: none }`

**Botones de navegación a generar** (uno por cada sección + fijos):
```
🚐 Info General | 🗺️ Mapa | Día 1 | Día 2 | ... | Día N | 📏 Km | 🍽️ Gastronomía
```
Cada botón tiene `data-target="[id-sección]"` y `onclick="scrollToSection('[id]')"`

### Info General (`<section id="info">`)

4 acordeones colapsados por defecto:

**Acordeón 1 — Vehículo y Peajes**
- Título: "Vehículo y Peajes" / Subtítulo: "[tipo vehículo] · [nombre peaje]"
- Contenido: descripción del vehículo, ventajas para el grupo, datos del peaje, enlace oficial
- Cajas `.practical-box` para datos importantes

**Acordeón 2 — Alojamientos — N bases**
- Tabla `info-alojamiento-table` con columnas: Noches / Base / Duración / Precio est.
- Fila por zona con emoji (🏔️ alpes, 🏙️ ciudad, 🌊 costa)
- Caja de consejo con `.practical-box`
- Lista `bullet-list` con consejos por zona

**Acordeón 3 — Consejos Prácticos**
- Lista `.consejos-list` con bullets `→` en `var(--primary)`
- Incluir: moneda, gasolina, propinas, idioma, emergencias, apps móvil, reservas en temporada alta

**Acordeón 4 — Información del País**
- Tabla `.country-table` con datos básicos: capital, moneda, superficie, población, idioma, electricidad, zona horaria, llamadas de emergencia

### Mapa Leaflet Interactivo (`<section id="mapa-ruta">`)

- Fuera del `<main>`, con `max-width: 960px` centrado
- Título H2 + párrafo explicativo
- `<div id="route-map" style="height:520px;width:100%">` envuelto en `border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.12)`
- Leyenda de colores por día debajo del mapa (`flex-wrap: wrap; gap: 12px 24px`)
- Especificación JS detallada en sección 2.7

### Secciones por Día (`<section id="dia-N" class="day-section">`)

Cada día tiene esta estructura interna:

**A) Cabecera visual** (`.day-header` — 300px alto)
```html
<div class="day-header">
  <div class="day-header-bg" style="background-image:url('...')"></div>
  <div class="day-header-overlay"></div>
  <div class="day-header-content">
    <span class="day-badge">Día N</span>
    <p class="day-date">[Día semana, DD de mes]</p>
    <h2 class="day-title" id="diaN-title">[Lugar A → Lugar B]</h2>
    <span class="day-km-badge">🚐 XXX km · Xh Ymin</span>
  </div>
</div>
```
- `.day-badge`: fondo `--accent`, color `--primary-dark`, uppercase, 0.72rem
- `.day-title`: Playfair Display 1.8rem, blanco
- `.day-km-badge`: glassmorphism (`rgba(255,255,255,0.18)` + `backdrop-filter: blur(4px)` + borde)
- Overlay: `linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)`

**B) Timeline de ruta** (`.route-timeline`)
```html
<div class="route-timeline">
  <h3>Recorrido del día</h3>
  <div class="timeline-steps">
    <!-- por cada punto: -->
    <div class="timeline-step">
      <div class="timeline-dot-col">
        <div class="timeline-dot"></div>
        <div class="timeline-line"></div>
      </div>
      <div class="timeline-info">
        <div class="timeline-place">[emoji] [Nombre lugar]</div>
        <div class="timeline-time">[HH:MM — descripción]</div>
      </div>
    </div>
    <div class="timeline-leg">[X km / Y min]</div>
    <!-- ... -->
  </div>
</div>
```
- `.timeline-dot`: 14×14px, `background: var(--primary)`, `box-shadow: 0 0 0 2px var(--primary)`
- `.timeline-line`: `border-left: 2px dashed var(--border)`, `min-height: 28px`
- `.timeline-leg`: cursiva, 0.78rem, `color: var(--text-light)`, `padding-left: 32px`

**C) Acordeones de lugares** — uno por lugar del día

```html
<div class="accordion">
  <button class="accordion-header" aria-expanded="false" aria-controls="body-[id]">
    <div class="accordion-header-content">
      <div class="accordion-thumb-wrap" style="width:80px;height:80px;border-radius:8px;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,var(--primary),var(--turquoise))">
        <img src="[pexels 160x160]" class="accordion-thumb" alt="[nombre lugar]" loading="lazy" onerror="this.style.opacity='0'">
      </div>
      <div>
        <h3 class="accordion-title">[Nombre del lugar]</h3>
        <p class="accordion-subtitle">[descripción breve de 1 línea]</p>
      </div>
    </div>
    <span class="accordion-chevron">▾</span>
  </button>
  <div class="accordion-body" id="body-[id]" hidden>
    <!-- imagen 16:9 -->
    <div class="accordion-img-wrap">
      <img src="[pexels 800x450]" alt="[descripción]" loading="lazy" onerror="this.style.opacity='0'">
    </div>
    <!-- Historia -->
    <div class="content-section">
      <h4>Historia</h4>
      <p>[texto]</p>
    </div>
    <!-- Qué ver -->
    <div class="content-section">
      <h4>Qué ver</h4>
      <!-- por cada ítem: -->
      <li class="qvitem">
        <span class="qv-bullet">✦</span>
        <span class="qv-text"><strong>[punto]:</strong> [descripción]</span>
        <a href="https://maps.google.com/?q=..." target="_blank" rel="noopener" class="gps-pin" title="Ver en Google Maps">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#c00">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </a>
      </li>
    </div>
    <!-- Datos prácticos -->
    <div class="practical-box">
      <strong>[Etiqueta]:</strong> [dato]<br>
      <a href="https://maps.google.com/?q=..." target="_blank" rel="noopener" style="color:var(--turquoise)">
        <strong>📍 [Nombre parking]:</strong>
      </a> [precio y descripción]
    </div>
    <!-- Botones Google Maps -->
    <div class="maps-group">
      <a href="https://maps.google.com/?q=..." target="_blank" rel="noopener" class="map-btn">📍 [Nombre]</a>
    </div>
    <!-- Clima -->
    <div class="climate-card">
      <strong>[☀️/⛅] Clima — [Zona] ([mes])</strong><br>
      [T]°C máx / [T]°C mín · [descripción condiciones]
    </div>
  </div>
</div>
```

**D) Acordeón Gastronomía del día**

```html
<div class="accordion">
  <button class="accordion-header" ...>
    <h3>🍽️ Dónde y qué comer</h3>
    <p>[zona] · [plato 1] · [plato 2] · [plato 3]</p>
  </button>
  <div class="accordion-body" ...>
    <table class="gastro-table">
      <thead><tr><th>Plato</th><th>Descripción</th></tr></thead>
      <tbody>
        <tr><td>[plato]</td><td>[descripción]</td></tr>
      </tbody>
    </table>
    <h4>Restaurantes recomendados en [zona]</h4>
    <div class="restaurant-cards">
      <div class="restaurant-card">
        <h5>[Nombre restaurante]</h5>
        <p>[Ubicación] · [descripción breve]. <strong>~XX–XX€/persona</strong></p>
      </div>
    </div>
  </div>
</div>
```

### Resumen de Kilómetros (`<section id="km">`)

```html
<table class="km-table">
  <thead>
    <tr><th>Tramo</th><th>Km</th><th>Tiempo aprox.</th></tr>
  </thead>
  <tbody>
    <tr><td>[Origen] → [Destino]</td><td>X km</td><td>Xh Ymin</td></tr>
    <!-- ... -->
    <tr><td><strong>Total km del viaje</strong></td><td><strong>~XXX km</strong></td><td></td></tr>
  </tbody>
</table>
```
- Cabecera: fondo `var(--primary-dark)`, texto blanco, uppercase
- Filas alternas: `var(--bg)` / `var(--bg-card)`
- Última fila: `rgba(27,107,74,0.08)`, texto bold, `--primary-dark`

### Gastronomía General (`<section id="gastro">`)

Un único acordeón con:
- Tabla de 13+ platos (columnas: Plato / Descripción / Zona) con `.gastro-zone-label` badges
- Tabla de bebidas (columnas: Bebida / Descripción)

### Footer

```html
<footer>
  <p class="footer-title">[Destino] [Año] · [bandera emoji]</p>
  <p class="footer-sub">[fechas] · N viajeros · ~XXX km de aventura</p>
  <pre class="footer-ascii">[mapa ASCII del recorrido]</pre>
</footer>
```
- Fondo `var(--bg-dark)`, padding `56px 24px 40px`, texto centrado
- `.footer-ascii`: monospace, `rgba(255,255,255,0.45)`, `white-space: pre`, tamaño 0.78rem

---

## 2.6 Componentes CSS — clases y estilos

### `.accordion`
```css
background: var(--bg-card);
border-radius: 12px;
box-shadow: 0 1px 3px rgba(0,0,0,0.08);
margin-bottom: 12px;
overflow: hidden;
border: 1px solid var(--border);
```

### `.accordion-header`
```css
width: 100%; background: none; border: none;
padding: 16px 20px; cursor: pointer;
display: flex; align-items: center;
justify-content: space-between; gap: 12px;
transition: background 0.2s;
```
Hover: `background: var(--bg)`

### `.accordion-thumb`
```css
width: 80px; height: 80px; object-fit: cover;
border-radius: 8px; flex-shrink: 0;
background: linear-gradient(135deg, var(--primary), var(--turquoise)); /* fallback */
```
Móvil: 60×60px

### `.accordion-chevron`
```css
font-size: 1.1rem; color: var(--text-light);
transition: transform 0.25s ease; flex-shrink: 0;
```
Cuando `aria-expanded="true"`: `transform: rotate(180deg)`

### `.accordion-body`
```css
padding: 0 20px 24px;
border-top: 1px solid var(--border);
```
`[hidden]`: `display: none`

### `.accordion-img-wrap`
```css
background: linear-gradient(135deg, var(--primary), var(--turquoise));
border-radius: 12px; overflow: hidden;
margin: 20px 0; aspect-ratio: 16/9;
```
`img` empieza `opacity: 0` → `.loaded` → `opacity: 1` (transition 0.4s)

### `.practical-box`
```css
background: var(--bg);
border-left: 3px solid var(--turquoise);
border-radius: 0 8px 8px 0;
padding: 14px 16px; margin-bottom: 12px;
font-size: 0.88rem; line-height: 1.65;
```

### `.climate-card`
```css
background: var(--bg);
border-left: 3px solid var(--accent);
border-radius: 0 8px 8px 0;
padding: 12px 16px; margin-top: 14px;
font-size: 0.85rem; color: var(--text-light);
```

### `.map-btn`
```css
display: inline-flex; align-items: center; gap: 5px;
border: 1px solid var(--border); border-radius: 20px;
padding: 5px 14px; font-size: 0.82rem;
font-weight: 500; color: var(--primary);
text-decoration: none; transition: background 0.2s, border-color 0.2s;
```
Hover: `background: var(--primary); color: #fff; border-color: var(--primary)`

### `.maps-group`
```css
display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px;
```

### `.gps-pin` (pin SVG rojo inline en texto)
```css
display: inline-flex; align-items: center;
margin-left: 6px; opacity: 0.6;
transition: opacity 0.2s, transform 0.2s;
vertical-align: middle; text-decoration: none;
```
Hover: `opacity: 1; transform: scale(1.2)`

### `.qvitem`
```css
display: flex; align-items: baseline;
gap: 6px; margin-bottom: 8px;
font-size: 0.92rem; line-height: 1.6;
```
- `.qv-bullet`: `color: var(--accent); font-size: 0.7rem; flex-shrink: 0`
- `.qv-text`: `flex: 1`

### `.restaurant-card`
```css
background: var(--bg); border: 1px solid var(--border);
border-radius: 10px; padding: 14px;
```
Grid: `repeat(auto-fill, minmax(200px, 1fr))`, gap 12px

### `.gastro-table`
- Header: `background: var(--bg)`, uppercase 0.78rem, `--text-light`, `border-bottom: 2px solid var(--border)`
- Celdas: `padding: 10px 12px`, `border-bottom: 1px solid var(--border)`
- Filas alternas: `background: var(--bg)`
- Primera columna: bold, `--primary-dark`, `white-space: nowrap`

### `.km-table`
- Cabecera: `background: var(--primary-dark)`, texto blanco, uppercase 0.82rem
- Filas alternas: `--bg` / `--bg-card`
- Última fila: `rgba(27,107,74,0.08) !important`, bold, `--primary-dark`

### `.day-header`
```css
position: relative; height: 300px; /* 250px tablet, 200px móvil */
border-radius: 16px; overflow: hidden;
display: flex; align-items: flex-end;
margin-bottom: 32px;
background: linear-gradient(135deg, var(--primary-dark), var(--turquoise)); /* fallback */
```

### `.day-section` (fade-in on scroll)
```css
margin-top: 56px;
opacity: 0; transform: translateY(20px);
transition: opacity 0.5s ease, transform 0.5s ease;
```
Con clase `.visible`: `opacity: 1; transform: translateY(0)`

### `.consejos-list`
```css
list-style: none; padding: 0;
```
Cada `li`: `padding: 6px 0 6px 24px; position: relative; border-bottom: 1px solid var(--border); font-size: 0.9rem`
`li::before`: `content: '→'; position: absolute; left: 0; color: var(--primary); font-weight: 700`

### `.gastro-zone-label`
```css
display: inline-block;
background: rgba(27,107,74,0.1); color: var(--primary-dark);
font-size: 0.75rem; font-weight: 600;
padding: 2px 10px; border-radius: 12px;
margin-left: 8px; vertical-align: middle;
```

### `.warning-box`
```css
background: rgba(212,168,83,0.1);
border-left: 3px solid var(--accent);
border-radius: 0 8px 8px 0;
padding: 14px 16px; margin-bottom: 16px;
font-size: 0.88rem; line-height: 1.65;
```

### `.bullet-list li`
```css
font-size: 0.92rem; padding: 3px 0 3px 22px; position: relative;
```
`li::before`: `content: '✦'; position: absolute; left: 0; color: var(--accent); font-size: 0.7rem; top: 6px`

---

## 2.7 Mapa Leaflet interactivo

```javascript
// Inicializar ANTES del script principal (IIFE separado)
(function() {
  var map = L.map('route-map', {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView([LAT_CENTRO, LNG_CENTRO, ZOOM_INICIAL]);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  // Icono personalizado por color
  function mkIcon(color) {
    return L.divIcon({
      className: '',
      html: '<svg viewBox="0 0 24 36" width="24" height="36">' +
            '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="' + color + '"/>' +
            '<circle cx="12" cy="11" r="5" fill="#fff"/></svg>',
      iconSize: [24, 36], iconAnchor: [12, 36], popupAnchor: [0, -36]
    });
  }

  // Datos de los días con sus puntos GPS y colores
  var days = [
    { color: '#2563eb', points: [
      { lat: X, lng: Y, name: 'Nombre', info: 'Día N — descripción breve' },
      ...
    ]},
    ...
  ];

  var allLatLngs = [];
  days.forEach(function(day) {
    var dayLatLngs = [];
    day.points.forEach(function(p) {
      L.marker([p.lat, p.lng], { icon: mkIcon(day.color) })
        .addTo(map)
        .bindPopup('<strong>' + p.name + '</strong><br>' + p.info);
      allLatLngs.push([p.lat, p.lng]);
      dayLatLngs.push([p.lat, p.lng]);
    });
    if (dayLatLngs.length > 1) {
      L.polyline(dayLatLngs, { color: day.color, weight: 3, opacity: 0.6, dashArray: '8 6' }).addTo(map);
    }
  });

  // Líneas de traslado entre días (gris claro)
  var transfers = [
    { from: [LAT1, LNG1], to: [LAT2, LNG2] },
    ...
  ];
  transfers.forEach(function(t) {
    L.polyline([t.from, t.to], { color: '#d1d5db', weight: 2, opacity: 0.4, dashArray: '4 8' }).addTo(map);
  });

  map.fitBounds(allLatLngs, { padding: [30, 30] });

  // Activar scrollWheelZoom solo al hacer clic dentro del mapa
  map.on('click', function() { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function() { map.scrollWheelZoom.disable(); });
})();
```

**Centro y zoom inicial**: calcular el punto medio geográfico de todos los puntos GPS y usar zoom 8–10 según la extensión del territorio.

**Colores por día** (asignar en orden):
```
Día 1: #2563eb  Día 2: #16a34a  Día 3: #ea580c
Día 4: #9333ea  Día 5: #dc2626  Día 6: #0891b2
Día 7: #6b7280  Día 8: #ca8a04  Día 9: #0f766e
```

**Leyenda del mapa** (`#map-legend`): `flex-wrap: wrap; gap: 12px 24px; margin-top: 16px; font-size: 0.85rem`
Cada ítem: círculo de color (12×12px, border-radius 50%) + texto "Día N — nombre zona"

---

## 2.8 JavaScript — funcionalidades

Todo en un único `<script>` al final del body, dentro de IIFE `(function() { 'use strict'; })()`.

### Acordeones (`initAccordions`)
```javascript
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(function(header) {
    var body = document.getElementById(header.getAttribute('aria-controls'));
    if (!body) return;
    if (header.getAttribute('aria-expanded') === 'true') body.removeAttribute('hidden');
    header.addEventListener('click', function() {
      var isOpen = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', !isOpen);
      if (isOpen) { body.setAttribute('hidden', ''); }
      else { body.removeAttribute('hidden'); }
      // Lazy load de imágenes al abrir
      body.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        img.addEventListener('load', function() { img.classList.add('loaded'); });
        if (img.complete) img.classList.add('loaded');
      });
    });
  });
}
```

### Navegación sticky y scroll spy (`initNav`)
```javascript
function scrollToSection(id) {
  var el = document.getElementById(id);
  if (!el) return;
  var navH = document.getElementById('main-nav').offsetHeight;
  var top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
  window.scrollTo({ top: top, behavior: 'smooth' });
}

// Scroll spy con IntersectionObserver
var navObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.target === entry.target.id);
      });
    }
  });
}, { threshold: 0.3, rootMargin: '-60px 0px -40% 0px' });

document.querySelectorAll('main section[id], section[id]').forEach(function(s) {
  navObserver.observe(s);
});

// Box-shadow al hacer scroll
window.addEventListener('scroll', function() {
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 10);
});
```

### Parallax Hero
```javascript
var heroBg = document.getElementById('hero-bg');
if (heroBg) {
  window.addEventListener('scroll', function() {
    requestAnimationFrame(function() {
      heroBg.style.transform = 'translateY(' + (window.scrollY * 0.3) + 'px)';
    });
  });
}
```

### Fade-in on Scroll
```javascript
var fadeObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); fadeObserver.unobserve(e.target); }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.day-section').forEach(function(s) { fadeObserver.observe(s); });
```

### Lazy load de imágenes (al abrir acordeón)
```javascript
// Cada img cargada: añadir clase .loaded para opacity 0→1
document.querySelectorAll('.accordion-img-wrap img, .accordion-thumb').forEach(function(img) {
  img.addEventListener('load', function() { img.classList.add('loaded'); });
  if (img.complete) img.classList.add('loaded');
});
```

---

## 2.9 Imágenes — fuente y formato

**Fuente**: Pexels — todas las imágenes deben verificarse que cargan antes de incluir el ID.

**Patrón de URL**:
```
https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w={W}&h={H}&fit=crop
```

**Tamaños por uso**:
| Contexto | W | H |
|---|---|---|
| Hero background | 1920 | 1080 |
| OG image | 1200 | 630 |
| Sección viajeros | 1200 | 600 |
| Header de día | 1200 | 400 |
| Imagen acordeón grande (16:9) | 800 | 450 |
| Thumbnail acordeón | 160 | 160 |

**Atributos obligatorios en cada `<img>`**:
```html
loading="lazy"           <!-- excepto hero: fetchpriority="high" -->
alt="[descripción]"      <!-- descriptivo, no genérico -->
onerror="this.style.opacity='0'"
```

**Fallback**: El contenedor siempre tiene `background: linear-gradient(135deg, var(--primary), var(--turquoise))`. Si la imagen falla, el gradiente es visible.

---

## 2.10 Responsive design

### Desktop (>1024px)
- `main`: `max-width: 900px`, centrado, `padding: 0 24px 64px`
- Nav: `max-width: 960px`
- Thumbnails: 80×80px
- Headers de día: 300px alto
- Boarding passes: 2 columnas
- Restaurant cards: `auto-fill minmax(200px, 1fr)`

### Tablet (768px–1024px)
- `main`: `padding: 0 24px 56px`
- Headers de día: 250px alto

### Móvil (<768px)
```css
@media (max-width: 768px) {
  .hero-title { font-size: 3rem; }
  .hero-subtitle { font-size: 1rem; }
  main { padding: 0 16px 48px; }
  .day-header { height: 200px; border-radius: 12px; }
  .day-title { font-size: 1.4rem; }
  .accordion-thumb { width: 60px; height: 60px; }
  .section-title { font-size: 1.5rem; }
  .restaurant-cards { grid-template-columns: 1fr 1fr; }
  .flights-grid { grid-template-columns: 1fr; }
  .travelers-grid { grid-template-columns: repeat(3, 1fr); }
  .footer-ascii { font-size: 0.65rem; }
}
```

### Reducción de movimiento
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .day-section { opacity: 1; transform: none; }
}
```

---

## 2.11 Animaciones y microinteracciones

| Elemento | Animación | Detalle |
|---|---|---|
| Hero flag | `fadeInDown 0.8s ease` | `from: opacity:0, translateY(-20px)` |
| Hero title | `fadeInDown 0.9s ease 0.1s both` | Ligero delay |
| Hero subtitle | `fadeInDown 1s ease 0.2s both` | |
| Hero scroll btn | `fadeInDown 1.1s ease 0.3s both` | |
| Flecha hero | `bounce 2s ease-in-out infinite` | `translateY(0→10px)` |
| Hero parallax | `translateY(scrollY * 0.3)` | `requestAnimationFrame` |
| Day section | `opacity 0→1` + `translateY(20px→0)` en 0.5s | Al entrar en viewport (IntersectionObserver) |
| Acordeón chevron | `rotate(0→180deg)` en 0.25s | |
| Imágenes | `opacity 0→1` en 0.4s | Al completar carga (`img.classList.add('loaded')`) |
| GPS pins | `opacity 0.6→1` + `scale(1.2)` | En hover |
| Nav underline | `left: 50%→16px`, `right: 50%→16px` | En hover y activo |
| Nav scrolled | `box-shadow` añadido | Al pasar el hero |

---

## 2.12 Accesibilidad

- `<html lang="es">`
- Semántica: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- `<nav role="navigation" aria-label="Navegación principal">`
- Cada `<section>` con `aria-labelledby` apuntando a su `<h2>` interno
- Todos los acordeones: `aria-expanded` + `aria-controls` en el button
- Navegación por teclado (Tab + Enter)
- `alt` descriptivo en todas las imágenes (nunca vacío ni genérico)
- Contraste mínimo WCAG AA en todos los textos
- `prefers-reduced-motion`: desactiva parallax y animaciones de scroll

---

## 2.13 Checklist de implementación

### Paso A — Verificar datos y generar base.html
- [ ] Leer `datos-enriquecidos/logistica.md`
- [ ] **⛔ GATE**: Verificar que la sección `## 🖼️ IDs de Pexels verificados` tiene exactamente `N_días + 1` filas con ✅ o GRADIENTE. Si hay filas vacías o con `[PENDIENTE]`, **detener FASE 2 y completar los IDs en FASE 1 primero**.
- [ ] Leer `_templates/base-styles.css` y `_templates/base-scripts.js`
- [ ] Adaptar `:root` con los colores del destino (ver sección 2.2)
- [ ] Generar `_draft/base.html`: head, CSS, draft-banner, hero (con ID Pexels), viajeros, vuelos, nav, info general (4 acordeones)
- [ ] **⛔ NO incluir la sección #mapa-ruta ni script Leaflet en base.html** — el mapa vive íntegramente en `mapa.html`. Incluir L.map() fuera de mapa.html causa doble inicialización.

### Paso Mapa — Generar mapa.html
- [ ] Leer `_cache/gps-coords.md` y `datos-enriquecidos.md` (coordenadas de todos los días)
- [ ] Usar `_templates/mapa-template.html` como estructura de referencia
- [ ] Generar `_draft/mapa.html`: `<section id="mapa-ruta">` + div `#route-map` + leyenda + `<script>` con `L.map()` completo
- [ ] Rellenar array `days` con todos los puntos GPS del itinerario (colores por día)
- [ ] Rellenar array `transfers` con líneas grises entre bases
- [ ] Ajustar `setView([LAT, LNG], ZOOM)` al centro geográfico del destino
- [ ] **⛔ Verificar antes de guardar**: `grep -c 'L.map(' _draft/mapa.html` debe dar exactamente **1**

### Paso B — Generar día a día (repetir para cada día)
- [ ] Leer `datos-enriquecidos/dia-NN.md` (solo ese fichero)
- [ ] Usar el ID Pexels del header del día que está en `dia-NN.md` — **no buscar nuevos IDs en FASE 2, todos deben venir ya verificados de FASE 1**
- [ ] Generar `_draft/dia-NN.html`: `<section id="dia-N">` completo con cabecera (URL Pexels en `background-image`), timeline, acordeones de lugares, gastronomía del día
- [ ] **⛔ TODOS los `accordion-thumb-wrap` deben tener `<img>` con URL Pexels real** — usar el ID del lugar del `dia-NN.md`. Gradiente solo como `background` de fallback, nunca como único contenido.
- [ ] **⛔ TODOS los `accordion-img-wrap` deben tener `<img>` con URL Pexels real** — misma regla.
- [ ] Antes de escribir el fichero: contar cuántos `accordion-thumb-wrap` tiene y verificar que todos tienen `<img>`. Si falta alguno, buscarlo ahora (no lo dejó en datos: usar el ID del lugar del día como fallback mínimo).
- [ ] Repetir para cada día del itinerario

### Paso C — Generar end.html
- [ ] Leer `datos-enriquecidos/resumen.md`
- [ ] Generar `_draft/end.html`: `</main>`, sección km, gastronomía general, footer con mapa ASCII, `<script>` con BLOQUE 2 (acordeones, nav, lazy load), `</body></html>`
- [ ] **⛔ end.html NO debe contener L.map() ni sección #mapa-ruta** — el mapa vive en mapa.html.
- [ ] Verificar antes de guardar: `grep -c "L.map(" _draft/end.html` debe dar **0**

### Paso D — Ensamblar draft.html + Validación
- [ ] `cat _draft/base.html _draft/mapa.html _draft/dias-*.html _draft/end.html > draft.html`
- [ ] **⛔ Ejecutar la checklist de validación post-ensamblado** (ver sección 2.0 — todos los checks bash). Si alguno falla, corregir el fragmento y reensamblar.
- [ ] Solo declarar el paso completado cuando TODOS los checks pasen: mapa.html existe con 1 L.map(), base.html y end.html sin L.map(), 0 thumbnails vacíos, todos los day-headers con Pexels URL, `#route-map` presente.

### Paso 3 — Secciones estáticas
- [ ] Hero con imagen Pexels correcta y parallax
- [ ] Sección viajeros con avatares de colores rotativos
- [ ] Boarding passes con datos de vuelo IDA y VUELTA
- [ ] Nav sticky con todos los botones (Info + Mapa + N días + Km + Gastronomía)
- [ ] Info General (4 acordeones): vehículo, alojamientos, consejos, país

### Paso 4 — Mapa Leaflet (fichero mapa.html)
- [ ] **Generado en `_draft/mapa.html`** — nunca en base.html ni end.html
- [ ] Inicializar mapa con centro y zoom correctos para el destino
- [ ] Añadir todos los puntos GPS con colores por día y popups
- [ ] Polylines de ruta por día (color sólido, dashArray '8 6')
- [ ] Polylines de traslado entre bases (gris '#d1d5db', dashArray '4 8')
- [ ] `fitBounds` sobre todos los puntos
- [ ] Leyenda del mapa (.map-legend) con colores y nombres de día
- [ ] `setTimeout(map.invalidateSize, 100)` para forzar re-renderizado
- [ ] **⛔ Validar**: `grep -c 'L\.map(' _draft/mapa.html` → exactamente **1**
- [ ] **⛔ Validar**: `grep -c 'L\.map(' _draft/base.html` → exactamente **0**
- [ ] **⛔ Validar**: `grep -c 'L\.map(' _draft/end.html` → exactamente **0**

### Paso 5 — Secciones por día
- [ ] Cabecera visual con imagen Pexels 1200×400, badges, título y km badge
- [ ] Timeline de ruta con todos los puntos y tramos del día
- [ ] Acordeones de lugares: thumbnail + historia + qué ver + datos prácticos + parkings + mapa buttons + clima
- [ ] GPS pins SVG en cada ítem de "Qué ver"
- [ ] Acordeón de gastronomía con tabla y grid de restaurantes

### Paso 6 — Secciones finales
- [ ] Tabla de km con todos los tramos y el total
- [ ] Sección gastronomía general (13+ platos + bebidas)
- [ ] Footer con título, subtítulo y mapa ASCII

### Paso 7 — JavaScript
- [ ] Acordeones (toggle hidden + aria-expanded + lazy load imágenes)
- [ ] Nav scroll spy con IntersectionObserver
- [ ] `scrollToSection()` con offset del nav
- [ ] Parallax hero con requestAnimationFrame
- [ ] Fade-in on scroll de `.day-section`
- [ ] Lazy load con clase `.loaded` en imágenes

### Paso 8 — Verificación final
- [ ] Todas las imágenes con `loading="lazy"` excepto hero
- [ ] Todos los `alt` descriptivos y actualizados
- [ ] Todos los enlaces `target="_blank" rel="noopener"`
- [ ] Responsive: probar hero, nav, acordeones y boarding passes en móvil
- [ ] `prefers-reduced-motion` aplicado
- [ ] Mapa Leaflet encuadra correctamente todos los puntos con `fitBounds`
- [ ] Idioma `<html lang="es">`

---

---

# FASE 3 — `draft.html` → `index.html` (datos reales + presupuesto)

La Fase 3 sustituye todos los datos inventados del `draft.html` por datos reales obtenidos de fuentes externas, y genera el presupuesto definitivo del viaje. El resultado es el `index.html` final, sin marcas de borrador.

---

## 3.1 Objetivo

Reemplazar cada `<span class="draft-placeholder">` por el dato real correspondiente, eliminar el banner de borrador, y producir `index.html` como copia limpia y definitiva del `draft.html`.

---

## 3.2 Búsqueda de datos reales

> Las URLs y patrones de búsqueda de cada fuente están en **[`FUENTES.md`](./FUENTES.md)** → secciones "Vuelos", "Alojamientos", "Alquiler de vehículo" y "Entradas, precios y horarios".

### Vuelos

**Fuentes**: ver `FUENTES.md` → [Vuelos].

**Datos a obtener**:
- Compañía y número de vuelo
- Horario de salida y llegada (con escala si aplica)
- Precio por persona (tarifa más económica que cumpla los filtros de `requerimientos.yaml`)
- Clase de equipaje incluida

**Proceso**:
```
1. WebSearch("vuelos Madrid [destino] [fecha ida] directos baratos")
2. Verificar que cumple los filtros del requerimientos.yaml (directo, horario, compañía)
3. Anotar precio, compañía, número de vuelo y horario
4. Repetir para el vuelo de vuelta
```

**Criterio de selección**: el vuelo más barato que cumpla todos los filtros. Si ninguno cumple todos, indicar qué filtro se ha relajado y por qué.

---

### Hoteles y alojamientos

**Fuentes**: ver `FUENTES.md` → [Alojamientos].

**Datos a obtener por zona**:
- Nombre del alojamiento
- Tipo (apartamento, hotel, casa rural)
- Precio por noche (para el número de viajeros del grupo)
- Precio total de la zona (noches × precio/noche)
- Valoración (puntuación + número de reseñas)
- URL de reserva

**Proceso**:
```
1. WebSearch("apartamento [N] personas [ciudad/zona] [fechas] booking")
2. Seleccionar opción que cumpla preferencias del requerimientos.yaml (parking, tipo)
3. Anotar nombre, precio/noche, precio total, valoración y URL
4. Repetir para cada zona del itinerario
```

---

### Alquiler de vehículo

**Fuentes**: ver `FUENTES.md` → [Alquiler de vehículo].

**Datos a obtener**:
- Arrendadora y modelo de vehículo
- Precio total del alquiler (todos los días)
- Condiciones: kilometraje ilimitado, seguro incluido, conductor adicional
- Aeropuerto de recogida y devolución

**Proceso**:
```
1. WebSearch("alquiler furgoneta [N] plazas [aeropuerto] [fechas] rentalcars")
2. Verificar que el vehículo admite equipaje para el grupo
3. Anotar arrendadora, modelo, precio total y condiciones
```

---

### Actividades y entradas

**Fuentes**: web oficial de cada atracción, GetYourGuide.

**Datos a obtener** (para cada actividad del itinerario):
- Precio de entrada por persona
- Necesidad de reserva previa (sí/no) y URL
- Horario actualizado

> Muchos de estos datos ya se han investigado en FASE 1. En FASE 3, verificar que siguen vigentes y actualizar si han cambiado.

---

## 3.3 Presupuesto definitivo

Una vez recopilados todos los datos reales, generar la sección de presupuesto con el siguiente desglose:

| Concepto | Coste total | Coste/persona |
|---|---|---|
| Vuelos (ida + vuelta) | X € | X € |
| Alojamiento (todas las zonas) | X € | X € |
| Alquiler de vehículo | X € | X € |
| Combustible estimado | X € | X € |
| Actividades y entradas | X € | X € |
| Gastronomía estimada | X € | X € |
| Gastos varios (parking, vignette, etc.) | X € | X € |
| **TOTAL** | **X €** | **X €** |

**Reglas del presupuesto**:
- Los vuelos y el alojamiento son datos reales obtenidos en 3.2 — no estimar.
- El combustible se calcula a partir de los km totales del itinerario, el consumo medio del vehículo (~10 L/100 km) y el precio del combustible en el destino.
- La gastronomía se estima como media de menú del día × número de días × número de personas.
- Los gastos varios se detallan línea a línea (vignette, peajes, parking, propinas...).

---

## 3.4 Generación de index.html

Una vez obtenidos todos los datos reales:

1. Tomar el `draft.html` como base
2. Sustituir cada `<span class="draft-placeholder">...</span>` por el dato real, sin la clase ni el atributo `title`
3. Eliminar el bloque `.draft-banner` del HTML
4. Eliminar los estilos `.draft-placeholder` y `.draft-banner` del CSS
5. Actualizar la sección de presupuesto con el desglose definitivo de 3.3
6. Guardar como `index.html`

> El `draft.html` se conserva como referencia histórica del borrador.

---

## 3.5 Checklist de FASE 3

- [ ] Vuelo de ida: compañía, número, horario y precio reales obtenidos
- [ ] Vuelo de vuelta: compañía, número, horario y precio reales obtenidos
- [ ] Alojamiento de cada zona: nombre, precio/noche y URL de reserva
- [ ] Alquiler de vehículo: arrendadora, modelo y precio total
- [ ] Precios de actividades verificados y actualizados
- [ ] Presupuesto completo generado con desglose por concepto y por persona
- [ ] Todos los `draft-placeholder` reemplazados por datos reales
- [ ] Banner de borrador eliminado
- [ ] Estilos de borrador eliminados del CSS
- [ ] Fichero guardado como `index.html`
