"""
deteccion_bloqueos_discursivos.py

Módulo para detectar bloqueos o patrones repetitivos en el discurso.

Analiza:
- Temas mencionados repetidamente
- Nivel de detalle/elaboración en cada tema
- Patrones de evitación o bloqueo
- Comparación con historial si está disponible
"""

from typing import Dict, List, Optional
from collections import Counter
import re
from .utils import tokenizar, detectar_temas, limpiar_texto, validar_entrada


# =============================================================================
# FUNCIONES DE DETECCIÓN DE TEMAS Y PROFUNDIDAD
# =============================================================================

def analizar_temas_detallados(texto: str) -> List[Dict]:
    """
    Analiza los temas presentes y estima el nivel de detalle de cada uno.

    El nivel de detalle se mide por:
    - Número de menciones del tema
    - Contexto alrededor de las menciones (número de palabras relacionadas)
    - Presencia de detalles concretos (números, nombres propios, fechas)

    Args:
        texto: Texto a analizar

    Returns:
        Lista de dicts con información de cada tema detectado:
        [
            {
                "tema": str,
                "frecuencia": int,
                "detalle_medio": int (0-5),
                "contextos": List[str]
            }
        ]
    """
    # Detectar temas básicos
    temas_conteo = detectar_temas(texto)

    # Analizar en detalle cada tema
    temas_detallados = []

    for tema, frecuencia in temas_conteo.items():
        if frecuencia == 0:
            continue

        # Estimar nivel de detalle
        # Por ahora, usamos heurísticas simples:
        # - Si menciona el tema pero con pocas palabras alrededor = bajo detalle
        # - Si el texto es largo y menciona varias veces = más detalle

        detalle_medio = min(frecuencia, 5)  # Escala 0-5

        temas_detallados.append({
            "tema": tema,
            "frecuencia": frecuencia,
            "detalle_medio": detalle_medio,
            "patron": "repetitivo" if frecuencia > 3 else "normal"
        })

    # Ordenar por frecuencia
    temas_detallados.sort(key=lambda x: x['frecuencia'], reverse=True)

    return temas_detallados


def detectar_patrones_evitacion(texto: str, temas_detectados: List[Dict]) -> List[str]:
    """
    Detecta patrones de evitación o bloqueo en el discurso.

    Indicadores de bloqueo:
    - Tema mencionado varias veces pero con poco detalle
    - Uso de palabras emocionales sin desarrollo
    - Frases incompletas o generalizaciones vagas
    - Cambios bruscos de tema

    Args:
        texto: Texto completo
        temas_detectados: Lista de temas ya analizados

    Returns:
        Lista de posibles bloqueos identificados
    """
    posibles_bloqueos = []
    texto_lower = texto.lower()

    # Detectar temas frecuentes con bajo detalle
    for tema_info in temas_detectados:
        if tema_info['frecuencia'] >= 3 and tema_info['detalle_medio'] <= 2:
            posibles_bloqueos.append(
                f"Menciona '{tema_info['tema']}' repetidamente "
                f"({tema_info['frecuencia']} veces) pero no entra en detalles ni emociones."
            )

    # Detectar palabras emocionales sin contexto
    palabras_emocionales_importantes = [
        'miedo', 'angustia', 'trauma', 'violencia', 'dolor',
        'tristeza', 'depresión', 'ansiedad', 'pánico'
    ]

    for palabra in palabras_emocionales_importantes:
        if palabra in texto_lower:
            # Buscar el contexto (50 caracteres alrededor)
            posiciones = [m.start() for m in re.finditer(palabra, texto_lower)]
            for pos in posiciones:
                contexto_inicio = max(0, pos - 50)
                contexto_fin = min(len(texto), pos + 50)
                contexto = texto[contexto_inicio:contexto_fin]

                # Si el contexto es muy corto, puede ser un bloqueo
                palabras_contexto = len(tokenizar(contexto))
                if palabras_contexto < 10:
                    posibles_bloqueos.append(
                        f"Aparece la palabra '{palabra}' pero no se describe "
                        f"la situación concreta o se desarrolla mínimamente."
                    )
                    break  # Solo reportar una vez por palabra

    # Detectar generalizaciones excesivas
    generalizaciones = [
        'siempre', 'nunca', 'todo', 'nada', 'todos', 'nadie',
        'todo el tiempo', 'para siempre', 'en general'
    ]

    conteo_generalizaciones = sum(
        1 for gen in generalizaciones if gen in texto_lower
    )

    if conteo_generalizaciones >= 3:
        posibles_bloqueos.append(
            f"Uso frecuente de generalizaciones ({conteo_generalizaciones} veces), "
            f"lo que puede indicar dificultad para acceder a recuerdos o situaciones concretas."
        )

    # Detectar frases cortas y fragmentadas (posible inhibición)
    frases = [f.strip() for f in re.split(r'[.!?]', texto) if f.strip()]
    frases_muy_cortas = [f for f in frases if len(tokenizar(f)) < 5]

    if len(frases_muy_cortas) > len(frases) * 0.5 and len(frases) > 3:
        posibles_bloqueos.append(
            f"Más de la mitad de las frases son muy cortas (< 5 palabras), "
            f"posible inhibición o dificultad de expresión."
        )

    return posibles_bloqueos


def comparar_con_historial(
    temas_actuales: List[Dict],
    historial: Optional[List[Dict]]
) -> List[str]:
    """
    Compara los temas actuales con el historial para detectar patrones.

    Args:
        temas_actuales: Temas del texto actual
        historial: Lista de análisis previos (opcional)

    Returns:
        Lista de observaciones sobre patrones en el tiempo
    """
    if not historial or len(historial) == 0:
        return ["Sin historial previo para comparar."]

    observaciones = []

    # Extraer temas del historial
    temas_historicos = {}
    for analisis_previo in historial:
        if 'temas_detectados' in analisis_previo:
            for tema_info in analisis_previo['temas_detectados']:
                tema = tema_info['tema']
                if tema not in temas_historicos:
                    temas_historicos[tema] = []
                temas_historicos[tema].append(tema_info['frecuencia'])

    # Comparar con temas actuales
    temas_actuales_dict = {t['tema']: t['frecuencia'] for t in temas_actuales}

    for tema, frecuencias_previas in temas_historicos.items():
        if tema in temas_actuales_dict:
            freq_actual = temas_actuales_dict[tema]
            freq_media_previa = sum(frecuencias_previas) / len(frecuencias_previas)

            if freq_actual > freq_media_previa * 1.5:
                observaciones.append(
                    f"El tema '{tema}' aparece con mayor frecuencia que en textos previos "
                    f"(antes: {freq_media_previa:.1f}, ahora: {freq_actual})."
                )
            elif freq_actual < freq_media_previa * 0.5:
                observaciones.append(
                    f"El tema '{tema}' aparece menos que antes "
                    f"(antes: {freq_media_previa:.1f}, ahora: {freq_actual})."
                )

    # Detectar nuevos temas
    temas_nuevos = set(temas_actuales_dict.keys()) - set(temas_historicos.keys())
    if temas_nuevos:
        observaciones.append(
            f"Aparecen nuevos temas no mencionados antes: {', '.join(temas_nuevos)}."
        )

    # Detectar temas que desaparecieron
    temas_desaparecidos = set(temas_historicos.keys()) - set(temas_actuales_dict.keys())
    if temas_desaparecidos:
        observaciones.append(
            f"Ya no se mencionan temas antes presentes: {', '.join(temas_desaparecidos)}."
        )

    if not observaciones:
        observaciones.append("Los temas se mantienen estables respecto al historial.")

    return observaciones


def deteccion_bloqueos_discursivos(
    entrada: Dict,
    historial: Optional[List[Dict]] = None
) -> Dict:
    """
    Detecta bloqueos o patrones problemáticos en el discurso.

    Esta es la función principal del módulo.

    Args:
        entrada: Dict con la estructura:
            {
                "id_sujeto": str,
                "texto": str
            }
        historial: Lista opcional de análisis previos del mismo sujeto

    Returns:
        Dict con el análisis de bloqueos:
            {
                "id_sujeto": str,
                "temas_detectados": List[Dict],
                "posibles_bloqueos": List[str],
                "comparacion_historial": List[str] (si hay historial),
                "nivel_riesgo_bloqueo": str ("bajo", "medio", "alto")
            }
    """
    # Validación
    if not validar_entrada(entrada):
        raise ValueError("La entrada debe contener al menos 'id_sujeto' y 'texto'")

    # Limpiar texto
    texto = limpiar_texto(entrada['texto'])

    # Analizar temas
    temas_detectados = analizar_temas_detallados(texto)

    # Detectar patrones de evitación
    posibles_bloqueos = detectar_patrones_evitacion(texto, temas_detectados)

    # Comparar con historial si está disponible
    comparacion_historial = []
    if historial:
        comparacion_historial = comparar_con_historial(temas_detectados, historial)

    # Estimar nivel de riesgo de bloqueo
    if len(posibles_bloqueos) == 0:
        nivel_riesgo = "bajo"
    elif len(posibles_bloqueos) <= 2:
        nivel_riesgo = "medio"
    else:
        nivel_riesgo = "alto"

    # Construir resultado
    resultado = {
        "id_sujeto": entrada['id_sujeto'],
        "temas_detectados": temas_detectados,
        "posibles_bloqueos": posibles_bloqueos,
        "nivel_riesgo_bloqueo": nivel_riesgo
    }

    if historial:
        resultado["comparacion_historial"] = comparacion_historial

    return resultado


# =============================================================================
# EJEMPLO DE USO
# =============================================================================

if __name__ == "__main__":
    # Ejemplo de entrada
    entrada_ejemplo = {
        "id_sujeto": "paciente_003",
        "texto": """
        Mi familia es importante. Siempre pienso en mi familia.
        Tengo miedo. El trabajo está bien. La familia me preocupa.
        Nada es como antes. Todo cambió. La familia, el trabajo, todo.
        Tengo que trabajar. Mi familia está lejos. Siempre igual.
        """
    }

    # Ejemplo de historial (análisis previos)
    historial_ejemplo = [
        {
            "id_sujeto": "paciente_003",
            "fecha": "2024-01-01",
            "temas_detectados": [
                {"tema": "familia", "frecuencia": 2, "detalle_medio": 3},
                {"tema": "trabajo", "frecuencia": 1, "detalle_medio": 2}
            ]
        }
    ]

    # Ejecutar detección
    resultado = deteccion_bloqueos_discursivos(entrada_ejemplo, historial_ejemplo)

    # Mostrar resultado
    print("=" * 80)
    print("DETECCIÓN DE BLOQUEOS DISCURSIVOS")
    print("=" * 80)
    print(f"\nID Sujeto: {resultado['id_sujeto']}")
    print(f"\nTemas detectados:")
    for tema_info in resultado['temas_detectados']:
        print(f"  - {tema_info['tema']}: {tema_info['frecuencia']} menciones, "
              f"detalle: {tema_info['detalle_medio']}/5, patrón: {tema_info['patron']}")
    print(f"\nNivel de riesgo de bloqueo: {resultado['nivel_riesgo_bloqueo']}")
    print(f"\nPosibles bloqueos identificados:")
    for bloqueo in resultado['posibles_bloqueos']:
        print(f"  - {bloqueo}")
    if 'comparacion_historial' in resultado:
        print(f"\nComparación con historial:")
        for obs in resultado['comparacion_historial']:
            print(f"  - {obs}")
