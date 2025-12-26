import { JsonRpcProvider } from "ethers";

export function getProvider(rpcUrl: string): JsonRpcProvider {
  if (!rpcUrl) {
    throw new Error("RPC URL is required");
  }
  return new JsonRpcProvider(rpcUrl);
}
