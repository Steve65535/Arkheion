import { Interface } from "ethers";

/**
 * Encode a contract function call into calldata
 */
export function encodeCall(
  abi: any,
  functionName: string,
  args: any[] = []
): string {
  const iface = new Interface(abi);

  if (!iface.getFunction(functionName)) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  return iface.encodeFunctionData(functionName, args);
}

/**
 * Decode return data from a contract call
 */
export function decodeResult(
  abi: any,
  functionName: string,
  data: string
): any {
  const iface = new Interface(abi);

  if (!iface.getFunction(functionName)) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  const decoded = iface.decodeFunctionResult(functionName, data);
  return decoded.length === 1 ? decoded[0] : decoded;
}
