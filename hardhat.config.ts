import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const privateKey = process.env.SEPOLIA_PRIVATE_KEY?.trim();
if (privateKey && !/^(0x)?[0-9a-fA-F]{64}$/.test(privateKey)) {
  throw new Error("SEPOLIA_PRIVATE_KEY must be a valid private key");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris"
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: privateKey ? [privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`] : []
    }
  }
};
export default config;
