"""
utils.py - Funciones auxiliares para el análisis de texto

Este módulo contiene funciones de utilidad que serán usadas por todos los
módulos de análisis de la clínica cultural y lingüística.
"""

import re
from typing import List, Dict, Set
from collections import Counter


# =============================================================================
# LISTAS DE REFERENCIA LINGÜÍSTICAS
# =============================================================================

PRONOMBRES_PRIMERA_PERSONA = {
    'yo', 'me', 'mi', 'mí', 'mis', 'conmigo', 'nosotros', 'nosotras',
    'nos', 'nuestro', 'nuestra', 'nuestros', 'nuestras'
}

CONECTORES = {
    # Causa/consecuencia
    'porque', 'por', 'ya que', 'dado que', 'puesto que', 'como',
    'por tanto', 'por lo tanto', 'así que', 'entonces', 'consecuentemente',
    # Contraste
    'pero', 'sin embargo', 'no obstante', 'aunque', 'a pesar de',
    'mientras que', 'en cambio', 'sino',
    # Adición
    'y', 'además', 'también', 'asimismo', 'igualmente', 'incluso',
    # Temporal
    'cuando', 'mientras', 'antes', 'después', 'luego', 'entonces',
    'finalmente', 'posteriormente', 'anteriormente'
}

PALABRAS_EMOCIONALES = {
    'alegría': {
        'feliz', 'alegre', 'contento', 'contenta', 'alegría', 'gozo', 'felicidad',
        'sonrisa', 'risa', 'reír', 'disfrutar', 'disfruté', 'emocionado',
        'emocionada', 'entusiasmo', 'ilusión'
    },
    'tristeza': {
        'triste', 'tristeza', 'pena', 'melancolía', 'melancólico', 'llorar',
        'llanto', 'lágrimas', 'deprimido', 'deprimida', 'desanimado', 'desanimada',
        'soledad', 'solo', 'sola', 'nostalgia', 'nostálgico'
    },
    'miedo': {
        'miedo', 'temor', 'pánico', 'terror', 'asustado', 'asustada',
        'angustia', 'ansiedad', 'ansioso', 'ansiosa', 'nervioso', 'nerviosa',
        'preocupado', 'preocupada', 'inseguro', 'insegura'
    },
    'rabia': {
        'rabia', 'ira', 'enfado', 'enfadado', 'enfadada', 'enojado', 'enojada',
        'furia', 'furioso', 'furiosa', 'molesto', 'molesta', 'irritado',
        'irritada', 'frustrado', 'frustrada', 'indignación'
    }
}

VERBOS_MODALES = {
    'quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren',
    'puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden',
    'debo', 'debes', 'debe', 'debemos', 'debéis', 'deben',
    'tengo que', 'tienes que', 'tiene que', 'tenemos que', 'tenéis que', 'tienen que',
    'necesito', 'necesitas', 'necesita', 'necesitamos', 'necesitáis', 'necesitan'
}

TEMAS_PALABRAS_CLAVE = {
    'familia': {
        'familia', 'madre', 'padre', 'hermano', 'hermana', 'hijo', 'hija',
        'abuelo', 'abuela', 'tío', 'tía', 'primo', 'prima', 'mamá', 'papá',
        'padres', 'hijos', 'esposo', 'esposa', 'marido', 'mujer'
    },
    'trabajo': {
        'trabajo', 'empleo', 'jefe', 'jefa', 'compañero', 'compañera', 'oficina',
        'empresa', 'sueldo', 'salario', 'negocio', 'profesión', 'carrera',
        'desempleo', 'paro', 'contratar', 'despedir'
    },
    'estudios': {
        'estudiar', 'estudios', 'escuela', 'colegio', 'instituto', 'universidad',
        'profesor', 'profesora', 'maestro', 'maestra', 'clase', 'curso',
        'examen', 'aprender', 'enseñar', 'educación'
    },
    'salud': {
        'salud', 'enfermedad', 'enfermo', 'enferma', 'médico', 'médica',
        'hospital', 'clínica', 'dolor', 'medicina', 'tratamiento', 'curar'
    },
    'vivienda': {
        'casa', 'hogar', 'piso', 'apartamento', 'vivienda', 'habitación',
        'vecino', 'vecina', 'barrio', 'alquiler', 'comprar', 'vivir'
    }
}


# =============================================================================
# FUNCIONES DE TOKENIZACIÓN Y ANÁLISIS BÁSICO
# =============================================================================

def tokenizar(texto: str) -> List[str]:
    """
    Tokeniza el texto en palabras individuales.

    Args:
        texto: Texto a tokenizar

    Returns:
        Lista de palabras (tokens) en minúsculas
    """
    # Convertir a minúsculas y dividir por espacios/puntuación
    texto_limpio = re.sub(r'[^\w\s]', ' ', texto.lower())
    tokens = texto_limpio.split()
    return tokens


def contar_palabras(texto: str) -> int:
    """
    Cuenta el número total de palabras en el texto.

    Args:
        texto: Texto a analizar

    Returns:
        Número de palabras
    """
    tokens = tokenizar(texto)
    return len(tokens)


def calcular_variedad_lexica(texto: str) -> float:
    """
    Calcula la variedad léxica (type-token ratio).

    Fórmula: (palabras únicas / palabras totales)
    Valores cercanos a 1 = alta variedad; cercanos a 0 = baja variedad

    Args:
        texto: Texto a analizar

    Returns:
        Valor entre 0 y 1 indicando variedad léxica
    """
    tokens = tokenizar(texto)
    if len(tokens) == 0:
        return 0.0

    tokens_unicos = set(tokens)
    return len(tokens_unicos) / len(tokens)


def contar_pronombres_primera_persona(texto: str) -> Dict[str, float]:
    """
    Cuenta los pronombres de primera persona en el texto.

    Args:
        texto: Texto a analizar

    Returns:
        Dict con conteo absoluto y porcentaje respecto al total de palabras
    """
    tokens = tokenizar(texto)
    total_palabras = len(tokens)

    if total_palabras == 0:
        return {'conteo': 0, 'porcentaje': 0.0}

    conteo = sum(1 for token in tokens if token in PRONOMBRES_PRIMERA_PERSONA)
    porcentaje = (conteo / total_palabras) * 100

    return {
        'conteo': conteo,
        'porcentaje': round(porcentaje, 2)
    }


def detectar_verbos_pasado(texto: str) -> Dict[str, float]:
    """
    Detecta verbos en pasado usando patrones de terminaciones típicas.

    Detecta:
    - Pretérito indefinido: -é, -aste, -ó, -amos, -asteis, -aron
    - Imperfecto: -aba, -ía

    Args:
        texto: Texto a analizar

    Returns:
        Dict con conteo y porcentaje de verbos en pasado
    """
    tokens = tokenizar(texto)
    total_palabras = len(tokens)

    if total_palabras == 0:
        return {'conteo': 0, 'porcentaje': 0.0}

    # Patrones de terminaciones de pasado
    patrones_pasado = [
        r'\w+é$',      # hablé, comí
        r'\w+aste$',   # hablaste
        r'\w+ó$',      # habló
        r'\w+amos$',   # hablamos (puede ser presente también)
        r'\w+asteis$', # hablasteis
        r'\w+aron$',   # hablaron
        r'\w+ieron$',  # comieron
        r'\w+aba$',    # hablaba
        r'\w+ían$',    # hablaban
        r'\w+ía$',     # comía
    ]

    conteo = 0
    for token in tokens:
        for patron in patrones_pasado:
            if re.match(patron, token):
                conteo += 1
                break

    porcentaje = (conteo / total_palabras) * 100

    return {
        'conteo': conteo,
        'porcentaje': round(porcentaje, 2)
    }


def contar_conectores(texto: str) -> Dict[str, float]:
    """
    Cuenta el uso de conectores discursivos en el texto.

    Args:
        texto: Texto a analizar

    Returns:
        Dict con conteo y porcentaje de conectores
    """
    tokens = tokenizar(texto)
    total_palabras = len(tokens)

    if total_palabras == 0:
        return {'conteo': 0, 'porcentaje': 0.0}

    conteo = sum(1 for token in tokens if token in CONECTORES)
    porcentaje = (conteo / total_palabras) * 100

    return {
        'conteo': conteo,
        'porcentaje': round(porcentaje, 2)
    }


def detectar_emociones(texto: str) -> Dict[str, int]:
    """
    Detecta palabras emocionales en el texto.

    Args:
        texto: Texto a analizar

    Returns:
        Dict con conteo de cada emoción detectada
    """
    tokens = tokenizar(texto)

    emociones_detectadas = {}
    for emocion, palabras in PALABRAS_EMOCIONALES.items():
        conteo = sum(1 for token in tokens if token in palabras)
        emociones_detectadas[emocion] = conteo

    return emociones_detectadas


def detectar_temas(texto: str) -> Dict[str, int]:
    """
    Detecta temas principales mencionados en el texto.

    Args:
        texto: Texto a analizar

    Returns:
        Dict con conteo de menciones de cada tema
    """
    tokens = tokenizar(texto)

    temas_detectados = {}
    for tema, palabras_clave in TEMAS_PALABRAS_CLAVE.items():
        conteo = sum(1 for token in tokens if token in palabras_clave)
        temas_detectados[tema] = conteo

    return temas_detectados


def validar_entrada(entrada: Dict) -> bool:
    """
    Valida que la entrada tenga los campos mínimos requeridos.

    Args:
        entrada: Dict con los datos de entrada

    Returns:
        True si es válida, False en caso contrario
    """
    campos_requeridos = ['id_sujeto', 'texto']
    return all(campo in entrada for campo in campos_requeridos)


def limpiar_texto(texto: str) -> str:
    """
    Limpia el texto de espacios extra y normaliza.

    Args:
        texto: Texto a limpiar

    Returns:
        Texto limpio
    """
    # Eliminar espacios múltiples
    texto = re.sub(r'\s+', ' ', texto)
    # Eliminar espacios al inicio y final
    texto = texto.strip()
    return texto
