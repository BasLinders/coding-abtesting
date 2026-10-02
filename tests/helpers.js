'use strict';

/**
 * Test helpers: run a recipe in a simulated browser (jsdom) and inspect the result.
 *
 * runRecipe('shared/recipes/countdown-banner/variant.js', { html, url, width, edits, before })
 *   html    page HTML the recipe runs on
 *   url     page URL (?hh_debug=1 is added automatically, so log() output is captured)
 *   width   simulated screen width for matchMedia (default 400 = mobile)
 *   edits   [[search, replace], ...] applied to the source, e.g. to fill in [SELECTOR] placeholders.
 *           A search string that isn't found throws, so tests break loudly when CONFIG changes.
 *   before  function(window) called before the recipe runs, e.g. to fake platform globals
 *
 * Returns { window, document, logs, errors, reloads(), resize(width), rerun(), source }.
 * Always await wait() after runRecipe: init() runs on DOMContentLoaded.
 */

const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const openWindows = [];

function readSource(file, edits = []) {
    let source = fs.readFileSync(path.join(ROOT, file), 'utf8');
    edits.forEach(([search, replace]) => {
        if (!source.includes(search)) throw new Error(`${file}: edit not found: ${search}`);
        source = source.replace(search, replace);
    });
    return source;
}

function addDebugFlag(url) {
    const u = new URL(url);
    u.searchParams.set('hh_debug', '1');
    return u.toString();
}

function runRecipe(file, { html = '<body></body>', url = 'https://shop.test/', width = 400, edits = [], before } = {}) {
    const source = readSource(file, edits);
    const errors = [];
    let reloads = 0;

    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', (err) => {
        // jsdom can't navigate: location.reload() reports "Not implemented: navigation"
        if (/navigation/i.test(err.message)) reloads++;
        else errors.push(err);
    });

    const dom = new JSDOM(html, { url: addDebugFlag(url), runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
    const { window } = dom;
    openWindows.push(window);

    // matchMedia with a controllable width (only max-width queries are used in the recipes)
    let currentWidth = width;
    const mediaLists = [];
    window.matchMedia = (query) => {
        const max = Number((query.match(/max-width:\s*(\d+)px/) || [])[1]);
        const list = {
            get matches() { return Number.isNaN(max) ? true : currentWidth <= max; },
            listeners: [],
            addEventListener(type, fn) { this.listeners.push(fn); },
            removeEventListener(type, fn) { this.listeners = this.listeners.filter((l) => l !== fn); }
        };
        mediaLists.push(list);
        return list;
    };

    if (!window.CSS?.escape) {
        window.CSS = window.CSS || {};
        // Simplified CSS.escape (jsdom has none): leading digit as code point, other special characters with a backslash
        window.CSS.escape = (value) => Array.from(String(value), (char, i) => {
            if (i === 0 && /\d/.test(char)) return `\\3${char} `;
            return /[\w-]/.test(char) ? char : `\\${char}`;
        }).join('');
    }

    const logs = [];
    window.console.log = (...args) => {
        logs.push(args.filter((a) => typeof a === 'string' && !a.startsWith('color')).join(' ').replace(/%c/g, ''));
    };

    if (before) before(window);
    window.eval(source);

    return {
        window,
        document: window.document,
        logs,
        errors,
        source,
        reloads: () => reloads,
        resize(newWidth) {
            currentWidth = newWidth;
            mediaLists.forEach((list) => list.listeners.forEach((fn) => fn({ matches: list.matches })));
        },
        rerun() {
            window.eval(source);
        }
    };
}

function wait(ms = 50) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Text without whitespace differences (Intl uses non-breaking spaces in prices)
function text(el) {
    return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function closeAll() {
    openWindows.splice(0).forEach((window) => window.close());
}

module.exports = { ROOT, runRecipe, readSource, wait, text, closeAll };
