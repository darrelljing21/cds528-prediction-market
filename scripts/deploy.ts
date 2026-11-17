import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// 辅助函数：支持命令行交互输入
async function promptQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main(): Promise<void> {
  console.log("==================================================");
  console.log("🤖 欢迎使用 PredictionMarket 自动化部署与同步工具");
  console.log("==================================================\n");

  // 1. 获取用户输入的预测问题（如果直接回车，则使用默认问题）
  const defaultQuestion = "Will the green car win the championship?";
  const userInput = await promptQuestion(`请输入你的预测问题 [默认: "${defaultQuestion}"]: `);
  const question = userInput.length > 0 ? userInput : defaultQuestion;

  console.log(`\n📌 当前确定的预测问题: "${question}"`);

  const [deployer] = await ethers.getSigners();
  console.log(`当前部署账号 (Deployer/Oracle): ${deployer.address}`);

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
  let addressUpdateCount = 0;

  // 2. 自动更新合约地址
  for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");

      if (addressRegex.test(content)) {
        addressRegex.lastIndex = 0;
        content = content.replace(addressRegex, contractAddress);
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`✅ 已自动更新合约地址: ${path.relative(rootDir, filePath)}`);
        addressUpdateCount++;
      }
    }
  }

  // 3. 自动更新预测问题字符串（可选：自动把 App.tsx 或其他地方的 question 文本也同步了）
  // 如果你的前端或脚本里定义了类似 const question = "..."，也可以通过正则一并替换
  const questionFiles = [
    path.join(rootDir, "frontend/src/App.tsx"),
    path.join(rootDir, "scripts/buy.ts"),
    path.join(rootDir, "scripts/sell.ts"),
    path.join(rootDir, "scripts/report.ts"),
    path.join(rootDir, "scripts/claim.ts"),
  ];

  let questionUpdateCount = 0;
  for (const filePath of questionFiles) {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");
      // 匹配形如 const question = "xxx"; 或类似赋值
      const questionRegex = /const\s+question\s*=\s*"([^"]+)"/;
      if (questionRegex.test(content)) {
        content = content.replace(questionRegex, `const question = "${question}"`);
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`✍️ 已自动同步预测问题: ${path.relative(rootDir, filePath)}`);
        questionUpdateCount++;
      }
    }
  }

  console.log(`\n🚀 恭喜！共自动同步了 ${addressUpdateCount} 个文件的合约地址，以及 ${questionUpdateCount} 个文件的预测问题！`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署合约时发生错误:", error);
    process.exit(1);
  });