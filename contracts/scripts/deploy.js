// Usage: npx hardhat run scripts/deploy.js --network sepolia
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from (this wallet becomes the registrar):", deployer.address);
  const c = await hre.ethers.deployContract("ActionRegistry");
  await c.waitForDeployment();
  console.log("ActionRegistry deployed at:", await c.getAddress());
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
