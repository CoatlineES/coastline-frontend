import sys

with open("src/views/employee/projects/tabs/GlobalGanttTimeline.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add import
import_str = "import { projectsService } from '../../../../services/projects.service';\n"
if "projectsService" not in content:
    content = content.replace("import { ProjectPlan", import_str + "import { ProjectPlan")

# Replace handleTaskClick
old_handle = """  const handleTaskClick = (task: ProjectTask) => {
    if (task.type === 'TASK') {
      setSelectedTaskForBreakdown(task);
      setIsTaskBreakdownOpen(true);
    }
  };"""

new_handle = """  const handleTaskClick = async (task: ProjectTask) => {
    if (task.type === 'TASK') {
      setSelectedTaskForBreakdown(task);
      setIsTaskBreakdownOpen(true);
    } else if (task.type === 'PROJECT') {
      const newAlias = prompt('Nuevo alias para el proyecto (dejar en blanco para eliminar):', task.alias || '');
      if (newAlias !== null) {
        try {
          await projectsService.update(task.id, { alias: newAlias || null });
          onUpdate();
        } catch (error) {
          console.error(error);
          alert('Error al actualizar el alias del proyecto');
        }
      }
    }
  };"""
content = content.replace(old_handle, new_handle)

# Replace task name rendering
old_render = """                    'text-[#002D5A] font-semibold'
                  }`}>
                  {task.name}
                </span>"""

new_render = """                    'text-[#002D5A] font-semibold'
                  }`}
                  title={task.alias || task.name}
                >
                  {task.alias || task.name}
                </span>"""
content = content.replace(old_render, new_render)

with open("src/views/employee/projects/tabs/GlobalGanttTimeline.tsx", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("done")
