#!/usr/bin/env python3
"""
Valida un draft.html de guía de viaje.
Uso: python3 docker/validate_draft.py Suiza/draft.html
"""
import sys
import re

if len(sys.argv) < 2:
    print("Uso: python3 docker/validate_draft.py <ruta/draft.html>")
    sys.exit(1)

path = sys.argv[1]
try:
    html = open(path).read()
except FileNotFoundError:
    print(f"  ERROR: {path} no encontrado")
    sys.exit(1)

errors = []
warnings = []

# Quitar <style> y <script> para evitar falsos positivos en regex
clean = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
clean = re.sub(r'<script[^>]*>.*?</script>', '', clean, flags=re.DOTALL)

# 1. Solo un bloque L.map() en todo el HTML (excluir comentarios HTML y JS)
html_no_comments = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
html_no_comments = re.sub(r'/\*.*?\*/', '', html_no_comments, flags=re.DOTALL)
html_no_comments = re.sub(r'//[^\n]*', '', html_no_comments)
lmap_count = html_no_comments.count('L.map(')
if lmap_count == 0:
    errors.append("No se encontró L.map() — mapa Leaflet no inicializado")
elif lmap_count > 1:
    errors.append(f"L.map() aparece {lmap_count} veces — posible doble inicialización del mapa")
else:
    print("  [OK] L.map() aparece exactamente 1 vez")

# 2. Leaflet CSS y JS cargados
if 'leaflet.css' not in html:
    errors.append("Leaflet CSS no cargado")
else:
    print("  [OK] Leaflet CSS presente")

if 'leaflet.js' not in html and 'leaflet-src.js' not in html:
    errors.append("Leaflet JS no cargado")
else:
    print("  [OK] Leaflet JS presente")

# 2b. Leaflet tags SIN integrity ni crossorigin (bloqueante en file://)
head = html[:html.find('</head>')] if '</head>' in html else html[:2000]
leaflet_tags = re.findall(r'<(?:link|script)[^>]*leaflet[^>]*>', head)
bad_tags = [t for t in leaflet_tags if 'integrity' in t or 'crossorigin' in t]
if bad_tags:
    errors.append(f"Tags Leaflet con integrity/crossorigin (rompe el mapa en file://): {bad_tags}")
else:
    print(f"  [OK] Tags Leaflet sin integrity/crossorigin ({len(leaflet_tags)} tags)")

# 3. #route-map existe
if 'id="route-map"' not in html and "id='route-map'" not in html:
    errors.append("Elemento #route-map no encontrado")
else:
    print("  [OK] #route-map presente")

# 4. accordion-thumb-wrap sin <img>
thumbs = re.findall(r'<div[^>]*class="[^"]*accordion-thumb-wrap[^"]*"[^>]*>(.*?)</div>', clean, re.DOTALL)
empty_thumbs = [i for i, t in enumerate(thumbs, 1) if '<img' not in t]
if empty_thumbs:
    errors.append(f"{len(empty_thumbs)} accordion-thumb-wrap sin <img>: índices {empty_thumbs}")
else:
    print(f"  [OK] {len(thumbs)} accordion-thumb-wrap con imagen")

# 5. accordion-img-wrap sin <img>
imgwraps = re.findall(r'<div[^>]*class="[^"]*accordion-img-wrap[^"]*"[^>]*>(.*?)</div>', clean, re.DOTALL)
empty_wraps = [i for i, t in enumerate(imgwraps, 1) if '<img' not in t]
if empty_wraps:
    warnings.append(f"{len(empty_wraps)} accordion-img-wrap sin <img> (índices: {empty_wraps})")
else:
    print(f"  [OK] {len(imgwraps)} accordion-img-wrap con imagen")

# 6. day-header-bg con URL de imagen
day_headers = re.findall(r'<div[^>]*class="[^"]*day-header[^"]*"[^>]*>', html)
day_headers_no_url = [h for h in day_headers if 'background' not in h and 'pexels' not in h.lower()]
if day_headers_no_url:
    warnings.append(f"{len(day_headers_no_url)} day-header sin imagen de fondo")
elif day_headers:
    print(f"  [OK] {len(day_headers)} day-header con imagen de fondo")

# Resultado
print()
if errors:
    print("  ERRORES:")
    for e in errors:
        print(f"    ✗ {e}")
if warnings:
    print("  AVISOS:")
    for w in warnings:
        print(f"    ⚠ {w}")
if not errors and not warnings:
    print("  ✓ Validación completa — sin errores ni avisos")
elif not errors:
    print("  ✓ Sin errores bloqueantes")

sys.exit(1 if errors else 0)
