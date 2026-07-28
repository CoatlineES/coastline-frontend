const fs = require('fs');
const file = 'c:/Users/whilmis/Documents/GitHub/coastline-/src/views/employee/quotations/QuotationChapterEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('Plus, Edit2, Trash2, Check, X, Calendar, Package, Save', 'Plus, Edit2, Trash2, Check, X, Calendar, Package, Save, Layers, ChevronDown, ChevronRight');

const oldTbodyStart = '<tbody className="divide-y divide-slate-100">';
const oldTbodyEnd = '</tbody>';

const tbodyStartIndex = content.indexOf(oldTbodyStart);
const tbodyEndIndex = content.indexOf(oldTbodyEnd) + oldTbodyEnd.length;

const newTbody = `<tbody className="divide-y divide-slate-100">
          {chapter.lines.filter(l => !l.parentId).map((l, lIdx) => {
            const isEditing = editingLineId === l.id;
            const children = chapter.lines.filter(cl => cl.parentId === l.id);
            const isGroup = l.isGroup;
            const computedUnitPrice = isGroup ? children.reduce((sum, cl) => sum + (cl.quantity * cl.unitPrice), 0) : l.unitPrice;
            const totalCost = (l.quantity || 1) * computedUnitPrice;

            return (
              <React.Fragment key={l.id}>
                <tr className={\`transition-colors group \${isEditing ? 'bg-primary/5' : 'hover:bg-slate-50'}\`}>
                  <td className="py-2 px-4 text-slate-400 font-mono text-xs">{index + 1}.{lIdx + 1}</td>
                  
                  {isEditing ? (
                    <>
                      <td className="py-2 px-2 align-top">
                        <div className="flex flex-col gap-1">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Título de la partida..."
                            className="w-full text-sm font-bold p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.title || ''} onChange={e => setLineForm({...lineForm, title: e.target.value})}
                          />
                          <textarea 
                            placeholder="Descripción (opcional)..."
                            className="w-full text-xs p-1.5 border border-slate-300 rounded resize-none outline-none focus:ring-1 focus:ring-primary bg-white" 
                            rows={3}
                            value={lineForm.description || ''} onChange={e => setLineForm({...lineForm, description: e.target.value})}
                          />
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                          value={lineForm.quantity || ''} onChange={e => setLineForm({...lineForm, quantity: parseFloat(e.target.value)})} />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" className="w-full text-center text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                          value={lineForm.unit || ''} onChange={e => setLineForm({...lineForm, unit: e.target.value})} />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" disabled={isGroup} className={\`w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary \${isGroup ? 'bg-slate-100 text-slate-500' : 'bg-white'}\`}
                          value={isGroup ? computedUnitPrice : (lineForm.unitPrice || '')} onChange={e => setLineForm({...lineForm, unitPrice: parseFloat(e.target.value)})} />
                      </td>
                      <td className="py-2 px-4 text-right font-bold text-slate-800 bg-white/50">
                        {formatCurrency((Number(lineForm.quantity) || 0) * (isGroup ? computedUnitPrice : (Number(lineForm.unitPrice) || 0)))}
                      </td>
                      <td className="py-2 px-2 flex gap-1 justify-end">
                        <button onClick={saveLine} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={14} /></button>
                        <button onClick={cancelEditLine} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={14} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 cursor-text" onClick={() => startEditLine(l)}>
                        <div className="flex items-start gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); quotationsService.updateLine(quotationId, chapter.id, l.id, { isGroup: !isGroup }).then(onUpdate); }}
                            className={\`mt-0.5 p-1 rounded transition-colors \${isGroup ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}\`}
                            title={isGroup ? "Desagrupar partida" : "Convertir en partida agrupada"}
                          >
                            <Layers size={14} />
                          </button>
                          <div>
                            <div className="font-bold text-slate-800">{l.concept?.split('\\n')[0]}</div>
                            {l.concept?.includes('\\n') && <div className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{l.concept.substring(l.concept.indexOf('\\n') + 1)}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 cursor-text" onClick={() => startEditLine(l)}>{l.quantity}</td>
                      <td className="py-3 px-4 text-center text-slate-500 cursor-text" onClick={() => startEditLine(l)}>{l.unit || 'ud'}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 cursor-text" onClick={() => startEditLine(l)}>
                        <span className={isGroup ? 'text-indigo-600 font-bold' : ''}>{formatCurrency(computedUnitPrice)}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{formatCurrency(totalCost)}</td>
                      <td className="py-3 px-2 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <button onClick={() => exportToLibrary(l)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Guardar en Biblioteca">
                          <Save size={14} />
                        </button>
                        <button onClick={() => deleteLine(l.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded ml-1" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>

                {/* CHILD LINES RENDER */}
                {isGroup && children.map((cl, clIdx) => {
                  const isChildEditing = editingLineId === cl.id;
                  return (
                    <tr key={cl.id} className={\`transition-colors group bg-slate-50/80 \${isChildEditing ? 'bg-primary/5' : 'hover:bg-slate-100'}\`}>
                      <td className="py-1 px-4 text-slate-300 font-mono text-xs text-right pr-6">↳ {index + 1}.{lIdx + 1}.{clIdx + 1}</td>
                      
                      {isChildEditing ? (
                        <>
                          <td className="py-1 px-2 align-top pl-8">
                            <div className="flex flex-col gap-1">
                              <input
                                autoFocus
                                type="text"
                                placeholder="Título de la sub-partida..."
                                className="w-full text-xs font-bold p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                                value={lineForm.title || ''} onChange={e => setLineForm({...lineForm, title: e.target.value})}
                              />
                            </div>
                          </td>
                          <td className="py-1 px-2">
                            <input type="number" className="w-full text-right text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                              value={lineForm.quantity || ''} onChange={e => setLineForm({...lineForm, quantity: parseFloat(e.target.value)})} />
                          </td>
                          <td className="py-1 px-2">
                            <input type="text" className="w-full text-center text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                              value={lineForm.unit || ''} onChange={e => setLineForm({...lineForm, unit: e.target.value})} />
                          </td>
                          <td className="py-1 px-2">
                            <input type="number" className="w-full text-right text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                              value={lineForm.unitPrice || ''} onChange={e => setLineForm({...lineForm, unitPrice: parseFloat(e.target.value)})} />
                          </td>
                          <td className="py-1 px-4 text-right font-bold text-slate-600 text-xs bg-white/50">
                            {formatCurrency((Number(lineForm.quantity) || 0) * (Number(lineForm.unitPrice) || 0))}
                          </td>
                          <td className="py-1 px-2 flex gap-1 justify-end">
                            <button onClick={saveLine} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={12} /></button>
                            <button onClick={cancelEditLine} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={12} /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-1.5 px-4 cursor-text pl-8" onClick={() => startEditLine(cl)}>
                            <div className="font-medium text-slate-600 text-xs">{cl.concept?.split('\\n')[0]}</div>
                          </td>
                          <td className="py-1.5 px-4 text-right font-medium text-slate-600 text-xs cursor-text" onClick={() => startEditLine(cl)}>{cl.quantity}</td>
                          <td className="py-1.5 px-4 text-center text-slate-400 text-xs cursor-text" onClick={() => startEditLine(cl)}>{cl.unit || 'ud'}</td>
                          <td className="py-1.5 px-4 text-right font-medium text-slate-600 text-xs cursor-text" onClick={() => startEditLine(cl)}>{formatCurrency(cl.unitPrice)}</td>
                          <td className="py-1.5 px-4 text-right font-bold text-slate-600 text-xs">{formatCurrency(cl.quantity * cl.unitPrice)}</td>
                          <td className="py-1.5 px-2 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            <button onClick={() => deleteLine(cl.id)} className="p-1 text-slate-300 hover:text-red-500 rounded ml-1" title="Eliminar sub-partida">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}

                {/* ADD SUB-LINE FORM / BUTTON */}
                {isGroup && !isEditing && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={2} className="py-2 px-4 pl-14">
                      {(isAddingLine && lineForm.parentId === l.id) ? (
                        <div className="flex flex-col gap-1 w-full">
                          <input
                            autoFocus
                            type="text"
                            placeholder="Nueva sub-partida..."
                            className="w-full text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.title || ''} onChange={e => setLineForm({...lineForm, title: e.target.value})}
                          />
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setIsAddingLine(true); setEditingLineId(null); setLineForm({ title: '', quantity: 1, unit: 'ud', unitPrice: 0, parentId: l.id }); }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Plus size={12} /> Añadir sub-partida
                        </button>
                      )}
                    </td>
                    {(isAddingLine && lineForm.parentId === l.id) ? (
                      <>
                        <td className="py-1 px-2">
                          <input type="number" placeholder="Cant" className="w-full text-right text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.quantity || ''} onChange={e => setLineForm({...lineForm, quantity: parseFloat(e.target.value)})} />
                        </td>
                        <td className="py-1 px-2">
                          <input type="text" placeholder="Ud" className="w-full text-center text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.unit || ''} onChange={e => setLineForm({...lineForm, unit: e.target.value})} />
                        </td>
                        <td className="py-1 px-2">
                          <input type="number" placeholder="Precio" className="w-full text-right text-xs p-1 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                            value={lineForm.unitPrice || ''} onChange={e => setLineForm({...lineForm, unitPrice: parseFloat(e.target.value)})} />
                        </td>
                        <td className="py-1 px-4 text-right font-bold text-slate-600 text-xs bg-white/50">
                          {formatCurrency((Number(lineForm.quantity) || 0) * (Number(lineForm.unitPrice) || 0))}
                        </td>
                        <td className="py-1 px-2 flex gap-1 justify-end">
                          <button onClick={saveLine} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={12} /></button>
                          <button onClick={cancelEditLine} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={12} /></button>
                        </td>
                      </>
                    ) : (
                      <td colSpan={5}></td>
                    )}
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          
          {/* Add Line Form inline (ROOT LINES) */}
          {(isAddingLine && !lineForm.parentId) && (
            <tr className="bg-primary/5">
               <td className="py-2 px-4 text-slate-400 font-mono text-xs">+</td>
               <td className="py-2 px-2 align-top">
                 <div className="flex flex-col gap-1">
                   <input
                     autoFocus
                     type="text"
                     placeholder="Título de la partida..."
                     className="w-full text-sm font-bold p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                     value={lineForm.title || ''} onChange={e => setLineForm({...lineForm, title: e.target.value})}
                   />
                   <textarea 
                     placeholder="Descripción (opcional)..."
                     className="w-full text-xs p-1.5 border border-slate-300 rounded resize-none outline-none focus:ring-1 focus:ring-primary bg-white" 
                     rows={3}
                     value={lineForm.description || ''} onChange={e => setLineForm({...lineForm, description: e.target.value})}
                   />
                 </div>
               </td>
               <td className="py-2 px-2">
                 <input type="number" placeholder="0" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                   value={lineForm.quantity || ''} onChange={e => setLineForm({...lineForm, quantity: parseFloat(e.target.value)})} />
               </td>
               <td className="py-2 px-2">
                 <input type="text" placeholder="ud" className="w-full text-center text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                   value={lineForm.unit || ''} onChange={e => setLineForm({...lineForm, unit: e.target.value})} />
               </td>
               <td className="py-2 px-2">
                 <input type="number" placeholder="0.00" className="w-full text-right text-sm p-1.5 border border-primary/50 rounded outline-none focus:ring-1 focus:ring-primary bg-white" 
                   value={lineForm.unitPrice || ''} onChange={e => setLineForm({...lineForm, unitPrice: parseFloat(e.target.value)})} />
               </td>
               <td className="py-2 px-4 text-right font-bold text-slate-800 bg-white/50">
                 {formatCurrency((Number(lineForm.quantity) || 0) * (Number(lineForm.unitPrice) || 0))}
               </td>
               <td className="py-2 px-2 flex gap-1 justify-end">
                 <button onClick={saveLine} className="p-1 text-primary hover:bg-primary/10 rounded"><Check size={14} /></button>
                 <button onClick={cancelEditLine} className="p-1 text-slate-400 hover:bg-slate-200 rounded"><X size={14} /></button>
               </td>
            </tr>
          )}

          {!isAddingLine && chapter.lines.filter(l => !l.parentId).length === 0 && (
            <tr><td colSpan={7} className="py-6 text-center text-slate-400">No hay partidas en este capítulo</td></tr>
          )}
        </tbody>`;

content = content.substring(0, tbodyStartIndex) + newTbody + content.substring(tbodyEndIndex);

const totalCalcOld = 'chapter.lines.reduce((a, l) => a + (l.quantity * l.unitPrice), 0)';
const totalCalcNew = 'chapter.lines.filter(l => !l.parentId).reduce((a, l) => { const children = chapter.lines.filter(cl => cl.parentId === l.id); const up = l.isGroup ? children.reduce((sum, cl) => sum + (cl.quantity * cl.unitPrice), 0) : l.unitPrice; return a + (l.quantity * up); }, 0)';
content = content.replace(totalCalcOld, totalCalcNew);

const saveLineOld = `
      if (isAddingLine) {
        await quotationsService.addLine(quotationId, chapter.id, {
          concept: fullConcept,
          unit: lineForm.unit || 'ud',
          quantity: Number(lineForm.quantity || 1),
          unitPrice: Number(lineForm.unitPrice || 0),
          resourceId: lineForm.resourceId || null
        });
      } else if (editingLineId) {
        await quotationsService.updateLine(quotationId, chapter.id, editingLineId, {
          concept: fullConcept,
          unit: lineForm.unit,
          quantity: Number(lineForm.quantity),
          unitPrice: Number(lineForm.unitPrice),
          resourceId: lineForm.resourceId || null
        });
      }
`;
const saveLineNew = `
      if (isAddingLine) {
        await quotationsService.addLine(quotationId, chapter.id, {
          concept: fullConcept,
          unit: lineForm.unit || 'ud',
          quantity: Number(lineForm.quantity || 1),
          unitPrice: Number(lineForm.unitPrice || 0),
          resourceId: lineForm.resourceId || null,
          parentId: lineForm.parentId || null,
          isGroup: lineForm.isGroup || false
        });
      } else if (editingLineId) {
        await quotationsService.updateLine(quotationId, chapter.id, editingLineId, {
          concept: fullConcept,
          unit: lineForm.unit,
          quantity: Number(lineForm.quantity),
          unitPrice: Number(lineForm.unitPrice),
          resourceId: lineForm.resourceId || null,
          isGroup: lineForm.isGroup || false
        });
      }
`;
content = content.replace(saveLineOld, saveLineNew);

fs.writeFileSync(file, content);
