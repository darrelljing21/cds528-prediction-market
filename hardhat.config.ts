import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24", // 保持与你当前项目编译版本一致（如果你需要 0.8.24 可以改回 0.8.24）
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      // 已去除私钥末尾的空格，确保正好是 64 位十六进制字符
      accounts: ["your metamask private key"]
    }
  }
};

export default config;