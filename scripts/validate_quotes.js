const fs = require('fs');
const path = require('path');

const QUOTES_FILE = path.join(__dirname, '../src/data/quotes.json');

console.log(`Validating ${QUOTES_FILE}...`);

let quotes = [];
try {
  quotes = require(QUOTES_FILE);
} catch (error) {
  console.error("CRITICAL: Could not parse quotes.json");
  process.exit(1);
}

let errors = 0;
const ids = new Set();

quotes.forEach((q, index) => {
  // Check 1: Unique ID
  if (ids.has(q.id)) {
    console.error(`Row ${index + 1}: Duplicate ID detected (${q.id})`);
    errors++;
  }
  ids.add(q.id);

  // Check 2: Content
  if (!q.content || !q.content.en || q.content.en.trim() === "") {
    console.error(`Row ${index + 1} (ID ${q.id}): Missing English content`);
    errors++;
  }
  if (!q.content || !q.content.es || q.content.es.trim() === "") {
    console.error(`Row ${index + 1} (ID ${q.id}): Missing Spanish content`);
    errors++;
  }

  // Check 3: Author
  if (!q.author || q.author.trim() === "") {
    console.error(`Row ${index + 1} (ID ${q.id}): Missing Author`);
    errors++;
  }

  // Check 4: Check for deprecated fields (Strict Schema)
  if (q.tags || q.wiki) {
     console.warn(`Row ${index + 1} (ID ${q.id}): Contains deprecated fields (tags/wiki). Cleanup recommended.`);
  }
});

if (errors === 0) {
  console.log(`✅ Validation Passed! (${quotes.length} quotes checked)`);
} else {
  console.error(`❌ Validation Failed with ${errors} errors.`);
  process.exit(1);
}
