'use strict';

/**
 * Checks every recipe (and the skeleton in _base-context.md) against the
 * "Mandatory code structure" rules, and every JS file against the code rules.
 * Run with: npm test
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT } = require('./helpers');

const SKIP_DIRS = new Set(['node_modules', '.git', 'tests']);

function findFiles(dir, extension, found = []) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) findFiles(full, extension, found);
        } else if (entry.name.endsWith(extension)) {
            found.push(full);
        }
    });
    return found;
}

const rel = (file) => path.relative(ROOT, file);
const jsFiles = findFiles(ROOT, '.js');
const cssFiles = findFiles(ROOT, '.css');
const recipeFiles = jsFiles.filter((f) => /[\\/]recipes[\\/][^\\/]+[\\/]variant\.js$/.test(f));

// The skeleton from _base-context.md is checked like a recipe
const baseContext = fs.readFileSync(path.join(ROOT, '_base-context.md'), 'utf8');
const skeleton = baseContext.split('### Skeleton')[1]?.split('```js')[1]?.split('```')[0];

// Lines of code: without blank lines and comment lines
function codeLines(source) {
    return source.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('/*') && !l.startsWith('*') && !l.startsWith('//'));
}

// Lines with leading spaces that are not a multiple of 4, outside /* */ comments
function badIndentLines(source) {
    const bad = [];
    let inBlock = false;
    source.split('\n').forEach((line, i) => {
        const trimmed = line.trim();
        const indent = line.length - line.trimStart().length;
        const isComment = inBlock || trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*');
        if (/^\t/.test(line)) bad.push(`${i + 1}: tab`);
        else if (trimmed && !isComment && indent % 4 !== 0) bad.push(`${i + 1}: ${indent} spaces`);
        if (trimmed.includes('/*') && !trimmed.slice(trimmed.indexOf('/*')).includes('*/')) inBlock = true;
        else if (trimmed.includes('*/')) inBlock = false;
    });
    return bad;
}

const BOOT = [
    "if (document.readyState === 'loading') {",
    "        document.addEventListener('DOMContentLoaded', init);",
    '    } else {',
    '        init();',
    '    }',
    '})();'
].join('\n');

function checkRecipeStructure(name, source) {
    describe(`structure: ${name}`, () => {
        const body = source.slice(source.indexOf('(function () {'));
        const lines = codeLines(body);

        test('rule 1: IIFE with "use strict" as the first line', () => {
            assert.ok(source.includes('(function () {'), 'no IIFE');
            assert.equal(lines[1], "'use strict';");
        });
        test('rule 2: CONFIG directly after "use strict"', () => {
            assert.match(lines[2], /^const CONFIG = \{/);
            assert.match(source, /testId: '/, 'CONFIG.testId missing');
        });
        test('rule 3: debug block present, console.log only inside log()', () => {
            assert.match(source, /function log\(msg, \.\.\.args\)/);
            assert.match(source, /hh_debug/);
            assert.match(source, /debug: false/, 'debug must be false');
            assert.equal((source.match(/console\.log/g) || []).length, 1, 'console.log outside log()');
        });
        test('rule 4: init() wraps its body in try/catch', () => {
            assert.match(source, /function init\(\) \{\n {8}try \{/);
        });
        test('rule 5: init() started based on document.readyState', () => {
            assert.ok(source.includes(BOOT), 'start-up block missing or different');
        });
        test('rule 6: no forbidden insertion methods', () => {
            assert.doesNotMatch(source, /\.(appendChild|append|prepend|insertBefore|after|before|replaceWith)\(|innerHTML \+=/);
        });
        test('rule 7: MutationObservers only through observe() with CONFIG.observers', () => {
            const count = (source.match(/new MutationObserver/g) || []).length;
            if (count === 0) return;
            assert.equal(count, 1, 'more than one "new MutationObserver": use observe()');
            assert.match(source, /function observe\(settings, callback\)/);
            assert.match(source, /observers: \{/);
        });
    });
}

recipeFiles.forEach((file) => checkRecipeStructure(rel(file), fs.readFileSync(file, 'utf8')));

describe('structure: skeleton in _base-context.md', () => {
    test('skeleton found', () => assert.ok(skeleton, 'no ```js block after "### Skeleton"'));
});
if (skeleton) checkRecipeStructure('skeleton in _base-context.md', skeleton);

describe('code rules: every JS file', () => {
    jsFiles.forEach((file) => {
        const source = fs.readFileSync(file, 'utf8');
        test(rel(file), () => {
            execFileSync(process.execPath, ['--check', file]); // throws on a syntax error
            assert.doesNotMatch(source, /\bvar\s/, 'uses var');
            assert.doesNotMatch(source, /[^=!<>]==[^=]|!=[^=]/, 'uses == or !=');
            assert.doesNotMatch(source, /\.(appendChild|append|prepend|insertBefore|replaceWith)\(/, 'forbidden insertion method');
            assert.deepEqual(badIndentLines(source), [], 'indentation must be 4 spaces');
            assert.doesNotMatch(codeLines(source).join('\n'), /\bjQuery\s*[.(]|\$\(/, 'uses jQuery');
        });
    });
});

describe('code rules: every CSS file', () => {
    cssFiles.forEach((file) => {
        test(rel(file), () => {
            assert.deepEqual(badIndentLines(fs.readFileSync(file, 'utf8')), [], 'indentation must be 4 spaces');
        });
    });
});

describe('recipe folders', () => {
    recipeFiles.forEach((file) => {
        const dir = path.dirname(file);
        test(rel(dir), () => {
            assert.ok(fs.existsSync(path.join(dir, 'README.md')), 'README.md missing');
            assert.ok(fs.existsSync(path.join(dir, 'variant.css')), 'variant.css missing');
            const table = path.join(dir, '..', 'README.md');
            assert.ok(fs.readFileSync(table, 'utf8').includes(`\`${path.basename(dir)}\``), `not listed in ${rel(table)}`);
            const tests = fs.readFileSync(path.join(__dirname, 'recipes.test.js'), 'utf8');
            assert.ok(tests.includes(rel(file).split(path.sep).join('/')), 'no behaviour test in tests/recipes.test.js');
        });
    });
});
