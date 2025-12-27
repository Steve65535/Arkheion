const { ContractFactory } = require("ethers");

/**
 * 部署合约
 * @param {Object} signer - Wallet signer
 * @param {any} abi - 合约 ABI
 * @param {string} bytecode - 合约字节码
 * @param {any[]} constructorArgs - 构造函数参数
 * @returns {Promise<string>} 合约地址
 */
async function deployContract(signer, abi, bytecode, constructorArgs = []) {
  const factory = new ContractFactory(abi, bytecode, signer);

  const contract = await factory.deploy(...constructorArgs);
  await contract.waitForDeployment();

  return await contract.getAddress();
}

module.exports = { deployContract };

