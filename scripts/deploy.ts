import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main(): Promise<void> {
  console.log("正在准备部署 PredictionMarket 智能合约到 Sepolia 测试网...");

  const [deployer] = await ethers.getSigners();
  console.log(`当前部署账号 (Deployer/Oracle): ${deployer.address}`);

  const question = "Will the green car win the championship?";
  const oracleAddress = deployer.address;
  const tradingSeconds = 300;
  const graceSeconds = 24 * 60 * 60;
  const seedAmount = ethers.parseEther("0.4");

  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  console.log("正在发送合约部署交易（包含 0.4 ETH 初始资金）...");

  const market = await PredictionMarket.deploy(
    question,
    oracleAddress,
    tradingSeconds,
    graceSeconds,
    { value: seedAmount }
  );

  await market.waitForDeployment();

  // 💡 核心修复：使用 .trim() 强制清除任何前后隐藏空格或换行符
  const rawAddress = await market.getAddress();
  const contractAddress = rawAddress.trim();

  console.log("--------------------------------------------------");
  console.log(`🎉 预测市场合约部署成功！`);
  console.log(`📌 最新合约地址: [${contractAddress}]`);
  console.log("--------------------------------------------------");

  const rootDir = path.join(__dirname, "..");

  const targetFiles = [
    path.join(rootDir, "frontend/src/App.tsx"),
    path.join(rootDir, "scripts/buy.ts"),
    path.join(rootDir, "scripts/sell.ts"),
    path.join(rootDir, "scripts/report.ts"),
    path.join(rootDir, "scripts/claim.ts"),
    path.join(rootDir, "scripts/cancelExpired.ts"),
    path.join(rootDir, "scripts/withdrawSurplus.ts"),
    path.join(rootDir, "scripts/interact.ts"),
  ];

  const addressRegex = /0x[a-fA-F0-9]{40}/g;
  let updateCount = 0;

  for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");

      if (addressRegex.test(content)) {
        addressRegex.lastIndex = 0;
        // 确保写入时绝对干净、无空格
        content = content.replace(addressRegex, contractAddress);
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`✅ 已自动更新并清洗空格: ${path.relative(rootDir, filePath)}`);
        updateCount++;
      }
    }
  }

  console.log(`\n🚀 恭喜！共自动同步并清洗了 ${updateCount} 个文件的合约地址！`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署合约时发生错误:", error);
    process.exit(1);
  });