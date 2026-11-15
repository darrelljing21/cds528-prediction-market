import { ethers } from "hardhat";

async function main(): Promise<void> {
  const rawAddress = "0x5E01b3fb7acc05E2025C4B244Ca0b0a571E6d8bb";
  const CONTRACT_ADDRESS = ethers.getAddress(rawAddress.toLowerCase());

  console.log(`正在连接到 Sepolia 测试网的 PredictionMarket 合约执行超时取消 (cancelExpired)...`);

  const [signer] = await ethers.getSigners();
  console.log(`当前操作的钱包地址: ${signer.address}`);

  const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
  const market = PredictionMarketFactory.attach(CONTRACT_ADDRESS).connect(signer);

  // 1. 检查当前状态
  const result = await market.result();
  if (result.toString() !== "0") {
    console.log(`❌ 市场已经处于结算或取消状态 (Result: ${result.toString()})，无需重复取消。`);
    return;
  }

  // 2. 发送 cancelExpired 交易
  console.log(`正在发送超时取消交易...`);
  const tx = await market.cancelExpired();
  console.log(`交易已广播，Hash: ${tx.hash}`);
  console.log(`等待交易确认中...`);

  const receipt = await tx.wait();
  console.log(`✅ 超时取消成功！市场状态已设为 3 (已取消)。区块高度: ${receipt?.blockNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("执行 cancelExpired 脚本时发生错误:", error);
    process.exit(1);
  });