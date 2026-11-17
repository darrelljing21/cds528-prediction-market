import { ethers } from "hardhat";

async function main(): Promise<void> {
  const rawAddress = "0x48DE3794FB4652B296dBeb96092eFC698eD3d086";
  const CONTRACT_ADDRESS = ethers.getAddress(rawAddress.toLowerCase());

  console.log(`正在连接到 Sepolia 测试网的 PredictionMarket 合约...`);

  // 获取签名者（需要你在 hardhat.config.ts 中配置了 private key）
  const [signer] = await ethers.getSigners();
  console.log(`当前操作的钱包地址: ${signer.address}`);

  const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
  const market = PredictionMarketFactory.attach(CONTRACT_ADDRESS).connect(signer);

  // 设置购买参数：购买方向 (0 = YES, 1 = NO)，购买数量 (例如 1 个单位)
  const side = 0; // 0 代表 YES
  const amount = 1; // 购买 1 个单位份额

  // 1. 调用 buyQuote 计算需要支付的精准 wei 价格
  const quotePrice = await market.buyQuote(side, amount);
  console.log(`📈 购买 ${amount} 个单位的 YES 份额，计算出的报价为: ${quotePrice.toString()} wei (${ethers.formatEther(quotePrice)} ETH)`);

  // 2. 发送交易调用 buy 函数
  console.log(`正在发送买入交易...`);
  const tx = await market.buy(side, amount, {
    value: quotePrice // 必须发送与 quote 精确相等的 ETH
  });

  console.log(`交易已广播，Hash: ${tx.hash}`);
  console.log(`等待交易确认中...`);

  // 等待区块链确认交易
  const receipt = await tx.wait();
  console.log(`✅ 交易已成功确认！区块高度: ${receipt?.blockNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("执行买入脚本时发生错误:", error);
    process.exit(1);
  });