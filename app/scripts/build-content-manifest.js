#!/usr/bin/env node

// Scans public/content/ and generates a JSON manifest of all available
// markdown files. This runs at build time so the app knows which content
// exists without needing a server-side file listing.

import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const CONTENT_DIR = join(import.meta.dirname, '..', 'public', 'content');
const OUTPUT = join(import.meta.dirname, '..', 'public', 'content', 'manifest.json');

function walkDir(dir) {
  const results = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.endsWith('.md')) {
      results.push('/' + relative(CONTENT_DIR, fullPath));
    }
  }

  return results;
}

const files = walkDir(CONTENT_DIR).sort();

const manifest = {
  generatedAt: new Date().toISOString(),
  totalFiles: files.length,
  files,
};

writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
console.log(`Content manifest: ${files.length} files written to ${OUTPUT}`);
