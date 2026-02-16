#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

const files = globSync('src/**/*.{tsx,ts}', { nodir: true });

const replacements = [
  // Text colors - timestamps and meta info
  [/text-muted-foreground/g, 'text-gray-500'],
  // Backgrounds
  [/bg-muted\/30/g, 'bg-gray-50'],
  [/bg-muted\/50/g, 'bg-gray-100'],
  [/bg-muted /g, 'bg-gray-50 '],
  [/bg-muted"/g, 'bg-gray-50"'],
  [/bg-muted'/g, "bg-gray-50'"],
  [/bg-muted\)/g, 'bg-gray-50)'],
  // Hover states
  [/hover:bg-muted/g, 'hover:bg-gray-100'],
  [/hover:text-muted-foreground/g, 'hover:text-gray-600'],
  // Borders
  [/border-muted-foreground/g, 'border-gray-300'],
  // Text variants
  [/text-muted /g, 'text-gray-600 '],
  [/text-muted"/g, 'text-gray-600"'],
  [/text-muted'/g, "text-gray-600'"],
  // Data states
  [/data\[state=open\]:text-muted-foreground/g, 'data[state=open]:text-gray-500'],
];

let totalReplacements = 0;

files.forEach(file => {
  let content = readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });
  
  if (content !== originalContent) {
    writeFileSync(file, content, 'utf8');
    totalReplacements++;
    console.log(`✓ ${file}`);
  }
});

console.log(`\n✅ Fixed ${totalReplacements} files`);
