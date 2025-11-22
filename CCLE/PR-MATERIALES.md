# Pull Request: Agregar Materiales del Curso

## 📚 Resumen

Este PR agrega una sección completa de materiales didácticos al sitio web del curso, incluyendo PDFs profesionales y versiones HTML navegables para las 4 semanas del programa.

## ✨ Cambios Principales

### 1. Materiales en PDF y HTML
- ✅ **4 PDFs profesionales** (semana1-4.pdf) con formato educativo
- ✅ **4 archivos HTML** (semana1-4.html) navegables en el browser
- ✅ Diseño consistente con encabezados, pie de página y numeración
- ✅ Estilos CSS profesionales incluidos

### 2. Página Índice de Materiales
- ✅ `/materials/index.html` con diseño responsive y atractivo
- ✅ Cards para cada semana con descripción de contenidos
- ✅ Botones para acceder a PDF o HTML de cada semana
- ✅ Integración con el diseño del sitio principal

### 3. Integración con el Sitio Web
- ✅ Nuevo enlace "Materiales" en el menú de navegación principal
- ✅ Acceso directo desde la página principal del curso

### 4. Scripts de Generación
- ✅ Scripts Python para generar PDFs desde Markdown
- ✅ Sistema automatizado de conversión Markdown → HTML → PDF
- ✅ Documentación completa en materiales/README.md

## 📁 Estructura de Archivos

```
materials/
├── index.html                    # Página principal de materiales
└── cuadernos/
    ├── semana1.html & .pdf      # Fundamentos Básicos (6 páginas)
    ├── semana2.html & .pdf      # La Vida Cotidiana (7 páginas)
    ├── semana3.html & .pdf      # Experiencias y Viajes
    └── semana4.html & .pdf      # Planes y Proyectos

materiales/
├── README.md                     # Documentación completa
├── pdf-style.css                # Estilos CSS profesionales
├── generate-html.py             # Script de generación HTML
├── convert-to-pdf.py            # Script de conversión a PDF
├── pdfs/                        # PDFs generados
└── html/                        # HTMLs generados
```

## 🎨 Características de los PDFs

- ✅ Formato A4 con márgenes de 2cm
- ✅ Encabezado: "Curso Intensivo de Español - CILE"
- ✅ Pie de página con numeración automática
- ✅ Jerarquía visual clara (H1-H4 diferenciados)
- ✅ Colores corporativos (azul #1a4d8f, naranja #f39c12)
- ✅ Listas, diálogos y ejercicios bien formateados
- ✅ Tipografía optimizada para lectura e impresión

## 📝 Contenido de las Semanas

**Semana 1: Fundamentos Básicos**
- Presente de indicativo, verbos regulares e irregulares
- Presentaciones y descripciones, vocabulario familiar

**Semana 2: La Vida Cotidiana**
- Pretérito perfecto simple, verbos reflexivos
- Rutinas diarias, expresar gustos y preferencias

**Semana 3: Experiencias y Viajes**
- Pretérito imperfecto, narrar eventos pasados
- Vocabulario de viajes, expresiones temporales

**Semana 4: Planes y Proyectos**
- Futuro simple, expresar intenciones
- Vocabulario profesional, hacer predicciones

## 🌐 URLs (después del merge)

- **Página principal:** https://elcorreveidile.github.io/CILE/materials/
- **PDFs:** https://elcorreveidile.github.io/CILE/materials/cuadernos/semana1.pdf
- **HTMLs:** https://elcorreveidile.github.io/CILE/materials/cuadernos/semana1.html

## ✅ Testing

- [x] PDFs generados correctamente y visualizados
- [x] HTMLs navegables en el browser
- [x] Estilos CSS aplicados correctamente
- [x] Enlaces del menú funcionan
- [x] Responsive design verificado
- [x] Compatibilidad con GitHub Pages

## 📸 Preview

Los materiales incluyen:
- Contenido gramatical completo
- Vocabulario esencial por temas
- Diálogos prácticos
- Ejercicios con espacios para completar
- Tareas semanales
- Recursos online sugeridos
- Criterios de evaluación

---

**Listo para merge y publicación en GitHub Pages** 🚀

## 🔗 Para Crear el Pull Request

**Opción 1: Desde GitHub Web**
1. Ve a: https://github.com/elcorreveidile/CILE
2. Haz clic en "Pull requests"
3. Haz clic en "New pull request"
4. Selecciona:
   - Base: `main`
   - Compare: `claude/fix-repository-issues-011CUreH3NXSCNzc3kMH4gHA`
5. Copia y pega esta descripción
6. Haz clic en "Create pull request"

**Opción 2: Link directo**
https://github.com/elcorreveidile/CILE/compare/main...claude/fix-repository-issues-011CUreH3NXSCNzc3kMH4gHA

**Título del PR:**
```
Feat: Agregar materiales del curso con PDFs y HTMLs navegables
```
