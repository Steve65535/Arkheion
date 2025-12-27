const { JsonRpcProvider } = require("ethers");

/**
 * 获取 Provider
 * @param {string} rpcUrl - RPC URL
 * @returns {JsonRpcProvider} Provider 实例
 */
function getProvider(rpcUrl) {
  if (!rpcUrl) {
    throw new Error("RPC URL is required");
  }
  return new JsonRpcProvider(rpcUrl);
}

module.exports = { getProvider };

