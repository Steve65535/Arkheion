const { Contract } = require("ethers");

/**
 * 调用合约函数
 * @param {Object} signer - Wallet signer
 * @param {string} contractAddress - 合约地址
 * @param {any} abi - 合约 ABI
 * @param {string} functionName - 函数名
 * @param {any[]} args - 函数参数
 * @param {bigint} value - 发送的 ETH 数量
 * @returns {Promise<string>} 交易哈希
 */
async function callContract(signer, contractAddress, abi, functionName, args = [], value = 0n) {
  const contract = new Contract(contractAddress, abi, signer);

  if (!contract[functionName]) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  const tx = await contract[functionName](...args, { value });
  const receipt = await tx.wait();

  return receipt?.hash;
}

module.exports = { callContract };

