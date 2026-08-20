import sys

file = "src/views/employee/projects/reports/ReportEditorView.tsx"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

# Add import
import_str = "import { ReportSeccionesTab } from './tabs/ReportSeccionesTab';\n"
if "ReportSeccionesTab" not in content:
    content = content.replace("import { ReportZonasTab } from './tabs/ReportZonasTab';", import_str + "import { ReportZonasTab } from './tabs/ReportZonasTab';")

# Add isEjecucionObra
is_ejecucion_str = "const isGeomembranas = report.type === 'GEOMEMBRANAS';\n  const isEjecucionObra = report.type === 'EJECUCION_OBRA';"
content = content.replace("const isGeomembranas = report.type === 'GEOMEMBRANAS';", is_ejecucion_str)

# Modify tabs
old_tabs = """  const tabs = isGeomembranas ? [
    { id: 'DATOS', label: 'Datos generales' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'INTRO', label: 'Introducci\u00f3n' },
    { id: 'ZONAS', label: 'Zonas' },
    { id: 'FOTOS', label: 'Fotograf\u00edas' },
    { id: 'PREVIEW', label: 'Vista previa' }
  ] : [
    { id: 'DATOS', label: 'Datos generales' },
    { id: 'ZONAS', label: 'Zonas y Patolog\u00edas' },
    { id: 'INTRO', label: 'Recomendaciones' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'PREVIEW', label: 'Vista previa' }
  ];"""

new_tabs = """  const tabs = isGeomembranas ? [
    { id: 'DATOS', label: 'Datos generales' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'INTRO', label: 'Introducción' },
    { id: 'ZONAS', label: 'Zonas' },
    { id: 'FOTOS', label: 'Fotografías' },
    { id: 'PREVIEW', label: 'Vista previa' }
  ] : isEjecucionObra ? [
    { id: 'DATOS', label: 'Datos' },
    { id: 'SECCIONES', label: 'Secciones' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'PREVIEW', label: 'Vista previa' }
  ] : [
    { id: 'DATOS', label: 'Datos generales' },
    { id: 'ZONAS', label: 'Zonas y Patologías' },
    { id: 'INTRO', label: 'Recomendaciones' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'PREVIEW', label: 'Vista previa' }
  ];"""
content = content.replace(old_tabs, new_tabs)

# Handle encoding issues from previous replace
content = content.replace("IntroducciA3n", "Introducción")
content = content.replace("FotografA-as", "Fotografías")
content = content.replace("PatologA-as", "Patologías")

# Add Secciones Tab rendering
old_render = """          <div className="max-w-6xl mx-auto">
            {!isGeomembranas && (
              <>
                {activeTab === 'DATOS' && ("""

new_render = """          <div className="max-w-6xl mx-auto">
            {isEjecucionObra && (
              <>
                {activeTab === 'DATOS' && (
                  <ReportDatosTab report={report} onChange={handleUpdateReport} />
                )}
                {activeTab === 'SECCIONES' && (
                  <ReportSeccionesTab report={report} onChange={handleUpdateReport} />
                )}
                {activeTab === 'PORTADA' && (
                  <ReportCoverTab report={report} onChange={handleUpdateReport} />
                )}
                {activeTab === 'PREVIEW' && (
                  <ReportPreviewTab report={report} />
                )}
              </>
            )}
            {!isGeomembranas && !isEjecucionObra && (
              <>
                {activeTab === 'DATOS' && ("""

content = content.replace(old_render, new_render)

with open(file, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("done")
