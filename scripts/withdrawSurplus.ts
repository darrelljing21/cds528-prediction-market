import { ethers } from "hardhat";

async function main(): Promise<void> {
  const rawAddress = "0xAAC26183DB21E87ADE52B59792B1AC7EA31cE40D";
  const CONTRACT_ADDRESS = ethers.getAddress(rawAddress.toLowerCase());

  console.log(`正在连接到 Sepolia 测试网的 PredictionMarket 合约提取盈余 (withdrawSurplus)...`);

  const [signer] = await ethers.getSigners();
  console.log(`当前操作的钱包地址 (Owner): ${signer.address}`);

  const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
  const market = PredictionMarketFactory.attach(CONTRACT_ADDRESS).connect(signer);

  // 1. 检查市场是否已结算
  const result = await market.result();
  if (result.toString() === "0") {
    console.log("❌ 市场尚未结算，无法提取盈余！");
    return;
  }

  // 2. 发送 withdrawSurplus 交易
  console.log(`正在发送盈余提现交易...`);
  const tx = await market.withdrawSurplus();
  console.log(`交易已广播，Hash: ${tx.hash}`);
  console.log(`等待交易确认中...`);

  const receipt = await tx.wait();
  console.log(`✅ 盈余提现成功！区块高度: ${receipt?.blockNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("执行 withdrawSurplus 脚本时发生错误:", error);
    process.exit(1);
  });
