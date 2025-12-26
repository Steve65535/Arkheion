# FSCA CLI

链上智能合约集群开发工具的命令行界面。

## 框架结构

本 CLI 工具采用模块化设计，包含以下核心组件：

### 1. 命令行解析模块 (`cli/parser.js`)
- 解析命令行参数
- 支持树形结构的命令（子命令）
- 支持 `--flag` 和 `--key=value` 格式的参数
- 提供帮助信息生成功能

### 2. 命令执行模块 (`cli/executor.js`)
- 加载和执行命令处理器
- 支持 JavaScript 和 TypeScript 模块
- 处理器缓存机制

### 3. 命令配置 (`cli/commands.json`)
- JSON 格式的命令定义
- 树形结构，支持嵌套子命令
- 每个命令可配置：
  - `description`: 命令描述
  - `handler`: 处理器路径
  - `params`: 参数定义
  - `usage`: 使用示例
  - `commands`: 子命令

### 4. 主入口 (`cli/index.js`)
- 处理命令行参数
- 协调解析器和执行器
- 错误处理和帮助信息

## 使用方法

### 安装

```bash
npm link
# 或者
npm install -g .
```

### 基本命令

```bash
# 查看帮助
fsca --help

# 查看版本
fsca --version

# 初始化项目
fsca init

# 使用子命令
fsca contract deploy --name MyContract --network mainnet
```

## 添加新命令

### 1. 在 `cli/commands.json` 中添加命令定义

```json
{
  "commands": {
    "mycommand": {
      "description": "我的命令描述",
      "handler": "./libs/mycommand",
      "params": {
        "param1": {
          "type": "string",
          "required": true,
          "description": "参数1描述"
        }
      },
      "usage": "fsca mycommand --param1 value"
    }
  }
}
```

### 2. 创建处理器文件

在 `libs/` 目录下创建对应的处理器文件（如 `libs/mycommand.js`）：

```javascript
/**
 * 命令处理器
 * @param {Object} context - 执行上下文
 * @param {Object} context.args - 解析后的参数
 * @param {string[]} context.subcommands - 子命令路径
 * @param {Object} context.config - 命令配置
 * @param {string} context.rootDir - 项目根目录
 */
module.exports = async function mycommand({ args, subcommands, config, rootDir }) {
  console.log('执行我的命令');
  console.log('参数:', args);
  // 你的命令逻辑
};
```

### 3. 添加子命令

```json
{
  "commands": {
    "parent": {
      "description": "父命令",
      "commands": {
        "child": {
          "description": "子命令",
          "handler": "./libs/parent/child"
        }
      }
    }
  }
}
```

使用方式：`fsca parent child`

## 参数类型

支持以下参数类型：
- `string`: 字符串（默认）
- `number`: 数字
- `boolean`: 布尔值
- `array`: 数组（使用逗号分隔）

## 参数格式

```bash
# 标志参数
fsca command --flag

# 键值对参数
fsca command --key value
fsca command --key=value

# 数组参数
fsca command --items item1,item2,item3
```

## 项目结构

```
fsca-cli/
├── cli/
│   ├── index.js          # 主入口
│   ├── parser.js         # 命令解析器
│   ├── executor.js       # 命令执行器
│   ├── commands.json     # 命令配置
│   └── utils.js          # 工具函数
├── libs/                 # 命令处理器目录
│   ├── init.js
│   ├── version.js
│   └── ...
├── chain/                # 链相关模块
├── wallet/               # 钱包相关模块
└── package.json
```

## 开发

框架已经搭建完成，你可以：

1. 在 `cli/commands.json` 中添加命令定义
2. 在 `libs/` 目录下创建对应的处理器
3. 使用 `npm link` 进行本地测试

## 示例命令

框架中已经包含了一些示例命令：

- `fsca init` - 初始化项目
- `fsca version` - 显示版本
- `fsca contract deploy` - 部署合约（需要实现处理器）
- `fsca chain info` - 显示链信息（需要实现处理器）
- `fsca wallet create` - 创建钱包（需要实现处理器）

你可以参考这些示例来添加自己的命令。
