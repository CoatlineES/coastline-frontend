import sys

files = [
    "src/views/employee/projects/tabs/GanttTimeline.tsx",
    "src/views/employee/projects/tabs/GlobalGanttTimeline.tsx"
]

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # In GlobalGanttTimeline.tsx
    content = content.replace("truncate block cursor-pointer", "line-clamp-2 leading-tight cursor-pointer")
    # Also remove truncate from the parent div if there is one
    content = content.replace('className="flex-1 truncate relative"', 'className="flex-1 relative pr-1"')
    
    # In GanttTimeline.tsx
    content = content.replace("className={`text-sm truncate block ${", "className={`text-sm line-clamp-2 leading-tight cursor-pointer ${")
    content = content.replace('className="flex-1 truncate pr-2"', 'className="flex-1 pr-2"')
    
    with open(file, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)

print("done")
