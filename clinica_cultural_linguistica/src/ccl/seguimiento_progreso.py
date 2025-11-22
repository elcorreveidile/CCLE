"""
seguimiento_progreso.py

Módulo para hacer seguimiento del progreso a lo largo del tiempo.

Analiza:
- Evolución de métricas lingüísticas
- Evolución de patrones emocionales y culturales
- Tendencias positivas o negativas
- Recomendaciones basadas en la evolución
"""

from typing import Dict, List
from statistics import mean


# =============================================================================
# FUNCIONES DE ANÁLISIS TEMPORAL
# =============================================================================

def extraer_metrica_temporal(historial: List[Dict], metrica: str) -> List[float]:
    """
    Extrae los valores de una métrica específica a lo largo del historial.

    Args:
        historial: Lista de análisis ordenados cronológicamente
        metrica: Nombre de la métrica a extraer (ej: 'variedad_lexica')

    Returns:
        Lista de valores de la métrica
    """
    valores = []

    for analisis in historial:
        # Navegar por la estructura del análisis
        if 'metricas' in analisis:
            metricas = analisis['metricas']
            if metrica in metricas:
                valores.append(metricas[metrica])

    return valores


def calcular_tendencia(valores: List[float]) -> Dict[str, any]:
    """
    Calcula la tendencia de una serie de valores.

    Args:
        valores: Lista de valores numéricos

    Returns:
        Dict con información de la tendencia:
            {
                "inicio": float,
                "actual": float,
                "cambio_absoluto": float,
                "cambio_porcentual": float,
                "direccion": str ("mejora", "estable", "deterioro")
            }
    """
    if len(valores) == 0:
        return {
            "inicio": 0,
            "actual": 0,
            "cambio_absoluto": 0,
            "cambio_porcentual": 0,
            "direccion": "sin_datos"
        }

    if len(valores) == 1:
        return {
            "inicio": valores[0],
            "actual": valores[0],
            "cambio_absoluto": 0,
            "cambio_porcentual": 0,
            "direccion": "sin_suficientes_datos"
        }

    inicio = valores[0]
    actual = valores[-1]
    cambio_absoluto = actual - inicio

    # Evitar división por cero
    if inicio == 0:
        cambio_porcentual = 0
    else:
        cambio_porcentual = (cambio_absoluto / inicio) * 100

    # Determinar dirección
    if cambio_porcentual > 10:
        direccion = "mejora"
    elif cambio_porcentual < -10:
        direccion = "deterioro"
    else:
        direccion = "estable"

    return {
        "inicio": round(inicio, 2),
        "actual": round(actual, 2),
        "cambio_absoluto": round(cambio_absoluto, 2),
        "cambio_porcentual": round(cambio_porcentual, 2),
        "direccion": direccion
    }


def analizar_evolucion_emocional(historial: List[Dict]) -> Dict:
    """
    Analiza la evolución del estado emocional a lo largo del tiempo.

    Args:
        historial: Lista de análisis con diagnósticos emocionales

    Returns:
        Dict con el análisis de evolución emocional
    """
    emociones_por_sesion = []

    for analisis in historial:
        if 'estado_emocional_dominante' in analisis:
            emociones_por_sesion.append(analisis['estado_emocional_dominante'])

    if len(emociones_por_sesion) == 0:
        return {
            "evolucion": [],
            "interpretacion": "Sin datos emocionales para analizar."
        }

    # Contar frecuencia de cada emoción
    from collections import Counter
    conteo = Counter(emociones_por_sesion)

    # Detectar patrones
    interpretacion = []

    if len(emociones_por_sesion) > 1:
        if emociones_por_sesion[0] != emociones_por_sesion[-1]:
            interpretacion.append(
                f"Cambio emocional de {emociones_por_sesion[0]} a {emociones_por_sesion[-1]}."
            )

        # Ver si hay estabilidad
        if conteo.most_common(1)[0][1] == len(emociones_por_sesion):
            emocion_constante = conteo.most_common(1)[0][0]
            interpretacion.append(
                f"Estado emocional constante: {emocion_constante}. "
                f"Podría indicar bloqueo o cronicidad."
            )

    if not interpretacion:
        interpretacion.append("Variabilidad emocional normal.")

    return {
        "evolucion": emociones_por_sesion,
        "frecuencias": dict(conteo),
        "interpretacion": " ".join(interpretacion)
    }


def analizar_evolucion_cultural(historial: List[Dict]) -> Dict:
    """
    Analiza la evolución de los referentes culturales.

    Args:
        historial: Lista de análisis con radiografías culturales

    Returns:
        Dict con el análisis de evolución cultural
    """
    referentes_origen_temporal = []
    referentes_acogida_temporal = []

    for analisis in historial:
        if 'referentes_origen' in analisis:
            referentes_origen_temporal.append(len(analisis['referentes_origen']))
        if 'referentes_acogida' in analisis:
            referentes_acogida_temporal.append(len(analisis['referentes_acogida']))

    if len(referentes_origen_temporal) == 0:
        return {
            "tendencia_origen": "sin_datos",
            "tendencia_acogida": "sin_datos",
            "interpretacion": "Sin datos culturales para analizar."
        }

    # Calcular tendencias
    inicio_origen = referentes_origen_temporal[0] if referentes_origen_temporal else 0
    actual_origen = referentes_origen_temporal[-1] if referentes_origen_temporal else 0

    inicio_acogida = referentes_acogida_temporal[0] if referentes_acogida_temporal else 0
    actual_acogida = referentes_acogida_temporal[-1] if referentes_acogida_temporal else 0

    # Interpretación
    interpretacion = []

    if actual_origen > inicio_origen:
        interpretacion.append("Aumento de referentes del país de origen.")
    elif actual_origen < inicio_origen:
        interpretacion.append("Disminución de referentes del país de origen.")

    if actual_acogida > inicio_acogida:
        interpretacion.append("Aumento de referentes del país de acogida (señal de integración).")
    elif actual_acogida < inicio_acogida:
        interpretacion.append("Disminución de referentes del país de acogida.")

    if not interpretacion:
        interpretacion.append("Referentes culturales estables.")

    return {
        "referentes_origen": {"inicio": inicio_origen, "actual": actual_origen},
        "referentes_acogida": {"inicio": inicio_acogida, "actual": actual_acogida},
        "interpretacion": " ".join(interpretacion)
    }


def generar_recomendaciones_progreso(tendencias: Dict, interpretacion: List[str]) -> List[str]:
    """
    Genera recomendaciones basadas en las tendencias observadas.

    Args:
        tendencias: Dict con las tendencias calculadas
        interpretacion: Lista de interpretaciones generadas

    Returns:
        Lista de recomendaciones
    """
    recomendaciones = []

    # Recomendaciones según longitud de textos
    if 'longitud_media_textos' in tendencias:
        tendencia_longitud = tendencias['longitud_media_textos']
        if tendencia_longitud['direccion'] == "deterioro":
            recomendaciones.append(
                "Los textos se están acortando. Considerar explorar posible fatiga o desánimo."
            )
        elif tendencia_longitud['direccion'] == "mejora":
            recomendaciones.append(
                "Los textos son cada vez más largos, señal de mayor fluidez y confianza."
            )

    # Recomendaciones según variedad léxica
    if 'variedad_lexica' in tendencias:
        tendencia_variedad = tendencias['variedad_lexica']
        if tendencia_variedad['direccion'] == "mejora":
            recomendaciones.append(
                "Mejora en variedad léxica. Continuar con tareas que enriquezcan vocabulario."
            )

    # Recomendaciones según uso de primera persona
    if 'uso_primera_persona' in tendencias:
        tendencia_primera = tendencias['uso_primera_persona']
        if tendencia_primera['direccion'] == "mejora":
            recomendaciones.append(
                "Mayor uso del 'yo', señal de apropiación del discurso y protagonismo narrativo."
            )
        elif tendencia_primera['direccion'] == "deterioro":
            recomendaciones.append(
                "Disminución del 'yo'. Explorar si hay evitación o despersonalización."
            )

    if not recomendaciones:
        recomendaciones.append("Continuar con el plan actual. Evolución dentro de lo esperado.")

    return recomendaciones


def seguimiento_progreso(historial_analisis: List[Dict]) -> Dict:
    """
    Realiza un seguimiento del progreso a partir del historial de análisis.

    Esta es la función principal del módulo.

    Args:
        historial_analisis: Lista de análisis previos, ordenados cronológicamente.
                           Cada elemento debe ser un dict con los resultados completos
                           de un análisis (diagnóstico, radiografía, etc.)

    Returns:
        Dict con el seguimiento:
            {
                "numero_sesiones": int,
                "tendencias": Dict con tendencias de métricas clave,
                "evolucion_emocional": Dict,
                "evolucion_cultural": Dict,
                "interpretacion_general": List[str],
                "recomendaciones": List[str]
            }
    """
    if not historial_analisis or len(historial_analisis) == 0:
        return {
            "numero_sesiones": 0,
            "mensaje": "No hay historial suficiente para hacer seguimiento."
        }

    numero_sesiones = len(historial_analisis)

    # Extraer y calcular tendencias de métricas clave
    metricas_a_analizar = [
        'longitud_texto',
        'variedad_lexica',
        'porcentaje_pronombres_primera_persona',
        'porcentaje_verbos_pasado',
        'porcentaje_conectores'
    ]

    tendencias = {}

    for metrica in metricas_a_analizar:
        valores = extraer_metrica_temporal(historial_analisis, metrica)
        if valores:
            # Renombrar para mejor legibilidad
            nombre_legible = metrica.replace('_', ' ').replace('porcentaje ', 'uso ')
            if metrica == 'longitud_texto':
                nombre_legible = 'longitud_media_textos'
            elif metrica == 'porcentaje_pronombres_primera_persona':
                nombre_legible = 'uso_primera_persona'

            tendencias[nombre_legible] = calcular_tendencia(valores)

    # Analizar evolución emocional
    evolucion_emocional = analizar_evolucion_emocional(historial_analisis)

    # Analizar evolución cultural
    evolucion_cultural = analizar_evolucion_cultural(historial_analisis)

    # Generar interpretación general
    interpretacion_general = []

    # Interpretación de tendencias lingüísticas
    if 'longitud_media_textos' in tendencias:
        t = tendencias['longitud_media_textos']
        if t['direccion'] == "mejora":
            interpretacion_general.append(
                f"Los textos han crecido de {t['inicio']} a {t['actual']} palabras en promedio."
            )
        elif t['direccion'] == "deterioro":
            interpretacion_general.append(
                f"Los textos se han acortado de {t['inicio']} a {t['actual']} palabras."
            )

    if 'variedad lexica' in tendencias:
        t = tendencias['variedad lexica']
        if t['direccion'] == "mejora":
            interpretacion_general.append(
                f"La variedad léxica ha mejorado ({t['cambio_porcentual']:.1f}%)."
            )

    if 'uso_primera_persona' in tendencias:
        t = tendencias['uso_primera_persona']
        if t['direccion'] == "mejora":
            interpretacion_general.append(
                "Aparece más el 'yo' en los textos, mayor elaboración personal."
            )

    # Añadir interpretaciones emocionales y culturales
    if evolucion_emocional.get('interpretacion'):
        interpretacion_general.append(evolucion_emocional['interpretacion'])

    if evolucion_cultural.get('interpretacion'):
        interpretacion_general.append(evolucion_cultural['interpretacion'])

    # Generar recomendaciones
    recomendaciones = generar_recomendaciones_progreso(tendencias, interpretacion_general)

    # Construir resultado
    resultado = {
        "numero_sesiones": numero_sesiones,
        "tendencias": tendencias,
        "evolucion_emocional": evolucion_emocional,
        "evolucion_cultural": evolucion_cultural,
        "interpretacion_general": interpretacion_general,
        "recomendaciones": recomendaciones
    }

    return resultado


# =============================================================================
# EJEMPLO DE USO
# =============================================================================

if __name__ == "__main__":
    # Simulación de historial de análisis
    historial_ejemplo = [
        {
            "fecha": "2024-01-01",
            "id_sujeto": "paciente_001",
            "estado_emocional_dominante": "tristeza",
            "metricas": {
                "longitud_texto": 120,
                "variedad_lexica": 0.35,
                "porcentaje_pronombres_primera_persona": 3.0,
                "porcentaje_verbos_pasado": 5.0,
                "porcentaje_conectores": 2.0
            },
            "referentes_origen": ["bogotá", "sancocho"],
            "referentes_acogida": []
        },
        {
            "fecha": "2024-02-01",
            "id_sujeto": "paciente_001",
            "estado_emocional_dominante": "tristeza",
            "metricas": {
                "longitud_texto": 150,
                "variedad_lexica": 0.42,
                "porcentaje_pronombres_primera_persona": 6.0,
                "porcentaje_verbos_pasado": 8.0,
                "porcentaje_conectores": 3.5
            },
            "referentes_origen": ["colombia", "madre", "familia"],
            "referentes_acogida": ["madrid"]
        },
        {
            "fecha": "2024-03-01",
            "id_sujeto": "paciente_001",
            "estado_emocional_dominante": "alegría",
            "metricas": {
                "longitud_texto": 220,
                "variedad_lexica": 0.52,
                "porcentaje_pronombres_primera_persona": 12.0,
                "porcentaje_verbos_pasado": 10.0,
                "porcentaje_conectores": 5.0
            },
            "referentes_origen": ["bogotá", "cumbia"],
            "referentes_acogida": ["españa", "madrid", "paella", "flamenco"]
        }
    ]

    # Ejecutar seguimiento
    resultado = seguimiento_progreso(historial_ejemplo)

    # Mostrar resultado
    print("=" * 80)
    print("SEGUIMIENTO DE PROGRESO")
    print("=" * 80)
    print(f"\nNúmero de sesiones analizadas: {resultado['numero_sesiones']}")

    print("\n--- TENDENCIAS LINGÜÍSTICAS ---")
    for metrica, datos in resultado['tendencias'].items():
        print(f"\n{metrica.upper()}:")
        print(f"  Inicio: {datos['inicio']}")
        print(f"  Actual: {datos['actual']}")
        print(f"  Cambio: {datos['cambio_absoluto']} ({datos['cambio_porcentual']:.1f}%)")
        print(f"  Dirección: {datos['direccion']}")

    print("\n--- EVOLUCIÓN EMOCIONAL ---")
    print(f"Emociones a lo largo del tiempo: {resultado['evolucion_emocional']['evolucion']}")
    print(f"Interpretación: {resultado['evolucion_emocional']['interpretacion']}")

    print("\n--- EVOLUCIÓN CULTURAL ---")
    print(f"Interpretación: {resultado['evolucion_cultural']['interpretacion']}")

    print("\n--- INTERPRETACIÓN GENERAL ---")
    for obs in resultado['interpretacion_general']:
        print(f"  • {obs}")

    print("\n--- RECOMENDACIONES ---")
    for rec in resultado['recomendaciones']:
        print(f"  • {rec}")
