"""
prescripcion_tareas.py

Módulo para generar prescripciones de tareas terapéuticas basadas en los diagnósticos.

A partir de los resultados de los otros módulos, genera recomendaciones de:
- Tareas de escritura
- Ejercicios lingüísticos
- Actividades de elaboración cultural y emocional
"""

from typing import Dict, List


# =============================================================================
# CATÁLOGO DE TAREAS TERAPÉUTICAS
# =============================================================================

CATALOGO_TAREAS = {
    # Tareas lingüísticas
    "escritura_autobiografica_breve": {
        "descripcion": "Escribe un recuerdo concreto de tu infancia usando pasado y primera persona (100-150 palabras).",
        "objetivo_linguistico": "trabajar el pretérito indefinido e imperfecto",
        "objetivo_clinico_cultural": "elaborar un recuerdo del país de origen"
    },
    "reescritura_perspectiva": {
        "descripcion": "Reescribe una escena importante en tercera persona, como si fueras un narrador externo.",
        "objetivo_linguistico": "variar el punto de vista narrativo",
        "objetivo_clinico_cultural": "tomar distancia emocional del conflicto"
    },
    "carta_al_futuro": {
        "descripcion": "Escribe una carta a tu yo del futuro (dentro de un año) contándole cómo te sientes ahora.",
        "objetivo_linguistico": "usar futuro y presente, estructurar ideas",
        "objetivo_clinico_cultural": "proyección y esperanza"
    },
    "dialogo_imaginario": {
        "descripcion": "Escribe un diálogo entre tú y una persona importante de tu vida (presente o pasada).",
        "objetivo_linguistico": "uso de diálogo, registro coloquial",
        "objetivo_clinico_cultural": "elaborar relaciones significativas"
    },
    "descripcion_sensorial": {
        "descripcion": "Describe un lugar importante para ti usando los cinco sentidos (vista, oído, olfato, tacto, gusto).",
        "objetivo_linguistico": "enriquecer vocabulario descriptivo",
        "objetivo_clinico_cultural": "anclar recuerdos en lo sensorial"
    },
    "conectores_causales": {
        "descripcion": "Reescribe tu último texto añadiendo conectores que expliquen causas y consecuencias.",
        "objetivo_linguistico": "uso de conectores causales y consecutivos",
        "objetivo_clinico_cultural": "elaborar la lógica de los eventos vividos"
    },
    "expansion_tema": {
        "descripcion": "Elige un tema que mencionaste brevemente y desarróllalo en un párrafo de 150 palabras.",
        "objetivo_linguistico": "elaboración y desarrollo de ideas",
        "objetivo_clinico_cultural": "profundizar en temas evitados"
    },

    # Tareas culturales
    "comparacion_cultural": {
        "descripcion": "Escribe sobre una misma situación (ej: comer en familia) en tu país de origen y en tu país actual.",
        "objetivo_linguistico": "comparación, contraste, vocabulario cultural",
        "objetivo_clinico_cultural": "integración de dos marcos culturales"
    },
    "receta_significativa": {
        "descripcion": "Describe una comida importante de tu cultura: ingredientes, preparación y qué significa para ti.",
        "objetivo_linguistico": "imperativo, vocabulario especializado",
        "objetivo_clinico_cultural": "valorar herencia cultural"
    },
    "ritual_o_celebracion": {
        "descripcion": "Narra una celebración o ritual importante de tu cultura de origen.",
        "objetivo_linguistico": "narración en pasado, descripción cultural",
        "objetivo_clinico_cultural": "mantener vínculo con cultura de origen"
    },
    "exploracion_cultura_acogida": {
        "descripcion": "Describe algo nuevo que has descubierto de la cultura del país donde vives y qué piensas de ello.",
        "objetivo_linguistico": "vocabulario cultural, opinión",
        "objetivo_clinico_cultural": "apertura a nueva cultura"
    },

    # Tareas emocionales
    "carta_no_enviada": {
        "descripcion": "Escribe una carta a alguien que no está (porque está lejos o porque falleció) diciéndole lo que necesitas.",
        "objetivo_linguistico": "expresión epistolar, condicional",
        "objetivo_clinico_cultural": "elaborar duelo y separación"
    },
    "inventario_emocional": {
        "descripcion": "Haz una lista de 10 emociones que has sentido esta semana y describe brevemente una situación para cada una.",
        "objetivo_linguistico": "vocabulario emocional",
        "objetivo_clinico_cultural": "conciencia emocional"
    },
    "momento_dificil": {
        "descripcion": "Narra un momento difícil que viviste, qué sentiste, qué hiciste y qué aprendiste.",
        "objetivo_linguistico": "narración, reflexión",
        "objetivo_clinico_cultural": "integrar experiencias traumáticas"
    },
    "logros_pequenos": {
        "descripcion": "Escribe sobre tres cosas pequeñas que has logrado últimamente y cómo te hacen sentir.",
        "objetivo_linguistico": "narración positiva, expresión emocional",
        "objetivo_clinico_cultural": "reforzar autoeficacia"
    }
}


# =============================================================================
# REGLAS DE PRESCRIPCIÓN
# =============================================================================

def prescribir_por_errores_linguisticos(errores: List[str]) -> List[str]:
    """
    Recomienda tareas basadas en los errores lingüísticos detectados.

    Args:
        errores: Lista de errores identificados

    Returns:
        Lista de IDs de tareas recomendadas
    """
    tareas = []

    if "problemas_tiempos_pasado" in errores:
        tareas.append("escritura_autobiografica_breve")

    if "escasez_conectores" in errores:
        tareas.append("conectores_causales")

    if "pobreza_lexica" in errores:
        tareas.append("descripcion_sensorial")

    if "texto_muy_corto" in errores:
        tareas.append("expansion_tema")

    return tareas


def prescribir_por_patrones_emocionales(diagnostico: Dict) -> List[str]:
    """
    Recomienda tareas basadas en el estado emocional.

    Args:
        diagnostico: Resultado del diagnóstico lingüístico-emocional

    Returns:
        Lista de IDs de tareas recomendadas
    """
    tareas = []
    estado_emocional = diagnostico.get('estado_emocional_dominante', 'neutro')

    if estado_emocional == "tristeza":
        tareas.append("carta_no_enviada")
        tareas.append("logros_pequenos")

    elif estado_emocional == "miedo":
        tareas.append("momento_dificil")
        tareas.append("carta_al_futuro")

    elif estado_emocional == "rabia":
        tareas.append("carta_no_enviada")
        tareas.append("reescritura_perspectiva")

    # Si evita primera persona
    metricas = diagnostico.get('metricas', {})
    if metricas.get('porcentaje_pronombres_primera_persona', 0) < 2:
        tareas.append("escritura_autobiografica_breve")
        tareas.append("inventario_emocional")

    return tareas


def prescribir_por_tension_cultural(radiografia: Dict) -> List[str]:
    """
    Recomienda tareas basadas en la tensión cultural detectada.

    Args:
        radiografia: Resultado de la radiografía cultural

    Returns:
        Lista de IDs de tareas recomendadas
    """
    tareas = []
    tension = radiografia.get('tension_dominante', 'sin_indicadores')

    if tension == "nostalgia":
        tareas.append("ritual_o_celebracion")
        tareas.append("receta_significativa")
        tareas.append("exploracion_cultura_acogida")

    elif tension == "choque":
        tareas.append("comparacion_cultural")
        tareas.append("exploracion_cultura_acogida")

    elif tension == "integracion":
        tareas.append("comparacion_cultural")

    elif tension == "exploracion":
        tareas.append("exploracion_cultura_acogida")

    return tareas


def prescribir_por_bloqueos(bloqueos: Dict) -> List[str]:
    """
    Recomienda tareas basadas en los bloqueos detectados.

    Args:
        bloqueos: Resultado de la detección de bloqueos

    Returns:
        Lista de IDs de tareas recomendadas
    """
    tareas = []
    nivel_riesgo = bloqueos.get('nivel_riesgo_bloqueo', 'bajo')
    temas_detectados = bloqueos.get('temas_detectados', [])

    if nivel_riesgo in ["medio", "alto"]:
        tareas.append("expansion_tema")
        tareas.append("dialogo_imaginario")

    # Si hay temas repetitivos con bajo detalle
    for tema_info in temas_detectados:
        if tema_info.get('patron') == "repetitivo" and tema_info.get('detalle_medio', 0) <= 2:
            if tema_info['tema'] == "familia":
                tareas.append("carta_no_enviada")
            elif tema_info['tema'] == "trabajo":
                tareas.append("momento_dificil")

    return tareas


def construir_tarea(id_tarea: str, personalizacion: str = "") -> Dict:
    """
    Construye un dict con la información completa de una tarea.

    Args:
        id_tarea: ID de la tarea en el catálogo
        personalizacion: Texto adicional para personalizar la tarea

    Returns:
        Dict con la tarea completa
    """
    if id_tarea not in CATALOGO_TAREAS:
        return None

    tarea_base = CATALOGO_TAREAS[id_tarea].copy()
    tarea = {
        "tipo": id_tarea,
        "descripcion": tarea_base["descripcion"],
        "objetivo_linguistico": tarea_base["objetivo_linguistico"],
        "objetivo_clinico_cultural": tarea_base["objetivo_clinico_cultural"]
    }

    if personalizacion:
        tarea["nota_personalizada"] = personalizacion

    return tarea


def prescripcion_tareas(
    entrada: Dict,
    diagnostico: Dict,
    radiografia: Dict,
    bloqueos: Dict
) -> Dict:
    """
    Genera una prescripción de tareas terapéuticas personalizada.

    Esta es la función principal del módulo que combina todos los análisis
    para recomendar tareas específicas.

    Args:
        entrada: Entrada original del sujeto
        diagnostico: Resultado del diagnóstico lingüístico-emocional
        radiografia: Resultado de la radiografía cultural
        bloqueos: Resultado de la detección de bloqueos

    Returns:
        Dict con la prescripción:
            {
                "id_sujeto": str,
                "tareas_recomendadas": List[Dict],
                "justificacion": str
            }
    """
    id_sujeto = entrada.get('id_sujeto', 'unknown')

    # Recolectar recomendaciones de cada módulo
    tareas_por_errores = prescribir_por_errores_linguisticos(
        diagnostico.get('errores_clave', [])
    )
    tareas_por_emociones = prescribir_por_patrones_emocionales(diagnostico)
    tareas_por_cultura = prescribir_por_tension_cultural(radiografia)
    tareas_por_bloqueos = prescribir_por_bloqueos(bloqueos)

    # Combinar y eliminar duplicados manteniendo orden
    todas_tareas_ids = (
        tareas_por_errores +
        tareas_por_emociones +
        tareas_por_cultura +
        tareas_por_bloqueos
    )

    # Eliminar duplicados manteniendo orden
    tareas_ids_unicas = []
    for tarea_id in todas_tareas_ids:
        if tarea_id not in tareas_ids_unicas:
            tareas_ids_unicas.append(tarea_id)

    # Limitar a máximo 5 tareas para no abrumar
    tareas_ids_unicas = tareas_ids_unicas[:5]

    # Construir tareas completas
    tareas_recomendadas = []
    for tarea_id in tareas_ids_unicas:
        tarea = construir_tarea(tarea_id)
        if tarea:
            tareas_recomendadas.append(tarea)

    # Generar justificación
    justificacion = generar_justificacion(
        diagnostico, radiografia, bloqueos, tareas_recomendadas
    )

    # Construir resultado
    resultado = {
        "id_sujeto": id_sujeto,
        "tareas_recomendadas": tareas_recomendadas,
        "justificacion": justificacion,
        "numero_tareas": len(tareas_recomendadas)
    }

    return resultado


def generar_justificacion(
    diagnostico: Dict,
    radiografia: Dict,
    bloqueos: Dict,
    tareas: List[Dict]
) -> str:
    """
    Genera un texto justificativo de por qué se recomiendan estas tareas.

    Args:
        diagnostico: Diagnóstico lingüístico-emocional
        radiografia: Radiografía cultural
        bloqueos: Detección de bloqueos
        tareas: Lista de tareas recomendadas

    Returns:
        Texto justificativo
    """
    justificacion = "Estas tareas se recomiendan porque:\n"

    # Razones lingüísticas
    errores = diagnostico.get('errores_clave', [])
    if errores:
        justificacion += f"- Se detectaron áreas de mejora lingüística: {', '.join(errores[:2])}.\n"

    # Razones emocionales
    estado = diagnostico.get('estado_emocional_dominante')
    if estado and estado != "neutro":
        justificacion += f"- El estado emocional dominante es {estado}, que requiere elaboración.\n"

    # Razones culturales
    tension = radiografia.get('tension_dominante')
    if tension and tension != "sin_indicadores":
        justificacion += f"- La tensión cultural dominante es {tension}.\n"

    # Razones por bloqueos
    nivel_bloqueo = bloqueos.get('nivel_riesgo_bloqueo')
    if nivel_bloqueo in ["medio", "alto"]:
        justificacion += f"- Se detectan posibles bloqueos discursivos (nivel: {nivel_bloqueo}).\n"

    return justificacion


# =============================================================================
# EJEMPLO DE USO
# =============================================================================

if __name__ == "__main__":
    # Simulación de resultados de otros módulos
    entrada_ejemplo = {
        "id_sujeto": "paciente_001"
    }

    diagnostico_ejemplo = {
        "errores_clave": ["problemas_tiempos_pasado", "escasez_conectores"],
        "estado_emocional_dominante": "tristeza",
        "metricas": {
            "porcentaje_pronombres_primera_persona": 1.5
        }
    }

    radiografia_ejemplo = {
        "tension_dominante": "nostalgia"
    }

    bloqueos_ejemplo = {
        "nivel_riesgo_bloqueo": "medio",
        "temas_detectados": [
            {"tema": "familia", "frecuencia": 5, "detalle_medio": 1, "patron": "repetitivo"}
        ]
    }

    # Generar prescripción
    resultado = prescripcion_tareas(
        entrada_ejemplo,
        diagnostico_ejemplo,
        radiografia_ejemplo,
        bloqueos_ejemplo
    )

    # Mostrar resultado
    print("=" * 80)
    print("PRESCRIPCIÓN DE TAREAS")
    print("=" * 80)
    print(f"\nID Sujeto: {resultado['id_sujeto']}")
    print(f"Número de tareas recomendadas: {resultado['numero_tareas']}")
    print(f"\nJustificación:\n{resultado['justificacion']}")
    print(f"\nTareas recomendadas:")
    for i, tarea in enumerate(resultado['tareas_recomendadas'], 1):
        print(f"\n{i}. Tipo: {tarea['tipo']}")
        print(f"   Descripción: {tarea['descripcion']}")
        print(f"   Objetivo lingüístico: {tarea['objetivo_linguistico']}")
        print(f"   Objetivo clínico-cultural: {tarea['objetivo_clinico_cultural']}")
