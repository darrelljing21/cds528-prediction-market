import { ethers } from "hardhat";

async function main(): Promise<void> {
  const rawAddress = "0x48DE3794FB4652B296dBeb96092eFC698eD3d086";
  const CONTRACT_ADDRESS = ethers.getAddress(rawAddress.toLowerCase());

  console.log(`正在连接到 Sepolia 测试网的 PredictionMarket 合约进行卖出操作...`);

  const [signer] = await ethers.getSigners();
  console.log(`当前操作的钱包地址: ${signer.address}`);

  const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
  const market = PredictionMarketFactory.attach(CONTRACT_ADDRESS).connect(signer);

  // 设置卖出参数：卖出方向 (0 = YES, 1 = NO)，卖出数量
  const side = 0; // 0 代表 YES
  const amount = 1; // 卖出 1 个单位份额

  // 1. 调用 sellQuote 计算当前可以换回多少 wei
  const quotePrice = await market.sellQuote(side, amount);
  console.log(`📉 卖出 ${amount} 个单位的 YES 份额，预计可拿回: ${quotePrice.toString()} wei (${ethers.formatEther(quotePrice)} ETH)`);

  // 设置滑点保护：允许的最低退款金额（这里为了测试设为与 quotePrice 相同，或者留出一点滑点空间）
  const minReturn = quotePrice;

  // 2. 发送交易调用 sell 函数
  console.log(`正在发送卖出交易...`);
  const tx = await market.sell(side, amount, minReturn);

  console.log(`交易已广播，Hash: ${tx.hash}`);
  console.log(`等待交易确认中...`);

  const receipt = await tx.wait();
  console.log(`✅ 卖出交易已成功确认！区块高度: ${receipt?.blockNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("执行卖出脚本时发生错误:", error);
    process.exit(1);
  });