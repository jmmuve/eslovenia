# SPECS.md — Sistema de Generación de Guías de Viaje Web

> **Propósito**: Documento operativo completo para que Claude pueda generar desde cero una guía de viaje interactiva para cualquier destino. Define el pipeline de tres ficheros, los procesos de transformación de datos, las fuentes de información y la especificación técnica completa del HTML resultante.
>
> **Referencia de implementación**: El viaje a Eslovenia (julio 2026) es el caso base. Los ficheros resultantes son `datos-enriquecidos.md` e `index.html`.

---

## El Pipeline

```
datos-base.md
    │
    │  FASE 1: Investigación y enriquecimiento
    │  (Claude busca, expande y estructura los datos)
    ▼
datos-enriquecidos.md
    │
    │  FASE 2: Generación del HTML
    │  (Claude produce el index.html completo)
    ▼
index.html
```

Cada fase tiene entradas, procesos y salidas definidos. Este documento los especifica en detalle.

---

## Índice

- [FASE 0 — Crear datos-base.md](#fase-0--crear-datos-basemd)
- [FASE 1 — datos-base.md → datos-enriquecidos.md](#fase-1--datos-basemd--datos-enriquecidosmd)
  - [1.1 Proceso general de enriquecimiento](#11-proceso-general-de-enriquecimiento)
  - [1.2 Fuentes de información por tipo de dato](#12-fuentes-de-información-por-tipo-de-dato)
  - [1.3 Schema del fichero enriquecido](#13-schema-del-fichero-enriquecido)
  - [1.4 Transformaciones sección a sección](#14-transformaciones-sección-a-sección)
- [FASE 2 — datos-enriquecidos.md → index.html](#fase-2--datos-enriquecidosmd--indexhtml)
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

# FASE 0 — Crear `datos-base.md`

`datos-base.md` es el fichero de entrada mínimo. Contiene solo los datos que el usuario conoce de antemano. Claude lo usa como punto de partida para la Fase 1.

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
   → Buscar en Pexels una foto panorámica del destino general
   → Anotar el ID

PASO 4 — Para cada DÍA del itinerario, en orden cronológico:
   4a. Imagen del día (Pexels ID para el header de la sección)
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

> Todas las instrucciones de esta sección son genéricas y aplicables a cualquier destino. Sustituir `[Lugar]`, `[Ciudad]`, `[País]` por los valores reales del viaje.

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

| Fuente | URL | Qué buscar |
|---|---|---|
| Wikipedia ES/EN | `https://es.wikipedia.org/wiki/[País]` | Capital, moneda, idioma oficial, superficie, población |
| Lonely Planet | `https://www.lonelyplanet.com/[pais]` → sección "Practical information" | Visados, electricidad, moneda, costumbres |
| Web de turismo oficial | Buscar como se indica arriba | Información de entrada, recomendaciones oficiales |
| Web de autopistas del país | Buscar `[país] vignette` o `[país] autopista peaje` | Peajes, vinjetas, coste y cómo comprarlas |
| Ministerio de Exteriores ES | `https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-de-pais.aspx?IdPais=[código]` | Seguridad, emergencias, recomendaciones de viaje para españoles |
| WikiTravel | `https://wikitravel.org/es/[País]` | Costumbres locales, propinas, transporte, consejos prácticos |

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

| Fuente | URL | Uso |
|---|---|---|
| Wikipedia ES | `https://es.wikipedia.org/wiki/[Lugar]` | Historia, datos básicos, fechas de fundación, contexto |
| Wikipedia EN | `https://en.wikipedia.org/wiki/[Place]` | Más detallado; usar cuando el artículo en español es escaso |
| Lonely Planet | `https://www.lonelyplanet.com/` + país + lugar | Descripciones narrativas, por qué vale la pena visitar |
| TripAdvisor | `https://www.tripadvisor.es/Tourism-[código]-[Ciudad].html` | Qué ver según viajeros reales, valoraciones |
| Web de turismo oficial | (encontrada en paso de "Datos del país") | Descripción oficial del lugar |
| Blogs de viaje | Buscar `[lugar] guía visita qué ver` en Google | Datos locales, consejos prácticos, itinerarios reales |

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

| Fuente | URL | Uso |
|---|---|---|
| TripAdvisor Atracciones | `https://www.tripadvisor.es/Attractions-[código]-[Ciudad].html` | Lista ordenada por popularidad con fotos y valoraciones |
| Google Maps | Buscar el lugar → panel lateral "Lugares populares" | Mapa con clustering de puntos de interés |
| Lonely Planet | `https://www.lonelyplanet.com/` + ruta al lugar → "Sights" | Descripción editorial profesional |
| Wikipedia | Artículo del lugar → sección "Monumentos y lugares de interés" | Lista exhaustiva con historia de cada punto |
| GetYourGuide | `https://www.getyourguide.es/[ciudad]-l[id]/` | Actividades con descripción detallada y tiempo estimado |
| Civitatis | `https://www.civitatis.com/es/[ciudad]/` | Excursiones y actividades; útil para entender qué combina bien |

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

| Fuente | URL | Qué buscar |
|---|---|---|
| Web oficial del lugar | (buscar en Google `[nombre] official tickets`) | Precios oficiales, horarios, cómo reservar |
| GetYourGuide | `https://www.getyourguide.es/` + lugar | Precios de entrada + tours; fiable y actualizado |
| Civitatis | `https://www.civitatis.com/es/[ciudad]/` | Alternativa a GetYourGuide, muchas veces con entradas directas |
| TripAdvisor | Ficha del lugar → pestaña "Info" | Precios y horarios reportados por viajeros (contrastar) |
| Google Maps | Ficha del lugar → "Horario de apertura" | Horarios actualizados por el propio establecimiento |
| Musement | `https://www.musement.com/es/` | Entradas con fecha para museos y monumentos populares |

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

| Fuente | URL | Qué buscar |
|---|---|---|
| Climate-data.org | `https://es.climate-data.org/europa/[pais]/[ciudad]/` | Temperatura media, máx/mín por mes, precipitaciones mm |
| WeatherSpark | `https://es.weatherspark.com/` + ciudad | Gráficas interactivas de temperatura, lluvia, horas de sol |
| Wikipedia | `https://es.wikipedia.org/wiki/[Ciudad]` → sección Clima | Tabla de datos climáticos mensuales |
| Meteoblue | `https://www.meteoblue.com/es/tiempo/historyclimate/climatemodelled/[ciudad]` | Histórico climático detallado |
| AEMET equivalente local | Buscar `[país] servicio meteorológico nacional` | Datos oficiales del país |

**Datos a extraer por zona**:
- Temperatura media, máxima y mínima en el mes del viaje
- Precipitación mensual media en mm
- Número de días de lluvia esperados
- Descripción de condiciones (soleado, variable, posibles tormentas de tarde en montaña, etc.)
- Consejo de ropa o equipo (ej. "llevar impermeable ligero para las tardes en los Alpes")

---

### 🖼️ Imágenes (IDs de Pexels)

**Cuándo**: Una vez recopilados todos los lugares, buscar una imagen por lugar y una imagen hero general.

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

4. **Verificar el ID obtenido** construyendo la URL de producción y comprobando que es coherente:
   ```
   https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop
   ```
   Si el ID es válido, esta URL devuelve una imagen JPEG. Si falla, intentar con el siguiente ID encontrado.

5. **Si no hay fotos del lugar exacto**, buscar por términos más generales en este orden: nombre de la región → nombre del país → tipo de paisaje (mountain lake, alpine village, mediterranean coast...).

6. **Último recurso**: usar gradiente CSS como fallback — no inventar un ID que no se ha verificado.

**Formato de URL de producción**:
```
https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w={W}&h={H}&fit=crop
```

**Tamaños necesarios por uso**:
| Uso | Ancho (w) | Alto (h) |
|---|---|---|
| Hero (imagen principal de la página) | 1920 | 1080 |
| OG Image (meta tag para redes sociales) | 1200 | 630 |
| Header de día (cabecera de sección) | 1200 | 400 |
| Imagen grande en acordeón | 800 | 450 |
| Thumbnail del acordeón | 160 | 160 |
| Sección viajeros (fondo) | 1200 | 600 |

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

**Formato de URL de Google Maps** (para usar en el HTML):
```
https://maps.google.com/?q=[nombre+del+lugar],[País]
```
- Usar `+` para los espacios
- Para direcciones exactas: `https://maps.google.com/?q=[Calle+Número],[Ciudad],[País]`
- Para coordenadas directas: `https://maps.google.com/?q=[lat],[lng]`

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

| Fuente | URL | Uso |
|---|---|---|
| TripAdvisor | `https://www.tripadvisor.es/Restaurants-[código]-[Ciudad].html` | Lista con valoraciones, precios y fotos |
| Google Maps | Buscar `restaurantes [ciudad]` | Horarios actualizados, menú, valoraciones recientes |
| Guía Michelin | `https://guide.michelin.com/es/es/restaurants` → filtrar por ciudad | Estrellas Michelin y Bib Gourmand (relación calidad/precio) |
| TheFork | `https://www.thefork.es/restaurantes/[ciudad]` | Reservas online, menús con precios |
| Eater / Time Out | Buscar `best restaurants [city] [year]` en Google | Artículos editoriales con selecciones curadas |

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

| Fuente | URL | Uso |
|---|---|---|
| Google Maps | Buscar `parking [ciudad]` | Ubicación, precio aproximado, horario |
| ParkMe | `https://www.parkme.com` | Precios en tiempo real, mapa de disponibilidad |
| EasyPark | `https://www.easypark.es` | Verificar cobertura de la app en esa ciudad/país |
| Ayuntamiento local | Buscar `aparcamiento [ciudad] ayuntamiento` | Parkings municipales con precios oficiales |
| Foros TripAdvisor | `https://www.tripadvisor.es/ShowForum-[código].html` | Consejos reales de viajeros sobre dónde aparcar |
| Reddit | Buscar `r/travel [city] parking` o `r/[país] parking` | Experiencias recientes de viajeros |

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

| Fuente | URL | Uso |
|---|---|---|
| Airbnb | `https://www.airbnb.es/s/[Ciudad]/homes` | Apartamentos y casas enteras, ideal para grupos |
| Booking.com | `https://www.booking.com/searchresults.es.html?ss=[Ciudad]` | Amplia oferta, filtros de grupo, cancelación gratis |
| Google Hotels | Buscar `hoteles [ciudad] [fechas]` en Google | Comparador de precios en tiempo real |
| VRBO / HomeAway | `https://www.vrbo.com/es-es/` | Casas de alquiler vacacional para grupos grandes |
| TripAdvisor Alojamientos | `https://www.tripadvisor.es/Hotels-[código]-[Ciudad].html` | Valoraciones detalladas de viajeros reales |

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

| Fuente | URL | Uso |
|---|---|---|
| Google Maps | `https://maps.google.com` → Cómo llegar | Distancia en km, tiempo estimado, ruta alternativa |
| Rome2Rio | `https://www.rome2rio.com` | Comparativa de todos los medios de transporte disponibles |
| Viamichelin | `https://www.viamichelin.es` | Cálculo de ruta con coste de peajes incluido |
| Komoot | `https://www.komoot.com` | Para tramos de senderismo o rutas en bicicleta |

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

**Imágenes**
- [ ] ID de Pexels para la imagen hero general
- [ ] ID de Pexels para el header de cada día
- [ ] IDs verificados (la URL de producción carga correctamente)

**Resumen final**
- [ ] Tabla de km totales con todos los tramos
- [ ] Tabla de coordenadas GPS de todos los puntos
- [ ] Sección de gastronomía general del destino
- [ ] Consejos para grupos
- [ ] Notas importantes y advertencias

> Si algún punto no está cubierto, completarlo antes de iniciar FASE 2. Un HTML generado con datos incompletos produce secciones vacías difíciles de corregir a posteriori.

---

---

# FASE 2 — `datos-enriquecidos.md` → `index.html`

La Fase 2 genera el HTML completo a partir del fichero de datos enriquecido. El resultado es un único `index.html` autocontenido, visual y funcional.

---

## 2.1 Stack técnico

| Elemento | Valor |
|---|---|
| Archivo de salida | Un único `index.html` con CSS y JS embebidos |
| Dependencias externas | Google Fonts (Inter + Playfair Display) + Leaflet.js 1.9.4 |
| Leaflet CSS | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css` integrity=`sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=` |
| Leaflet JS | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` integrity=`sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=` |
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

```html
<html lang="es">
<head>
  <!-- Meta tags + OG tags -->
  <!-- Google Fonts -->
  <!-- Leaflet CSS -->
  <!-- Leaflet JS -->
  <!-- <style> con TODO el CSS -->
</head>
<body>
  <header id="hero">                   <!-- Hero full viewport -->
  <section class="travelers-section">  <!-- Viajeros con avatares -->
  <div class="flights-section">        <!-- Boarding passes vuelos -->
  <nav id="main-nav">                  <!-- Navegación sticky -->
  <main>
    <section id="info">                <!-- Info General (4 acordeones) -->
    <section id="mapa-ruta">           <!-- Mapa Leaflet interactivo -->
    <section id="dia-1">               <!-- Día 1 -->
    <section id="dia-2">               <!-- Día 2 -->
    ...
    <section id="dia-N">               <!-- Día N -->
    <section id="km">                  <!-- Resumen kilómetros -->
    <section id="gastro">              <!-- Gastronomía general -->
  </main>
  <footer>
  <script>  <!-- TODO el JS -->
</body>
```

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

### Paso 1 — Preparar los datos
- [ ] Leer `datos-enriquecidos.md` completo
- [ ] Identificar número de días, lugares por día y zonas gastronómicas
- [ ] Verificar que todos los IDs de Pexels cargan con el formato de URL indicado
- [ ] Verificar que todas las coordenadas GPS son correctas

### Paso 2 — Estructura HTML y CSS
- [ ] Escribir el `<head>` completo con meta tags, OG tags y Google Fonts
- [ ] Incluir Leaflet CSS y JS con los integrity hashes
- [ ] Escribir TODO el CSS en un único bloque `<style>` antes del body
- [ ] Variables CSS `:root` con la paleta adaptada al destino

### Paso 3 — Secciones estáticas
- [ ] Hero con imagen Pexels correcta y parallax
- [ ] Sección viajeros con avatares de colores rotativos
- [ ] Boarding passes con datos de vuelo IDA y VUELTA
- [ ] Nav sticky con todos los botones (Info + Mapa + N días + Km + Gastronomía)
- [ ] Info General (4 acordeones): vehículo, alojamientos, consejos, país

### Paso 4 — Mapa Leaflet
- [ ] Inicializar mapa con centro y zoom correctos
- [ ] Añadir todos los puntos GPS con colores por día y popups
- [ ] Polylines de ruta por día (color sólido, dashArray '8 6')
- [ ] Polylines de traslado entre días (gris, dashArray '4 8')
- [ ] `fitBounds` sobre todos los puntos
- [ ] Leyenda del mapa con colores y nombres de día

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
