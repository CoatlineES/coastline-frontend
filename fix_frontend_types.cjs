const fs = require('fs');
const path = 'src/services/types.ts';
let content = fs.readFileSync(path, 'utf8');

// Update ProjectStatus
content = content.replace(/export enum ProjectStatus \{[\s\S]*?\}/, `export enum ProjectStatus {
  AWARDED = 'awarded',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  INVOICED = 'invoiced',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}`);

// Remove OperationalPhase
content = content.replace(/export enum OperationalPhase \{[\s\S]*?\}\r?\n\r?\n/, '');

// Remove operationalPhase from Project interface
content = content.replace(/\s*operationalPhase:\s*OperationalPhase;\r?\n/, '\n');

fs.writeFileSync(path, content, 'utf8');
