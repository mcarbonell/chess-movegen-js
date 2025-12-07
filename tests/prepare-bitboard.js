const fs = require('fs');
const path = require('path');

// Read x88.js to extract the helper section
const x88Content = fs.readFileSync(path.join(__dirname, '..', 'js', 'x88.js'), 'utf8');
const helperMatch = x88Content.match(/\/\/ Piece type and color constants[\s\S]*?return count;\s*\}/);

if (!helperMatch) {
    console.error('Could not find helpers in x88.js');
    process.exit(1);
}

const helpers = helperMatch[0];

// Read bitboard.js
let bitboardContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'bitboard.js'), 'utf8');

// Check if already modified
if (bitboardContent.includes('// Piece type and color constants')) {
    console.log('bitboard.js already has helpers - skipping');
} else {
    // Remove "use strict" and add headers
    bitboardContent = bitboardContent.replace(/^["']use strict["'];?\s*/m, '');
    bitboardContent = '"use strict";\r\n\r\n' + helpers + '\r\n\r\n\r\n' + bitboardContent;
    fs.writeFileSync(path.join(__dirname, '..', 'js', 'bitboard.js'), bitboardContent);
    console.log('✓ Added helpers to bitboard.js');
}

// Now add export at the end if not present
bitboardContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'bitboard.js'), 'utf8');
if (!bitboardContent.includes('module.exports')) {
    bitboardContent += '\r\n\r\n// Node.js export compatibility\r\nif (typeof module !== \'undefined\' && module.exports) {\r\n    module.exports = { BBBoard };\r\n}\r\n';
    fs.writeFileSync(path.join(__dirname, '..', 'js', 'bitboard.js'), bitboardContent);
    console.log('✓ Added export to bitboard.js');
} else {
    console.log('bitboard.js already has export - skipping');
}

console.log('✓ bitboard.js is ready for Node.js!');
