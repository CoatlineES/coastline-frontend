import sys

file = "src/views/employee/projects/reports/ReportEditorView.tsx"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

# Add import
import_str = "import { EjecucionObraPreviewTab } from './tabs/EjecucionObraPreviewTab';\n"
if "EjecucionObraPreviewTab" not in content:
    content = content.replace("import { ReportPreviewTab } from './tabs/ReportPreviewTab';", import_str + "import { ReportPreviewTab } from './tabs/ReportPreviewTab';")

# Change preview render logic for EjecucionObra
old_render = """                {activeTab === 'PREVIEW' && (
                  <ReportPreviewTab report={report} />
                )}"""

new_render = """                {activeTab === 'PREVIEW' && (
                  <EjecucionObraPreviewTab report={report} />
                )}"""

content = content.replace(old_render, new_render, 1) # Only replace the first one which is inside isEjecucionObra

with open(file, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("done")
