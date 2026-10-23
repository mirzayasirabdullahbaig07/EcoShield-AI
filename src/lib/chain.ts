// Server-only. The registrar private key never leaves the server and is never logged.
import { Contract, JsonRpcProvider, Wallet, isAddress } from "ethers";

const ABI = [
  "function register(string recordId, bytes32 evidenceHash, bytes32 recordHash)",
  "function getRecord(string recordId) view returns (bytes32 evidenceHash, bytes32 recordHash, uint64 registeredAt, bool exists)",
];
const NETWORKS: Record<number, { name: string; explorer: string | null }> = {
  11155111: { name: "Sepolia testnet", explorer: "https://sepolia.etherscan.io" },
  31337: { name: "Local test chain (not a public network)", explorer: null },
};

export class ChainError extends Error {}

export const expectedChainId = () => Number(process.env.CHAIN_ID || 11155111);
export const networkInfo = () => NETWORKS[expectedChainId()] ?? { name: `Chain ${expectedChainId()}`, explorer: null };
export const txUrl = (hash: string) => { const e = networkInfo().explorer; return e ? `${e}/tx/${hash}` : null; };
export const chainReadConfigured = () =>
  Boolean(process.env.SEPOLIA_RPC_URL && process.env.REGISTRY_CONTRACT_ADDRESS && isAddress(process.env.REGISTRY_CONTRACT_ADDRESS));
export const chainWriteConfigured = () => chainReadConfigured() && Boolean(process.env.REGISTRAR_PRIVATE_KEY);

async function connect() {
  const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const net = await provider.getNetwork();
  if (Number(net.chainId) !== expectedChainId()) {
    throw new ChainError(`The RPC URL points to chain ${net.chainId}, but chain ${expectedChainId()} is expected.`);
  }
  return provider;
}

function explain(e: unknown): ChainError {
  if (e instanceof ChainError) return e;
  const msg = String((e as { shortMessage?: string; message?: string })?.shortMessage ?? (e as Error)?.message ?? e);
  if (/Already registered/i.test(msg)) return new ChainError("This record is already registered on the blockchain.");
  if (/Only registrar/i.test(msg)) return new ChainError("The configured wallet is not the registrar that deployed this contract.");
  if (/insufficient funds/i.test(msg)) return new ChainError("The registrar wallet has no test ETH left. Top it up from a faucet.");
  console.error("Chain error:", msg.replace(/0x[0-9a-fA-F]{64}/g, "0x…").slice(0, 200));
  return new ChainError("The blockchain network could not be reached or rejected the transaction.");
}

/** Sends the transaction and returns its hash without waiting for confirmation. */
export async function sendRegister(recordId: string, evidenceHash: string, recordHash: string): Promise<string> {
  try {
    const provider = await connect();
    const wallet = new Wallet(process.env.REGISTRAR_PRIVATE_KEY!, provider);
    const tx = await new Contract(process.env.REGISTRY_CONTRACT_ADDRESS!, ABI, wallet).register(recordId, evidenceHash, recordHash);
    return tx.hash as string;
  } catch (e) { throw explain(e); }
}

/** Waits up to `timeoutMs` for one confirmation. confirmed=false means "not mined yet", never a failure. */
export async function confirmTx(txHash: string, timeoutMs = 45_000): Promise<{ confirmed: boolean; blockNumber: number | null }> {
  try {
    const provider = await connect();
    const receipt = (await provider.getTransactionReceipt(txHash)) ?? (await provider.waitForTransaction(txHash, 1, timeoutMs).catch(() => null));
    if (!receipt) return { confirmed: false, blockNumber: null };
    if (receipt.status !== 1) throw new ChainError("The blockchain transaction failed.");
    return { confirmed: true, blockNumber: receipt.blockNumber };
  } catch (e) { throw explain(e); }
}

export type OnChain =
  | { state: "unreachable" }
  | { state: "not_registered" }
  | { state: "registered"; evidenceHash: string; recordHash: string; registeredAt: number };

export async function readRecord(recordId: string): Promise<OnChain> {
  try {
    const provider = await connect();
    const [ev, rec, at, exists] = await new Contract(process.env.REGISTRY_CONTRACT_ADDRESS!, ABI, provider).getRecord(recordId);
    return exists ? { state: "registered", evidenceHash: ev, recordHash: rec, registeredAt: Number(at) } : { state: "not_registered" };
  } catch { return { state: "unreachable" }; }
}
