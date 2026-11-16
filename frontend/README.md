# Prediction Market Frontend / 预测市场前端

A Sepolia prediction market frontend built with React, TypeScript, Vite, and ethers.

基于 React、TypeScript、Vite 和 ethers 构建的 Sepolia 预测市场前端。

## Local Setup / 本地启动

Run from the repository root.
在仓库根目录执行：

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

If `.env.local` already exists, keep your existing configuration and skip the copy command.

如果已有 `.env.local`，请保留现有配置，跳过复制命令。

Open the local URL printed in the terminal and connect MetaMask to Sepolia.

打开终端显示的本地地址，通过 MetaMask 连接 Sepolia 测试网。

## Contract Configuration / 合约配置

Set the contract address in `.env.local`.
在 `.env.local` 中设置合约地址：

```dotenv
VITE_CONTRACT_ADDRESS=0x5E01b3fb7acc05E2025C4B244Ca0b0a571E6d8bb
```

This is the Sepolia address recorded in the repository's deployment documentation. After deploying a new contract, update this value and restart the development server.

这是仓库部署文档记录的 Sepolia 合约地址。部署新合约后，请更新地址并重启开发服务。

Variables prefixed with `VITE_` are exposed to the browser. Never include private keys or seed phrases.

以 `VITE_` 开头的变量会暴露给浏览器，切勿填写私钥或助记词。

## Checks / 代码检查

Run from the `frontend` directory.
在 `frontend` 目录执行：

```powershell
npm run build
npm run lint
```

## Validation and Limitations / 验证情况与限制

- Build and lint checks passed.
  构建和 lint 检查已通过。
- Market data loading, account switching, and data recovery after switching back to Sepolia were verified manually.
  已手动验证市场数据读取、账户切换及切回 Sepolia 后恢复读取。
- The documented deployment's trading period has ended; disabled trading buttons are expected.
  文档所记录部署的交易期已结束，买卖按钮禁用符合预期。
- Buying, selling, settlement, and refunds have not completed end-to-end validation.
  买入、卖出、结算及退款尚未完成端到端验证。
- At the time of validation, `npm audit` reported seven moderate vulnerabilities in the ESLint development dependency chain.
  验证时，`npm audit` 报告 ESLint 开发依赖链中存在七项中等漏洞。
- The build reports a JavaScript chunk size warning above 500 KB.
  构建存在 JavaScript 分块超过 500 KB 的体积提示。