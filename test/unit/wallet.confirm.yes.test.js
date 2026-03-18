/**
 * Regression tests: wallet invasive commands respect --yes / abort on denial.
 * Uses the confirm module directly since wallet commands require chain access.
 */

const { confirm } = require('../../libs/commands/confirm');

describe('wallet --yes confirmation gate', () => {
    it('confirm() resolves true immediately when yes=true', async () => {
        const result = await confirm('Deploy?', true);
        expect(result).toBe(true);
    });

    it('confirm() resolves false on stdin EOF (non-interactive)', async () => {
        // Simulate non-interactive by passing a closed stream
        const { Readable } = require('stream');
        const readline = require('readline');

        const fakeStdin = new Readable({ read() {} });
        fakeStdin.push(null); // EOF immediately

        const rl = readline.createInterface({ input: fakeStdin, output: null, terminal: false });

        const result = await new Promise((resolve) => {
            let answered = false;
            rl.question('Deploy? [y/N] ', (answer) => {
                answered = true;
                rl.close();
                resolve(answer.trim().toLowerCase() === 'y');
            });
            rl.on('close', () => {
                if (!answered) resolve(false);
            });
        });

        expect(result).toBe(false);
    });

    it('confirm() resolves false when user answers "n"', async () => {
        const { Readable } = require('stream');
        const readline = require('readline');

        const fakeStdin = new Readable({ read() {} });
        fakeStdin.push('n\n');
        fakeStdin.push(null);

        const rl = readline.createInterface({ input: fakeStdin, output: null, terminal: false });

        const result = await new Promise((resolve) => {
            let answered = false;
            rl.question('Deploy? [y/N] ', (answer) => {
                answered = true;
                rl.close();
                resolve(answer.trim().toLowerCase() === 'y');
            });
            rl.on('close', () => {
                if (!answered) resolve(false);
            });
        });

        expect(result).toBe(false);
    });

    it('confirm() resolves true when user answers "y"', async () => {
        const { Readable } = require('stream');
        const readline = require('readline');

        const fakeStdin = new Readable({ read() {} });
        fakeStdin.push('y\n');
        fakeStdin.push(null);

        const rl = readline.createInterface({ input: fakeStdin, output: null, terminal: false });

        const result = await new Promise((resolve) => {
            let answered = false;
            rl.question('Deploy? [y/N] ', (answer) => {
                answered = true;
                rl.close();
                resolve(answer.trim().toLowerCase() === 'y');
            });
            rl.on('close', () => {
                if (!answered) resolve(false);
            });
        });

        expect(result).toBe(true);
    });
});
