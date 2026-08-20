import sys
file = "src/views/employee/quotations/QuotationGantt.tsx"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

# Replace truncate with line-clamp
content = content.replace("truncate block cursor-pointer", "line-clamp-2 leading-tight cursor-pointer")
content = content.replace("truncate cursor-pointer", "line-clamp-2 leading-tight cursor-pointer")
content = content.replace('className="flex-1 truncate relative"', 'className="flex-1 relative pr-1"')
content = content.replace('className={`text-sm truncate block ${', 'className={`text-sm line-clamp-2 leading-tight cursor-pointer ${')
content = content.replace('className="flex-1 truncate pr-2"', 'className="flex-1 pr-2"')

# Update baseDate
old_state = "  const [baseDate, setBaseDate] = useState<Date>(new Date());"
new_state = """  const [baseDate, setBaseDate] = useState<Date>(() => {
    if (lines && lines.length > 0) {
      const startDates = lines
        .map(l => l.startDate)
        .filter(Boolean)
        .map(d => new Date(d as string).getTime());
      if (startDates.length > 0) {
        return new Date(Math.min(...startDates));
      }
    }
    return new Date();
  });"""
content = content.replace(old_state, new_state)

with open(file, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)
print("done")
