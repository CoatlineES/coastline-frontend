import sys

file = "src/views/employee/projects/reports/tabs/EjecucionObraPreviewTab.tsx"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("import { api } from '../../../../../services/api.service';", "import api from '../../../../../services/api';")

with open(file, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("done")
