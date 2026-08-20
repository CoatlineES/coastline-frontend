import sys

file = "src/views/employee/projects/reports/ReportEditorView.tsx"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("report.type === 'EJECUCION_OBRA'", "report.type === 'OBRA'")

with open(file, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("done")
