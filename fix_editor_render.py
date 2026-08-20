import sys

file = "src/views/employee/projects/reports/ReportEditorView.tsx"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

import re

old_chunk = """        <div className="max-w-6xl mx-auto">
          {!isGeomembranas && (
            <>
              {activeTab === 'DATOS' && (
                <ReportDatosTab report={report} onChange={handleUpdateReport} />
              )}
              {activeTab === 'ZONAS' && (
                <ReportZonasTab report={report} onChange={handleUpdateReport} />
              )}
              {activeTab === 'INTRO' && (
                <ReportIntroTab report={report} onChange={handleUpdateReport} />
              )}
              {activeTab === 'PORTADA' && (
                <ReportCoverTab report={report} onChange={handleUpdateReport} />
              )}
              {activeTab === 'PREVIEW' && (
                <ReportPreviewTab report={report} />
              )}
            </>
          )}"""

new_chunk = """        <div className="max-w-6xl mx-auto">
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
                <EjecucionObraPreviewTab report={report} />
              )}
            </>
          )}
          {!isGeomembranas && !isEjecucionObra && (
            <>
              {activeTab === 'DATOS' && (
                <ReportDatosTab report={report} onChange={handleUpdateReport} />
              )}
              {activeTab === 'ZONAS' && (
                <ReportZonasTab report={report} onChange={handleUpdateReport} />
              )}
              {activeTab === 'INTRO' && (
                <ReportIntroTab report={report} onChange={handleUpdateReport} />
              )}
              {activeTab === 'PORTADA' && (
                <ReportCoverTab report={report} onChange={handleUpdateReport} />
              )}
              {activeTab === 'PREVIEW' && (
                <ReportPreviewTab report={report} />
              )}
            </>
          )}"""

content = content.replace(old_chunk, new_chunk)

with open(file, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("done")
