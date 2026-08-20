const fs = require('fs');
const path = 'src/views/employee/projects/ProjectDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-2xl font-bold text-slate-900 mb-2 border-b border-blue-500 focus:outline-none bg-blue-50"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                      {project.name}
                    </h1>
                  )}`;

const replacement = `                  {isEditing ? (
                    <div className="mb-2">
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full text-2xl font-bold text-slate-900 mb-1 border-b border-blue-500 focus:outline-none bg-blue-50 placeholder-slate-400"
                        placeholder="Nombre del proyecto"
                      />
                      <input
                        type="text"
                        value={formData.alias || ''}
                        onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                        className="w-full text-sm font-medium text-slate-600 border-b border-blue-500 focus:outline-none bg-blue-50 placeholder-slate-400"
                        placeholder="Alias del proyecto (opcional)"
                      />
                    </div>
                  ) : (
                    <div className="mb-2">
                      <h1 className="text-3xl font-bold text-slate-900 mb-1">
                        {project.name}
                      </h1>
                      {project.alias && (
                        <h2 className="text-sm font-medium text-slate-500">
                          Alias: {project.alias}
                        </h2>
                      )}
                    </div>
                  )}`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success detail");
} else {
    console.log("Not found target");
}
