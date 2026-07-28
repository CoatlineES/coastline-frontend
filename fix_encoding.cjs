const fs = require('fs');

function fixFile(path) {
  let c = fs.readFileSync(path, 'utf-8');
  c = c.replace(/Ã©/g, 'é')
       .replace(/Ã“/g, 'Ó')
       .replace(/Ã³/g, 'ó')
       .replace(/Ã\xAD/g, 'í')
       .replace(/Ã¡/g, 'á')
       .replace(/Ãº/g, 'ú')
       .replace(/Ã±/g, 'ñ')
       .replace(/Ã\x8D/g, 'Í')
       .replace(/Ã/g, 'í')
       .replace(/Â/g, '');
  fs.writeFileSync(path, c);
  console.log('Fixed', path);
}

fixFile('c:/Users/whilmis/Documents/GitHub/coastline-/src/views/employee/almacen/AlmacenView.tsx');
fixFile('c:/Users/whilmis/Documents/GitHub/coastline-/src/views/employee/almacen/AlmacenAdminView.tsx');
