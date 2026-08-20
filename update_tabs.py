import sys

file = "src/views/employee/projects/reports/ReportEditorView.tsx"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

# Modify tabs
old_tabs = """  const tabs = isGeomembranas ? [
    { id: 'DATOS', label: 'Datos generales' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'INTRO', label: 'IntroducciA3n' },
    { id: 'ZONAS', label: 'Zonas e inspecciA3n' },
    { id: 'FOTOS', label: 'Fotos' },
    { id: 'PREVIEW', label: 'PDF' }
  ] : [
    { id: 'DATOS', label: 'Datos' },
    { id: 'ZONAS', label: 'Zonas' },
    { id: 'INTRO', label: 'IntroducciA3n' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'PREVIEW', label: 'Vista previa' }
  ];"""

new_tabs = """  const tabs = isGeomembranas ? [
    { id: 'DATOS', label: 'Datos generales' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'INTRO', label: 'Introducción' },
    { id: 'ZONAS', label: 'Zonas e inspección' },
    { id: 'FOTOS', label: 'Fotos' },
    { id: 'PREVIEW', label: 'PDF' }
  ] : isEjecucionObra ? [
    { id: 'DATOS', label: 'Datos' },
    { id: 'SECCIONES', label: 'Secciones' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'PREVIEW', label: 'Vista previa' }
  ] : [
    { id: 'DATOS', label: 'Datos' },
    { id: 'ZONAS', label: 'Zonas' },
    { id: 'INTRO', label: 'Introducción' },
    { id: 'PORTADA', label: 'Portada' },
    { id: 'PREVIEW', label: 'Vista previa' }
  ];"""

content = content.replace("IntroducciA3n", "Introducción").replace("inspecciA3n", "inspección")

# Now re-apply the tabs modification
import re
# To be safe, just replace the whole tabs definition
content = re.sub(r'const tabs = isGeomembranas \? \[\s*\{[\s\S]*?\];', new_tabs, content)

with open(file, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("done")
