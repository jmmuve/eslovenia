COLOR_RESET    = \033[0m
COLOR_INFO     = \033[32m
COLOR_HELP     = \033[1;34m
COLOR_BOLD     = \033[1m
COLOR_WARN     = \033[33m

PROJECT_NAME        = Viaje Eslovenia
PROJECT_DESCRIPTION = Guías de viaje generadas con IA

.DEFAULT_GOAL := help

##@ Helpers

.PHONY: help
help: ## Muestra esta ayuda
	@awk 'BEGIN {FS = ":.*##"; printf "${COLOR_HELP}${PROJECT_NAME}${COLOR_RESET}\n${PROJECT_DESCRIPTION}\n\nUsage:\n make ${COLOR_HELP}<target>${COLOR_RESET}\n"} /^[a-zA-Z0-9_-]+:.*##/ { printf " ${COLOR_HELP}%-32s${COLOR_RESET} %s\n", $$1, $$2 } /^##@/ { printf "\n${COLOR_BOLD}%s${COLOR_RESET}\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Caché — Gestión de datos cacheados

.PHONY: cache-status
cache-status: ## Muestra el estado de todos los ficheros de caché (TTL)
	@echo "${COLOR_INFO}Estado de caché (fecha hoy: $$(date +%Y-%m-%d)):${COLOR_RESET}"
	@echo ""
	@for f in _cache/**/*.md _cache/*.md; do \
		[ -f "$$f" ] || continue; \
		expires=$$(grep -m1 'expires:' "$$f" 2>/dev/null | grep -o '[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}'); \
		if [ -z "$$expires" ]; then \
			printf "  ${COLOR_BOLD}%-50s${COLOR_RESET} permanente\n" "$$f"; \
		elif [[ "$$(date +%Y-%m-%d)" > "$$expires" ]]; then \
			printf "  ${COLOR_WARN}%-50s CADUCADA (expiró: %s)${COLOR_RESET}\n" "$$f" "$$expires"; \
		else \
			printf "  ${COLOR_INFO}%-50s OK hasta %s${COLOR_RESET}\n" "$$f" "$$expires"; \
		fi; \
	done

.PHONY: cache-images
cache-images: ## Muestra el catálogo de imágenes (_images/catalog.yaml)
	@echo "${COLOR_INFO}Imágenes en catálogo:${COLOR_RESET}"
	@python3 -c "\
import yaml, os; \
data = yaml.safe_load(open('_images/catalog.yaml')); \
imgs = data.get('images', []); \
print(f'  Total: {len(imgs)} imágenes\n'); \
[print(f'  {i[\"id\"]:30s} {i[\"place\"][\"country_code\"]}  {i[\"place\"][\"name\"]}') for i in imgs]" \
	2>/dev/null || echo "${COLOR_WARN}  Instala pyyaml: pip3 install pyyaml${COLOR_RESET}"

##@ Guía de viaje

.PHONY: validate-draft
validate-draft: ## Valida draft.html (mapa Leaflet, imágenes, thumbs) — uso: make validate-draft DRAFT=Suiza/draft.html
	@DRAFT=$${DRAFT:-Suiza/draft.html}; \
	echo "${COLOR_INFO}Validando $$DRAFT...${COLOR_RESET}"; \
	python3 docker/validate_draft.py "$$DRAFT"

.PHONY: open-suiza
open-suiza: ## Abre Suiza/draft.html en el navegador
	@open Suiza/draft.html 2>/dev/null || xdg-open Suiza/draft.html

.PHONY: open-eslovenia
open-eslovenia: ## Abre Eslovenia/draft.html en el navegador
	@open Eslovenia/draft.html 2>/dev/null || xdg-open Eslovenia/draft.html

.PHONY: open-luxemburgo
open-luxemburgo: ## Abre Luxemburgo/draft.html en el navegador
	@open Luxemburgo/draft.html 2>/dev/null || xdg-open Luxemburgo/draft.html
