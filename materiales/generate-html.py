#!/usr/bin/env python3
"""
Script para generar archivos HTML bonitos desde archivos Markdown
Estos pueden ser abiertos en un navegador y guardados como PDF
"""

import os
import re
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
    <script>
        // Función para imprimir/guardar como PDF
        function printPDF() {{
            window.print();
        }}
    </script>
</head>
<body>
    <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
        <button onclick="printPDF()" style="
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        ">
            📄 Guardar como PDF
        </button>
    </div>

    <div class="content">
{content}
    </div>
</body>
</html>
"""

def markdown_to_html(markdown_text):
    """Convierte markdown a HTML con formato mejorado"""
    lines = markdown_text.split('\n')
    html_lines = []
    in_list = False
    in_paragraph = False

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Headers
        if stripped.startswith('#### '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_paragraph:
                html_lines.append('</p>')
                in_paragraph = False
            html_lines.append(f'<h4>{stripped[5:]}</h4>')

        elif stripped.startswith('### '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_paragraph:
                html_lines.append('</p>')
                in_paragraph = False
            html_lines.append(f'<h3>{stripped[4:]}</h3>')

        elif stripped.startswith('## '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_paragraph:
                html_lines.append('</p>')
                in_paragraph = False
            html_lines.append(f'<h2>{stripped[3:]}</h2>')

        elif stripped.startswith('# '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_paragraph:
                html_lines.append('</p>')
                in_paragraph = False
            html_lines.append(f'<h1>{stripped[2:]}</h1>')

        # Lists
        elif stripped.startswith('- '):
            if in_paragraph:
                html_lines.append('</p>')
                in_paragraph = False
            if not in_list:
                html_lines.append('<ul>')
                in_list = True
            content = stripped[2:]
            # Procesar bold e italic en el contenido
            content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
            content = re.sub(r'(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)', r'<em>\1</em>', content)
            html_lines.append(f'<li>{content}</li>')

        # Horizontal rule
        elif stripped == '---':
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_paragraph:
                html_lines.append('</p>')
                in_paragraph = False
            html_lines.append('<hr>')

        # Empty line
        elif not stripped:
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            if in_paragraph:
                html_lines.append('</p>')
                in_paragraph = False

        # Regular text
        else:
            if in_list:
                html_lines.append('</ul>')
                in_list = False

            # Procesar bold e italic
            content = stripped
            content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
            content = re.sub(r'(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)', r'<em>\1</em>', content)

            if not in_paragraph:
                html_lines.append(f'<p>{content}')
                in_paragraph = True
            else:
                html_lines.append(f'<br>{content}')

    # Cerrar tags abiertas
    if in_list:
        html_lines.append('</ul>')
    if in_paragraph:
        html_lines.append('</p>')

    return '\n'.join(html_lines)

def generate_html_file(markdown_file, css_file, output_dir):
    """Genera archivo HTML desde markdown con estilos CSS"""
    # Leer archivos
    with open(markdown_file, 'r', encoding='utf-8') as f:
        markdown_text = f.read()

    with open(css_file, 'r', encoding='utf-8') as f:
        css_text = f.read()

    # Convertir markdown a HTML
    html_content = markdown_to_html(markdown_text)

    # Obtener título del archivo
    title = Path(markdown_file).stem.replace('_', ' ').replace('semana', 'Semana ')

    # Crear HTML completo
    full_html = HTML_TEMPLATE.format(
        title=title,
        css=css_text,
        content=html_content
    )

    # Guardar archivo HTML
    output_file = output_dir / f"{Path(markdown_file).stem}.html"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(full_html)

    return output_file

def main():
    """Función principal"""
    script_dir = Path(__file__).parent
    html_dir = script_dir / 'html'
    css_file = script_dir / 'pdf-style.css'

    # Crear carpeta para HTMLs
    html_dir.mkdir(exist_ok=True)

    # Buscar archivos markdown
    md_files = sorted(script_dir.glob('semana*.md'))

    if not md_files:
        print("❌ No se encontraron archivos .md")
        return

    print(f"\n🚀 Generando archivos HTML para {len(md_files)} archivos...\n")

    success_count = 0

    for md_file in md_files:
        print(f"📄 Procesando: {md_file.name}")

        try:
            # Generar HTML
            output_file = generate_html_file(md_file, css_file, html_dir)
            print(f"✅ HTML generado: {output_file.name}")
            success_count += 1

        except Exception as e:
            print(f"❌ Error procesando {md_file.name}: {str(e)}")
            import traceback
            traceback.print_exc()

    print(f"\n✨ ¡Proceso completado! {success_count}/{len(md_files)} archivos HTML generados")
    print(f"\n📂 Los archivos están en: {html_dir}")
    print("\n💡 Abre los archivos HTML en un navegador y usa 'Imprimir > Guardar como PDF' para generar los PDFs\n")

if __name__ == '__main__':
    main()
