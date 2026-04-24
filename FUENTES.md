# FUENTES.md — Fuentes de Datos e Imágenes

> Catálogo de fuentes externas utilizadas en el pipeline de generación de guías de viaje.
> Referenciado desde `SPECS.md`. Actualizar este fichero cuando se descubran fuentes nuevas o mejores.
>
> **Convención de URLs**: usar `[Variable]` para los fragmentos que cambian por destino.

---

## Índice

- [Información general del país](#información-general-del-país)
- [Historia e información turística](#historia-e-información-turística)
- [Qué ver y hacer](#qué-ver-y-hacer)
- [Entradas, precios y horarios](#entradas-precios-y-horarios)
- [Clima](#clima)
- [Imágenes](#imágenes)
- [Coordenadas GPS y mapas](#coordenadas-gps-y-mapas)
- [Gastronomía y restaurantes](#gastronomía-y-restaurantes)
- [Parkings](#parkings)
- [Alojamientos](#alojamientos)
- [Distancias y conducción](#distancias-y-conducción)
- [Vuelos](#vuelos)
- [Alquiler de vehículo](#alquiler-de-vehículo)

---

## Información general del país

| Fuente | URL patrón | Qué buscar |
|---|---|---|
| Wikipedia ES | `https://es.wikipedia.org/wiki/[País]` | Capital, moneda, idioma, superficie, población |
| Lonely Planet | `https://www.lonelyplanet.com/[pais]` → "Practical information" | Visados, electricidad, moneda, costumbres |
| Web de turismo oficial | Buscar `"turismo oficial" [país]` o `visit[país].com` | Información de entrada, recomendaciones oficiales |
| Autopistas / vignette | Buscar `[país] vignette autopista peaje` | Peajes, vinjetas, coste y cómo comprarlas |
| Ministerio de Exteriores ES | `https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-de-pais.aspx?IdPais=[código]` | Seguridad, emergencias, recomendaciones para españoles |
| WikiTravel | `https://wikitravel.org/es/[País]` | Costumbres locales, propinas, transporte, consejos prácticos |

---

## Historia e información turística

| Fuente | URL patrón | Uso |
|---|---|---|
| Wikipedia ES | `https://es.wikipedia.org/wiki/[Lugar]` | Historia, datos básicos, fechas de fundación, contexto |
| Wikipedia EN | `https://en.wikipedia.org/wiki/[Place]` | Más detallado; usar cuando el artículo en español es escaso |
| Lonely Planet | `https://www.lonelyplanet.com/[pais]/[region]/[lugar]` | Descripciones narrativas orientadas al viajero |
| TripAdvisor | `https://www.tripadvisor.es/Tourism-[código]-[Ciudad].html` | Qué ver según viajeros reales, valoraciones |
| Web turismo oficial | (encontrada en "Información general del país") | Descripción oficial del lugar |
| Blogs de viaje | Buscar `[lugar] guía visita qué ver` en Google | Datos locales, consejos prácticos, itinerarios reales |

---

## Qué ver y hacer

| Fuente | URL patrón | Uso |
|---|---|---|
| TripAdvisor Atracciones | `https://www.tripadvisor.es/Attractions-[código]-[Ciudad].html` | Lista ordenada por popularidad con fotos y valoraciones |
| Google Maps | Buscar el lugar → panel lateral "Lugares populares" | Clustering de puntos de interés |
| Lonely Planet | `https://www.lonelyplanet.com/[pais]/[lugar]` → "Sights" | Descripción editorial profesional |
| Wikipedia | Artículo del lugar → sección "Monumentos y lugares de interés" | Lista exhaustiva con historia de cada punto |
| GetYourGuide | `https://www.getyourguide.es/[ciudad]-l[id]/` | Actividades con descripción detallada y tiempo estimado |
| Civitatis | `https://www.civitatis.com/es/[ciudad]/` | Excursiones y actividades; útil para ver qué combina bien |

---

## Entradas, precios y horarios

| Fuente | URL patrón | Qué buscar |
|---|---|---|
| Web oficial del lugar | Buscar `[nombre] official tickets` en Google | Precios oficiales, horarios, cómo reservar |
| GetYourGuide | `https://www.getyourguide.es/` + lugar | Precios de entrada + tours; fiable y actualizado |
| Civitatis | `https://www.civitatis.com/es/[ciudad]/` | Entradas directas y tours alternativos |
| TripAdvisor | Ficha del lugar → pestaña "Info" | Precios y horarios reportados por viajeros (contrastar) |
| Google Maps | Ficha del lugar → "Horario de apertura" | Horarios actualizados por el propio establecimiento |
| Musement | `https://www.musement.com/es/` | Entradas con fecha para museos y monumentos populares |

---

## Clima

| Fuente | URL patrón | Qué buscar |
|---|---|---|
| Climate-data.org | `https://es.climate-data.org/europa/[pais]/[ciudad]/` | Temperatura media, máx/mín por mes, precipitaciones mm |
| WeatherSpark | `https://es.weatherspark.com/` + ciudad | Gráficas de temperatura, lluvia, horas de sol |
| Wikipedia | `https://es.wikipedia.org/wiki/[Ciudad]` → sección Clima | Tabla de datos climáticos mensuales |
| Meteoblue | `https://www.meteoblue.com/es/tiempo/historyclimate/climatemodelled/[ciudad]` | Histórico climático detallado |
| Servicio meteorológico nacional | Buscar `[país] servicio meteorológico nacional` | Datos oficiales del país |

---

## Imágenes

### Pexels (fuente principal)

| Concepto | Detalle |
|---|---|
| Búsqueda | `https://www.pexels.com/search/[lugar en inglés]/` |
| URL de producción | `https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?auto=compress&cs=tinysrgb&w=[W]&h=[H]&fit=crop` |
| Alternativa si falla | `WebSearch("pexels [lugar en inglés] landscape photo site:pexels.com")` |
| Fallback CSS | `linear-gradient(135deg, var(--primary), var(--turquoise))` |

**Tamaños estándar por uso**:

| Uso | Ancho (w) | Alto (h) |
|---|---|---|
| Hero (imagen principal de la página) | 1920 | 1080 |
| OG Image (meta tag redes sociales) | 1200 | 630 |
| Header de día (cabecera de sección) | 1200 | 400 |
| Imagen grande en acordeón | 800 | 450 |
| Thumbnail del acordeón | 160 | 160 |
| Sección viajeros (fondo) | 1200 | 600 |

### Fuentes alternativas de imágenes

| Fuente | URL | Notas |
|---|---|---|
| Unsplash | `https://unsplash.com/s/photos/[lugar]` | Alta calidad, licencia libre |
| Wikimedia Commons | `https://commons.wikimedia.org/w/index.php?search=[lugar]` | Imágenes históricas y de monumentos |
| Pixabay | `https://pixabay.com/images/search/[lugar]/` | Alternativa libre |

---

## Coordenadas GPS y mapas

| Fuente | URL patrón | Uso |
|---|---|---|
| Conocimiento propio | — | Lugares muy conocidos (precisión ≥ 4 decimales, verificar que tiene sentido geográfico) |
| Wikipedia | `https://es.wikipedia.org/wiki/[Lugar]` → infobox `{{coord}}` | Coordenadas en la infobox del artículo |
| WebSearch | `"coordenadas GPS [lugar] [país] latitud longitud"` | Cuando Wikipedia no tiene el dato |
| coordinates.org | `https://coordinates.org` | Búsqueda directa de coordenadas |
| Mapcarta | `https://mapcarta.com` | Coordenadas de lugares con menor cobertura en Wikipedia |

**Formato URL Google Maps**:
```
# Por nombre
https://maps.google.com/?q=[nombre+del+lugar],[País]

# Por coordenadas
https://maps.google.com/?q=[lat],[lng]

# Por dirección
https://maps.google.com/?q=[Calle+Número],[Ciudad],[País]
```

---

## Gastronomía y restaurantes

### Platos típicos

| Fuente | URL patrón | Uso |
|---|---|---|
| Wikipedia | `https://es.wikipedia.org/wiki/Gastronomía_de_[País]` | Lista de platos, bebidas y postres típicos |
| Lonely Planet | `https://www.lonelyplanet.com/[pais]` → "Food & Drink" | Selección editorial curada |
| Blogs de viaje | Buscar `gastronomía típica [región] qué comer` en Google | Perspectiva de viajeros |

### Restaurantes

| Fuente | URL patrón | Uso |
|---|---|---|
| TripAdvisor | `https://www.tripadvisor.es/Restaurants-[código]-[Ciudad].html` | Lista por valoración, precios y fotos |
| Google Maps | Buscar `restaurantes [ciudad]` | Horarios actualizados, menú, valoraciones recientes |
| Guía Michelin | `https://guide.michelin.com/es/es/restaurants` → filtrar por ciudad | Estrellas Michelin y Bib Gourmand |
| TheFork | `https://www.thefork.es/restaurantes/[ciudad]` | Reservas online, menús con precios |
| Eater / Time Out | Buscar `best restaurants [city] [año]` en Google | Artículos editoriales con selecciones curadas |

---

## Parkings

| Fuente | URL patrón | Uso |
|---|---|---|
| Google Maps | Buscar `parking [ciudad o lugar]` | Ubicación, precio aproximado, horario |
| ParkMe | `https://www.parkme.com` | Precios, disponibilidad, mapa |
| EasyPark | `https://www.easypark.es` | Verificar cobertura de la app en ese país/ciudad |
| Ayuntamiento local | Buscar `aparcamiento [ciudad] ayuntamiento` | Parkings municipales con precios oficiales |
| TripAdvisor Foros | `https://www.tripadvisor.es/ShowForum-[código].html` | Consejos reales de viajeros |
| Reddit | Buscar `r/travel [city] parking` o `r/[país] parking` | Experiencias recientes de viajeros |

> **Nota para furgonetas**: verificar siempre la altura máxima de parkings cubiertos (habitual: 1,9–2,1 m). Buscar plazas XXL o parkings de superficie cuando sea posible.

---

## Alojamientos

| Fuente | URL patrón | Uso |
|---|---|---|
| Airbnb | `https://www.airbnb.es/s/[Ciudad]/homes?adults=[N]` | Apartamentos y casas enteras, ideal para grupos |
| Booking.com | `https://www.booking.com/searchresults.es.html?ss=[Ciudad]&group_adults=[N]` | Amplia oferta, filtros de grupo, cancelación gratis |
| Google Hotels | Buscar `hoteles [ciudad] [fechas]` en Google | Comparador de precios en tiempo real |
| VRBO / HomeAway | `https://www.vrbo.com/es-es/` | Casas de alquiler vacacional para grupos grandes |
| TripAdvisor Alojamientos | `https://www.tripadvisor.es/Hotels-[código]-[Ciudad].html` | Valoraciones detalladas de viajeros reales |

---

## Distancias y conducción

| Fuente | URL patrón | Uso |
|---|---|---|
| Google Maps (WebSearch) | Buscar `distancia [origen] a [destino] en coche` | Devuelve km y tiempo en el snippet de Google |
| Google Maps (URL directa) | `https://www.google.com/maps/dir/[origen]/[destino]/` | Ruta completa con alternativas |
| Rome2Rio | `https://www.rome2rio.com/es/map/[origen]/[destino]` | Múltiples opciones de transporte con tiempos |

> Para furgonetas de 9 plazas, añadir un 10–15 % al tiempo estimado en carreteras de montaña y un 20–30 % al tiempo de visitas por gestión de grupo.

---

## Vuelos

> Usadas principalmente en **FASE 3** para sustituir datos inventados por datos reales.

| Fuente | URL patrón | Uso |
|---|---|---|
| Google Flights | `https://www.google.com/flights` | Comparador de precios con filtros de escala, horario y aerolínea |
| Skyscanner | `https://www.skyscanner.es/vuelos/[MAD]/[DST]/[YYMMDD]/` | Comparador con alertas de precio |
| Kayak | `https://www.kayak.es/flights/[MAD]-[DST]/[fecha-ida]/[fecha-vuelta]` | Alternativa con filtros de paradas y horario |
| Web aerolínea | Directa según aerolínea seleccionada | Precio oficial, bagaje incluido, condiciones |
| ITA Matrix | `https://matrix.itasoftware.com` | Búsqueda avanzada de combinaciones de vuelo |

---

## Alquiler de vehículo

> Usadas principalmente en **FASE 3** para sustituir datos inventados por datos reales.

| Fuente | URL patrón | Uso |
|---|---|---|
| Rentalcars | `https://www.rentalcars.com` | Comparador de arrendadoras con filtros de tipo de vehículo |
| AutoEurope | `https://www.autoeurope.es` | Especializado en Europa, buenos precios para furgonetas |
| Kayak Coches | `https://www.kayak.es/cars` | Comparador adicional |
| Discovercars | `https://www.discovercars.com/es` | Buena cobertura de aeropuertos europeos |
| Web de la arrendadora | Directa (Hertz, Avis, Enterprise, Europcar...) | Precio oficial, condiciones de seguro, conductor adicional |

> Para furgonetas de 9 plazas: verificar que el modelo admite equipaje para el número de viajeros y confirmar política de conductor adicional (suele tener coste extra).
