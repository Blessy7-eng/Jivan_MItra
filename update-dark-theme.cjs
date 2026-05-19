const fs = require('fs');

const replaceRules = [
  [/bg-white/g, 'bg-white dark:bg-[#111827]'],
  [/border-\[\#bbdefb\]/g, 'border-[#bbdefb] dark:border-slate-800'],
  [/border-slate-100/g, 'border-slate-100 dark:border-slate-800/80'],
  [/border-slate-200/g, 'border-slate-200 dark:border-slate-800'],
  [/border-slate-300/g, 'border-slate-300 dark:border-slate-700'],
  [/bg-slate-50/g, 'bg-slate-50 dark:bg-[#1E293B]/50'],
  [/bg-slate-100/g, 'bg-slate-100 dark:bg-slate-800'],
  [/text-slate-600/g, 'text-slate-600 dark:text-slate-300'],
  [/text-slate-500/g, 'text-slate-500 dark:text-slate-400'],
  [/text-slate-800/g, 'text-slate-800 dark:text-slate-200'],
  [/bg-\[\#E3F2FD\]/g, 'bg-[#E3F2FD] dark:bg-blue-900/20'],
  [/text-\[\#0D47A1\]/g, 'text-[#0D47A1] dark:text-blue-400'],
  [/border-blue-100/g, 'border-blue-100 dark:border-blue-900/50'],
  [/border-blue-200/g, 'border-blue-200 dark:border-blue-800/50'],
  [/bg-white\/90/g, 'bg-white/90 dark:bg-[#111827]/90'],
];

function flattenClasses(str) {
  // deduplicate
  str = str.replace(/dark:bg-\[\#111827\]/g, '');
  str = str.replace(/dark:border-slate-800\/80/g, '');
  str = str.replace(/dark:border-slate-800/g, '');
  str = str.replace(/dark:border-slate-700/g, '');
  str = str.replace(/dark:bg-\[\#1E293B\]\/50/g, '');
  str = str.replace(/dark:bg-slate-800/g, '');
  str = str.replace(/dark:text-slate-300/g, '');
  str = str.replace(/dark:text-slate-400/g, '');
  str = str.replace(/dark:text-slate-200/g, '');
  str = str.replace(/dark:bg-blue-900\/20/g, '');
  str = str.replace(/dark:text-blue-400/g, '');
  str = str.replace(/dark:border-blue-900\/50/g, '');
  str = str.replace(/dark:border-blue-800\/50/g, '');
  str = str.replace(/dark:bg-\[\#111827\]\/90/g, '');
  str = str.replace(/ +/g, ' ');

  replaceRules.forEach(([regex, replacement]) => {
    str = str.replace(regex, replacement);
  });
  
  return str.replace(/className=(["'])(.*?)\1/g, (match, quote, classNames) => {
    const uniqueClasses = [...new Set(classNames.split(' ').filter(Boolean))].join(' ');
    return `className=${quote}${uniqueClasses}${quote}`;
  });
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('src/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = flattenClasses(content);
  
  if(content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
