const fs = require('fs');
const path = require('path');

const bitboardPath = path.join(__dirname, '..', 'js', 'bitboard.js');
const content = fs.readFileSync(bitboardPath, 'utf8');
const lines = content.split('\n');

// Find the table declarations
const tables = ['lookup_table', 'b_magics', 'r_magics'];
const tableInfo = {};

for (let i = 0; i < lines.length; i++) {
    for (const tableName of tables) {
        if (lines[i].match(new RegExp(`^var\\s+${tableName}\\s*=`))) {
            tableInfo[tableName] = { start: i + 1 };
            console.log(`Found ${tableName} at line ${i + 1}`);
        }
    }
}

// Find where each table ends (look for ];)
for (const tableName of Object.keys(tableInfo)) {
    const startLine = tableInfo[tableName].start - 1;
    for (let i = startLine; i < lines.length; i++) {
        if (lines[i].includes('];')) {
            tableInfo[tableName].end = i + 1;
            console.log(`${tableName} ends at line ${i + 1}`);
            break;
        }
    }
}

console.log('\nTable information:');
console.log(JSON.stringify(tableInfo, null, 2));

// Calculate sizes
for (const tableName of Object.keys(tableInfo)) {
    const { start, end } = tableInfo[tableName];
    const tableLines = end - start + 1;
    const tableContent = lines.slice(start - 1, end).join('\n');
    const tableSize = tableContent.length;
    console.log(`\n${tableName}:`);
    console.log(`  Lines: ${tableLines}`);
    console.log(`  Size: ${(tableSize / 1024).toFixed(0)} KB`);
}
