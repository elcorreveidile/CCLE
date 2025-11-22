#!/usr/bin/env python3
"""
Script para convertir archivos HTML a PDF usando WeasyPrint
"""

from pathlib import Path
from weasyprint import HTML, CSS
import sys

def convert_html_to_pdf(html_file, pdf_file):
    """Convierte un archivo HTML a PDF usando WeasyPrint"""
    try:
        # Convertir HTML a PDF
        HTML(filename=str(html_file)).write_pdf(
            str(pdf_file),
            stylesheets=None,  # Los estilos ya están en el HTML
            optimize_size=('fonts', 'images')
        )
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    """Función principal"""
    script_dir = Path(__file__).parent
    html_dir = script_dir / 'html'
    pdf_dir = script_dir / 'pdfs'

    # Crear carpeta para PDFs si no existe
    pdf_dir.mkdir(exist_ok=True)

    # Buscar archivos HTML
    html_files = sorted(html_dir.glob('semana*.html'))

    if not html_files:
        print("❌ No se encontraron archivos HTML")
        return

    print(f"\n🚀 Convirtiendo {len(html_files)} archivos HTML a PDF...\n")

    success_count = 0

    for html_file in html_files:
        print(f"📄 Procesando: {html_file.name}")

        try:
            # Nombre del PDF de salida
            pdf_file = pdf_dir / f"{html_file.stem}.pdf"

            # Convertir a PDF
            if convert_html_to_pdf(html_file, pdf_file):
                print(f"✅ PDF generado: {pdf_file.name}")
                success_count += 1
            else:
                print(f"❌ Error al generar {pdf_file.name}")

        except Exception as e:
            print(f"❌ Error procesando {html_file.name}: {str(e)}")
            import traceback
            traceback.print_exc()

    print(f"\n✨ ¡Proceso completado! {success_count}/{len(html_files)} PDFs generados")
    print(f"\n📂 Los PDFs están en: {pdf_dir}\n")

if __name__ == '__main__':
    main()
