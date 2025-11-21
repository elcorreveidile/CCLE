const { spawn } = require('child_process');
const path = require('path');

/**
 * Analizar texto usando el sistema Python CCL
 * @route POST /api/ccl/analizar
 * @access Protected
 */
exports.analizarTexto = async (req, res) => {
    try {
        const { texto, metadatos, idioma, nivel_declarado, contexto } = req.body;

        // Validación básica
        if (!texto || texto.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El texto es requerido'
            });
        }

        if (!metadatos || !metadatos.pais_origen) {
            return res.status(400).json({
                success: false,
                message: 'El país de origen es requerido'
            });
        }

        // Preparar entrada para el sistema Python CCL
        const entrada = {
            id_sujeto: req.user.id,
            texto: texto.trim(),
            idioma: idioma || 'es',
            metadatos: {
                pais_origen: metadatos.pais_origen.toLowerCase(),
                pais_residencia: metadatos.pais_residencia?.toLowerCase() || 'españa'
            },
            contexto: contexto || 'texto_libre'
        };

        if (nivel_declarado) {
            entrada.nivel_declarado = nivel_declarado;
        }

        // Ejecutar análisis Python
        const resultado = await ejecutarAnalisisPython(entrada);

        // Agregar el texto original al resultado
        resultado.texto = texto;

        res.json({
            success: true,
            data: resultado,
            message: 'Análisis completado exitosamente'
        });

    } catch (error) {
        console.error('Error en análisis CCL:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al analizar el texto',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Ejecutar el sistema Python CCL
 */
function ejecutarAnalisisPython(entrada) {
    return new Promise((resolve, reject) => {
        // Ruta al script Python
        const pythonScriptPath = path.join(__dirname, '../../clinica_cultural_linguistica/backend_integration.py');

        // Ejecutar Python con el módulo ccl
        const pythonProcess = spawn('python3', [
            '-c',
            `
import sys
import json
sys.path.insert(0, '${path.join(__dirname, '../../clinica_cultural_linguistica/src')}')

from ccl import analisis_completo

# Leer entrada desde stdin
entrada = json.loads(sys.stdin.read())

# Ejecutar análisis
resultado = analisis_completo(entrada, incluir_riesgo=True)

# Devolver resultado como JSON
print(json.dumps(resultado, ensure_ascii=False))
            `
        ]);

        let outputData = '';
        let errorData = '';

        // Enviar entrada al proceso Python
        pythonProcess.stdin.write(JSON.stringify(entrada));
        pythonProcess.stdin.end();

        // Capturar salida
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        // Manejar finalización
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Error en proceso Python:', errorData);
                reject(new Error(`Error en análisis Python: ${errorData || 'Código de salida ' + code}`));
                return;
            }

            try {
                const resultado = JSON.parse(outputData);
                resolve(resultado);
            } catch (error) {
                console.error('Error al parsear respuesta Python:', outputData);
                reject(new Error('Error al procesar la respuesta del análisis'));
            }
        });

        pythonProcess.on('error', (error) => {
            console.error('Error al ejecutar Python:', error);
            reject(new Error('Error al ejecutar el sistema de análisis. Por favor, contacta al administrador.'));
        });
    });
}

/**
 * Obtener historial de análisis del usuario
 * @route GET /api/ccl/historial
 * @access Protected
 */
exports.obtenerHistorial = async (req, res) => {
    try {
        // Por ahora, el historial se guarda en localStorage del cliente
        // En una implementación completa, se guardaría en base de datos
        res.json({
            success: true,
            data: {
                message: 'El historial se almacena localmente en tu navegador'
            }
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial'
        });
    }
};
