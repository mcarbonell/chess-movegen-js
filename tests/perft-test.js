#!/usr/bin/env node

/**
 * Perft Test Runner for Chess Move Generators
 * 
 * Usage:
 *   node tests/perft-test.js                    # Run all tests on both generators
 *   node tests/perft-test.js --generator x88    # Test only x88
 *   node tests/perft-test.js --generator bb     # Test only bitboard
 *   node tests/perft-test.js --position 0       # Test only position 0
 *   node tests/perft-test.js --depth 5          # Test up to depth 5
 *   node tests/perft-test.js --quick            # Quick test (depths 1-4)
 */

const perftPositions = require('./perft-positions.js');

// Ensure `performance` is available in Node.js (GitHub Actions runners)
if (typeof performance === 'undefined') {
    try {
        global.performance = require('perf_hooks').performance;
    } catch (e) {
        // If perf_hooks is unavailable, tests will report missing performance timing.
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    generator: 'both', // 'x88', 'bb', or 'both'
    position: null,    // null = all positions, number = specific position
    maxDepth: 6,       // Maximum depth to test
    quick: false       // Quick mode (depths 1-4 only)
};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--generator' && args[i + 1]) {
        options.generator = args[++i];
    } else if (args[i] === '--position' && args[i + 1]) {
        options.position = parseInt(args[++i]);
    } else if (args[i] === '--depth' && args[i + 1]) {
        options.maxDepth = parseInt(args[++i]);
    } else if (args[i] === '--quick') {
        options.quick = true;
        options.maxDepth = 4;
    } else if (args[i] === '--help' || args[i] === '-h') {
        console.log(`
Perft Test Runner

Usage:
  node tests/perft-test.js [options]

Options:
  --generator <x88|bb|both>   Select generator to test (default: both)
  --position <n>              Test only position n (default: all)
  --depth <n>                 Test up to depth n (default: 6)
  --quick                     Quick test mode (depths 1-4)
  --help, -h                  Show this help

Examples:
  node tests/perft-test.js --quick
  node tests/perft-test.js --generator x88 --depth 5
  node tests/perft-test.js --position 1 --generator bb
        `);
        process.exit(0);
    }
}

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatTime(ms) {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
}

function calculateNPS(nodes, ms) {
    return Math.round((nodes / ms) * 1000);
}

// Test results accumulator
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
    timings: []
};

function runPerftTest(board, fen, depth, expectedResult, testName) {
    try {
        board.loadFEN(fen);

        const startTime = performance.now();
        const result = board.perft(depth);
        const endTime = performance.now();

        const elapsedMs = endTime - startTime;
        const nps = calculateNPS(result, elapsedMs);

        testResults.total++;

        if (result === expectedResult) {
            testResults.passed++;
            console.log(
                `  ${colors.green}✓${colors.reset} Depth ${depth}: ` +
                `${colors.cyan}${formatNumber(result)}${colors.reset} nodes ` +
                `${colors.gray}[${formatTime(elapsedMs)}, ${formatNumber(nps)} NPS]${colors.reset}`
            );

            testResults.timings.push({
                name: testName,
                depth: depth,
                nodes: result,
                time: elapsedMs,
                nps: nps
            });

            return true;
        } else {
            testResults.failed++;
            const error = {
                test: testName,
                depth: depth,
                expected: expectedResult,
                got: result
            };
            testResults.errors.push(error);

            console.log(
                `  ${colors.red}✗${colors.reset} Depth ${depth}: ` +
                `Expected ${colors.yellow}${formatNumber(expectedResult)}${colors.reset}, ` +
                `got ${colors.red}${formatNumber(result)}${colors.reset}`
            );
            return false;
        }
    } catch (error) {
        testResults.total++;
        testResults.failed++;
        testResults.errors.push({
            test: testName,
            depth: depth,
            error: error.message
        });
        console.log(`  ${colors.red}✗${colors.reset} Depth ${depth}: ${colors.red}ERROR - ${error.message}${colors.reset}`);
        return false;
    }
}

function testGenerator(generatorName, BoardClass, positions) {
    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}Testing: ${generatorName}${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    const board = new BoardClass();

    for (const position of positions) {
        console.log(`${colors.cyan}${position.name}${colors.reset}`);
        console.log(`${colors.gray}FEN: ${position.fen}${colors.reset}`);

        // Test each depth that has expected results
        const depths = Object.keys(position.results)
            .map(d => parseInt(d))
            .filter(d => d <= options.maxDepth)
            .sort((a, b) => a - b);

        for (const depth of depths) {
            const testName = `${generatorName} - ${position.name} - Depth ${depth}`;
            runPerftTest(
                board,
                position.fen,
                depth,
                position.results[depth],
                testName
            );
        }

        console.log(''); // Empty line between positions
    }
}

function printSummary() {
    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.blue}Summary${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);

    console.log(`Total tests: ${testResults.total}`);
    console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
    console.log(`Pass rate: ${passRate}%\n`);

    if (testResults.errors.length > 0) {
        console.log(`${colors.red}Errors:${colors.reset}`);
        testResults.errors.forEach(err => {
            console.log(`  ${colors.red}✗${colors.reset} ${err.test}`);
            if (err.error) {
                console.log(`    ${colors.gray}Error: ${err.error}${colors.reset}`);
            } else {
                console.log(`    ${colors.gray}Expected: ${formatNumber(err.expected)}, Got: ${formatNumber(err.got)}${colors.reset}`);
            }
        });
        console.log('');
    }

    // Performance summary
    if (testResults.timings.length > 0) {
        console.log(`${colors.cyan}Performance Summary:${colors.reset}`);

        // Group by depth
        const byDepth = {};
        testResults.timings.forEach(t => {
            if (!byDepth[t.depth]) byDepth[t.depth] = [];
            byDepth[t.depth].push(t);
        });

        Object.keys(byDepth).sort((a, b) => a - b).forEach(depth => {
            const tests = byDepth[depth];
            const avgNPS = tests.reduce((sum, t) => sum + t.nps, 0) / tests.length;
            const totalNodes = tests.reduce((sum, t) => sum + t.nodes, 0);
            const totalTime = tests.reduce((sum, t) => sum + t.time, 0);

            console.log(`  Depth ${depth}: ${colors.cyan}${formatNumber(Math.round(avgNPS))} NPS avg${colors.reset} ` +
                `${colors.gray}(${formatNumber(totalNodes)} nodes in ${formatTime(totalTime)})${colors.reset}`);
        });
    }

    console.log('');

    // Exit with error code if tests failed
    if (testResults.failed > 0) {
        process.exit(1);
    }
}

// Main execution
async function main() {
    console.log(`${colors.blue}Chess Move Generator - Perft Test Suite${colors.reset}\n`);

    // Filter positions if specific position requested
    let positionsToTest = perftPositions;
    if (options.position !== null) {
        if (options.position >= 0 && options.position < perftPositions.length) {
            positionsToTest = [perftPositions[options.position]];
        } else {
            console.error(`${colors.red}Error: Position ${options.position} not found${colors.reset}`);
            process.exit(1);
        }
    }

    console.log(`${colors.gray}Configuration:${colors.reset}`);
    console.log(`${colors.gray}  Generator: ${options.generator}${colors.reset}`);
    console.log(`${colors.gray}  Positions: ${positionsToTest.length}${colors.reset}`);
    console.log(`${colors.gray}  Max depth: ${options.maxDepth}${colors.reset}`);

    // Load the generators
    try {
        // Import x88 board
        if (options.generator === 'x88' || options.generator === 'both') {
            const { Board: X88Board } = require('./x88-node.js');
            testGenerator('x88 Generator', X88Board, positionsToTest);
        }

        // Import bitboard
        if (options.generator === 'bb' || options.generator === 'both') {
            try {
                const { BBBoard } = require('./bitboard-node.js');
                testGenerator('Bitboard Generator', BBBoard, positionsToTest);
            } catch (error) {
                console.log(`${colors.yellow}Warning: Could not load bitboard generator${colors.reset}`);
                console.log(`${colors.gray}${error.message}${colors.reset}\n`);
            }
        }

        printSummary();

    } catch (error) {
        console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the tests
main();
