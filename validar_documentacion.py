#!/usr/bin/env python3
"""Valida presencia, secciones y enlaces locales de la documentación Arrullo.

Solo lectura: no crea, cambia ni elimina archivos.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent
REQUIRED = {
    "README.md": ["Protocolo operativo obligatorio", "Validación local", "Transferencia de trabajo"],
    "documentacion/INVENTARIO_MICROSERVICIOS.md": ["Registro", "Plantilla de servicio", "Estados y criterio"],
    "documentacion/INVENTARIO_FRONTEND.md": ["Componentes y superficies", "Requisitos frontend y cobertura", "Plantilla de componente frontend"],
    "documentacion/MATRIZ_INTEGRACION.md": ["Última actualización", "Matriz", "Lista de cierre reutilizable"],
    "documentacion/ERRORES_Y_SOLUCIONES.md": ["Registro actual", "Plantilla de error / solución", "Plantilla de prueba"],
    "documentacion/BITACORA_PROYECTO.md": ["Plantilla de entrada", "Mecanismo de seguimiento documental", "Decisión", "Cambio", "Pendiente"],
}
LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)]+)\)")
HEADING_RE = re.compile(r"^#{1,6}\s+(.+?)\s*#*\s*$", re.MULTILINE)


def slugify(heading: str) -> str:
    value = heading.strip().lower()
    value = re.sub(r"[`*_~]", "", value)
    value = re.sub(r"[^\w\- ]", "", value, flags=re.UNICODE)
    return re.sub(r"\s+", "-", value)


def main() -> int:
    problems: list[str] = []
    docs: dict[str, str] = {}
    for relative, headings in REQUIRED.items():
        path = ROOT / relative
        if not path.is_file():
            problems.append(f"Falta archivo requerido: {relative}")
            continue
        content = path.read_text(encoding="utf-8")
        docs[relative.replace("\\", "/")] = content
        for heading in headings:
            if heading.casefold() not in content.casefold():
                problems.append(f"Falta sección/contenido mínimo '{heading}' en {relative}")

    for relative, content in docs.items():
        source = ROOT / relative
        for target in LINK_RE.findall(content):
            target = target.strip().split()[0].strip("<>")
            if not target or target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            path_part, separator, fragment = target.partition("#")
            destination = (source.parent / unquote(path_part)).resolve() if path_part else source
            try:
                destination.relative_to(ROOT)
            except ValueError:
                problems.append(f"Enlace sale de la carpeta de integración: {relative} -> {target}")
                continue
            if not destination.exists():
                problems.append(f"Ruta interna inexistente: {relative} -> {target}")
                continue
            if separator and fragment and destination.is_file() and destination.suffix.lower() == ".md":
                linked_text = destination.read_text(encoding="utf-8")
                known_slugs = {slugify(h) for h in HEADING_RE.findall(linked_text)}
                if unquote(fragment).casefold() not in {s.casefold() for s in known_slugs}:
                    problems.append(f"Encabezado interno inexistente: {relative} -> {target}")

    if problems:
        print("VALIDACIÓN: ERROR")
        for problem in problems:
            print(f"- {problem}")
        return 1
    print(f"VALIDACIÓN: OK — {len(REQUIRED)} archivos, secciones mínimas y enlaces internos verificados.")
    print("Modo de solo lectura: no se modificó ningún archivo.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
