# EcoShield ActionRegistry

`src/ActionRegistry.sol` stores, for each APPROVED report: its public ID, a SHA-256 of the photo (or zero) and a SHA-256 of the canonical record. No files, no personal data.
A registry entry proves the evidence was unchanged after approval. It does not prove the claim is true.

## Easiest deploy (no local tools): Remix
1. Open https://remix.ethereum.org, create `ActionRegistry.sol`, paste the file from `src/`.
2. Compile with Solidity 0.8.26 (any 0.8.24+ works).
3. In MetaMask choose the **Sepolia** network, using a wallet made only for this project.
4. Remix > Deploy & Run > Environment "Injected Provider - MetaMask" > Deploy > confirm in MetaMask.
5. Copy the deployed contract address into `REGISTRY_CONTRACT_ADDRESS`. The deploying wallet is the registrar,
   so `REGISTRAR_PRIVATE_KEY` must be that same wallet's key.

## Or with Hardhat
```
cd contracts && npm install
npx hardhat test                      # downloads the compiler; add USE_SOLCJS=1 to compile offline
SEPOLIA_RPC_URL=... REGISTRAR_PRIVATE_KEY=0x... npm run deploy:sepolia
```
