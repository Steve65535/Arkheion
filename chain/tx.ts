import { Contract, Wallet } from "ethers";

export async function callContract(
  signer: Wallet,
  contractAddress: string,
  abi: any,
  functionName: string,
  args: any[] = [],
  value: bigint = 0n
): Promise<string> {
  const contract = new Contract(contractAddress, abi, signer);

  if (!contract[functionName]) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }

  const tx = await contract[functionName](...args, { value });
  const receipt = await tx.wait();

  return receipt?.hash;
}
