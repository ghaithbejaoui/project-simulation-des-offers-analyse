const fs = require('fs');

let c = fs.readFileSync('Scenarios.jsx', 'utf8');
c = c.replace(/function ScenarioModal\([^)]*\)\s*\{/, match => match + '\n  const { t } = useLanguage();');
c = c.replace(/function ResultsModal\([^)]*\)\s*\{/, match => match + '\n  const { t } = useLanguage();');
fs.writeFileSync('Scenarios.jsx', c, 'utf8');

let c2 = fs.readFileSync('Compare.jsx', 'utf8');
c2 = c2.replace(/function CompareModal\([^)]*\)\s*\{/, match => match + '\n  const { t } = useLanguage();');
fs.writeFileSync('Compare.jsx', c2, 'utf8');
