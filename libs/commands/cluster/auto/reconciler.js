/**
 * 状态协调器：对比 project.json 确定每个合约需要执行的操作
 */

module.exports = function reconcile(contracts, projectConfig) {
    const fsca = projectConfig.fsca || {};
    const running = fsca.runningcontracts || [];
    const unmounted = fsca.unmountedcontracts || [];

    const results = [];
    const warnings = [];

    for (const c of contracts) {
        const { contractName, fscaId, activePods, passivePods } = c;

        // Check if already mounted (match by contractId)
        const mountedEntry = running.find(r => Number(r.contractId) === fscaId);
        if (mountedEntry) {
            warnings.push(`Contract "${contractName}" (id=${fscaId}) is already mounted at ${mountedEntry.address}, skipping.`);
            results.push({
                contractName, fscaId, activePods, passivePods,
                state: 'mounted',
                existingAddress: mountedEntry.address,
                actions: [],
            });
            continue;
        }

        // Check if deployed but unmounted (match by name)
        const unmountedEntry = unmounted.find(u => u.name === contractName);
        if (unmountedEntry) {
            results.push({
                contractName, fscaId, activePods, passivePods,
                state: 'unmounted',
                existingAddress: unmountedEntry.address,
                actions: ['link', 'mount'],
            });
            continue;
        }

        // Not deployed yet
        results.push({
            contractName, fscaId, activePods, passivePods,
            state: 'undeployed',
            existingAddress: null,
            actions: ['deploy', 'link', 'mount'],
        });
    }

    return { plan: results, warnings };
};
