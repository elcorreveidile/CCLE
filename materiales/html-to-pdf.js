#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Importar playwright desde la instalación global
const playwright = require('/opt/node22/lib/node_modules/playwright');

async function convertHtmlToPdf(htmlPath, pdfPath) {
    const browser = await playwright.chromium.launch({
        headless: true
    });

    try {
        const page = await browser.newPage();

        // Leer el archivo HTML
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

        // Cargar el contenido HTML
        await page.setContent(htmlContent, {
            waitUntil: 'load'
        });

        // Generar PDF
        await page.pdf({
            path: pdfPath,
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

        console.log(`✅ PDF generado: ${path.basename(pdfPath)}`);

    } finally {
        await browser.close();
    }
}

async function main() {
    const htmlDir = path.join(__dirname, 'html');
    const pdfDir = path.join(__dirname, 'pdfs');

    // Crear directorio de PDFs si no existe
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Obtener todos los archivos HTML
    const htmlFiles = fs.readdirSync(htmlDir)
        .filter(file => file.endsWith('.html'))
        .map(file => path.join(htmlDir, file));

    console.log(`\n🚀 Convirtiendo ${htmlFiles.length} archivos HTML a PDF...\n`);

    // Convertir cada archivo
    for (const htmlFile of htmlFiles) {
        const basename = path.basename(htmlFile, '.html');
        const pdfPath = path.join(pdfDir, `${basename}.pdf`);

        console.log(`📄 Procesando: ${path.basename(htmlFile)}`);

        try {
            await convertHtmlToPdf(htmlFile, pdfPath);
        } catch (error) {
            console.error(`❌ Error procesando ${path.basename(htmlFile)}:`, error.message);
        }
    }

    console.log('\n✨ ¡Proceso completado!\n');
}

main().catch(console.error);
