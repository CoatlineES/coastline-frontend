import sys

# Update GanttTimeline.tsx
with open("src/views/employee/projects/tabs/GanttTimeline.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_state = "  const [baseDate, setBaseDate] = useState<Date>(new Date());"
new_state = """  const [baseDate, setBaseDate] = useState<Date>(() => {
    if (plan.tasks && plan.tasks.length > 0) {
      const startDates = plan.tasks
        .map(t => t.startDate)
        .filter(d => d)
        .map(d => new Date(d as str).getTime() if type(d) != str else new Date(d).getTime()) # Will fix below in js
    }
  });"""
# Wait, it's easier to just do it via exact string matching for JavaScript

new_state_js = """  const [baseDate, setBaseDate] = useState<Date>(() => {
    if (plan.tasks && plan.tasks.length > 0) {
      const startDates = plan.tasks
        .map(t => t.startDate)
        .filter(Boolean)
        .map(d => new Date(d as string).getTime());
      if (startDates.length > 0) {
        return new Date(Math.min(...startDates));
      }
    }
    return new Date();
  });"""

content = content.replace(old_state, new_state_js)

with open("src/views/employee/projects/tabs/GanttTimeline.tsx", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

# Update GlobalGanttTimeline.tsx
with open("src/views/employee/projects/tabs/GlobalGanttTimeline.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_state2 = "  const [baseDate, setBaseDate] = useState<Date>(new Date());"
new_state_js2 = """  const [baseDate, setBaseDate] = useState<Date>(() => {
    let minDate = Infinity;
    plans.forEach(p => {
      p.tasks?.forEach(t => {
        if (t.startDate) {
          const time = new Date(t.startDate).getTime();
          if (time < minDate) minDate = time;
        }
      });
    });
    return minDate !== Infinity ? new Date(minDate) : new Date();
  });"""

content = content.replace(old_state2, new_state_js2)

with open("src/views/employee/projects/tabs/GlobalGanttTimeline.tsx", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("done")
