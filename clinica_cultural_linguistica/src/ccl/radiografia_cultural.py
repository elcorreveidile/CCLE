"""
radiografia_cultural.py

Módulo para analizar los referentes culturales presentes en el texto.

Analiza:
- Referentes culturales del país de origen
- Referentes culturales del país de acogida
- Campos culturales mencionados (familia, trabajo, fiesta, etc.)
- Tensión cultural dominante (nostalgia, choque, integración, exploración)
"""

from typing import Dict, List
from .utils import tokenizar, limpiar_texto, validar_entrada


# =============================================================================
# BASES DE DATOS CULTURALES
# =============================================================================

# Referentes por países (ejemplos - se pueden expandir)
REFERENTES_CULTURALES = {
    'colombia': {
        'lugares': {'bogotá', 'medellín', 'cartagena', 'cali', 'barranquilla'},
        'comidas': {'arepa', 'bandeja paisa', 'ajiaco', 'sancocho', 'empanada'},
        'fiestas': {'carnaval de barranquilla', 'feria de las flores', 'festival de música'},
        'instituciones': {'sena', 'icbf'},
        'cultura': {'vallenato', 'cumbia', 'salsa', 'café', 'aguardiente'}
    },
    'venezuela': {
        'lugares': {'caracas', 'maracaibo', 'valencia', 'maracay'},
        'comidas': {'arepa', 'pabellón', 'hallaca', 'cachapa', 'tequeño'},
        'fiestas': {'carnaval', 'día de la chinita'},
        'cultura': {'joropo', 'gaita', 'béisbol'}
    },
    'ecuador': {
        'lugares': {'quito', 'guayaquil', 'cuenca'},
        'comidas': {'ceviche', 'encebollado', 'hornado', 'llapingacho'},
        'fiestas': {'inti raymi', 'carnaval'},
        'cultura': {'pasillo', 'san juanito'}
    },
    'perú': {
        'lugares': {'lima', 'cusco', 'arequipa', 'machu picchu'},
        'comidas': {'ceviche', 'lomo saltado', 'ají de gallina', 'causa', 'anticuchos'},
        'fiestas': {'inti raymi', 'fiestas patrias', 'señor de los milagros'},
        'cultura': {'huayno', 'marinera', 'pisco'}
    },
    'méxico': {
        'lugares': {'ciudad de méxico', 'guadalajara', 'monterrey', 'cancún'},
        'comidas': {'tacos', 'tamales', 'mole', 'pozole', 'enchiladas'},
        'fiestas': {'día de muertos', 'cinco de mayo', 'grito de independencia'},
        'cultura': {'mariachi', 'ranchera', 'tequila', 'lucha libre'}
    },
    'argentina': {
        'lugares': {'buenos aires', 'córdoba', 'rosario', 'mendoza'},
        'comidas': {'asado', 'empanadas', 'milanesa', 'dulce de leche'},
        'fiestas': {'carnaval', 'fiesta nacional de la vendimia'},
        'cultura': {'tango', 'mate', 'fútbol', 'vino'}
    },
    'españa': {
        'lugares': {'madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao'},
        'comidas': {'paella', 'tortilla', 'jamón', 'gazpacho', 'tapas'},
        'fiestas': {'semana santa', 'feria de abril', 'san fermines', 'tomatina'},
        'cultura': {'flamenco', 'fútbol', 'siesta', 'corrida'}
    }
}

# Campos culturales temáticos
CAMPOS_CULTURALES = {
    'familia': {
        'familia', 'madre', 'padre', 'hermano', 'hermana', 'abuelo', 'hijo',
        'parientes', 'tío', 'primo', 'familias', 'hogar', 'casa familiar'
    },
    'trabajo': {
        'trabajo', 'empleo', 'oficina', 'empresa', 'negocio', 'jefe',
        'compañeros de trabajo', 'sueldo', 'horario', 'profesión'
    },
    'fiesta': {
        'fiesta', 'celebración', 'festival', 'carnaval', 'navidad',
        'cumpleaños', 'boda', 'baile', 'música', 'tradición'
    },
    'comida': {
        'comida', 'cocina', 'plato', 'receta', 'restaurante',
        'comer', 'almuerzo', 'cena', 'desayuno', 'sabor'
    },
    'idioma': {
        'idioma', 'lengua', 'español', 'hablar', 'acento',
        'palabras', 'expresión', 'comunicación', 'vocabulario'
    },
    'educación': {
        'escuela', 'colegio', 'universidad', 'estudiar', 'aprender',
        'clase', 'curso', 'profesor', 'alumno', 'educación'
    },
    'religión': {
        'iglesia', 'dios', 'fe', 'religión', 'oración', 'misa',
        'santo', 'virgen', 'creencia', 'espiritual'
    }
}

# Palabras indicadoras de tensión cultural
INDICADORES_TENSION = {
    'nostalgia': {
        'extrañar', 'echar de menos', 'añorar', 'recordar', 'antes',
        'allá', 'mi país', 'mi tierra', 'nostalgia', 'lejos', 'distancia'
    },
    'choque': {
        'diferente', 'extraño', 'raro', 'difícil', 'no entiendo',
        'confuso', 'incomprensible', 'choque', 'contraste', 'distinto'
    },
    'integración': {
        'adaptado', 'acostumbrado', 'integrado', 'comunidad', 'pertenezco',
        'acepto', 'comprendido', 'cómodo', 'bienvenido', 'parte de'
    },
    'exploración': {
        'nuevo', 'descubrir', 'conocer', 'aprender', 'experiencia',
        'oportunidad', 'aventura', 'interesante', 'curioso', 'explorar'
    },
    'rechazo': {
        'no me gusta', 'odio', 'malo', 'peor', 'horrible',
        'rechazar', 'desprecio', 'discriminación', 'racismo'
    }
}


# =============================================================================
# FUNCIONES DE ANÁLISIS CULTURAL
# =============================================================================

def detectar_referentes_pais(texto: str, pais: str) -> List[str]:
    """
    Detecta referentes culturales de un país específico en el texto.

    Args:
        texto: Texto a analizar
        pais: País del que buscar referentes (en minúsculas)

    Returns:
        Lista de referentes detectados
    """
    if pais not in REFERENTES_CULTURALES:
        return []

    tokens = set(tokenizar(texto))
    texto_limpio = texto.lower()

    referentes_encontrados = []
    datos_pais = REFERENTES_CULTURALES[pais]

    # Buscar en todas las categorías del país
    for categoria, items in datos_pais.items():
        for item in items:
            # Buscar tanto en tokens individuales como en el texto completo
            # (para detectar expresiones de múltiples palabras)
            if item in texto_limpio:
                referentes_encontrados.append(item)

    return referentes_encontrados


def detectar_campos_culturales(texto: str) -> Dict[str, int]:
    """
    Detecta qué campos culturales están presentes en el texto.

    Args:
        texto: Texto a analizar

    Returns:
        Dict con conteo de menciones por campo cultural
    """
    tokens = tokenizar(texto)
    texto_limpio = texto.lower()

    campos_detectados = {}

    for campo, palabras_clave in CAMPOS_CULTURALES.items():
        conteo = 0
        for palabra in palabras_clave:
            # Buscar tanto tokens como expresiones completas
            if ' ' in palabra:
                if palabra in texto_limpio:
                    conteo += 1
            else:
                conteo += tokens.count(palabra)

        campos_detectados[campo] = conteo

    return campos_detectados


def detectar_tension_cultural(texto: str) -> Dict[str, int]:
    """
    Detecta indicadores de tensión cultural en el texto.

    Args:
        texto: Texto a analizar

    Returns:
        Dict con conteo de indicadores por tipo de tensión
    """
    tokens = tokenizar(texto)
    texto_limpio = texto.lower()

    tensiones = {}

    for tipo_tension, indicadores in INDICADORES_TENSION.items():
        conteo = 0
        for indicador in indicadores:
            if ' ' in indicador:
                if indicador in texto_limpio:
                    conteo += 1
            else:
                conteo += tokens.count(indicador)

        tensiones[tipo_tension] = conteo

    return tensiones


def determinar_tension_dominante(tensiones: Dict[str, int]) -> str:
    """
    Determina cuál es la tensión cultural dominante.

    Args:
        tensiones: Dict con conteos de cada tipo de tensión

    Returns:
        String con el tipo de tensión dominante o "equilibrio" si no hay clara predominancia
    """
    if all(count == 0 for count in tensiones.values()):
        return "sin_indicadores"

    max_tension = max(tensiones.items(), key=lambda x: x[1])

    if max_tension[1] == 0:
        return "sin_indicadores"

    # Si hay una tensión claramente dominante
    if max_tension[1] >= 2:
        return max_tension[0]

    return "equilibrio"


def generar_comentarios_culturales(
    referentes_origen: List[str],
    referentes_acogida: List[str],
    campos: Dict[str, int],
    tension: str
) -> List[str]:
    """
    Genera comentarios interpretativos sobre el análisis cultural.

    Args:
        referentes_origen: Referentes del país de origen detectados
        referentes_acogida: Referentes del país de acogida detectados
        campos: Campos culturales y sus frecuencias
        tension: Tensión cultural dominante

    Returns:
        Lista de comentarios interpretativos
    """
    comentarios = []

    # Comentario sobre balance de referentes
    if len(referentes_origen) > len(referentes_acogida) * 2:
        comentarios.append(
            "Menciona muchos más referentes del país de origen que del de acogida, "
            "posible anclaje en la cultura de origen."
        )
    elif len(referentes_acogida) > len(referentes_origen) * 2:
        comentarios.append(
            "Menciona más referentes del país de acogida que del de origen, "
            "posible proceso de adaptación cultural activo."
        )
    elif len(referentes_origen) == 0 and len(referentes_acogida) == 0:
        comentarios.append(
            "No se detectan referentes culturales específicos, "
            "discurso desculturizado o muy general."
        )

    # Comentario sobre campos culturales
    campos_principales = sorted(campos.items(), key=lambda x: x[1], reverse=True)[:3]
    campos_con_menciones = [c[0] for c in campos_principales if c[1] > 0]

    if campos_con_menciones:
        comentarios.append(
            f"Campos culturales principales: {', '.join(campos_con_menciones)}."
        )

    # Comentario sobre tensión
    if tension == "nostalgia":
        comentarios.append(
            "Predomina la nostalgia, posible duelo migratorio en proceso."
        )
    elif tension == "choque":
        comentarios.append(
            "Se evidencia choque cultural, dificultades de adaptación."
        )
    elif tension == "integración":
        comentarios.append(
            "Indicadores de integración cultural positiva."
        )
    elif tension == "exploración":
        comentarios.append(
            "Actitud exploratoria hacia la nueva cultura, apertura al cambio."
        )
    elif tension == "rechazo":
        comentarios.append(
            "Señales de rechazo o conflicto con la cultura de acogida."
        )

    return comentarios


def radiografia_cultural(entrada: Dict) -> Dict:
    """
    Realiza una radiografía cultural completa del texto.

    Esta es la función principal del módulo.

    Args:
        entrada: Dict con la estructura:
            {
                "id_sujeto": str,
                "texto": str,
                "metadatos": {
                    "pais_origen": str (opcional),
                    "pais_residencia": str (opcional)
                }
            }

    Returns:
        Dict con la radiografía cultural:
            {
                "id_sujeto": str,
                "referentes_origen": List[str],
                "referentes_acogida": List[str],
                "campos_culturales": Dict[str, int],
                "tension_dominante": str,
                "comentarios": List[str]
            }
    """
    # Validación
    if not validar_entrada(entrada):
        raise ValueError("La entrada debe contener al menos 'id_sujeto' y 'texto'")

    # Limpiar texto
    texto = limpiar_texto(entrada['texto'])

    # Obtener metadatos
    metadatos = entrada.get('metadatos', {})
    pais_origen = metadatos.get('pais_origen', '').lower()
    pais_residencia = metadatos.get('pais_residencia', '').lower()

    # Detectar referentes culturales
    referentes_origen = []
    referentes_acogida = []

    if pais_origen:
        referentes_origen = detectar_referentes_pais(texto, pais_origen)

    if pais_residencia and pais_residencia != pais_origen:
        referentes_acogida = detectar_referentes_pais(texto, pais_residencia)

    # Detectar campos culturales
    campos_culturales = detectar_campos_culturales(texto)

    # Detectar tensión cultural
    tensiones = detectar_tension_cultural(texto)
    tension_dominante = determinar_tension_dominante(tensiones)

    # Generar comentarios
    comentarios = generar_comentarios_culturales(
        referentes_origen,
        referentes_acogida,
        campos_culturales,
        tension_dominante
    )

    # Construir y retornar resultado
    resultado = {
        "id_sujeto": entrada['id_sujeto'],
        "referentes_origen": referentes_origen,
        "referentes_acogida": referentes_acogida,
        "campos_culturales": {k: v for k, v in campos_culturales.items() if v > 0},
        "tension_dominante": tension_dominante,
        "tensiones_detectadas": tensiones,
        "comentarios": comentarios
    }

    return resultado


# =============================================================================
# EJEMPLO DE USO
# =============================================================================

if __name__ == "__main__":
    # Ejemplo de entrada
    entrada_ejemplo = {
        "id_sujeto": "paciente_002",
        "texto": """
        Extraño mucho mi país. En Colombia todo era diferente.
        Los domingos mi familia se reunía para comer sancocho y escuchar vallenato.
        Aquí en España es todo muy distinto. La gente come tapas y jamón.
        Al principio me sentía muy extraño, pero poco a poco me estoy acostumbrando.
        He descubierto que la paella es deliciosa y he hecho amigos españoles.
        Todavía echo de menos Bogotá y a mi madre, pero también disfruto
        conociendo nuevas cosas y lugares. Madrid es una ciudad interesante.
        """,
        "metadatos": {
            "pais_origen": "colombia",
            "pais_residencia": "españa"
        }
    }

    # Ejecutar radiografía
    resultado = radiografia_cultural(entrada_ejemplo)

    # Mostrar resultado
    print("=" * 80)
    print("RADIOGRAFÍA CULTURAL")
    print("=" * 80)
    print(f"\nID Sujeto: {resultado['id_sujeto']}")
    print(f"\nReferentes del país de origen:")
    for ref in resultado['referentes_origen']:
        print(f"  - {ref}")
    print(f"\nReferentes del país de acogida:")
    for ref in resultado['referentes_acogida']:
        print(f"  - {ref}")
    print(f"\nCampos culturales mencionados:")
    for campo, freq in resultado['campos_culturales'].items():
        print(f"  - {campo}: {freq} menciones")
    print(f"\nTensión cultural dominante: {resultado['tension_dominante']}")
    print(f"\nComentarios:")
    for comentario in resultado['comentarios']:
        print(f"  - {comentario}")
