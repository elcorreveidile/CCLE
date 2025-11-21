# Materiales del Curso Intensivo de Español - CILE

Este directorio contiene los materiales didácticos para el Curso Intensivo de Español, organizados por semanas.

## Estructura de Archivos

```
materiales/
├── semana1.md              # Material de la Semana 1 (Markdown)
├── semana2.md              # Material de la Semana 2 (Markdown)
├── semana3.md              # Material de la Semana 3 (Markdown)
├── semana4.md              # Material de la Semana 4 (Markdown)
├── pdf-style.css           # Estilos CSS para los PDFs
├── pdfs/                   # PDFs generados con formato profesional
│   ├── semana1.pdf
│   ├── semana2.pdf
│   ├── semana3.pdf
│   └── semana4.pdf
├── html/                   # Archivos HTML intermedios
└── scripts de conversión   # Scripts para generar PDFs
```

## Características de los PDFs

Los PDFs generados incluyen:

✅ **Formato profesional** con tipografía clara y legible
✅ **Diseño limpio** con jerarquía visual bien definida
✅ **Colores apropiados** para destacar secciones importantes
✅ **Encabezados** con el nombre del curso
✅ **Numeración de páginas** automática
✅ **Espaciado óptimo** para lectura e impresión
✅ **Estilos diferenciados** para:
   - Encabezados (H1-H4)
   - Listas y puntos
   - Ejemplos y diálogos
   - Ejercicios
   - Vocabulario

## Cómo Generar los PDFs

### Requisitos

- Python 3.x
- WeasyPrint (para conversión HTML a PDF)

### Instalación de Dependencias

```bash
pip3 install weasyprint
```

### Generación de PDFs

Para regenerar los PDFs desde los archivos Markdown:

```bash
# 1. Generar archivos HTML desde Markdown
python3 generate-html.py

# 2. Convertir HTML a PDF
python3 convert-to-pdf.py
```

Esto creará:
1. Archivos HTML en la carpeta `html/`
2. Archivos PDF en la carpeta `pdfs/`

### Generación Individual

Si solo quieres generar un PDF específico, puedes modificar los scripts o usar:

```bash
python3 convert-to-pdf.py
```

## Modificar el Formato

### Cambiar Estilos CSS

Edita el archivo `pdf-style.css` para personalizar:

- Colores de encabezados
- Tamaños de fuente
- Márgenes y espaciado
- Bordes y decoraciones
- Estilos de listas

Después de modificar el CSS, regenera los PDFs ejecutando los scripts de conversión.

### Editar Contenido

1. Edita los archivos `.md` (semana1.md, semana2.md, etc.)
2. Ejecuta `python3 generate-html.py`
3. Ejecuta `python3 convert-to-pdf.py`

## Scripts Disponibles

### generate-html.py
Convierte archivos Markdown a HTML con estilos CSS embebidos.

### convert-to-pdf.py
Convierte archivos HTML a PDF usando WeasyPrint.

### generate-pdf.py (legacy)
Script anterior que intentaba usar Playwright (puede tener problemas de dependencias).

## Notas Técnicas

- **Motor de PDF**: WeasyPrint
- **Formato de página**: A4
- **Márgenes**: 2cm en todos los lados
- **Codificación**: UTF-8
- **Fuentes**: Georgia (principal), Times New Roman (respaldo)

## Solución de Problemas

### Error: "No se encontraron archivos .md"
Asegúrate de estar en el directorio `materiales/` cuando ejecutes los scripts.

### Error: "Module 'weasyprint' not found"
Instala WeasyPrint con: `pip3 install weasyprint`

### Los PDFs se ven mal
1. Verifica que `pdf-style.css` existe y está completo
2. Regenera primero los HTML: `python3 generate-html.py`
3. Luego convierte a PDF: `python3 convert-to-pdf.py`

## Contacto y Soporte

Para problemas o sugerencias sobre los materiales, contacta al equipo de CILE.

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0
