import sys
file = "src/types/inspection-report.ts"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

new_type = """export interface ReportSectionData {
  id: string;
  name: string;
  content: string;
  layout: '1' | '2' | '3';
  images: InspectionReportPhoto[];
}

"""

if "export interface ReportSectionData" not in content:
    content = content.replace("export interface InspectionReportPhoto", new_type + "export interface InspectionReportPhoto")
    with open(file, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
print("done")
