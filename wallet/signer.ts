import { Wallet, JsonRpcProvider } from "ethers";

export function getSigner(
  privateKey: string,
  provider: JsonRpcProvider
): Wallet {
  if (!privateKey) {
    throw new Error("Private key is required");
  }
  return new Wallet(privateKey, provider);
}
