# CCL - Clínica Cultural y Lingüística

Sistema de análisis de texto para diagnóstico lingüístico, cultural y emocional en contextos de aprendizaje de lenguas y migración.

## 📋 Descripción

**CCL** (Clínica Cultural y Lingüística) es un sistema modular en Python diseñado para analizar textos escritos por estudiantes de español como lengua extranjera o personas en contextos migratorios. El sistema combina análisis lingüístico, cultural y emocional para generar diagnósticos integrales y prescripciones de tareas terapéuticas.

### Características principales

- ✍️ **Diagnóstico lingüístico-emocional**: Analiza nivel lingüístico, estado emocional, recursos discursivos y patrones de uso
- 🌍 **Radiografía cultural**: Identifica referentes culturales de origen y acogida, detecta tensiones culturales
- 🔍 **Detección de bloqueos discursivos**: Identifica temas repetitivos, evitaciones y patrones problemáticos
- 📝 **Prescripción de tareas**: Genera recomendaciones de ejercicios terapéuticos personalizados
- 📊 **Seguimiento de progreso**: Analiza la evolución a lo largo del tiempo
- ⚠️ **Detección de riesgo psico-emocional**: Identifica señales de alerta que requieren derivación profesional

## 🏗️ Estructura del proyecto

```
clinica_cultural_linguistica/
├── README.md                    # Este archivo
├── pyproject.toml               # Configuración del proyecto (Poetry)
├── src/
│   └── ccl/                     # Paquete principal
│       ├── __init__.py          # Exports y función analisis_completo()
│       ├── utils.py             # Funciones auxiliares y datos de referencia
│       ├── diagnostico_linguistico_emocional.py
│       ├── radiografia_cultural.py
│       ├── deteccion_bloqueos_discursivos.py
│       ├── prescripcion_tareas.py
│       ├── seguimiento_progreso.py
│       └── riesgo_psico_emocional.py
├── tests/                       # Tests unitarios (pendiente)
│   └── test_*.py
└── examples/                    # Ejemplos de uso
    └── ejemplo_pipeline.py      # Demostración completa
```

## 🚀 Instalación

### Requisitos

- Python 3.8 o superior
- Poetry (recomendado) o pip

### Instalación en modo desarrollo

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/elcorreveidile/CCLE.git
   cd CCLE/clinica_cultural_linguistica
   ```

2. **Instalar con Poetry** (recomendado):
   ```bash
   poetry install
   poetry shell  # Activar el entorno virtual
   ```

   **O instalar con pip**:
   ```bash
   pip install -e .
   ```

3. **Verificar instalación**:
   ```bash
   python -c "import ccl; print(ccl.__version__)"
   ```

## 📖 Uso

### Ejemplo básico

```python
from ccl import diagnostico_linguistico_emocional

# Preparar entrada
entrada = {
    "id_sujeto": "paciente_001",
    "texto": """
    Me llamo Ana y vengo de Colombia. Llegué a España hace dos años.
    Trabajo en una tienda y estudio español por las noches.
    A veces me siento triste porque extraño a mi familia.
    """,
    "idioma": "es",
    "metadatos": {
        "pais_origen": "colombia",
        "pais_residencia": "españa"
    }
}

# Ejecutar diagnóstico
resultado = diagnostico_linguistico_emocional(entrada)

# Ver resultados
print(f"Nivel probable: {resultado['nivel_probable']}")
print(f"Estado emocional: {resultado['estado_emocional_dominante']}")
```

### Análisis completo integrado

```python
from ccl import analisis_completo

# Ejecutar todos los módulos de una vez
resultado_completo = analisis_completo(entrada, incluir_riesgo=True)

# Acceder a resultados específicos
print(resultado_completo['diagnostico_linguistico_emocional'])
print(resultado_completo['radiografia_cultural'])
print(resultado_completo['prescripcion_tareas'])
```

### Ejecutar el ejemplo completo

```bash
python examples/ejemplo_pipeline.py
```

Este script ejecuta tres ejemplos:
1. Análisis básico de un texto individual
2. Análisis con seguimiento de progreso (múltiples sesiones)
3. Análisis completo integrado con exportación a JSON

## 🔧 Módulos principales

### 1. Diagnóstico Lingüístico-Emocional

Analiza:
- Nivel lingüístico estimado (A1-C2)
- Estado emocional dominante
- Recursos discursivos utilizados
- Errores y patrones lingüísticos
- Hipótesis clínicas lingüísticas

**Entrada**:
```python
{
    "id_sujeto": str,
    "texto": str,
    "idioma": str (opcional),
    "nivel_declarado": str (opcional),
    "edad": int (opcional),
    "contexto": str (opcional)
}
```

**Salida**:
```python
{
    "nivel_probable": "B1",
    "estado_emocional_dominante": "tristeza",
    "recursos_discursivos": ["narración", "descripción"],
    "errores_clave": ["problemas_tiempos_pasado"],
    "hipotesis_clinica_linguistica": [...],
    "metricas": {...}
}
```

### 2. Radiografía Cultural

Detecta:
- Referentes culturales del país de origen
- Referentes culturales del país de acogida
- Campos culturales mencionados
- Tensión cultural dominante

### 3. Detección de Bloqueos Discursivos

Identifica:
- Temas repetitivos con bajo detalle
- Palabras emocionales sin desarrollo
- Generalizaciones excesivas
- Patrones de evitación

### 4. Prescripción de Tareas

Genera recomendaciones personalizadas de:
- Tareas de escritura autobiográfica
- Ejercicios lingüísticos específicos
- Actividades de elaboración cultural
- Trabajos de expresión emocional

### 5. Seguimiento de Progreso

Analiza la evolución temporal de:
- Métricas lingüísticas
- Patrones emocionales
- Referentes culturales
- Genera recomendaciones basadas en tendencias

### 6. Riesgo Psico-emocional

⚠️ **IMPORTANTE**: Este módulo NO sustituye evaluación clínica profesional.

Detecta señales de:
- Ideación suicida o autodaño
- Desesperanza extrema
- Trauma severo
- Síntomas de trastornos graves

## 📊 Formato de datos

### Estructura de entrada genérica

```python
entrada = {
    "id_sujeto": "identificador_unico",
    "texto": "El texto a analizar...",
    "idioma": "es",  # opcional
    "nivel_declarado": "B1",  # opcional
    "edad": 25,  # opcional
    "contexto": "relato_personal",  # opcional
    "fecha": "2024-01-15",  # opcional, útil para seguimiento
    "metadatos": {
        "pais_origen": "colombia",  # minúsculas
        "pais_residencia": "españa"  # minúsculas
    }
}
```

### Países soportados

El sistema incluye datos culturales para:
- Colombia, Venezuela, Ecuador, Perú
- México, Argentina
- España

Puedes expandir fácilmente añadiendo más países en `src/ccl/radiografia_cultural.py`.

## 🛠️ Personalización y extensión

### Añadir palabras clave

Edita `src/ccl/utils.py` para expandir:
- `PRONOMBRES_PRIMERA_PERSONA`
- `CONECTORES`
- `PALABRAS_EMOCIONALES`
- `TEMAS_PALABRAS_CLAVE`

### Añadir países y referentes culturales

Edita `src/ccl/radiografia_cultural.py`:

```python
REFERENTES_CULTURALES = {
    'tu_pais': {
        'lugares': {'ciudad1', 'ciudad2'},
        'comidas': {'plato1', 'plato2'},
        'fiestas': {'fiesta1', 'fiesta2'},
        'cultura': {'elemento1', 'elemento2'}
    }
}
```

### Añadir nuevas tareas terapéuticas

Edita `src/ccl/prescripcion_tareas.py` en `CATALOGO_TAREAS`.

## 📈 Casos de uso

1. **Docentes de español como lengua extranjera**: Evaluar producciones escritas de estudiantes
2. **Terapeutas y trabajadores sociales**: Analizar textos de personas en contextos migratorios
3. **Investigadores**: Estudiar patrones lingüísticos y culturales en corpus de textos
4. **Clínicas culturales**: Diagnóstico y seguimiento de pacientes en duelo migratorio

## ⚠️ Limitaciones y advertencias

- Los análisis son **orientativos** y basados en heurísticas simples
- **NO sustituyen** evaluaciones clínicas profesionales
- La detección de riesgo psico-emocional debe ser **siempre** complementada con juicio profesional
- Se recomienda integrar NLP más avanzado (spaCy, NLTK) para análisis más precisos
- Los datos culturales son ejemplos básicos y deben expandirse según contexto

## 🔮 Desarrollo futuro

- [ ] Integración con spaCy para análisis morfosintáctico avanzado
- [ ] Análisis de coherencia y cohesión textual
- [ ] Detección automática de idioma
- [ ] Soporte multilingüe (catalán, gallego, euskera, etc.)
- [ ] Interfaz web con visualizaciones
- [ ] Base de datos para almacenar historiales
- [ ] Tests unitarios completos
- [ ] API REST
- [ ] Exportación de informes en PDF

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - Desarrollo inicial

## 🙏 Agradecimientos

- A todos los docentes y clínicos culturales que trabajan con poblaciones migrantes
- A los estudiantes y pacientes cuyas historias inspiran este trabajo

## 📧 Contacto

Para preguntas o sugerencias: [tu@email.com]

---

**Nota**: Este sistema es una herramienta de apoyo. El análisis y la interpretación final siempre deben ser realizados por profesionales cualificados en lingüística aplicada, psicología o trabajo social.
