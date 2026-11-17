import { ethers } from "hardhat";

async function main(): Promise<void> {
  // 使用 .toLowerCase() 传入地址，让 ethers 自动计算并匹配正确的 EIP-55 校验格式，避免 checksum 报错
  const rawAddress = "0x48DE3794FB4652B296dBeb96092eFC698eD3d086";
  const CONTRACT_ADDRESS = ethers.getAddress(rawAddress.toLowerCase());

  console.log(`正在连接到 Sepolia 测试网的 PredictionMarket 合约...`);
  console.log(`目标合约地址: ${CONTRACT_ADDRESS}`);

  // 获取合约工厂并附加到指定的 Sepolia 合约地址
  const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
  const market = PredictionMarketFactory.attach(CONTRACT_ADDRESS);

  // 1. 读取合约的基本公开状态
  const question = await market.question();
  const result = await market.result();
  const closeTime = await market.closeTime();

  console.log("-----------------------------------------");
  console.log(`📌 预测问题 (Question): ${question}`);
  console.log(`📊 当前市场状态 (Result): ${result.toString()} (0=未结算, 1=YES胜出, 2=NO胜出, 3=已取消)`);
  console.log(`⏰ 交易截止时间戳 (Close Time): ${closeTime.toString()}`);
  console.log("-----------------------------------------");

  // 2. 查询 YES (side = 0) 和 NO (side = 1) 当前的份额供应量
  const supplyYes = await market.supply(0);
  const supplyNo = await market.supply(1);
  console.log(`📈 当前 YES 份额供应量: ${supplyYes.toString()}`);
  console.log(`📉 当前 NO 份额供应量: ${supplyNo.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("执行脚本时发生错误:", error);
    process.exit(1);
  });