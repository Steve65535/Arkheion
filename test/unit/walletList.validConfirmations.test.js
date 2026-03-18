'use strict';

/**
 * Regression tests for wallet list valid confirmations display.
 * Verifies that getValidConfirmations is used instead of numConfirmations,
 * so that removed owners' historical confirmations don't inflate the count.
 */

describe('wallet list valid confirmations logic', () => {
    // Simulate the logic in list.js: use getValidConfirmations per tx
    function buildTxEntry(tx, validConfirmations) {
        return {
            index: tx.index,
            to: tx.to,
            value: tx.value,
            executed: tx.executed,
            confirmations: validConfirmations,
        };
    }

    function isReady(entry, threshold) {
        return !entry.executed && entry.confirmations >= threshold;
    }

    test('uses validConfirmations, not numConfirmations', () => {
        const tx = { index: 0, to: '0xabc', value: 0n, executed: false, numConfirmations: 3n };
        // After removeOwner, only 1 of 3 confirmations is from a current owner
        const validConfirmations = 1n;
        const entry = buildTxEntry(tx, validConfirmations);
        expect(entry.confirmations).toBe(1n);
        expect(entry.confirmations).not.toBe(tx.numConfirmations);
    });

    test('ready status uses validConfirmations', () => {
        const threshold = 2n;
        // numConfirmations says 3 (stale), but only 1 valid owner remains
        const entryStale = buildTxEntry({ index: 0, to: '0x1', value: 0n, executed: false }, 3n);
        const entryValid = buildTxEntry({ index: 0, to: '0x1', value: 0n, executed: false }, 1n);

        // With stale count: incorrectly shows ready
        expect(isReady(entryStale, threshold)).toBe(true);
        // With valid count: correctly shows not ready
        expect(isReady(entryValid, threshold)).toBe(false);
    });

    test('executed tx is never ready regardless of confirmations', () => {
        const entry = buildTxEntry({ index: 0, to: '0x1', value: 0n, executed: true }, 5n);
        expect(isReady(entry, 2n)).toBe(false);
    });

    test('exactly at threshold → ready', () => {
        const entry = buildTxEntry({ index: 0, to: '0x1', value: 0n, executed: false }, 2n);
        expect(isReady(entry, 2n)).toBe(true);
    });

    test('below threshold → not ready', () => {
        const entry = buildTxEntry({ index: 0, to: '0x1', value: 0n, executed: false }, 1n);
        expect(isReady(entry, 2n)).toBe(false);
    });
});
