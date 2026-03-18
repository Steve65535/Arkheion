/**
 * Unit tests for libs/commands/cluster/auto/parser.js
 */

const parse = require('../../libs/commands/cluster/auto/parser');

describe('parser', () => {
    describe('autoEnabled detection', () => {
        it('returns autoEnabled=false when @fsca-auto is missing', () => {
            const src = `// @fsca-id 1\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.autoEnabled).toBe(false);
        });

        it('returns autoEnabled=false when @fsca-auto no', () => {
            const src = `// @fsca-auto no\n// @fsca-id 1\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.autoEnabled).toBe(false);
        });

        it('returns autoEnabled=true when @fsca-auto yes', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 1\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.autoEnabled).toBe(true);
        });

        it('is case-insensitive for yes/no', () => {
            const src = `// @fsca-auto YES\n// @fsca-id 1\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.autoEnabled).toBe(true);
        });
    });

    describe('fscaId parsing', () => {
        it('parses @fsca-id correctly', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 42\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.fscaId).toBe(42);
        });

        it('returns error when @fsca-id is missing but @fsca-auto yes', () => {
            const src = `// @fsca-auto yes\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.error).toMatch(/Missing @fsca-id/);
            expect(result.fscaId).toBeNull();
        });
    });

    describe('activePods parsing', () => {
        it('parses single active pod', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 2\n// @fsca-active 1\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.activePods).toEqual([1]);
        });

        it('parses multiple active pods', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 2\n// @fsca-active 1,3,5\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.activePods).toEqual([1, 3, 5]);
        });

        it('returns empty array when @fsca-active is empty', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 2\n// @fsca-active\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.activePods).toEqual([]);
        });

        it('returns empty array when @fsca-active is absent', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 2\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.activePods).toEqual([]);
        });

        it('handles spaces around commas', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 2\n// @fsca-active 1, 3, 5\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.activePods).toEqual([1, 3, 5]);
        });
    });

    describe('passivePods parsing', () => {
        it('parses passive pods', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 3\n// @fsca-passive 2\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.passivePods).toEqual([2]);
        });

        it('returns empty array when @fsca-passive is empty', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 3\n// @fsca-passive\ncontract Foo is normalTemplate {}`;
            const result = parse(src, 'Foo');
            expect(result.passivePods).toEqual([]);
        });
    });

    describe('contractName passthrough', () => {
        it('preserves contractName', () => {
            const src = `// @fsca-auto yes\n// @fsca-id 1\ncontract MyContract is normalTemplate {}`;
            const result = parse(src, 'MyContract');
            expect(result.contractName).toBe('MyContract');
        });
    });

    describe('full annotation block', () => {
        it('parses a complete annotation block correctly', () => {
            const src = [
                '// @fsca-id 2',
                '// @fsca-active 1,3',
                '// @fsca-passive',
                '// @fsca-auto yes',
                'contract TradeEngineV1 is normalTemplate {}'
            ].join('\n');
            const result = parse(src, 'TradeEngineV1');
            expect(result.autoEnabled).toBe(true);
            expect(result.fscaId).toBe(2);
            expect(result.activePods).toEqual([1, 3]);
            expect(result.passivePods).toEqual([]);
            expect(result.contractName).toBe('TradeEngineV1');
        });
    });
});
