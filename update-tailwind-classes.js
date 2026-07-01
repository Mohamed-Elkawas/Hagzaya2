#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

function parseReplacement(item) {
  const replacements = [];

  if (item.oldClass && item.newClass) {
    replacements.push({ oldClass: item.oldClass, newClass: item.newClass });
  }

  if (item.message && typeof item.message === 'string') {
    const arrowMatch = item.message.match(/[`"']?([^`"']+?)['"`]?[\s]*[→➔=>]+[\s]*[`"']?([^`"']+?)['"']?/);
    if (arrowMatch) {
      replacements.push({ oldClass: arrowMatch[1], newClass: arrowMatch[2] });
    }

    const replaceMatch = item.message.match(/replace\s+['"`]([^'"`]+)['"`]\s+with\s+['"`]([^'"`]+)['"`]/i);
    if (replaceMatch) {
      replacements.push({ oldClass: replaceMatch[1], newClass: replaceMatch[2] });
    }
  }

  if (item.replacement && item.replacement.oldClass && item.replacement.newClass) {
    replacements.push({ oldClass: item.replacement.oldClass, newClass: item.replacement.newClass });
  }

  return replacements;
}

function normalizeResource(resource) {
  if (!resource) return null;
  return path.normalize(resource.replace(/^\.\//, ''));
}

async function main() {
  const [jsonPathArg, rootArg] = process.argv.slice(2);
  if (!jsonPathArg) {
    console.error('Usage: node update-tailwind-classes.js <suggestions.json> [project-root]');
    process.exit(1);
  }

  const root = path.resolve(rootArg || process.cwd());
  const jsonPath = path.resolve(process.cwd(), jsonPathArg);

  let raw;
  try {
    raw = await fs.readFile(jsonPath, 'utf8');
  } catch (err) {
    console.error(`Failed to read JSON file: ${jsonPath}`);
    console.error(err.message);
    process.exit(1);
  }

  let suggestions;
  try {
    suggestions = JSON.parse(raw);
  } catch (err) {
    console.error('Invalid JSON format in suggestions file.');
    console.error(err.message);
    process.exit(1);
  }

  if (!Array.isArray(suggestions)) {
    console.error('Expected JSON file to contain an array of suggestions.');
    process.exit(1);
  }

  const files = new Map();

  suggestions.forEach((item, index) => {
    const resource = normalizeResource(item.resource || item.file || item.uri || item.path);
    if (!resource) {
      console.warn(`Skipping suggestion #${index + 1}: missing resource path.`);
      return;
    }

    const replacements = parseReplacement(item);
    if (!replacements.length) {
      console.warn(`Skipping suggestion for resource ${resource}: could not infer replacement from message.`);
      return;
    }

    const existing = files.get(resource) || [];
    files.set(resource, existing.concat(replacements));
  });

  if (!files.size) {
    console.log('No valid replacements found in the JSON file.');
    return;
  }

  for (const [resource, replacements] of files.entries()) {
    const filePath = path.resolve(root, resource);
    let content;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (err) {
      console.error(`Failed to read target file: ${filePath}`);
      continue;
    }

    const uniqueReplacements = Array.from(
      new Map(replacements.map((r) => [`${r.oldClass}|||${r.newClass}`, r])).values()
    );

    let modified = content;
    const applied = [];
    const missing = [];

    uniqueReplacements.forEach(({ oldClass, newClass }) => {
      if (!oldClass || !newClass) return;
      const count = modified.split(oldClass).length - 1;
      if (count === 0) {
        missing.push(oldClass);
        return;
      }
      modified = modified.split(oldClass).join(newClass);
      applied.push({ oldClass, newClass, count });
    });

    if (applied.length > 0) {
      await fs.writeFile(filePath, modified, 'utf8');
      console.log(`Updated ${resource}:`);
      applied.forEach(({ oldClass, newClass, count }) => {
        console.log(`  • Replaced ${count} occurrence(s) of '${oldClass}' with '${newClass}'.`);
      });
      if (missing.length) {
        missing.forEach((oldClass) => console.warn(`  ⚠️ Pattern not found in ${resource}: '${oldClass}'`));
      }
    } else {
      console.log(`No changes made to ${resource}.`);
      if (missing.length) {
        missing.forEach((oldClass) => console.warn(`  ⚠️ Pattern not found in ${resource}: '${oldClass}'`));
      }
    }
  }
}

main().catch((err) => {
  console.error('Unexpected error:');
  console.error(err);
  process.exit(1);
});
