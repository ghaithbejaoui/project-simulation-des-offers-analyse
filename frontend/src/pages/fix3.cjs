const fs = require('fs');
let c2 = fs.readFileSync('Compare.jsx', 'utf8');
if(!c2.includes('import { useLanguage }')) {
  c2 = 'import { useLanguage } from "../context/LanguageContext";\n' + c2;
}
fs.writeFileSync('Compare.jsx', c2, 'utf8');
