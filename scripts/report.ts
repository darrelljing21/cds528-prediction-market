import { ethers } from "hardhat";

async function main(): Promise<void> {
  const rawAddress = "0x48DE3794FB4652B296dBeb96092eFC698eD3d086";
  const CONTRACT_ADDRESS = ethers.getAddress(rawAddress.toLowerCase());

  console.log(`正在连接到 Sepolia 测试网的 PredictionMarket 合约进行结果上报...`);

  // 获取签名者（注意：执行 report 的钱包必须是合约中配置的 oracle 地址）
  const [signer] = await ethers.getSigners();
  console.log(`当前操作的钱包地址: ${signer.address}`);

  const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarket");
  const market = PredictionMarketFactory.attach(CONTRACT_ADDRESS).connect(signer);

  // 设置获胜方：0 = YES 胜出, 1 = NO 胜出
  const winningSide = 0;

  console.log(`正在提交结果上报，获胜方: ${winningSide === 0 ? 'YES (0)' : 'NO (1)'} ...`);

  // 发送 report 交易
  const tx = await market.report(winningSide);
  console.log(`交易已广播，Hash: ${tx.hash}`);
  console.log(`等待交易确认中...`);

  const receipt = await tx.wait();
  console.log(`✅ 市场结算上报交易已成功确认！区块高度: ${receipt?.blockNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("执行结果上报脚本时发生错误:", error);
    process.exit(1);
  });