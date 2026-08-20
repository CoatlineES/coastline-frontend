const fs = require('fs');
const path = 'src/views/employee/CrmView.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/<option value=\{ActivityType\.LLAMADA\}>.*?<\/option>/g, '<option value={ActivityType.CALL}>Llamada</option>');

c = c.replace(/<option value=\{ActivityType\.REUNION_COMERCIAL\}>.*?<\/option>/g, '<option value={ActivityType.REUNION_COMERCIAL}>Reuni\u00f3n Comercial</option>');
c = c.replace(/<option value=\{ActivityType\.REUNION_SEGUIMIENTO\}>.*?<\/option>/g, '<option value={ActivityType.REUNION_SEGUIMIENTO}>Reuni\u00f3n Seguimiento</option>');
c = c.replace(/<option value=\{ActivityType\.COTIZACION\}>.*?<\/option>/g, '<option value={ActivityType.COTIZACION}>Cotizaci\u00f3n</option>');
c = c.replace(/<option value=\{ActivityType\.TASK\}>.*?<\/option>/g, '<option value={ActivityType.TASK}>Tarea Gen\u00e9rica</option>');

c = c.replace(/<option value=\{ActivityResult\.CALL_BACK\}>.*?<\/option>/g, '<option value={ActivityResult.CALL_BACK}>Llamar m\u00e1s tarde</option>');

// Update getActivityTypeLabel
c = c.replace(/const getActivityTypeLabel = \(type: ActivityType\) => \{[\s\S]*?default: return type;\s*\n\s*\};/,
`const getActivityTypeLabel = (type: ActivityType) => {
    switch(type) {
      case ActivityType.CALL:
      case ActivityType.LLAMADA: return 'Llamada';
      case ActivityType.EMAIL: return 'Email';
      case ActivityType.TASK: return 'Tarea Gen\u00e9rica';
      case ActivityType.REUNION_COMERCIAL: return 'Reuni\u00f3n Comercial';
      case ActivityType.REUNION_SEGUIMIENTO: return 'Reuni\u00f3n Seguimiento';
      case ActivityType.COTIZACION: return 'Cotizaci\u00f3n';
      case ActivityType.SEGUIMIENTO: return 'Seguimiento';
      default: return type;
    }
  };`);

// Update getActivityIcon
c = c.replace(/const getActivityIcon = \(type: ActivityType\) => \{[\s\S]*?default: return <Clock size=\{14\} \/>;\s*\n\s*\};/,
`const getActivityIcon = (type: ActivityType) => {
    switch(type) {
      case ActivityType.CALL:
      case ActivityType.LLAMADA: return <PhoneCall size={14} />;
      case ActivityType.EMAIL: return <Mail size={14} />;
      case ActivityType.TASK: return <CheckSquare size={14} />;
      case ActivityType.REUNION_COMERCIAL:
      case ActivityType.REUNION_SEGUIMIENTO: return <Users size={14} />;
      case ActivityType.COTIZACION: return <FileText size={14} />;
      case ActivityType.SEGUIMIENTO: return <RefreshCw size={14} />;
      default: return <Clock size={14} />;
    }
  };`);

// For 'M\u00e1s recientes' etc in CrmView.tsx, replace the specific occurrences safely
c = c.replace(/>M[^\x00-\x7F]*s recientes</g, '>M\u00e1s recientes<');
c = c.replace(/>M[^\x00-\x7F]*s antiguas</g, '>M\u00e1s antiguas<');
c = c.replace(/>M[^\x00-\x7F]*s antiguos</g, '>M\u00e1s antiguos<');
c = c.replace(/>En planeaci[^\x00-\x7F]*n</g, '>En planeaci\u00f3n<');
c = c.replace(/>Creaci[^\x00-\x7F]*n/g, '>Creaci\u00f3n');

fs.writeFileSync(path, c, 'utf8');

const path2 = 'src/components/common/BulkActivityModal.tsx';
let c2 = fs.readFileSync(path2, 'utf8');
c2 = c2.replace(/<option value=\{ActivityType\.LLAMADA\}>.*?<\/option>/g, '<option value={ActivityType.CALL}>Llamada</option>');
c2 = c2.replace(/<option value=\{ActivityType\.REUNION_COMERCIAL\}>.*?<\/option>/g, '<option value={ActivityType.REUNION_COMERCIAL}>Reuni\u00f3n Comercial</option>');
c2 = c2.replace(/<option value=\{ActivityType\.REUNION_SEGUIMIENTO\}>.*?<\/option>/g, '<option value={ActivityType.REUNION_SEGUIMIENTO}>Reuni\u00f3n Seguimiento</option>');
c2 = c2.replace(/<option value=\{ActivityType\.COTIZACION\}>.*?<\/option>/g, '<option value={ActivityType.COTIZACION}>Cotizaci\u00f3n</option>');
c2 = c2.replace(/<option value=\{ActivityType\.TASK\}>.*?<\/option>/g, '<option value={ActivityType.TASK}>Otra Tarea</option>');
fs.writeFileSync(path2, c2, 'utf8');

console.log('Fixed correctly');
