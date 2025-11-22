"""
riesgo_psico_emocional.py

Módulo de detección básica de señales de riesgo psico-emocional.

IMPORTANTE: Este módulo NO sustituye una evaluación clínica profesional.
Solo identifica señales que requieren atención o derivación a salud mental.

Detecta:
- Menciones de ideación suicida o autodaño
- Expresiones de desesperanza extrema
- Indicadores de trauma severo
- Síntomas de trastornos graves
"""

from typing import Dict, List
import re
from .utils import tokenizar, limpiar_texto, validar_entrada


# =============================================================================
# LISTAS DE SEÑALES DE ALERTA
# =============================================================================

SEÑALES_AUTODAÑO_SUICIDIO = {
    'suicidarme', 'suicidio', 'quitarme la vida', 'acabar con todo',
    'no quiero vivir', 'mejor muerto', 'mejor muerta', 'matarme',
    'desaparecer para siempre', 'cortarme', 'hacerme daño',
    'terminar con mi vida', 'dejar de existir'
}

SEÑALES_DESESPERANZA = {
    'sin esperanza', 'no hay salida', 'todo está perdido',
    'nunca mejorará', 'no tiene sentido', 'inútil', 'fracaso total',
    'sin futuro', 'no hay solución', 'imposible', 'condenado',
    'condenada', 'atrapado', 'atrapada', 'sin escape'
}

SEÑALES_TRAUMA = {
    'abuso', 'violación', 'maltrato', 'golpes', 'tortura',
    'trauma', 'pesadillas', 'flashback', 'revivo', 'atacado',
    'atacada', 'violencia sexual', 'agresión'
}

SEÑALES_DISOCIACION = {
    'no soy yo', 'fuera de mi cuerpo', 'como si no fuera real',
    'no siento nada', 'vacío total', 'como un robot',
    'despersonalización', 'irreal', 'desconectado', 'desconectada'
}

SEÑALES_PARANOIA_PSICOSIS = {
    'me persiguen', 'conspiran contra mí', 'me vigilan',
    'voces en mi cabeza', 'escucho voces', 'me hablan',
    'controlado por', 'controlada por', 'implantaron',
    'leen mis pensamientos', 'me espían'
}

SEÑALES_CONSUMO_SUSTANCIAS = {
    'drogas', 'cocaína', 'heroína', 'adicto', 'adicta',
    'dependencia', 'alcoholismo', 'beber todos los días',
    'necesito drogas', 'síndrome de abstinencia'
}


# =============================================================================
# FUNCIONES DE DETECCIÓN
# =============================================================================

def detectar_señales_categoria(texto: str, categoria_señales: set) -> List[str]:
    """
    Detecta señales de una categoría específica en el texto.

    Args:
        texto: Texto a analizar
        categoria_señales: Set de palabras/frases de alerta

    Returns:
        Lista de señales encontradas
    """
    texto_lower = texto.lower()
    señales_encontradas = []

    for señal in categoria_señales:
        if señal in texto_lower:
            señales_encontradas.append(señal)

    return señales_encontradas


def calcular_nivel_riesgo(
    autodaño: List[str],
    desesperanza: List[str],
    trauma: List[str],
    disociacion: List[str],
    paranoia: List[str],
    sustancias: List[str]
) -> str:
    """
    Calcula el nivel de riesgo general basado en las señales detectadas.

    Args:
        autodaño: Señales de autodaño/suicidio
        desesperanza: Señales de desesperanza
        trauma: Señales de trauma
        disociacion: Señales de disociación
        paranoia: Señales de paranoia/psicosis
        sustancias: Señales de consumo de sustancias

    Returns:
        Nivel de riesgo: "bajo", "moderado", "alto", "crítico"
    """
    # Peso de cada categoría
    puntos = 0

    # Autodaño/suicidio es la señal más grave
    if autodaño:
        puntos += 10

    # Desesperanza severa
    if len(desesperanza) >= 3:
        puntos += 5
    elif desesperanza:
        puntos += 2

    # Trauma reciente o sin procesar
    if trauma:
        puntos += 4

    # Disociación
    if disociacion:
        puntos += 4

    # Paranoia/psicosis
    if paranoia:
        puntos += 6

    # Consumo de sustancias
    if sustancias:
        puntos += 3

    # Clasificar nivel
    if puntos >= 10:
        return "crítico"
    elif puntos >= 6:
        return "alto"
    elif puntos >= 3:
        return "moderado"
    else:
        return "bajo"


def generar_alertas(
    autodaño: List[str],
    desesperanza: List[str],
    trauma: List[str],
    disociacion: List[str],
    paranoia: List[str],
    sustancias: List[str]
) -> List[str]:
    """
    Genera una lista de alertas basadas en las señales detectadas.

    Args:
        (Mismo que calcular_nivel_riesgo)

    Returns:
        Lista de alertas específicas
    """
    alertas = []

    if autodaño:
        alertas.append("ALERTA CRÍTICA: Mención de ideación suicida o autodaño")

    if paranoia:
        alertas.append("ALERTA: Posibles síntomas psicóticos (paranoia, alucinaciones)")

    if disociacion:
        alertas.append("ALERTA: Síntomas de disociación")

    if trauma:
        alertas.append("ALERTA: Mención de trauma o violencia severa")

    if len(desesperanza) >= 3:
        alertas.append("ALERTA: Desesperanza extrema")

    if sustancias:
        alertas.append("ALERTA: Mención de consumo problemático de sustancias")

    return alertas


def generar_recomendaciones_riesgo(nivel_riesgo: str, alertas: List[str]) -> List[str]:
    """
    Genera recomendaciones específicas según el nivel de riesgo.

    Args:
        nivel_riesgo: Nivel calculado
        alertas: Alertas generadas

    Returns:
        Lista de recomendaciones
    """
    recomendaciones = []

    if nivel_riesgo == "crítico":
        recomendaciones.append(
            "ACCIÓN INMEDIATA: Derivar urgentemente a profesional de salud mental."
        )
        recomendaciones.append(
            "Contactar con servicios de emergencia o líneas de prevención del suicidio."
        )
        recomendaciones.append(
            "NO continuar con sesión sin marco de contención profesional adecuado."
        )

    elif nivel_riesgo == "alto":
        recomendaciones.append(
            "Derivar a profesional de salud mental a la mayor brevedad."
        )
        recomendaciones.append(
            "Evaluar red de apoyo y recursos de contención disponibles."
        )
        recomendaciones.append(
            "Evitar profundizar en temas traumáticos sin marco terapéutico adecuado."
        )

    elif nivel_riesgo == "moderado":
        recomendaciones.append(
            "Considerar derivación a profesional de salud mental."
        )
        recomendaciones.append(
            "Explorar con cuidado, respetando límites y ritmos del sujeto."
        )
        recomendaciones.append(
            "Fortalecer recursos y factores protectores."
        )

    else:  # bajo
        recomendaciones.append(
            "No se detectan señales graves de riesgo inmediato."
        )
        recomendaciones.append(
            "Continuar con monitoreo regular."
        )

    # Recomendaciones adicionales específicas
    if any("suicida" in alerta.lower() for alerta in alertas):
        recomendaciones.append(
            "Informar al sujeto sobre líneas de ayuda disponibles "
            "(teléfono de prevención del suicidio, emergencias, etc.)."
        )

    return recomendaciones


def riesgo_psico_emocional_basico(entrada: Dict) -> Dict:
    """
    Evalúa el nivel de riesgo psico-emocional básico del texto.

    IMPORTANTE: Esta función NO reemplaza una evaluación clínica profesional.
    Solo identifica señales que requieren atención especializada.

    Esta es la función principal del módulo.

    Args:
        entrada: Dict con la estructura:
            {
                "id_sujeto": str,
                "texto": str
            }

    Returns:
        Dict con la evaluación de riesgo:
            {
                "id_sujeto": str,
                "nivel_riesgo": str ("bajo", "moderado", "alto", "crítico"),
                "alertas": List[str],
                "señales_detectadas": Dict con categorías de señales,
                "recomendaciones": List[str],
                "aviso_legal": str
            }
    """
    # Validación
    if not validar_entrada(entrada):
        raise ValueError("La entrada debe contener al menos 'id_sujeto' y 'texto'")

    # Limpiar texto
    texto = limpiar_texto(entrada['texto'])

    # Detectar señales de cada categoría
    señales_autodaño = detectar_señales_categoria(texto, SEÑALES_AUTODAÑO_SUICIDIO)
    señales_desesperanza = detectar_señales_categoria(texto, SEÑALES_DESESPERANZA)
    señales_trauma = detectar_señales_categoria(texto, SEÑALES_TRAUMA)
    señales_disociacion = detectar_señales_categoria(texto, SEÑALES_DISOCIACION)
    señales_paranoia = detectar_señales_categoria(texto, SEÑALES_PARANOIA_PSICOSIS)
    señales_sustancias = detectar_señales_categoria(texto, SEÑALES_CONSUMO_SUSTANCIAS)

    # Calcular nivel de riesgo
    nivel_riesgo = calcular_nivel_riesgo(
        señales_autodaño,
        señales_desesperanza,
        señales_trauma,
        señales_disociacion,
        señales_paranoia,
        señales_sustancias
    )

    # Generar alertas
    alertas = generar_alertas(
        señales_autodaño,
        señales_desesperanza,
        señales_trauma,
        señales_disociacion,
        señales_paranoia,
        señales_sustancias
    )

    # Generar recomendaciones
    recomendaciones = generar_recomendaciones_riesgo(nivel_riesgo, alertas)

    # Agrupar señales detectadas
    señales_detectadas = {}
    if señales_autodaño:
        señales_detectadas['autodaño_suicidio'] = señales_autodaño
    if señales_desesperanza:
        señales_detectadas['desesperanza'] = señales_desesperanza
    if señales_trauma:
        señales_detectadas['trauma'] = señales_trauma
    if señales_disociacion:
        señales_detectadas['disociacion'] = señales_disociacion
    if señales_paranoia:
        señales_detectadas['paranoia_psicosis'] = señales_paranoia
    if señales_sustancias:
        señales_detectadas['consumo_sustancias'] = señales_sustancias

    # Construir resultado
    resultado = {
        "id_sujeto": entrada['id_sujeto'],
        "nivel_riesgo": nivel_riesgo,
        "alertas": alertas,
        "señales_detectadas": señales_detectadas,
        "recomendaciones": recomendaciones,
        "aviso_legal": (
            "Esta evaluación es orientativa y NO sustituye un diagnóstico clínico profesional. "
            "Ante cualquier señal de riesgo, derivar a servicios de salud mental especializados."
        )
    }

    return resultado


# =============================================================================
# EJEMPLO DE USO
# =============================================================================

if __name__ == "__main__":
    # Ejemplo 1: Texto de bajo riesgo
    print("=" * 80)
    print("EJEMPLO 1: BAJO RIESGO")
    print("=" * 80)

    entrada_bajo_riesgo = {
        "id_sujeto": "paciente_001",
        "texto": """
        Hoy fue un día normal. Fui al trabajo y después a clase de español.
        A veces me siento un poco triste porque extraño a mi familia,
        pero sé que esto es temporal. Estoy haciendo nuevos amigos aquí
        y eso me ayuda. Mañana voy a llamar a mi madre.
        """
    }

    resultado1 = riesgo_psico_emocional_basico(entrada_bajo_riesgo)
    print(f"\nNivel de riesgo: {resultado1['nivel_riesgo']}")
    print(f"Alertas: {resultado1['alertas'] if resultado1['alertas'] else 'Ninguna'}")
    print(f"Recomendaciones:")
    for rec in resultado1['recomendaciones']:
        print(f"  - {rec}")

    # Ejemplo 2: Texto de alto riesgo
    print("\n" + "=" * 80)
    print("EJEMPLO 2: ALTO RIESGO")
    print("=" * 80)

    entrada_alto_riesgo = {
        "id_sujeto": "paciente_002",
        "texto": """
        Ya no puedo más. No tiene sentido seguir. Todo está perdido.
        A veces pienso que sería mejor no estar aquí, desaparecer para siempre.
        Siento que no hay salida, que estoy condenado. Nada va a mejorar nunca.
        """
    }

    resultado2 = riesgo_psico_emocional_basico(entrada_alto_riesgo)
    print(f"\nNivel de riesgo: {resultado2['nivel_riesgo']}")
    print(f"\nAlertas:")
    for alerta in resultado2['alertas']:
        print(f"  ⚠️  {alerta}")
    print(f"\nSeñales detectadas:")
    for categoria, señales in resultado2['señales_detectadas'].items():
        print(f"  - {categoria}: {', '.join(señales[:3])}")
    print(f"\nRecomendaciones:")
    for rec in resultado2['recomendaciones']:
        print(f"  - {rec}")
    print(f"\n{resultado2['aviso_legal']}")
