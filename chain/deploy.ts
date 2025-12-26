import { ContractFactory, Wallet } from "ethers";

export async function deployContract(
  signer: Wallet,
  abi: any,
  bytecode: string,
  constructorArgs: any[] = []
): Promise<string> {
  const factory = new ContractFactory(abi, bytecode, signer);

  const contract = await factory.deploy(...constructorArgs);
  await contract.waitForDeployment();

  return await contract.getAddress();
}
