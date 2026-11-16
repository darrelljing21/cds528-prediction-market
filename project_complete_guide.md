# 📊 去中心化预测市场 DApp (Decentralized Prediction Market) 项目完整指南

本指南涵盖了本去中心化预测市场项目的完整安装、开发环境配置、依赖安装以及核心脚本运行说明。

---

## 🛠️ 一、 运行环境与前置依赖安装

在开始之前，请确保你的电脑上安装了以下基础运行环境：

### 1. 安装 Node.js 与 npm
项目运行依赖于 Node.js 运行时（自带 npm 包管理器）。
* **下载地址**：访问 [Node.js 官方网站](https://nodejs.org/) 下载并安装 **LTS（长期支持版，建议 v20.x 或以上版本）**。
* **验证安装**：在终端（Terminal / PowerShell）中运行以下命令检查是否安装成功：
  ```powershell
  node -v
  npm -v
  ```

---

## 📥 二、 Hardhat 与 Vite 的下载与版本参照

本项目分为**根目录（智能合约与 Hardhat 后端）**和 **`frontend/` 目录（React 前端）**。

### 1. Hardhat 后端环境及依赖安装
Hardhat 是以太坊智能合约开发框架。它不需要全局安装，建议直接作为项目的开发依赖安装在根目录下。

1. **进入项目根目录**：
   ```powershell
   cd blockchainproject
   ```
2. **安装根目录依赖**（包含 Hardhat、Ethers.js 及 TypeScript 相关编译工具）：
   ```powershell
   npm install
   ```
3. **版本参照（根目录 `package.json` 对应版本）**：
   * **Node.js**：`^20.x`
   * **Hardhat**：`^2.22.x`
   * **Solidity 编译器**：`^0.8.20` / `^0.8.24`
   * **Ethers.js**：`^6.x`

---

### 2. Frontend 前端环境及依赖安装
前端采用 React + Vite + TypeScript 构建。

1. **进入前端目录**：
   ```powershell
   cd frontend
   ```
2. **安装前端依赖**（包含 Vite, React, TailwindCSS 等）：
   ```powershell
   npm install
   ```
3. **版本参照（`frontend/package.json` 对应版本）**：
   * **Vite**：`^5.x` 或 `^6.x`
   * **React / React-DOM**：`^18.x`
   * **TypeScript**：`^5.x`

---

## 📁 三、 目录结构概览

```text
blockchainproject/
├── contracts/               # Solidity 智能合约目录
│   └── PredictionMarket.sol # 核心预测市场逻辑合约
├── frontend/                # 前端 React 应用目录
│   ├── src/App.tsx          # 前端交互主界面
│   ├── package.json         # 前端依赖配置
│   └── ...
├── scripts/                 # 运维与交互 TypeScript 脚本
│   ├── deploy.ts            # 部署合约脚本
│   ├── buy.ts               # 买入份额脚本
│   ├── sell.ts              # 卖出份额脚本
│   ├── report.ts            # 预言机上报结果与结算脚本
│   ├── claim.ts             # 领取奖励/退款脚本
│   ├── cancelExpired.ts     # 超时取消市场脚本
│   └── withdrawSurplus.ts   # 提取盈余资金脚本 (Owner 权限)
├── hardhat.config.ts        # Hardhat 配置文件
└── package.json             # 根目录依赖与脚本配置
```

---

## ⚙️ 四、 核心智能合约逻辑 (`PredictionMarket.sol`)

1. **种子资金 (Seed Amount)**：合约部署时必须注入至少 `0.4 ETH` 作为初始流动性储备。
2. **状态机管理**：
   * `0`: 活跃中（Trading）
   * `1`: YES 胜出
   * `2`: NO 胜出
   * `3`: 已取消（Expired / Refund）
3. **权限控制**：
   * **预言机 (Oracle)**：负责在交易截止后上报最终结果 (`report`)。
   * **管理员 (Owner)**：负责提取结算后的盈余资金 (`withdrawSurplus`)。

---

## 🚀 五、 常用脚本运行指南

请确保终端路径位于项目根目录下，且已在根目录配置好 `.env` 文件（包含钱包私钥和 Sepolia RPC URL）。

### 1. 部署合约并自动同步地址
```powershell
npx hardhat run scripts/deploy.ts --network sepolia
```
> *注：该脚本会自动将新生成的合约地址写入前端及后端脚本中。*

### 2. 买入份额
```powershell
npx hardhat run scripts/buy.ts --network sepolia
```

### 3. 预言机上报结果 (结算)
```powershell
npx hardhat run scripts/report.ts --network sepolia
```

### 4. 领取奖励 / 退款
```powershell
npx hardhat run scripts/claim.ts --network sepolia
```

### 5. 启动前端开发服务器
进入 `frontend` 目录后运行：
```powershell
cd frontend
npm run dev
```