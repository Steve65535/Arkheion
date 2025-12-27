const { Wallet } = require("ethers");

/**
 * 获取 Signer
 * @param {string} privateKey - 私钥
 * @param {Object} provider - Provider 实例
 * @returns {Wallet} Wallet 实例
 */
function getSigner(privateKey, provider) {
  if (!privateKey) {
    throw new Error("Private key is required");
  }
  return new Wallet(privateKey, provider);
}

module.exports = { getSigner };


