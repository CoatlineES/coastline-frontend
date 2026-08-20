const fs = require('fs');
const path = 'src/services/types.ts';
let content = fs.readFileSync(path, 'utf8');

// Update ProjectStatus
content = content.replace(/export type ProjectStatus = 'ACTIVE' \| 'COMPLETED' \| 'CANCELLED';/, "export type ProjectStatus = 'AWARDED' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'CLOSED' | 'CANCELLED';");

// Remove OperationalPhase
content = content.replace(/export type OperationalPhase = 'PENDING_PLANNING' \| 'CONSTRUCTION_PLANNING' \| 'INSPECTION_DONE' \| 'COMPLETION' \| 'CERT_INVOICING';\r?\n?/, '');

// Remove operationalPhase from Project interface
content = content.replace(/\s*operationalPhase: OperationalPhase;\r?\n/, '\n');

fs.writeFileSync(path, content, 'utf8');
