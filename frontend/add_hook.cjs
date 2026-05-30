const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/ghait/OneDrive/Desktop/pfe/pfe/project_pfe/frontend/src/pages';

function addUseLanguage(filename) {
    let p = path.join(dir, filename);
    let content = fs.readFileSync(p, 'utf8');
    
    // Add import if not present
    if (!content.includes('useLanguage')) {
        content = content.replace(/(import .*;\n)/, '$1import { useLanguage } from "../context/LanguageContext";\n');
    }
    
    // Add hook in component function. We'll look for `export default function Component() {` or `function Component() {`
    const functionRegex = /(export default function \w+\([^)]*\)\s*\{|function \w+\([^)]*\)\s*\{)/g;
    
    // Replace only the first occurrence which is usually the main component
    let replaced = false;
    content = content.replace(functionRegex, (match) => {
        if (!replaced) {
            replaced = true;
            return match + '\n  const { t } = useLanguage();';
        }
        return match;
    });
    
    fs.writeFileSync(p, content, 'utf8');
}

['Users.jsx', 'Audit.jsx', 'Scenarios.jsx', 'Compare.jsx'].forEach(addUseLanguage);

console.log("Hooks added");
