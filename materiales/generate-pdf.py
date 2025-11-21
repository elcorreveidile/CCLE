#!/usr/bin/env python3
"""
Script para generar PDFs bonitos desde archivos Markdown
Usa subprocess para llamar a playwright desde Node.js
"""

import os
import re
import sys
import subprocess
import tempfile
from pathlib import Path

# Plantilla HTML con estilos CSS incluidos
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
{css}
    </style>
</head>
<body>
{content}
</body>
</html>
"""

def markdown_to_html(markdown_text):
    """Convierte markdown a HTML con formato básico pero funcional"""
    html = markdown_text

    # Escapar caracteres HTML especiales primero
    # html = html.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

    # Headers (de mayor a menor para evitar conflictos)
    html = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)

    # Bold
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)

    # Italic
    html = re.sub(r'(?<!\*)\*(?!\*)([^*]+)\*(?!\*)', r'<em>\1</em>', html)

    # Lists - primero identificar items de lista
    html = re.sub(r'^- (.*?)$', r'<li>\1</li>', html, flags=re.MULTILINE)

    # Envolver listas consecutivas en <ul>
    lines = html.split('\n')
    in_list = False
    result = []

    for line in lines:
        if line.strip().startswith('<li>'):
            if not in_list:
                result.append('<ul>')
                in_list = True
            result.append(line)
        else:
            if in_list:
                result.append('</ul>')
                in_list = False
            result.append(line)

    if in_list:
        result.append('</ul>')

    html = '\n'.join(result)

    # Horizontal rules
    html = re.sub(r'^---$', '<hr>', html, flags=re.MULTILINE)

    # Párrafos - dividir por líneas vacías
    paragraphs = html.split('\n\n')
    processed = []

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # Si ya tiene una etiqueta HTML, no envolver en <p>
        if (para.startswith('<h') or para.startswith('<ul') or
            para.startswith('<ol') or para.startswith('<hr') or
            para.startswith('<div')):
            processed.append(para)
        else:
            # Reemplazar saltos de línea simples con <br>
            para = para.replace('\n', '<br>\n')
            if not para.startswith('<li>'):
                processed.append(f'<p>{para}</p>')
            else:
                processed.append(para)

    html = '\n\n'.join(processed)

    return html

def generate_html(markdown_file, css_file):
    """Genera HTML desde markdown con estilos CSS"""
    # Leer archivos
    with open(markdown_file, 'r', encoding='utf-8') as f:
        markdown_text = f.read()

    with open(css_file, 'r', encoding='utf-8') as f:
        css_text = f.read()

    # Convertir markdown a HTML
    html_content = markdown_to_html(markdown_text)

    # Obtener título del archivo
    title = Path(markdown_file).stem.replace('_', ' ').title()

    # Crear HTML completo
    full_html = HTML_TEMPLATE.format(
        title=title,
        css=css_text,
        content=html_content
    )

    return full_html

def html_to_pdf_playwright(html_content, output_pdf):
    """Convierte HTML a PDF usando Playwright vía Node.js"""
    # Crear un archivo temporal con el HTML
    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
        temp_html = f.name
        f.write(html_content)

    # Script de Node.js para generar PDF
    node_script = f"""
const {{ chromium }} = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');

(async () => {{
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const html = fs.readFileSync('{temp_html}', 'utf-8');
    await page.setContent(html, {{ waitUntil: 'networkidle' }});

    await page.pdf({{
        path: '{output_pdf}',
        format: 'A4',
        margin: {{
            top: '2cm',
            right: '2cm',
            bottom: '2cm',
            left: '2cm'
        }},
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
            <div style="font-size: 9pt; color: #999; width: 100%; text-align: right; padding-right: 1cm;">
                Curso Intensivo de Español - CILE
            </div>
        `,
        footerTemplate: `
            <div style="font-size: 9pt; color: #999; width: 100%; text-align: center;">
                Página <span class="pageNumber"></span> de <span class="totalPages"></span>
            </div>
        `
    }});

    await browser.close();
}})();
"""

    # Crear archivo temporal con el script de Node.js
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        temp_script = f.name
        f.write(node_script)

    try:
        # Ejecutar el script de Node.js
        result = subprocess.run(
            ['node', temp_script],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            print(f"❌ Error al generar PDF: {result.stderr}")
            return False

        return True

    finally:
        # Limpiar archivos temporales
        try:
            os.unlink(temp_html)
            os.unlink(temp_script)
        except:
            pass

def main():
    """Función principal"""
    script_dir = Path(__file__).parent
    pdf_dir = script_dir / 'pdfs'
    css_file = script_dir / 'pdf-style.css'

    # Crear carpeta para PDFs
    pdf_dir.mkdir(exist_ok=True)

    # Buscar archivos markdown
    md_files = sorted(script_dir.glob('*.md'))

    if not md_files:
        print("❌ No se encontraron archivos .md")
        return

    print(f"\n🚀 Generando PDFs para {len(md_files)} archivos...\n")

    success_count = 0

    for md_file in md_files:
        print(f"📄 Procesando: {md_file.name}")

        try:
            # Generar HTML
            html_content = generate_html(md_file, css_file)

            # Nombre del PDF de salida
            pdf_file = pdf_dir / f"{md_file.stem}.pdf"

            # Convertir a PDF
            if html_to_pdf_playwright(html_content, str(pdf_file)):
                print(f"✅ PDF generado: {pdf_file.name}")
                success_count += 1
            else:
                print(f"❌ Error al generar {pdf_file.name}")

        except Exception as e:
            print(f"❌ Error procesando {md_file.name}: {str(e)}")

    print(f"\n✨ ¡Proceso completado! {success_count}/{len(md_files)} PDFs generados\n")

if __name__ == '__main__':
    main()
