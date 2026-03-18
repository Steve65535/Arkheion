'use strict';

/**
 * Regression tests for cluster check conflict pre-flight gate.
 * Verifies that scanAllConflicts + scanIdConflicts are called and
 * cause process.exit(1) when conflicts exist.
 */

const { scanAllConflicts, scanIdConflicts, failOnAllConflicts } = require('../../libs/commands/contractConflicts');
const fs = require('fs');
const os = require('os');
const path = require('path');

function mkTmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'fsca-check-')); }
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function writeFile(p, content = '{}') { mkdirp(path.dirname(p)); fs.writeFileSync(p, content, 'utf-8'); }
function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }

describe('cluster check conflict pre-flight (unit)', () => {
    let tmp;
    beforeEach(() => { tmp = mkTmp(); });
    afterEach(() => { rmrf(tmp); });

    test('no conflicts → failOnAllConflicts does not throw', () => {
        writeFile(path.join(tmp, 'artifacts', 'contracts', 'undeployed', 'A.sol', 'A.json'));
        writeFile(path.join(tmp, 'contracts', 'undeployed', 'A.sol'),
            '// @fsca-id 1\ncontract A is normalTemplate {}');
        const conflicts = scanAllConflicts(tmp);
        const { idConflicts } = scanIdConflicts(tmp);
        expect(() => failOnAllConflicts({ ...conflicts, idConflicts })).not.toThrow();
    });

    test('artifact conflict → failOnAllConflicts throws (check would exit)', () => {
        writeFile(path.join(tmp, 'artifacts', 'contracts', 'undeployed', 'A.sol', 'A.json'));
        writeFile(path.join(tmp, 'artifacts', 'contracts', 'undeployed', 'lib', 'A.sol', 'A.json'));
        const conflicts = scanAllConflicts(tmp);
        const { idConflicts } = scanIdConflicts(tmp);
        expect(() => failOnAllConflicts({ ...conflicts, idConflicts })).toThrow(/1 contract conflict/);
    });

    test('@fsca-id conflict → failOnAllConflicts throws (check would exit)', () => {
        writeFile(path.join(tmp, 'contracts', 'undeployed', 'A.sol'),
            '// @fsca-id 3\ncontract A is normalTemplate {}');
        writeFile(path.join(tmp, 'contracts', 'undeployed', 'B.sol'),
            '// @fsca-id 3\ncontract B is normalTemplate {}');
        const conflicts = scanAllConflicts(tmp);
        const { idConflicts } = scanIdConflicts(tmp);
        expect(() => failOnAllConflicts({ ...conflicts, idConflicts })).toThrow(/1 contract conflict/);
        expect(() => failOnAllConflicts({ ...conflicts, idConflicts })).toThrow(/each @fsca-id is used by only one/);
    });

    test('non-@fsca-auto contract @fsca-id conflict is caught', () => {
        // Simulates a contract without @fsca-auto yes sharing an ID — check must still catch it
        writeFile(path.join(tmp, 'contracts', 'undeployed', 'X.sol'),
            '// @fsca-id 7\ncontract X is normalTemplate {}');
        writeFile(path.join(tmp, 'contracts', 'undeployed', 'lib', 'Y.sol'),
            '// @fsca-id 7\ncontract Y is normalTemplate {}');
        const { idConflicts } = scanIdConflicts(tmp);
        expect(idConflicts).toHaveLength(1);
        expect(idConflicts[0].contractId).toBe(7);
    });
});
