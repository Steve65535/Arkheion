/**
 * 初始化 FSCA 项目
 */

const fs = require('fs');
const path = require('path');

module.exports = async function init({ rootDir }) {
  console.log('Initializing FSCA project...');

  const fscaDir = path.join(rootDir, '.fsca');
  const contractsDir = path.join(rootDir, 'contracts');
  const configFile = path.join(fscaDir, 'config.json');

  // 创建 .fsca 目录
  if (!fs.existsSync(fscaDir)) {
    fs.mkdirSync(fscaDir, { recursive: true });
    console.log('Created .fsca directory');
  }

  // 创建 contracts 目录
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
    console.log('Created contracts directory');
  }

  // 创建默认配置文件
  if (!fs.existsSync(configFile)) {
    const defaultConfig = {
      network: 'mainnet',
      rpcUrl: '',
      chainId: 1
    };
    fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
    console.log('Created config.json');
  }

  console.log('FSCA project initialized successfully!');
};
