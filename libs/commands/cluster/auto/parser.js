/**
 * 解析合约源码中的 @fsca-* 注解
 */

module.exports = function parse(sourceCode, contractName) {
    const idMatch = sourceCode.match(/\/\/\s*@fsca-id\s+(\d+)/);
    const activeMatch = sourceCode.match(/\/\/\s*@fsca-active\s*([\d,\s]*)/);
    const passiveMatch = sourceCode.match(/\/\/\s*@fsca-passive\s*([\d,\s]*)/);
    const autoMatch = sourceCode.match(/\/\/\s*@fsca-auto\s+(yes|no)/i);

    const autoEnabled = autoMatch ? autoMatch[1].toLowerCase() === 'yes' : false;

    if (!autoEnabled) {
        return { contractName, fscaId: null, activePods: [], passivePods: [], autoEnabled: false };
    }

    if (!idMatch) {
        return { contractName, fscaId: null, activePods: [], passivePods: [], autoEnabled: true, error: `Missing @fsca-id in ${contractName}` };
    }

    const fscaId = parseInt(idMatch[1], 10);

    const parsePodList = (match) => {
        if (!match || !match[1].trim()) return [];
        return match[1].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    };

    return {
        contractName,
        fscaId,
        activePods: parsePodList(activeMatch),
        passivePods: parsePodList(passiveMatch),
        autoEnabled: true,
    };
};
