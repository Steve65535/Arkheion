# FSCA Demo: Deploy an On-Chain Financial System from Scratch

This guide walks you through deploying a modular **Core Banking System (CBS)** on a local blockchain using the FSCA framework — starting from an empty folder.

The demo simulates a real-world financial backend with three independent modules:

| Pod | ID | Role | Upgrade? |
|---|---|---|---|
| **AccountStorage** | 1 | Pure data storage (balances, user data) | Never — data layer is permanent |
| **TradeEngine** | 2 | Transaction logic (deposit, withdraw, trade) | Yes — hot-swapped V1 → V2 |
| **RiskGuard** | 3 | Risk control rules (limits, circuit breakers) | Independent — untouched during upgrade |

```
TradeEngine (V1/V2)
   |          |
   v          v
AccountStorage    RiskGuard
(data layer)      (risk rules)
```

---

## Prerequisites

- **Node.js** >= 16
- **npm** installed
- **fsca-cli** installed globally or accessible via the repository

Verify:

```bash
node -v    # v16+
npm -v     # 8+
```

---

## Step 1: Create an Empty Directory

```bash
mkdir fsca-cbs-demo
cd fsca-cbs-demo
```

---

## Step 2: Copy the Demo Files

Copy the entire `demo/` folder from the FSCA repository into your new directory:

```bash
cp -r /path/to/fsca-cli/demo/* .
```

Your directory should now contain:

```
fsca-cbs-demo/
├── contracts/
│   ├── core/              # FSCA kernel (ClusterManager, EvokerManager, etc.)
│   │   ├── lib/
│   │   └── structure/
│   ├── interfaces/        # IAccountStorage.sol, IRiskGuard.sol
│   ├── undeployed/        # Business contracts (AccountStorage, TradeEngine, RiskGuard)
│   └── deployed/          # (empty — populated after mount)
├── scripts/
│   ├── setup-infra.js     # Deploys ClusterManager + EvokerManager
│   ├── demo.js            # Programmatic demo (Hardhat script)
│   ├── deploy.js          # Standalone deploy script
│   └── upgrade.js         # Standalone upgrade script
├── demo.sh                # Interactive CLI demo (recommended)
├── hardhat.config.js
├── package.json
└── project.json           # FSCA state file (auto-managed)
```

---

## Step 3: Install Dependencies

```bash
npm install
```

This installs Hardhat and the required toolbox plugins.

---

## Step 4: Run the Interactive Demo

```bash
bash demo.sh
```

The script is fully interactive — press **Enter** to advance through each phase. It will:

1. Start a local Hardhat blockchain node on port 8545
2. Compile all Solidity contracts
3. Deploy the FSCA orchestration infrastructure (ClusterManager + EvokerManager)

Then walk you through the complete FSCA lifecycle using real CLI commands.

---

## What the Demo Does (5 Phases)

### Phase 1 — Compile and Deploy Infrastructure

```bash
npx hardhat compile
npx hardhat run scripts/setup-infra.js --network localhost
```

Deploys the two FSCA kernel contracts:
- **ClusterManager** — central Pod registry
- **EvokerManager** — Service Mesh (dependency graph manager)

The addresses are written to `project.json`.

### Phase 2 — Deploy Business Contracts

```bash
fsca deploy --contract AccountStorage --description AccountStorage
fsca deploy --contract TradeEngineV1 --description TradeEngineV1
fsca deploy --contract RiskGuardV1 --description RiskGuardV1
```

Each contract is compiled and deployed independently. Their addresses are stored in `project.json` under `unmountedcontracts`.

At this point the contracts exist on-chain but are **not yet part of the cluster** — they have no registered IDs and no dependencies.

### Phase 3 — Mount Contracts into the Cluster

```bash
fsca cluster choose <AccountStorageAddr>
fsca cluster mount 1 AccountStorage

fsca cluster choose <TradeEngineV1Addr>
fsca cluster mount 2 TradeEngineV1

fsca cluster choose <RiskGuardAddr>
fsca cluster mount 3 RiskGuardV1
```

Mounting registers each contract in ClusterManager with a permanent **logical ID** and activates it in the Service Mesh. The ID remains constant across upgrades — `TradeEngine` is always ID 2, regardless of which version is deployed.

Verify:

```bash
fsca cluster list mounted
```

### Phase 4 — Establish Pod Dependencies (Link)

```bash
fsca cluster choose <TradeEngineV1Addr>
fsca cluster link positive <AccountStorageAddr> 1
fsca cluster link positive <RiskGuardAddr> 3
```

This creates the dependency edges in the on-chain Service Mesh:
- TradeEngine can **call** AccountStorage (passive link on AccountStorage side)
- TradeEngine can **call** RiskGuard (passive link on RiskGuard side)

Visualize the topology:

```bash
fsca cluster graph
```

Output (Mermaid format):

```
TradeEngineV1 --> AccountStorage
TradeEngineV1 --> RiskGuardV1
```

### Phase 5 — Hot Upgrade: TradeEngineV1 → TradeEngineV2

```bash
fsca cluster upgrade --id 2 --contract TradeEngineV2
```

This single command performs the entire upgrade atomically:

1. Records TradeEngineV1's complete link topology (active and passive Pods)
2. Unmounts TradeEngineV1 (removes all graph edges)
3. Deploys TradeEngineV2
4. Mounts TradeEngineV2 at the same ID (2)
5. Restores all dependency links to the new contract

Verify:

```bash
fsca cluster list mounted    # TradeEngineV2 now at ID 2
fsca cluster graph           # Same topology, new contract address
```

---

## What This Proves

After the demo completes, the following properties have been demonstrated:

| Property | Evidence |
|---|---|
| **Storage isolation** | AccountStorage's address and data are untouched during the TradeEngine upgrade |
| **Zero-downtime upgrade** | TradeEngineV2 inherits all dependency links automatically |
| **Blast radius containment** | RiskGuardV1 was never modified, redeployed, or even aware of the upgrade |
| **Dynamic address resolution** | AccountStorage's `passiveModuleVerification` now points to TradeEngineV2's address — no manual reconfiguration |
| **Topology preservation** | `fsca cluster graph` shows identical dependency structure before and after upgrade |

---

## Architecture: Why This Matters

In a traditional (Diamond/Proxy) architecture, upgrading the trade engine would require:

1. Manually tracking storage slot layouts across all facets
2. Risk of silent storage collisions between TradeEngine and AccountStorage data
3. No built-in mechanism to verify that RiskGuard was not affected
4. No governance layer — a single EOA key controls everything

In FSCA:

- Each Pod has **physically separate storage** — collisions are impossible
- Dependencies are managed by the **on-chain Service Mesh** — verified automatically
- The **topology graph** provides auditable proof of system state
- **Multi-sig governance** (ProxyWallet) can be enabled for production deployments

---

## Next Steps

- Modify `TradeEngineV2.sol` to experiment with your own upgrade logic
- Add a fourth Pod (e.g., `ComplianceModule`) and link it into the topology
- Deploy to **Sei Testnet** by configuring `hardhat.config.js` with your RPC endpoint
- Enable multi-sig governance with `fsca cluster init --threshold 2`

---

## Files Reference

| File | Purpose |
|---|---|
| `demo.sh` | Interactive demo script (recommended entry point) |
| `scripts/setup-infra.js` | Deploys ClusterManager + EvokerManager |
| `contracts/undeployed/AccountStorage.sol` | Pure storage Pod — dual mapping design |
| `contracts/undeployed/TradeEngineV1.sol` | Business logic v1 |
| `contracts/undeployed/TradeEngineV2.sol` | Business logic v2 (adds 1% fee) |
| `contracts/undeployed/RiskGuardV1.sol` | Risk control rules |
| `contracts/interfaces/IAccountStorage.sol` | Storage interface |
| `contracts/interfaces/IRiskGuard.sol` | Risk guard interface |
| `project.json` | FSCA cluster state (auto-managed by CLI) |
| `hardhat.config.js` | Hardhat configuration (localhost + Sei) |

---

Apache 2.0 License. FSCA Project, 2026.
