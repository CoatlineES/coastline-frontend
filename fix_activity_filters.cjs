const fs = require('fs');
const path = 'src/views/employee/CrmView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const params = new URLSearchParams\(\);\s*if \(dashboardActivityUserFilter !== 'ALL'\) params\.append\('userId', dashboardActivityUserFilter\);/;

const replacement = `const params = new URLSearchParams();
        if (dashboardActivityUserFilter !== 'ALL') params.append('userId', dashboardActivityUserFilter);
        
        // Agregar filtros globales de actividades
        if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
        if (debouncedActivitiesFilters.userId) params.append('userId', debouncedActivitiesFilters.userId);
        if (debouncedActivitiesFilters.activityType) params.append('activityType', debouncedActivitiesFilters.activityType);
        if (debouncedActivitiesFilters.result) params.append('result', debouncedActivitiesFilters.result);
        if (debouncedActivitiesFilters.startDate) params.append('startDate', debouncedActivitiesFilters.startDate);
        if (debouncedActivitiesFilters.endDate) params.append('endDate', debouncedActivitiesFilters.endDate);
        if (debouncedActivitiesFilters.completedAtFrom) params.append('completedAtFrom', debouncedActivitiesFilters.completedAtFrom);
        if (debouncedActivitiesFilters.completedAtTo) params.append('completedAtTo', debouncedActivitiesFilters.completedAtTo);

        if (debouncedActivitiesFilters.startDate || debouncedActivitiesFilters.endDate) {
          filtersInfo += " | Creación: " + (debouncedActivitiesFilters.startDate || '*') + " a " + (debouncedActivitiesFilters.endDate || '*');
        }
        if (debouncedActivitiesFilters.completedAtFrom || debouncedActivitiesFilters.completedAtTo) {
          filtersInfo += " | Completado: " + (debouncedActivitiesFilters.completedAtFrom || '*') + " a " + (debouncedActivitiesFilters.completedAtTo || '*');
        }`;

content = content.replace(regex, replacement);

fs.writeFileSync(path, content, 'utf8');
