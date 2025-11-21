"""
diagnostico_linguistico_emocional.py

Módulo principal de diagnóstico lingüístico y emocional.

Analiza textos de estudiantes/pacientes y genera un diagnóstico que incluye:
- Nivel lingüístico probable (basado en complejidad léxica y gramatical)
- Estado emocional dominante (basado en palabras emocionales)
- Recursos discursivos utilizados
- Errores y patrones lingüísticos clave
- Hipótesis clínicas lingüísticas
"""

from typing import Dict, List
from .utils import (
    validar_entrada,
    limpiar_texto,
    contar_palabras,
    calcular_variedad_lexica,
    contar_pronombres_primera_persona,
    detectar_verbos_pasado,
    contar_conectores,
    detectar_emociones,
)


def estimar_nivel_linguistico(metricas: Dict) -> str:
    """
    Estima el nivel lingüístico basándose en las métricas del texto.

    Criterios heurísticos:
    - A1/A2: < 100 palabras, variedad léxica < 0.4, pocos conectores
    - B1: 100-200 palabras, variedad léxica 0.4-0.55, conectores moderados
    - B2: 200-400 palabras, variedad léxica 0.55-0.7, buenos conectores
    - C1/C2: > 400 palabras, variedad léxica > 0.7, conectores variados

    Args:
        metricas: Dict con las métricas calculadas del texto

    Returns:
        String con el nivel estimado (ej: "B1", "B2/C1")
    """
    longitud = metricas['longitud_texto']
    variedad = metricas['variedad_lexica']
    conectores = metricas['porcentaje_conectores']

    # Puntuación acumulativa
    puntos = 0

    # Criterio: longitud del texto
    if longitud < 100:
        puntos += 1
    elif longitud < 200:
        puntos += 2
    elif longitud < 400:
        puntos += 3
    else:
        puntos += 4

    # Criterio: variedad léxica
    if variedad < 0.4:
        puntos += 1
    elif variedad < 0.55:
        puntos += 2
    elif variedad < 0.7:
        puntos += 3
    else:
        puntos += 4

    # Criterio: uso de conectores
    if conectores < 2:
        puntos += 1
    elif conectores < 4:
        puntos += 2
    elif conectores < 6:
        puntos += 3
    else:
        puntos += 4

    # Mapeo de puntos a nivel
    if puntos <= 4:
        return "A1/A2"
    elif puntos <= 7:
        return "B1"
    elif puntos <= 10:
        return "B2"
    else:
        return "B2/C1"


def detectar_estado_emocional(emociones: Dict[str, int]) -> str:
    """
    Determina el estado emocional dominante basándose en las palabras detectadas.

    Args:
        emociones: Dict con conteo de palabras emocionales por categoría

    Returns:
        String con la emoción dominante o "neutro" si no hay clara predominancia
    """
    if all(count == 0 for count in emociones.values()):
        return "neutro"

    # Encontrar la emoción con más menciones
    emocion_dominante = max(emociones.items(), key=lambda x: x[1])

    if emocion_dominante[1] == 0:
        return "neutro"

    return emocion_dominante[0]


def identificar_recursos_discursivos(texto: str, metricas: Dict) -> List[str]:
    """
    Identifica los recursos discursivos principales utilizados en el texto.

    Heurísticas:
    - Narración: uso de verbos en pasado
    - Descripción: uso de adjetivos y presente
    - Argumentación: uso de conectores causales/contrastativos
    - Diálogo: presencia de comillas o guiones de diálogo

    Args:
        texto: Texto original
        metricas: Métricas calculadas

    Returns:
        Lista de recursos discursivos identificados
    """
    recursos = []

    # Detectar narración
    if metricas['porcentaje_verbos_pasado'] > 5:
        recursos.append("narración")

    # Detectar descripción (si hay muchas palabras pero poco pasado)
    if metricas['porcentaje_verbos_pasado'] < 5 and metricas['longitud_texto'] > 50:
        recursos.append("descripción")

    # Detectar argumentación (conectores causales/contrastativos)
    if metricas['porcentaje_conectores'] > 4:
        recursos.append("argumentación")

    # Detectar diálogo
    if '"' in texto or '—' in texto or '-' in texto:
        recursos.append("diálogo")

    # Si no se detecta nada específico
    if not recursos:
        recursos.append("expresión_simple")

    return recursos


def identificar_errores_clave(metricas: Dict) -> List[str]:
    """
    Identifica patrones que pueden indicar errores o áreas de mejora lingüística.

    Args:
        metricas: Métricas calculadas del texto

    Returns:
        Lista de errores/problemas identificados
    """
    errores = []

    # Problema con tiempos pasados
    if metricas['porcentaje_verbos_pasado'] < 2 and metricas['longitud_texto'] > 100:
        errores.append("problemas_tiempos_pasado")

    # Pobreza léxica
    if metricas['variedad_lexica'] < 0.4:
        errores.append("pobreza_lexica")

    # Escasez de conectores
    if metricas['porcentaje_conectores'] < 2:
        errores.append("escasez_conectores")

    # Texto muy corto
    if metricas['longitud_texto'] < 50:
        errores.append("texto_muy_corto")

    return errores


def generar_hipotesis_clinica(metricas: Dict, recursos: List[str], errores: List[str]) -> List[str]:
    """
    Genera hipótesis clínicas lingüísticas basadas en los patrones detectados.

    Args:
        metricas: Métricas del texto
        recursos: Recursos discursivos identificados
        errores: Errores identificados

    Returns:
        Lista de hipótesis clínicas
    """
    hipotesis = []

    # Hipótesis sobre uso de primera persona
    if metricas['porcentaje_pronombres_primera_persona'] < 2:
        hipotesis.append(
            "Evita el uso de primera persona del singular, posible distanciamiento del yo"
        )
    elif metricas['porcentaje_pronombres_primera_persona'] > 10:
        hipotesis.append(
            "Uso muy frecuente de primera persona, fuerte centrado en el yo"
        )

    # Hipótesis sobre narración del pasado
    if "problemas_tiempos_pasado" in errores:
        hipotesis.append(
            "Se mantiene en presente y apenas narra el pasado, posible dificultad para elaborar memoria"
        )

    # Hipótesis sobre complejidad discursiva
    if "expresión_simple" in recursos and metricas['longitud_texto'] < 100:
        hipotesis.append(
            "Expresión muy simple y breve, puede indicar bloqueo o dificultad de expresión"
        )

    # Hipótesis sobre conectores
    if "escasez_conectores" in errores:
        hipotesis.append(
            "Escasa cohesión textual, ideas yuxtapuestas sin conectar"
        )

    return hipotesis


def diagnostico_linguistico_emocional(entrada: Dict) -> Dict:
    """
    Realiza un diagnóstico lingüístico y emocional completo del texto.

    Esta es la función principal del módulo que orquesta todo el análisis.

    Args:
        entrada: Dict con la estructura:
            {
                "id_sujeto": str,
                "texto": str,
                "idioma": str (opcional, default "es"),
                "nivel_declarado": str (opcional),
                "edad": int (opcional),
                "contexto": str (opcional),
                "metadatos": dict (opcional)
            }

    Returns:
        Dict con el diagnóstico completo:
            {
                "nivel_probable": str,
                "estado_emocional_dominante": str,
                "recursos_discursivos": List[str],
                "errores_clave": List[str],
                "hipotesis_clinica_linguistica": List[str],
                "metricas": Dict
            }
    """
    # Validación de entrada
    if not validar_entrada(entrada):
        raise ValueError("La entrada debe contener al menos 'id_sujeto' y 'texto'")

    # Extraer y limpiar el texto
    texto = limpiar_texto(entrada['texto'])

    # Calcular métricas básicas
    longitud = contar_palabras(texto)
    variedad = calcular_variedad_lexica(texto)
    pronombres_primera = contar_pronombres_primera_persona(texto)
    verbos_pasado = detectar_verbos_pasado(texto)
    conectores = contar_conectores(texto)
    emociones = detectar_emociones(texto)

    # Construir dict de métricas
    metricas = {
        'longitud_texto': longitud,
        'variedad_lexica': round(variedad, 2),
        'porcentaje_pronombres_primera_persona': pronombres_primera['porcentaje'],
        'porcentaje_verbos_pasado': verbos_pasado['porcentaje'],
        'porcentaje_conectores': conectores['porcentaje'],
        'emociones_detectadas': emociones
    }

    # Realizar análisis
    nivel_probable = estimar_nivel_linguistico(metricas)
    estado_emocional = detectar_estado_emocional(emociones)
    recursos_discursivos = identificar_recursos_discursivos(texto, metricas)
    errores_clave = identificar_errores_clave(metricas)
    hipotesis_clinica = generar_hipotesis_clinica(metricas, recursos_discursivos, errores_clave)

    # Construir y retornar el diagnóstico
    diagnostico = {
        "id_sujeto": entrada['id_sujeto'],
        "nivel_probable": nivel_probable,
        "estado_emocional_dominante": estado_emocional,
        "recursos_discursivos": recursos_discursivos,
        "errores_clave": errores_clave,
        "hipotesis_clinica_linguistica": hipotesis_clinica,
        "metricas": metricas
    }

    return diagnostico


# =============================================================================
# EJEMPLO DE USO
# =============================================================================

if __name__ == "__main__":
    # Ejemplo de entrada
    entrada_ejemplo = {
        "id_sujeto": "paciente_001",
        "texto": """
        Me llamo Ana y vengo de Colombia. Llegué a España hace dos años.
        Trabajo en una tienda y estudio español por las noches.
        A veces me siento triste porque extraño a mi familia.
        Mi madre y mis hermanos están en Bogotá. Los echo de menos mucho.
        Pero también estoy contenta porque aquí tengo nuevos amigos y
        estoy aprendiendo muchas cosas. El trabajo es difícil pero me gusta.
        Quiero mejorar mi español para poder estudiar en la universidad.
        """,
        "idioma": "es",
        "nivel_declarado": "B1",
        "edad": 28,
        "contexto": "relato_personal"
    }

    # Ejecutar diagnóstico
    resultado = diagnostico_linguistico_emocional(entrada_ejemplo)

    # Mostrar resultado
    print("=" * 80)
    print("DIAGNÓSTICO LINGÜÍSTICO Y EMOCIONAL")
    print("=" * 80)
    print(f"\nID Sujeto: {resultado['id_sujeto']}")
    print(f"Nivel probable: {resultado['nivel_probable']}")
    print(f"Estado emocional dominante: {resultado['estado_emocional_dominante']}")
    print(f"\nRecursos discursivos: {', '.join(resultado['recursos_discursivos'])}")
    print(f"\nErrores clave detectados:")
    for error in resultado['errores_clave']:
        print(f"  - {error}")
    print(f"\nHipótesis clínica lingüística:")
    for hipotesis in resultado['hipotesis_clinica_linguistica']:
        print(f"  - {hipotesis}")
    print(f"\nMétricas:")
    for clave, valor in resultado['metricas'].items():
        print(f"  {clave}: {valor}")
