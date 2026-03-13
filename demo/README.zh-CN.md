# FSCA 演示：从零部署链上金融系统

本指南将带你从一个**空文件夹**开始，使用 FSCA 框架部署一套模块化的**核心银行系统（CBS）**到本地区块链上。

演示模拟了一个真实的金融后端，包含三个相互独立的模块：

| Pod | ID | 角色 | 是否升级 |
|---|---|---|---|
| **AccountStorage** | 1 | 纯数据存储（余额、用户数据） | 永不升级 — 数据层恒定 |
| **TradeEngine** | 2 | 交易逻辑（存款、取款、交易） | 是 — V1 热替换为 V2 |
| **RiskGuard** | 3 | 风控规则（限额、熔断） | 独立运行 — 升级过程中不受影响 |

```
TradeEngine (V1/V2)
   |          |
   v          v
AccountStorage    RiskGuard
（数据层）         （风控规则）
```

---

## 环境要求

- **Node.js** >= 16
- **npm** 已安装
- **fsca-cli** 已全局安装或可通过仓库路径访问

验证：

```bash
node -v    # v16+
npm -v     # 8+
```

---

## 第一步：创建空目录

```bash
mkdir fsca-cbs-demo
cd fsca-cbs-demo
```

---

## 第二步：复制 Demo 文件

将 FSCA 仓库中的 `demo/` 文件夹内容复制到你的新目录：

```bash
cp -r /path/to/fsca-cli/demo/* .
```

目录结构如下：

```
fsca-cbs-demo/
├── contracts/
│   ├── core/              # FSCA 内核（ClusterManager、EvokerManager 等）
│   │   ├── lib/
│   │   └── structure/
│   ├── interfaces/        # IAccountStorage.sol、IRiskGuard.sol
│   ├── undeployed/        # 业务合约（AccountStorage、TradeEngine、RiskGuard）
│   └── deployed/          # （空 — 挂载后自动填充）
├── scripts/
│   ├── setup-infra.js     # 部署 ClusterManager + EvokerManager
│   ├── demo.js            # 编程式演示（Hardhat 脚本）
│   ├── deploy.js          # 独立部署脚本
│   └── upgrade.js         # 独立升级脚本
├── demo.sh                # 交互式 CLI 演示（推荐）
├── hardhat.config.js
├── package.json
└── project.json           # FSCA 状态文件（CLI 自动管理）
```

---

## 第三步：安装依赖

```bash
npm install
```

安装 Hardhat 及所需的工具插件。

---

## 第四步：运行交互式演示

```bash
bash demo.sh
```

脚本为全交互式 — 按 **Enter** 键逐步推进。它将：

1. 在端口 8545 启动本地 Hardhat 区块链节点
2. 编译所有 Solidity 合约
3. 部署 FSCA 编排基础设施（ClusterManager + EvokerManager）

然后使用真实的 CLI 命令，引导你完成完整的 FSCA 生命周期。

---

## 演示内容详解（5 个阶段）

### 阶段一 — 编译与部署基础设施

```bash
npx hardhat compile
npx hardhat run scripts/setup-infra.js --network localhost
```

部署两个 FSCA 内核合约：
- **ClusterManager** — Pod 中央注册中心
- **EvokerManager** — 服务网格（依赖图管理器）

合约地址自动写入 `project.json`。

### 阶段二 — 部署业务合约

```bash
fsca deploy --contract AccountStorage --description AccountStorage
fsca deploy --contract TradeEngineV1 --description TradeEngineV1
fsca deploy --contract RiskGuardV1 --description RiskGuardV1
```

每个合约被独立编译和部署，地址存储在 `project.json` 的 `unmountedcontracts` 中。

此时合约已存在于链上，但**尚未加入集群** — 没有注册 ID，没有依赖关系。

### 阶段三 — 将合约挂载到集群

```bash
fsca cluster choose <AccountStorageAddr>
fsca cluster mount 1 AccountStorage

fsca cluster choose <TradeEngineV1Addr>
fsca cluster mount 2 TradeEngineV1

fsca cluster choose <RiskGuardAddr>
fsca cluster mount 3 RiskGuardV1
```

挂载操作将每个合约注册到 ClusterManager，分配一个永久的**逻辑 ID**，并在服务网格中激活。无论升级多少次版本，ID 始终不变 — `TradeEngine` 永远是 ID 2。

验证：

```bash
fsca cluster list mounted
```

### 阶段四 — 建立 Pod 依赖（链接）

```bash
fsca cluster choose <TradeEngineV1Addr>
fsca cluster link positive <AccountStorageAddr> 1
fsca cluster link positive <RiskGuardAddr> 3
```

在链上服务网格中创建依赖边：
- TradeEngine 可以**调用** AccountStorage（在 AccountStorage 侧建立被动链路）
- TradeEngine 可以**调用** RiskGuard（在 RiskGuard 侧建立被动链路）

可视化拓扑：

```bash
fsca cluster graph
```

输出（Mermaid 格式）：

```
TradeEngineV1 --> AccountStorage
TradeEngineV1 --> RiskGuardV1
```

### 阶段五 — 热升级：TradeEngineV1 → TradeEngineV2

```bash
fsca cluster upgrade --id 2 --contract TradeEngineV2
```

这条命令原子性地完成整个升级流程：

1. 记录 TradeEngineV1 的完整链路拓扑（主动和被动 Pod）
2. 卸载 TradeEngineV1（移除所有图边）
3. 部署 TradeEngineV2
4. 在相同 ID（2）上挂载 TradeEngineV2
5. 恢复所有依赖链路到新合约

验证：

```bash
fsca cluster list mounted    # TradeEngineV2 现在位于 ID 2
fsca cluster graph           # 相同拓扑，新合约地址
```

---

## 演示证明了什么

演示完成后，以下架构属性得到验证：

| 属性 | 验证证据 |
|---|---|
| **存储隔离** | AccountStorage 的地址和数据在 TradeEngine 升级过程中完全不受影响 |
| **零停机升级** | TradeEngineV2 自动继承所有依赖链路 |
| **爆炸半径控制** | RiskGuardV1 从未被修改、重新部署，甚至对升级毫无感知 |
| **动态地址解析** | AccountStorage 的 `passiveModuleVerification` 现在指向 TradeEngineV2 的地址 — 无需手动重配置 |
| **拓扑保持** | `fsca cluster graph` 在升级前后显示完全相同的依赖结构 |

---

## 架构对比：为什么这很重要

在传统的 Diamond/Proxy 架构中，升级交易引擎需要：

1. 手动追踪所有 Facet 的存储槽布局
2. 承受 TradeEngine 与 AccountStorage 数据之间静默存储碰撞的风险
3. 没有内置机制来验证 RiskGuard 是否受到影响
4. 没有治理层 — 单个 EOA 密钥控制一切

在 FSCA 中：

- 每个 Pod 拥有**物理独立的存储** — 碰撞在架构上不可能发生
- 依赖关系由**链上服务网格**管理 — 自动验证
- **拓扑图**提供可审计的系统状态证明
- **多签治理**（ProxyWallet）可用于生产环境部署

---

## 下一步

- 修改 `TradeEngineV2.sol`，实验你自己的升级逻辑
- 添加第四个 Pod（如 `ComplianceModule` 合规模块），将其链接到拓扑中
- 在 `hardhat.config.js` 中配置 RPC 端点，部署到 **Sei 测试网**
- 使用 `fsca cluster init --threshold 2` 启用多签治理

---

## 文件参考

| 文件 | 用途 |
|---|---|
| `demo.sh` | 交互式演示脚本（推荐入口） |
| `scripts/setup-infra.js` | 部署 ClusterManager + EvokerManager |
| `contracts/undeployed/AccountStorage.sol` | 纯存储 Pod — 双重 mapping 设计 |
| `contracts/undeployed/TradeEngineV1.sol` | 业务逻辑 v1 |
| `contracts/undeployed/TradeEngineV2.sol` | 业务逻辑 v2（增加 1% 手续费） |
| `contracts/undeployed/RiskGuardV1.sol` | 风控规则 |
| `contracts/interfaces/IAccountStorage.sol` | 存储接口 |
| `contracts/interfaces/IRiskGuard.sol` | 风控接口 |
| `project.json` | FSCA 集群状态（CLI 自动管理） |
| `hardhat.config.js` | Hardhat 配置（localhost + Sei） |

---

Apache 2.0 许可证。FSCA 项目，2026 年。
