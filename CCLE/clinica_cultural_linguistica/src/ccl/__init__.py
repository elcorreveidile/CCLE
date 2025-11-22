"""
CCL - Clínica Cultural y Lingüística

Sistema de análisis de texto para diagnóstico lingüístico, cultural y emocional.

Módulos principales:
- diagnostico_linguistico_emocional: Análisis lingüístico y emocional
- radiografia_cultural: Análisis de referentes culturales
- deteccion_bloqueos_discursivos: Detección de patrones y bloqueos
- prescripcion_tareas: Generación de tareas terapéuticas
- seguimiento_progreso: Análisis de evolución temporal
- riesgo_psico_emocional: Detección de señales de riesgo

Uso básico:
    >>> from ccl import diagnostico_linguistico_emocional
    >>> entrada = {
    ...     "id_sujeto": "paciente_001",
    ...     "texto": "Mi texto aquí..."
    ... }
    >>> resultado = diagnostico_linguistico_emocional(entrada)
"""

__version__ = "0.1.0"
__author__ = "Tu Nombre"

# Importar funciones principales de cada módulo
from .diagnostico_linguistico_emocional import diagnostico_linguistico_emocional
from .radiografia_cultural import radiografia_cultural
from .deteccion_bloqueos_discursivos import deteccion_bloqueos_discursivos
from .prescripcion_tareas import prescripcion_tareas
from .seguimiento_progreso import seguimiento_progreso
from .riesgo_psico_emocional import riesgo_psico_emocional_basico

# Importar funciones auxiliares útiles
from .utils import (
    validar_entrada,
    limpiar_texto,
    contar_palabras,
    calcular_variedad_lexica,
    tokenizar,
)

# Definir qué se exporta cuando se hace "from ccl import *"
__all__ = [
    # Funciones principales
    "diagnostico_linguistico_emocional",
    "radiografia_cultural",
    "deteccion_bloqueos_discursivos",
    "prescripcion_tareas",
    "seguimiento_progreso",
    "riesgo_psico_emocional_basico",

    # Funciones auxiliares
    "validar_entrada",
    "limpiar_texto",
    "contar_palabras",
    "calcular_variedad_lexica",
    "tokenizar",

    # Metadata
    "__version__",
    "__author__",
]


def analisis_completo(entrada, incluir_riesgo=True, historial=None):
    """
    Ejecuta un análisis completo combinando todos los módulos.

    Esta es una función de conveniencia que ejecuta todos los análisis
    en el orden correcto y retorna un resultado integrado.

    Args:
        entrada: Dict con los datos del sujeto y texto
        incluir_riesgo: Si True, incluye análisis de riesgo psico-emocional
        historial: Lista opcional de análisis previos para seguimiento

    Returns:
        Dict con todos los análisis integrados

    Ejemplo:
        >>> entrada = {
        ...     "id_sujeto": "paciente_001",
        ...     "texto": "Mi texto aquí...",
        ...     "metadatos": {
        ...         "pais_origen": "colombia",
        ...         "pais_residencia": "españa"
        ...     }
        ... }
        >>> resultado = analisis_completo(entrada)
    """
    # Ejecutar todos los análisis
    diagnostico = diagnostico_linguistico_emocional(entrada)
    radiografia = radiografia_cultural(entrada)
    bloqueos = deteccion_bloqueos_discursivos(entrada, historial)
    tareas = prescripcion_tareas(entrada, diagnostico, radiografia, bloqueos)

    # Análisis de riesgo (opcional)
    riesgo = None
    if incluir_riesgo:
        riesgo = riesgo_psico_emocional_basico(entrada)

    # Seguimiento de progreso (solo si hay historial)
    progreso = None
    if historial:
        # Añadir análisis actual al historial
        historial_completo = historial + [{
            **diagnostico,
            **radiografia,
            "fecha": entrada.get("fecha", "actual")
        }]
        progreso = seguimiento_progreso(historial_completo)

    # Construir resultado integrado
    resultado_completo = {
        "id_sujeto": entrada.get("id_sujeto"),
        "diagnostico_linguistico_emocional": diagnostico,
        "radiografia_cultural": radiografia,
        "deteccion_bloqueos": bloqueos,
        "prescripcion_tareas": tareas,
    }

    if riesgo:
        resultado_completo["riesgo_psico_emocional"] = riesgo

    if progreso:
        resultado_completo["seguimiento_progreso"] = progreso

    return resultado_completo


# Añadir analisis_completo a las exportaciones
__all__.append("analisis_completo")
