#!/usr/bin/env tsx
/**
 * TypeScript Dead Code Analyzer
 * Scans for unused type definitions, interfaces, enums, and type branches
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TypeDefinition {
  name: string;
  file: string;
  line: number;
  kind: 'interface' | 'type' | 'enum' | 'const';
  usage: number;
}

interface AnalysisReport {
  unusedTypes: TypeDefinition[];
  unusedEnumValues: Array<{ enum: string; value: string; file: string; line: number }>;
  duplicateTypes: Array<{ name: string; files: string[] }>;
  summary: {
    totalTypes: number;
    unusedTypes: number;
    unusedEnumValues: number;
    duplicates: number;
  };
}

const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git'];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx'];
const ROOT_DIR = '/Users/anthony/Documents/Projects/Collabuu-Webapp';

/**
 * Get all TypeScript files in the project
 */
function getTypeScriptFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        getTypeScriptFiles(fullPath, files);
      }
    } else {
      const ext = path.extname(entry.name);
      if (INCLUDE_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Extract type definitions from a file
 */
function extractTypeDefinitions(filePath: string): TypeDefinition[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const definitions: TypeDefinition[] = [];

  // Regex patterns for type definitions
  const interfacePattern = /export\s+interface\s+(\w+)/;
  const typePattern = /export\s+type\s+(\w+)/;
  const enumPattern = /export\s+enum\s+(\w+)/;
  const constTypePattern = /export\s+const\s+(\w+):\s*(?:readonly\s+)?(?:Array|Record|\[)/;

  lines.forEach((line, index) => {
    let match;

    if ((match = line.match(interfacePattern))) {
      definitions.push({
        name: match[1],
        file: filePath,
        line: index + 1,
        kind: 'interface',
        usage: 0
      });
    } else if ((match = line.match(typePattern))) {
      definitions.push({
        name: match[1],
        file: filePath,
        line: index + 1,
        kind: 'type',
        usage: 0
      });
    } else if ((match = line.match(enumPattern))) {
      definitions.push({
        name: match[1],
        file: filePath,
        line: index + 1,
        kind: 'enum',
        usage: 0
      });
    } else if ((match = line.match(constTypePattern))) {
      definitions.push({
        name: match[1],
        file: filePath,
        line: index + 1,
        kind: 'const',
        usage: 0
      });
    }
  });

  return definitions;
}

/**
 * Count usage of a type across all files
 */
function countTypeUsage(typeName: string, allFiles: string[], definitionFile: string): number {
  let count = 0;

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Don't count the definition itself
    if (file === definitionFile) {
      // Count occurrences but subtract 1 for the definition
      const matches = content.match(new RegExp(`\\b${typeName}\\b`, 'g'));
      count += matches ? matches.length - 1 : 0;
    } else {
      const matches = content.match(new RegExp(`\\b${typeName}\\b`, 'g'));
      count += matches ? matches.length : 0;
    }
  }

  return count;
}

/**
 * Extract enum values and check their usage
 */
function analyzeEnumValues(filePath: string, allFiles: string[]): Array<{ enum: string; value: string; file: string; line: number; usage: number }> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const results: Array<{ enum: string; value: string; file: string; line: number; usage: number }> = [];

  let currentEnum: string | null = null;
  let inEnum = false;

  lines.forEach((line, index) => {
    const enumMatch = line.match(/export\s+enum\s+(\w+)/);
    if (enumMatch) {
      currentEnum = enumMatch[1];
      inEnum = true;
      return;
    }

    if (inEnum && line.trim() === '}') {
      inEnum = false;
      currentEnum = null;
      return;
    }

    if (inEnum && currentEnum) {
      const valueMatch = line.match(/^\s*(\w+)\s*=\s*['"](\w+)['"]/);
      if (valueMatch) {
        const valueName = valueMatch[1];
        const fullName = `${currentEnum}.${valueName}`;

        // Count usage
        let usage = 0;
        for (const file of allFiles) {
          const fileContent = fs.readFileSync(file, 'utf-8');
          const matches = fileContent.match(new RegExp(`${currentEnum}\\.${valueName}`, 'g'));
          usage += matches ? matches.length : 0;
        }

        results.push({
          enum: currentEnum,
          value: valueName,
          file: filePath,
          line: index + 1,
          usage
        });
      }
    }
  });

  return results;
}

/**
 * Main analysis function
 */
function analyzeTypeScript(): AnalysisReport {
  console.log('🔍 Scanning TypeScript files...\n');

  const allFiles = getTypeScriptFiles(ROOT_DIR);
  console.log(`Found ${allFiles.length} TypeScript files\n`);

  // Extract all type definitions
  console.log('📊 Extracting type definitions...\n');
  const allDefinitions: TypeDefinition[] = [];
  const definitionsByName = new Map<string, string[]>();

  for (const file of allFiles) {
    const defs = extractTypeDefinitions(file);
    allDefinitions.push(...defs);

    // Track duplicates
    for (const def of defs) {
      if (!definitionsByName.has(def.name)) {
        definitionsByName.set(def.name, []);
      }
      definitionsByName.get(def.name)!.push(def.file);
    }
  }

  console.log(`Found ${allDefinitions.length} type definitions\n`);

  // Count usage for each type
  console.log('🔎 Analyzing type usage...\n');
  for (const def of allDefinitions) {
    def.usage = countTypeUsage(def.name, allFiles, def.file);
  }

  // Find unused types
  const unusedTypes = allDefinitions.filter(def => def.usage === 0);

  // Find duplicates
  const duplicates: Array<{ name: string; files: string[] }> = [];
  for (const [name, files] of definitionsByName.entries()) {
    if (files.length > 1) {
      duplicates.push({ name, files: [...new Set(files)] });
    }
  }

  // Analyze enum values
  console.log('🔎 Analyzing enum values...\n');
  const enumFiles = allDefinitions.filter(def => def.kind === 'enum');
  const allEnumValues: Array<{ enum: string; value: string; file: string; line: number; usage: number }> = [];

  for (const enumFile of enumFiles) {
    const values = analyzeEnumValues(enumFile.file, allFiles);
    allEnumValues.push(...values);
  }

  const unusedEnumValues = allEnumValues.filter(v => v.usage === 0);

  return {
    unusedTypes,
    unusedEnumValues,
    duplicateTypes: duplicates,
    summary: {
      totalTypes: allDefinitions.length,
      unusedTypes: unusedTypes.length,
      unusedEnumValues: unusedEnumValues.length,
      duplicates: duplicates.length
    }
  };
}

/**
 * Generate report
 */
function generateReport(report: AnalysisReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('TypeScript Dead Code Analysis Report');
  console.log('='.repeat(80) + '\n');

  console.log('📈 Summary:');
  console.log(`  Total type definitions: ${report.summary.totalTypes}`);
  console.log(`  Unused types: ${report.summary.unusedTypes}`);
  console.log(`  Unused enum values: ${report.summary.unusedEnumValues}`);
  console.log(`  Duplicate type names: ${report.summary.duplicates}\n`);

  if (report.unusedTypes.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('❌ Unused Type Definitions:');
    console.log('-'.repeat(80));

    const grouped = new Map<string, TypeDefinition[]>();
    for (const type of report.unusedTypes) {
      const relPath = path.relative(ROOT_DIR, type.file);
      if (!grouped.has(relPath)) {
        grouped.set(relPath, []);
      }
      grouped.get(relPath)!.push(type);
    }

    for (const [file, types] of grouped.entries()) {
      console.log(`\n📁 ${file}:`);
      for (const type of types) {
        console.log(`  ${type.kind.padEnd(10)} ${type.name.padEnd(40)} Line ${type.line}`);
      }
    }
  }

  if (report.unusedEnumValues.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('❌ Unused Enum Values:');
    console.log('-'.repeat(80));

    for (const value of report.unusedEnumValues) {
      const relPath = path.relative(ROOT_DIR, value.file);
      console.log(`  ${value.enum}.${value.value.padEnd(30)} ${relPath}:${value.line}`);
    }
  }

  if (report.duplicateTypes.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('⚠️  Duplicate Type Definitions:');
    console.log('-'.repeat(80));

    for (const dup of report.duplicateTypes) {
      console.log(`\n  Type: ${dup.name}`);
      for (const file of dup.files) {
        console.log(`    - ${path.relative(ROOT_DIR, file)}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Run analysis
const report = analyzeTypeScript();
generateReport(report);

// Write JSON report
const reportPath = path.join(ROOT_DIR, 'type-analysis-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Detailed report saved to: ${path.relative(ROOT_DIR, reportPath)}\n`);
