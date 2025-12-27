const { Interface } = require("ethers");

/**
 * 编码合约函数调用为 calldata
 * @param {any} abi - 合约 ABI
 * @param {string} functionName - 函数名
 * @param {any[]} args - 函数参数
 * @returns {string} 编码后的 calldata
 */
function encodeCall(abi, functionName, args = []) {
  const iface = new Interface(abi);

  if (!iface.getFunction(functionName)) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  return iface.encodeFunctionData(functionName, args);
}

/**
 * 解码合约函数返回数据
 * @param {any} abi - 合约 ABI
 * @param {string} functionName - 函数名
 * @param {string} data - 返回数据
 * @returns {any} 解码后的数据
 */
function decodeResult(abi, functionName, data) {
  const iface = new Interface(abi);

  if (!iface.getFunction(functionName)) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  const decoded = iface.decodeFunctionResult(functionName, data);
  return decoded.length === 1 ? decoded[0] : decoded;
}

module.exports = { encodeCall, decodeResult };

