#!/usr/bin/env python3
"""
ejemplo_pipeline.py

Script de demostración del pipeline completo de la Clínica Cultural y Lingüística.

Este ejemplo muestra cómo usar todos los módulos del sistema CCL de forma integrada
para analizar textos de estudiantes/pacientes y generar diagnósticos y prescripciones.
"""

import json
import sys
from pathlib import Path

# Añadir el directorio src al path para poder importar ccl
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from ccl import (
    diagnostico_linguistico_emocional,
    radiografia_cultural,
    deteccion_bloqueos_discursivos,
    prescripcion_tareas,
    seguimiento_progreso,
    riesgo_psico_emocional_basico,
    analisis_completo,
)


def imprimir_separador(titulo=""):
    """Imprime un separador visual con título opcional."""
    print("\n" + "=" * 80)
    if titulo:
        print(f"{titulo:^80}")
        print("=" * 80)


def ejemplo_basico():
    """
    Ejemplo 1: Análisis básico de un texto individual.
    """
    imprimir_separador("EJEMPLO 1: ANÁLISIS BÁSICO")

    # Preparar entrada
    entrada = {
        "id_sujeto": "ana_colombia_001",
        "texto": """
        Me llamo Ana y vengo de Colombia. Llegué a España hace dos años.
        Trabajo en una tienda y estudio español por las noches.
        A veces me siento triste porque extraño a mi familia.
        Mi madre y mis hermanos están en Bogotá. Los echo de menos mucho.
        Pero también estoy contenta porque aquí tengo nuevos amigos y
        estoy aprendiendo muchas cosas. El trabajo es difícil pero me gusta.
        Quiero mejorar mi español para poder estudiar en la universidad.
        En mi país hacíamos sancocho los domingos y escuchábamos vallenato.
        Aquí he probado la paella y me gusta, aunque es muy diferente.
        """,
        "idioma": "es",
        "nivel_declarado": "B1",
        "edad": 28,
        "contexto": "relato_personal",
        "metadatos": {
            "pais_origen": "colombia",
            "pais_residencia": "españa"
        }
    }

    # 1. Diagnóstico lingüístico-emocional
    print("\n--- 1. DIAGNÓSTICO LINGÜÍSTICO-EMOCIONAL ---")
    diagnostico = diagnostico_linguistico_emocional(entrada)
    print(f"Nivel probable: {diagnostico['nivel_probable']}")
    print(f"Estado emocional: {diagnostico['estado_emocional_dominante']}")
    print(f"Recursos discursivos: {', '.join(diagnostico['recursos_discursivos'])}")
    print(f"Errores clave: {', '.join(diagnostico['errores_clave']) if diagnostico['errores_clave'] else 'Ninguno'}")
    print("\nHipótesis clínicas:")
    for hip in diagnostico['hipotesis_clinica_linguistica']:
        print(f"  • {hip}")

    # 2. Radiografía cultural
    print("\n--- 2. RADIOGRAFÍA CULTURAL ---")
    radiografia = radiografia_cultural(entrada)
    print(f"Referentes de origen: {', '.join(radiografia['referentes_origen'])}")
    print(f"Referentes de acogida: {', '.join(radiografia['referentes_acogida'])}")
    print(f"Tensión dominante: {radiografia['tension_dominante']}")
    print("Comentarios:")
    for com in radiografia['comentarios']:
        print(f"  • {com}")

    # 3. Detección de bloqueos
    print("\n--- 3. DETECCIÓN DE BLOQUEOS DISCURSIVOS ---")
    bloqueos = deteccion_bloqueos_discursivos(entrada)
    print(f"Nivel de riesgo de bloqueo: {bloqueos['nivel_riesgo_bloqueo']}")
    print("Temas detectados:")
    for tema in bloqueos['temas_detectados']:
        print(f"  • {tema['tema']}: {tema['frecuencia']} menciones, detalle: {tema['detalle_medio']}/5")
    if bloqueos['posibles_bloqueos']:
        print("Posibles bloqueos:")
        for bloqueo in bloqueos['posibles_bloqueos']:
            print(f"  • {bloqueo}")

    # 4. Prescripción de tareas
    print("\n--- 4. PRESCRIPCIÓN DE TAREAS ---")
    tareas = prescripcion_tareas(entrada, diagnostico, radiografia, bloqueos)
    print(f"Número de tareas recomendadas: {tareas['numero_tareas']}")
    print(f"\nJustificación:\n{tareas['justificacion']}")
    print("\nTareas:")
    for i, tarea in enumerate(tareas['tareas_recomendadas'], 1):
        print(f"\n  {i}. {tarea['tipo']}")
        print(f"     {tarea['descripcion']}")
        print(f"     → Objetivo lingüístico: {tarea['objetivo_linguistico']}")
        print(f"     → Objetivo clínico: {tarea['objetivo_clinico_cultural']}")

    # 5. Evaluación de riesgo
    print("\n--- 5. EVALUACIÓN DE RIESGO PSICO-EMOCIONAL ---")
    riesgo = riesgo_psico_emocional_basico(entrada)
    print(f"Nivel de riesgo: {riesgo['nivel_riesgo']}")
    if riesgo['alertas']:
        print("Alertas:")
        for alerta in riesgo['alertas']:
            print(f"  ⚠️  {alerta}")
    else:
        print("Sin alertas críticas")


def ejemplo_con_historial():
    """
    Ejemplo 2: Análisis con seguimiento de progreso (usando historial).
    """
    imprimir_separador("EJEMPLO 2: ANÁLISIS CON SEGUIMIENTO DE PROGRESO")

    # Simular 3 sesiones de un mismo sujeto
    sesion_1 = {
        "fecha": "2024-01-15",
        "id_sujeto": "carlos_venezuela_002",
        "texto": """
        Vine de Venezuela. Trabajo. Mi familia está allá.
        Todo es diferente aquí. Difícil. No puedo hablar bien.
        """,
        "metadatos": {
            "pais_origen": "venezuela",
            "pais_residencia": "españa"
        }
    }

    sesion_2 = {
        "fecha": "2024-02-15",
        "id_sujeto": "carlos_venezuela_002",
        "texto": """
        He estado aquí dos meses ya. Sigo trabajando en construcción.
        Extraño mucho a mi familia, especialmente a mis hijos.
        Pero estoy aprendiendo más español en las clases.
        A veces me siento solo, pero mis compañeros de trabajo me ayudan.
        """,
        "metadatos": {
            "pais_origen": "venezuela",
            "pais_residencia": "españa"
        }
    }

    sesion_3 = {
        "fecha": "2024-03-15",
        "id_sujeto": "carlos_venezuela_002",
        "texto": """
        Ya llevo tres meses aquí y me siento mejor. He encontrado un grupo
        de venezolanos que se reúnen los domingos a jugar fútbol y comer.
        Eso me hace recordar mi país pero también me ayuda a sentirme menos solo.
        En el trabajo he mejorado y el jefe me felicitó. Estoy orgulloso de eso.
        Hablo con mis hijos por videollamada cada semana. Es duro estar lejos
        pero sé que estoy aquí para darles un futuro mejor. He probado el
        jamón ibérico y la tortilla española, son deliciosos. También fui
        a ver un partido del Real Madrid, fue increíble. Poco a poco voy
        conociendo esta ciudad y ya no me siento tan perdido como al principio.
        """,
        "metadatos": {
            "pais_origen": "venezuela",
            "pais_residencia": "españa"
        }
    }

    # Analizar cada sesión y construir historial
    historial = []

    print("\n--- SESIÓN 1 (Mes 1) ---")
    analisis_1 = diagnostico_linguistico_emocional(sesion_1)
    radiografia_1 = radiografia_cultural(sesion_1)
    historial.append({**analisis_1, **radiografia_1, "fecha": sesion_1["fecha"]})
    print(f"Nivel: {analisis_1['nivel_probable']}")
    print(f"Longitud: {analisis_1['metricas']['longitud_texto']} palabras")
    print(f"Estado emocional: {analisis_1['estado_emocional_dominante']}")

    print("\n--- SESIÓN 2 (Mes 2) ---")
    analisis_2 = diagnostico_linguistico_emocional(sesion_2)
    radiografia_2 = radiografia_cultural(sesion_2)
    historial.append({**analisis_2, **radiografia_2, "fecha": sesion_2["fecha"]})
    print(f"Nivel: {analisis_2['nivel_probable']}")
    print(f"Longitud: {analisis_2['metricas']['longitud_texto']} palabras")
    print(f"Estado emocional: {analisis_2['estado_emocional_dominante']}")

    print("\n--- SESIÓN 3 (Mes 3) ---")
    analisis_3 = diagnostico_linguistico_emocional(sesion_3)
    radiografia_3 = radiografia_cultural(sesion_3)
    historial.append({**analisis_3, **radiografia_3, "fecha": sesion_3["fecha"]})
    print(f"Nivel: {analisis_3['nivel_probable']}")
    print(f"Longitud: {analisis_3['metricas']['longitud_texto']} palabras")
    print(f"Estado emocional: {analisis_3['estado_emocional_dominante']}")

    # Análisis de progreso
    print("\n--- SEGUIMIENTO DE PROGRESO ---")
    progreso = seguimiento_progreso(historial)
    print(f"Sesiones analizadas: {progreso['numero_sesiones']}")
    print("\nTendencias:")
    for metrica, datos in progreso['tendencias'].items():
        print(f"  • {metrica}: {datos['inicio']} → {datos['actual']} ({datos['direccion']})")
    print("\nInterpretación general:")
    for interp in progreso['interpretacion_general']:
        print(f"  • {interp}")
    print("\nRecomendaciones:")
    for rec in progreso['recomendaciones']:
        print(f"  • {rec}")


def ejemplo_analisis_completo():
    """
    Ejemplo 3: Uso de la función analisis_completo() que ejecuta todo de una vez.
    """
    imprimir_separador("EJEMPLO 3: ANÁLISIS COMPLETO INTEGRADO")

    entrada = {
        "id_sujeto": "maria_peru_003",
        "texto": """
        Llegué de Perú hace seis meses. Al principio todo era muy confuso
        y me sentía perdida. No entendía cómo funcionaban las cosas aquí.
        Extrañaba mucho Lima, mi familia, el ceviche los domingos.
        Pero he ido descubriendo cosas nuevas. Me gusta el flamenco y
        he ido a ver espectáculos. También he probado el gazpacho y la
        tortilla de patatas. Sigo extrañando mi país, pero ya me siento
        más cómoda aquí. Tengo amigas españolas y también he conocido
        otros peruanos. Estudio español tres veces por semana y noto que
        cada vez hablo mejor. Mi objetivo es conseguir un trabajo mejor
        y poder traer a mi hijo que está con mi madre en Lima.
        """,
        "metadatos": {
            "pais_origen": "perú",
            "pais_residencia": "españa"
        }
    }

    # Ejecutar análisis completo
    resultado = analisis_completo(entrada, incluir_riesgo=True)

    # Mostrar resumen
    print("\n--- RESUMEN DEL ANÁLISIS COMPLETO ---")
    print(f"\nID: {resultado['id_sujeto']}")
    print(f"Nivel lingüístico: {resultado['diagnostico_linguistico_emocional']['nivel_probable']}")
    print(f"Estado emocional: {resultado['diagnostico_linguistico_emocional']['estado_emocional_dominante']}")
    print(f"Tensión cultural: {resultado['radiografia_cultural']['tension_dominante']}")
    print(f"Riesgo de bloqueo: {resultado['deteccion_bloqueos']['nivel_riesgo_bloqueo']}")
    print(f"Riesgo psico-emocional: {resultado['riesgo_psico_emocional']['nivel_riesgo']}")
    print(f"Tareas recomendadas: {resultado['prescripcion_tareas']['numero_tareas']}")

    # Exportar a JSON
    print("\n--- EXPORTACIÓN A JSON ---")
    output_file = Path(__file__).parent / "resultado_analisis_completo.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    print(f"Resultado exportado a: {output_file}")


def main():
    """
    Función principal que ejecuta todos los ejemplos.
    """
    print("""
    ╔════════════════════════════════════════════════════════════════════════════╗
    ║                                                                            ║
    ║                CLÍNICA CULTURAL Y LINGÜÍSTICA (CCL)                        ║
    ║              Sistema de Análisis de Texto - Demostración                  ║
    ║                                                                            ║
    ╚════════════════════════════════════════════════════════════════════════════╝
    """)

    try:
        # Ejecutar ejemplos
        ejemplo_basico()
        print("\n\n")
        ejemplo_con_historial()
        print("\n\n")
        ejemplo_analisis_completo()

        imprimir_separador("DEMOSTRACIÓN COMPLETADA")
        print("\n✅ Todos los ejemplos se ejecutaron correctamente.")
        print("\nPróximos pasos:")
        print("  1. Revisa el archivo 'resultado_analisis_completo.json'")
        print("  2. Adapta las entradas a tus casos reales")
        print("  3. Expande las listas de palabras clave en utils.py")
        print("  4. Considera integrar NLP más avanzado (spaCy, NLTK)")
        print()

    except Exception as e:
        print(f"\n❌ Error durante la ejecución: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
