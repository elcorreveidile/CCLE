#!/usr/bin/env node

/**
 * Script para generar PDFs bonitos desde archivos Markdown
 * Usa Playwright para convertir HTML a PDF
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Simple markdown to HTML converter (básico pero funcional)
function markdownToHtml(markdown) {
    let html = markdown;

    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');

    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/s, function(match) {
        return '<ul>' + match + '</ul>';
    });

    // Line breaks and paragraphs
    html = html.split('\n\n').map(para => {
        if (para.trim().startsWith('<h') ||
            para.trim().startsWith('<ul') ||
            para.trim().startsWith('<ol') ||
            para.trim().startsWith('<li') ||
            para.trim() === '---') {
            return para;
        }
        if (para.trim().length > 0 && !para.trim().startsWith('<')) {
            return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
        }
        return para;
    }).join('\n');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');

    return html;
}

function createHtmlTemplate(title, content, cssPath) {
    const css = fs.readFileSync(cssPath, 'utf-8');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${css}</style>
</head>
<body>
    ${content}
</body>
</html>`;
}

async function generatePDF(markdownPath, outputPath) {
    console.log(`📄 Procesando: ${path.basename(markdownPath)}`);

    // Leer el archivo markdown
    const markdown = fs.readFileSync(markdownPath, 'utf-8');

    // Convertir a HTML
    const htmlContent = markdownToHtml(markdown);

    // Crear HTML completo con estilos
    const cssPath = path.join(path.dirname(markdownPath), 'pdf-style.css');
    const title = path.basename(markdownPath, '.md');
    const fullHtml = createHtmlTemplate(title, htmlContent, cssPath);

    // Generar PDF con Playwright
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.setContent(fullHtml, { waitUntil: 'networkidle' });

    await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
            top: '2cm',
            right: '2cm',
            bottom: '2cm',
            left: '2cm'
        },
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
    });

    await browser.close();

    console.log(`✅ PDF generado: ${path.basename(outputPath)}`);
}

async function main() {
    const materialesDir = __dirname;
    const pdfDir = path.join(materialesDir, 'pdfs');

    // Crear carpeta para PDFs si no existe
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Buscar todos los archivos .md
    const mdFiles = fs.readdirSync(materialesDir)
        .filter(file => file.endsWith('.md'))
        .map(file => path.join(materialesDir, file));

    console.log(`\n🚀 Generando PDFs para ${mdFiles.length} archivos...\n`);

    // Generar PDFs
    for (const mdFile of mdFiles) {
        const outputPath = path.join(
            pdfDir,
            path.basename(mdFile, '.md') + '.pdf'
        );

        try {
            await generatePDF(mdFile, outputPath);
        } catch (error) {
            console.error(`❌ Error procesando ${path.basename(mdFile)}:`, error.message);
        }
    }

    console.log('\n✨ ¡Proceso completado!\n');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generatePDF, markdownToHtml };
