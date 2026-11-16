import { ethers } from "hardhat";

async function main(): Promise<void> {
  const rawAddress = "0xAAC26183DB21E87ADE52B59792B1AC7EA31cE40D";
  const CONTRACT_ADDRESS = ethers.getAddress(rawAddress.toLowerCase());

  console.log(`正在连接到 Sepolia 测试网的 PredictionMarket 合约进行奖励/退款领取...`);

  // 获取当前操作的用户签名者
  const [signer] = await ethers.getSigners();
  console.log(`当前领奖/退款的钱包地址: ${signer.address}`);

  const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
  const market = PredictionMarketFactory.attach(CONTRACT_ADDRESS).connect(signer);

  // 1. 先检查当前市场状态
  const result = await market.result();
  console.log(`当前市场结算状态 (Result): ${result.toString()} (1=YES胜出, 2=NO胜出, 3=已取消)`);

  if (result.toString() === "0") {
    console.log("❌ 市场尚未结算，当前无法领奖！");
    return;
  }

  // 2. 发送 claim 交易
  console.log(`正在发送领取交易 (claim)...`);
  const tx = await market.claim();
  console.log(`交易已广播，Hash: ${tx.hash}`);
  console.log(`等待交易确认中...`);

  const receipt = await tx.wait();
  console.log(`✅ 成功领取奖励/退款！交易已确认，区块高度: ${receipt?.blockNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("执行领取脚本时发生错误:", error);
    process.exit(1);
  });