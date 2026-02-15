#!/usr/bin/env node
/**
 * Анализ модульной структуры проекта
 * 
 * Находит:
 * - Zustand stores (create<...>)
 * - Actions (createAction)
 * - DI Tokens (new Token<...>)
 * - Containers (*Container.tsx)
 * - Связи между сущностями (imports)
 * 
 * Выводит Mermaid диаграмму
 * 
 * Usage: node scripts/analyze-modules.mjs [directory] [--output file.md]
 * Example: 
 *   node scripts/analyze-modules.mjs src/person-limits
 *   node scripts/analyze-modules.mjs src/person-limits --output src/person-limits/ARCHITECTURE.md
 */

import fs from 'fs';
import path from 'path';

// Parse arguments
const args = process.argv.slice(2);
let targetDir = 'src';
let outputFile = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' || args[i] === '-o') {
    outputFile = args[i + 1];
    i++;
  } else if (!args[i].startsWith('-')) {
    targetDir = args[i];
  }
}

// Output buffer for file writing
const outputLines = [];

function output(line = '') {
  outputLines.push(line);
  if (!outputFile) {
    console.log(line);
  }
}

// --- Helpers ---

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (/\.(ts|tsx)$/.test(file) && !file.includes('.test.') && !file.includes('.cy.') && !file.includes('.stories.')) {
      callback(filePath);
    }
  });
}

function getModuleName(filePath, baseDir) {
  const relative = path.relative(baseDir, filePath);
  const parts = relative.split(path.sep);
  
  // Берем только первый уровень папки
  // Например: BoardPage/actions/... -> BoardPage
  // Или: property/store.ts -> property
  return parts[0] || 'root';
}

// --- Analyzers ---

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const result = {
    path: filePath,
    fileName,
    stores: [],
    actions: [],
    tokens: [],
    containers: [],
    components: [],
    imports: [], // { name, from }
  };

  // Find Zustand stores: create<...>(...) or useXxxStore = create
  const storeMatches = content.matchAll(/(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*create[<(]/g);
  for (const match of storeMatches) {
    result.stores.push(match[1]);
  }

  // Find actions: createAction({ name: '...' })
  const actionMatches = content.matchAll(/(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*createAction\s*\(/g);
  for (const match of actionMatches) {
    result.actions.push(match[1]);
  }

  // Find actions in /actions/ folders: export const funcName = ...
  if (filePath.includes('/actions/') && !fileName.includes('index')) {
    const funcMatches = content.matchAll(/export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(/g);
    for (const match of funcMatches) {
      if (!result.actions.includes(match[1])) {
        result.actions.push(match[1]);
      }
    }
  }

  // Find DI tokens: new Token<...>('...')
  const tokenMatches = content.matchAll(/(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*new\s+Token\s*[<(]/g);
  for (const match of tokenMatches) {
    result.tokens.push(match[1]);
  }

  // Find containers: *Container.tsx files with React component
  if (fileName.includes('Container.tsx')) {
    const componentMatch = content.match(/(?:export\s+(?:default\s+)?(?:const|function)\s+)(\w+)/);
    if (componentMatch) {
      result.containers.push(componentMatch[1]);
    }
  }

  // Find other React components (export const/function + JSX or React.FC)
  if (fileName.endsWith('.tsx') && !fileName.includes('Container')) {
    const componentMatches = content.matchAll(/export\s+(?:const|function)\s+(\w+)(?:\s*:\s*React\.FC|\s*=\s*\([^)]*\)\s*(?::\s*\w+)?\s*=>|\s*\([^)]*\)\s*\{)/g);
    for (const match of componentMatches) {
      if (!match[1].startsWith('use')) { // Skip hooks
        result.components.push(match[1]);
      }
    }
  }

  // Find imports of known entities (stores, actions, tokens)
  const importMatches = content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of importMatches) {
    const names = match[1].split(',').map(n => n.trim().split(' as ')[0].trim());
    const from = match[2];
    names.forEach(name => {
      if (name) {
        result.imports.push({ name, from });
      }
    });
  }

  return result;
}

// --- Main ---

function main() {
  const modules = new Map(); // moduleName -> { stores, actions, tokens, containers, components }
  const allEntities = new Map(); // entityName -> { type, module, file }
  const allFiles = []; // { path, analysis }

  walkDir(targetDir, filePath => {
    const analysis = analyzeFile(filePath);
    const moduleName = getModuleName(filePath, targetDir);

    allFiles.push({ path: filePath, analysis, module: moduleName });

    if (!modules.has(moduleName)) {
      modules.set(moduleName, {
        stores: [],
        actions: [],
        tokens: [],
        containers: [],
        components: [],
        files: [],
      });
    }

    const mod = modules.get(moduleName);
    
    analysis.stores.forEach(s => {
      mod.stores.push(s);
      allEntities.set(s, { type: 'store', module: moduleName, file: filePath });
    });
    
    analysis.actions.forEach(a => {
      mod.actions.push(a);
      allEntities.set(a, { type: 'action', module: moduleName, file: filePath });
    });
    
    analysis.tokens.forEach(t => {
      mod.tokens.push(t);
      allEntities.set(t, { type: 'token', module: moduleName, file: filePath });
    });
    
    analysis.containers.forEach(c => {
      mod.containers.push(c);
      allEntities.set(c, { type: 'container', module: moduleName, file: filePath });
    });
    
    analysis.components.forEach(c => {
      mod.components.push(c);
      allEntities.set(c, { type: 'component', module: moduleName, file: filePath });
    });
    
    mod.files.push(analysis.path);
  });

  // Build dependency graph
  const edges = []; // { from, to, fromType, toType }
  
  for (const { path: filePath, analysis, module: moduleName } of allFiles) {
    // Find what this file defines
    const definedHere = [
      ...analysis.stores,
      ...analysis.actions,
      ...analysis.tokens,
      ...analysis.containers,
      ...analysis.components,
    ];
    
    // Find what this file imports that we know about
    for (const imp of analysis.imports) {
      if (allEntities.has(imp.name) && !definedHere.includes(imp.name)) {
        const target = allEntities.get(imp.name);
        
        // For each entity defined in this file, create edge
        for (const def of definedHere) {
          const source = allEntities.get(def);
          if (source && target) {
            edges.push({
              from: def,
              to: imp.name,
              fromType: source.type,
              toType: target.type,
            });
          }
        }
      }
    }
  }

  // Output
  output('# Module Analysis');
  output();
  output(`Analyzed: \`${targetDir}\``);
  output();
  
  // Summary table
  output('## Summary');
  output();
  output('| Module | Stores | Actions | DI Tokens | Containers |');
  output('|--------|--------|---------|-----------|------------|');
  
  for (const [name, mod] of modules) {
    if (mod.stores.length || mod.actions.length || mod.tokens.length || mod.containers.length) {
      output(`| ${name} | ${mod.stores.length} | ${mod.actions.length} | ${mod.tokens.length} | ${mod.containers.length} |`);
    }
  }

  // Dependencies list (skip components)
  output();
  output('## Dependencies');
  output();
  
  const relevantTypesForDeps = new Set(['store', 'action', 'token', 'container']);
  const edgesBySource = new Map();
  for (const edge of edges) {
    if (relevantTypesForDeps.has(edge.fromType) && relevantTypesForDeps.has(edge.toType)) {
      if (!edgesBySource.has(edge.from)) {
        edgesBySource.set(edge.from, []);
      }
      edgesBySource.get(edge.from).push(edge);
    }
  }
  
  for (const [source, deps] of edgesBySource) {
    const sourceInfo = allEntities.get(source);
    output(`**${source}** (${sourceInfo.type}) uses:`);
    deps.forEach(d => output(`  - \`${d.to}\` (${d.toType})`));
    output();
  }

  // Mermaid diagram with connections
  output('## Mermaid Diagram');
  output();
  output('```mermaid');
  output('flowchart TB');
  
  // Color definitions
  output('    classDef store fill:#4CAF50,stroke:#2E7D32,color:#fff');
  output('    classDef action fill:#2196F3,stroke:#1565C0,color:#fff');
  output('    classDef token fill:#FF9800,stroke:#EF6C00,color:#fff');
  output('    classDef container fill:#9C27B0,stroke:#6A1B9A,color:#fff');
  output();
  
  // Collect nodes by type for class assignment
  const storeNodes = [];
  const actionNodes = [];
  const tokenNodes = [];
  const containerNodes = [];
  
  // Define nodes (skip components)
  for (const [name, mod] of modules) {
    if (mod.stores.length || mod.actions.length || mod.tokens.length || mod.containers.length) {
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
      output(`    subgraph ${safeName}["${name}"]`);
      
      mod.stores.forEach(s => {
        output(`        ${s}[("${s}")]`);
        storeNodes.push(s);
      });
      
      mod.actions.forEach(a => {
        output(`        ${a}["${a}()"]`);
        actionNodes.push(a);
      });
      
      mod.tokens.forEach(t => {
        output(`        ${t}{{"${t}"}}`);
        tokenNodes.push(t);
      });
      
      mod.containers.forEach(c => {
        output(`        ${c}["${c}"]`);
        containerNodes.push(c);
      });
      
      output('    end');
    }
  }
  
  // Define edges (skip edges to/from components)
  output();
  const relevantTypes = new Set(['store', 'action', 'token', 'container']);
  const uniqueEdges = new Set();
  for (const edge of edges) {
    if (relevantTypes.has(edge.fromType) && relevantTypes.has(edge.toType)) {
      const edgeKey = `${edge.from}-->${edge.to}`;
      if (!uniqueEdges.has(edgeKey)) {
        uniqueEdges.add(edgeKey);
        output(`    ${edge.from} --> ${edge.to}`);
      }
    }
  }
  
  // Apply classes
  output();
  if (storeNodes.length) output(`    class ${storeNodes.join(',')} store`);
  if (actionNodes.length) output(`    class ${actionNodes.join(',')} action`);
  if (tokenNodes.length) output(`    class ${tokenNodes.join(',')} token`);
  if (containerNodes.length) output(`    class ${containerNodes.join(',')} container`);
  
  output('```');
  
  // Legend
  output();
  output('**Legend:**');
  output('- 🟢 Store (green)');
  output('- 🔵 Action (blue)');
  output('- 🟠 DI Token (orange)');
  output('- 🟣 Container (purple)');

  // Write to file if specified
  if (outputFile) {
    fs.writeFileSync(outputFile, outputLines.join('\n'), 'utf-8');
    console.log(`✅ Saved to ${outputFile}`);
  }
}

main();
