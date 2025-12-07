const fs = require('fs');
const path = require('path');

console.log('Extracting magic bitboard tables...\n');

const bitboardPath = path.join(__dirname, '..', 'js', 'bitboard.js');
const content = fs.readFileSync(bitboardPath, 'utf8');
const lines = content.split('\n');

// Extract the three tables
const lookupStart = 2775; // 0-indexed
const lookupEnd = 3479;
const bMagicsStart = 3483;
const bMagicsEnd = 3616;
const rMagicsStart = 3551;
const rMagicsEnd = 3616;

// Extract lookup_table
const lookupTable = lines.slice(lookupStart, lookupEnd + 1).join('\n');

// Extract b_magics (need to find where it actually starts since r_magics is embedded)
// Looking at the data, b_magics and r_magics have the same end line, so r_magics must start within b_magics block
// Let's extract them more carefully
let bMagicsLines = [];
let rMagicsLines = [];
let inRMagics = false;

for (let i = bMagicsStart; i <= bMagicsEnd; i++) {
    if (lines[i].match(/^var\s+r_magics\s*=/)) {
        inRMagics = true;
    }

    if (inRMagics) {
        rMagicsLines.push(lines[i]);
    } else {
        bMagicsLines.push(lines[i]);
    }
}

const bMagics = bMagicsLines.join('\n');
const rMagics = rMagicsLines.join('\n');

// Create the magic tables file
const magicTablesContent = `"use strict";

// Magic Bitboard Lookup Tables
// These tables are used for fast slider move generation (bishops and rooks)
// Generated using magic bitboards technique

${lookupTable}

${bMagics}

${rMagics}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { lookup_table, b_magics, r_magics };
}
`;

const magicTablesPath = path.join(__dirname, '..', 'js', 'magic-tables.js');
fs.writeFileSync(magicTablesPath, magicTablesContent);

console.log(`✓ Created js/magic-tables.js`);
console.log(`  Size: ${(magicTablesContent.length / 1024).toFixed(0)} KB\n`);

// Now modify bitboard.js to import these tables instead
let newBitboardContent = '';
let skipUntil = -1;

for (let i = 0; i < lines.length; i++) {
    if (i < skipUntil) continue;

    // When we hit lookup_table, replace with import
    if (i === lookupStart) {
        newBitboardContent += '// Magic bitboard tables imported from external file\n';
        newBitboardContent += 'var lookup_table, b_magics, r_magics;\n';
        newBitboardContent += 'if (typeof module !== \'undefined\' && require) {\n';
        newBitboardContent += '    const magicTables = require(\'./magic-tables.js\');\n';
        newBitboardContent += '    lookup_table = magicTables.lookup_table;\n';
        newBitboardContent += '    b_magics = magicTables.b_magics;\n';
        newBitboardContent += '    r_magics = magicTables.r_magics;\n';
        newBitboardContent += '} else {\n';
        newBitboardContent += '    // In browser, these should be loaded via script tag before bitboard.js\n';
        newBitboardContent += '}\n';
        skipUntil = rMagicsEnd + 1;
        continue;
    }

    newBitboardContent += lines[i] + '\n';
}

fs.writeFileSync(bitboardPath, newBitboardContent);

console.log(`✓ Modified js/bitboard.js to import tables`);
console.log(`  New size: ${(newBitboardContent.length / 1024).toFixed(0)} KB`);
console.log(`  Original size: ${(content.length / 1024).toFixed(0)} KB`);
console.log(`  Saved: ${((content.length - newBitboardContent.length) / 1024).toFixed(0)} KB\n`);

console.log('✓ Extraction complete!');
