# FSCA CLI 框架使用示例

本文档展示如何使用 FSCA CLI 框架添加命令的完整示例。

## 示例：添加一个完整的命令树

### 1. 在 `cli/commands.json` 中添加命令定义

假设我们要添加一个 `cluster` 命令，包含子命令 `create` 和 `deploy`：

```json
{
  "commands": {
    "cluster": {
      "description": "智能合约集群管理",
      "commands": {
        "create": {
          "description": "创建新的合约集群",
          "handler": "./libs/cluster/create",
          "params": {
            "name": {
              "type": "string",
              "required": true,
              "description": "集群名称"
            },
            "network": {
              "type": "string",
              "required": false,
              "description": "目标网络"
            },
            "contracts": {
              "type": "array",
              "required": false,
              "description": "合约列表（逗号分隔）"
            }
          },
          "usage": "fsca cluster create --name my-cluster --network mainnet --contracts Contract1,Contract2"
        },
        "deploy": {
          "description": "部署合约集群",
          "handler": "./libs/cluster/deploy",
          "params": {
            "cluster": {
              "type": "string",
              "required": true,
              "description": "集群配置文件路径"
            },
            "dry-run": {
              "type": "boolean",
              "required": false,
              "description": "仅模拟，不实际部署"
            }
          },
          "usage": "fsca cluster deploy --cluster ./clusters/my-cluster.json --dry-run"
        }
      }
    }
  }
}
```

### 2. 创建处理器文件

#### `libs/cluster/create.js`

```javascript
/**
 * 创建合约集群
 * @param {Object} context - 执行上下文
 * @param {Object} context.args - 解析后的参数
 *   - args.name: 集群名称
 *   - args.network: 网络名称（可选）
 *   - args.contracts: 合约列表数组（可选）
 * @param {string[]} context.subcommands - 子命令路径 ['cluster', 'create']
 * @param {Object} context.config - 命令配置对象
 * @param {string} context.rootDir - 项目根目录
 */
module.exports = async function create({ args, subcommands, config, rootDir }) {
  const { name, network = 'mainnet', contracts = [] } = args;
  
  console.log(`创建合约集群: ${name}`);
  console.log(`目标网络: ${network}`);
  
  if (contracts.length > 0) {
    console.log(`合约列表: ${contracts.join(', ')}`);
  }
  
  // 你的业务逻辑
  // 例如：创建配置文件、初始化目录结构等
  
  console.log('集群创建成功！');
};
```

#### `libs/cluster/deploy.js`

```javascript
const fs = require('fs');
const path = require('path');

/**
 * 部署合约集群
 */
module.exports = async function deploy({ args, rootDir }) {
  const { cluster, 'dry-run': dryRun } = args;
  
  if (!cluster) {
    throw new Error('必须指定集群配置文件路径');
  }
  
  const clusterPath = path.resolve(rootDir, cluster);
  
  if (!fs.existsSync(clusterPath)) {
    throw new Error(`集群配置文件不存在: ${clusterPath}`);
  }
  
  const clusterConfig = JSON.parse(fs.readFileSync(clusterPath, 'utf-8'));
  
  console.log(`部署集群: ${clusterConfig.name}`);
  
  if (dryRun) {
    console.log('【模拟模式】不会实际部署');
  }
  
  // 你的部署逻辑
  // 例如：读取配置、部署合约、保存部署结果等
  
  console.log('集群部署完成！');
};
```

### 3. 使用命令

```bash
# 查看帮助
fsca cluster --help
fsca cluster create --help

# 创建集群
fsca cluster create --name my-cluster --network testnet --contracts Token,Factory

# 部署集群（模拟）
fsca cluster deploy --cluster ./clusters/my-cluster.json --dry-run

# 实际部署
fsca cluster deploy --cluster ./clusters/my-cluster.json
```

## 参数说明

### 参数类型

- `string`: 字符串类型（默认）
  ```bash
  fsca command --name "My Contract"
  ```

- `number`: 数字类型
  ```json
  "amount": {
    "type": "number",
    "required": true,
    "description": "数量"
  }
  ```
  ```bash
  fsca command --amount 100
  ```

- `boolean`: 布尔类型
  ```json
  "force": {
    "type": "boolean",
    "required": false,
    "description": "强制执行"
  }
  ```
  ```bash
  fsca command --force
  fsca command --force=true
  ```

- `array`: 数组类型（使用逗号分隔）
  ```json
  "items": {
    "type": "array",
    "required": false,
    "description": "项目列表"
  }
  ```
  ```bash
  fsca command --items item1,item2,item3
  ```

### 位置参数

未使用 `--` 前缀的参数会被作为位置参数处理：

```bash
fsca command arg1 arg2
```

在处理器中访问：
```javascript
module.exports = async function handler({ args }) {
  const arg1 = args.arg0;  // 第一个位置参数
  const arg2 = args.arg1;  // 第二个位置参数
  // ...
};
```

## 完整的命令树示例

```json
{
  "commands": {
    "parent": {
      "description": "父命令",
      "handler": "./libs/parent",  // 父命令也可以有处理器
      "commands": {
        "child1": {
          "description": "子命令1",
          "handler": "./libs/parent/child1",
          "commands": {
            "grandchild": {
              "description": "孙子命令",
              "handler": "./libs/parent/child1/grandchild"
            }
          }
        },
        "child2": {
          "description": "子命令2",
          "handler": "./libs/parent/child2"
        }
      }
    }
  }
}
```

使用：
```bash
fsca parent                    # 执行父命令处理器
fsca parent child1            # 执行子命令1处理器
fsca parent child1 grandchild # 执行孙子命令处理器
fsca parent child2            # 执行子命令2处理器
```

## 处理器函数签名

所有处理器函数都应该遵循以下签名：

```javascript
/**
 * 命令处理器
 * @param {Object} context - 执行上下文
 * @param {Object} context.args - 解析后的参数对象
 *   - 所有通过 --key value 传入的参数都在这里
 *   - 位置参数会以 arg0, arg1, ... 的形式存在
 * @param {string[]} context.subcommands - 完整的命令路径数组
 *   例如：['cluster', 'create'] 或 ['contract', 'deploy']
 * @param {Object} context.config - 当前命令的配置对象（来自 commands.json）
 * @param {string} context.rootDir - 项目根目录（当前工作目录）
 * @returns {Promise<any>} 执行结果（可选）
 */
module.exports = async function handler({ args, subcommands, config, rootDir }) {
  // 你的命令逻辑
};
```

或者使用具名导出：

```javascript
async function handler({ args, subcommands, config, rootDir }) {
  // 你的命令逻辑
}

module.exports = { default: handler };
```

## 错误处理

处理器中可以抛出错误，框架会自动捕获并显示：

```javascript
module.exports = async function handler({ args }) {
  if (!args.requiredParam) {
    throw new Error('必须提供 requiredParam 参数');
  }
  
  // 正常逻辑
};
```

## 工具函数

可以使用 `cli/utils.js` 中的工具函数：

```javascript
const { resolveFscaRoot, loadConfig } = require('../cli/utils');

module.exports = async function handler({ rootDir }) {
  // 查找 FSCA 项目根目录
  const projectRoot = resolveFscaRoot(rootDir);
  
  if (!projectRoot) {
    throw new Error('当前目录不是 FSCA 项目');
  }
  
  // 加载配置文件
  const config = loadConfig(projectRoot);
  
  // 使用配置
  console.log('网络:', config.network);
};
```

## 总结

1. 在 `cli/commands.json` 中定义命令树和参数
2. 在 `libs/` 目录下创建对应的处理器文件
3. 处理器函数接收 `{ args, subcommands, config, rootDir }` 参数
4. 使用 `--help` 查看命令帮助信息
5. 框架会自动处理参数解析、命令匹配和错误处理

现在你可以开始编写自己的命令了！
