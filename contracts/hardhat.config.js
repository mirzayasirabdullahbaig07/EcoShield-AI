require("@nomicfoundation/hardhat-ethers");
const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");

// Offline fallback: set USE_SOLCJS=1 to compile with the bundled solc-js instead of downloading the compiler.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
  if (process.env.USE_SOLCJS !== "1") return runSuper();
  const version = require("solc/package.json").version;
  return { compilerPath: require.resolve("solc/soljson.js"), isSolcJs: true, version, longVersion: version };
});

module.exports = {
  solidity: { version: "0.8.26", settings: { optimizer: { enabled: true, runs: 200 } } },
  paths: { sources: "./src", tests: "./test" },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.REGISTRAR_PRIVATE_KEY ? [process.env.REGISTRAR_PRIVATE_KEY] : [],
    },
  },
};
