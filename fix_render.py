import sys

file = "src/views/employee/projects/reports/ReportEditorView.tsx"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

import re

old_render = r"\{\!isGeomembranas && \(\s*<>\s*\{activeTab === 'DATOS' && \(\s*<ReportDatosTab report=\{report\} onChange=\{handleUpdateReport\} />\s*\)\}\s*\{activeTab === 'ZONAS' && \(\s*<ReportZonasTab report=\{report\} onChange=\{handleUpdateReport\} />\s*\)\}\s*\{activeTab === 'INTRO' && \(\s*<ReportIntroTab report=\{report\} onChange=\{handleUpdateReport\} />\s*\)\}\s*\{activeTab === 'PORTADA' && \(\s*<ReportCoverTab report=\{report\} onChange=\{handleUpdateReport\} />\s*\)\}\s*\{activeTab === 'PREVIEW' && \(\s*<ReportPreviewTab report=\{report\} />\s*\)\}\s*</>\s*\)\}"

new_render = """{isEjecucionObra && (
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

# It might be easier to use string replace on a smaller chunk.
# Let's see what the file currently has exactly.
