import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

type WalletProvider = ethers.Eip1193Provider & {
  on(event: 'accountsChanged', listener: (accounts: string[]) => void): void;
  on(event: 'chainChanged', listener: () => void): void;
  removeListener(
    event: 'accountsChanged',
    listener: (accounts: string[]) => void
  ): void;
  removeListener(event: 'chainChanged', listener: () => void): void;
};

const ethereum = (
  window as Window & { ethereum?: WalletProvider }
).ethereum;

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'reason' in error &&
    typeof error.reason === 'string'
  ) {
    return error.reason;
  }

  return error instanceof Error ? error.message : String(error);
}

function getWalletProvider() {
  if (!ethereum) {
    throw new Error('请安装 MetaMask 钱包');
  }

  return new ethers.BrowserProvider(ethereum);
}

// 💡 请确保这里填入的是你最新部署的合约地址
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// 对应 PredictionMarket.sol 智能合约的完整 ABI
const CONTRACT_ABI = [
  "function question() view returns (string)",
  "function result() view returns (uint8)",
  "function closeTime() view returns (uint256)",
  "function supply(uint256) view returns (uint256)",
  "function buyQuote(uint8 side, uint256 amount) view returns (uint256)",
  "function sellQuote(uint8 side, uint256 amount) view returns (uint256)",
  "function buy(uint8 side, uint256 amount) external payable",
  "function sell(uint8 side, uint256 amount, uint256 minReturn) external",
  "function claim() external"
];

export default function App() {
  const [account, setAccount] = useState<string>("");
  const [question, setQuestion] = useState<string>("正在加载链上数据...");
  const [marketStatus, setMarketStatus] = useState<number>(0);
  const [closeTimeTimestamp, setCloseTimeTimestamp] = useState<number>(0);
  const [closeTimeStr, setCloseTimeStr] = useState<string>("");
  const [supplyYes, setSupplyYes] = useState<string>("0");
  const [supplyNo, setSupplyNo] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);

  // 1. 连接 MetaMask 钱包并自动检测/切换到 Sepolia 测试网
  const connectWallet = async () => {
    if (!ethereum) {
      alert("请安装 MetaMask 钱包！");
      return;
    }
    try {
      const provider = getWalletProvider();
      const accounts = await provider.send("eth_requestAccounts", []);

      const network = await provider.getNetwork();
      const sepoliaChainId = 11155111n;

      if (network.chainId !== sepoliaChainId) {
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch{
          alert("请在 MetaMask 中手动将网络切换至 Sepolia 测试网！");
          return;
        }
      }

      setAccount(accounts[0]);
      await loadMarketData();
    } catch (err) {
      console.error("连接钱包失败:", err);
    }
  };

  // 2. 从链上加载预测市场数据
  const loadMarketData = async () => {
    try {
      const provider = ethereum
        ? new ethers.BrowserProvider(ethereum)
        : ethers.getDefaultProvider("sepolia");

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const q = await contract.question();
      const res = await contract.result();
      const cTime = await contract.closeTime();
      const sYes = await contract.supply(0);
      const sNo = await contract.supply(1);

      setQuestion(q);
      setMarketStatus(Number(res));
      setCloseTimeTimestamp(Number(cTime));
      setCloseTimeStr(new Date(Number(cTime) * 1000).toLocaleString());
      setSupplyYes(sYes.toString());
      setSupplyNo(sNo.toString());
    } catch (err) {
      console.error("读取合约数据失败:", err);
    }
  };

  useEffect(() => {
  void loadMarketData();

  if (!ethereum) return;

  const restoreAccount = async () => {
  try {
    const accounts = await getWalletProvider().send('eth_accounts', []);
    setAccount(accounts[0] || "");
  } catch (error) {
    console.error("恢复钱包连接失败:", error);
  }
};

void restoreAccount();

  const handleAccountsChanged = (accounts: string[]) => {
    setAccount(accounts[0] || "");
    void loadMarketData();
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  ethereum.on('accountsChanged', handleAccountsChanged);
  ethereum.on('chainChanged', handleChainChanged);

  return () => {
    ethereum.removeListener('accountsChanged', handleAccountsChanged);
    ethereum.removeListener('chainChanged', handleChainChanged);
  };
}, []);

  // 核心判断：如果合约状态不是0，或者当前现实时间超过了截止时间，则交易关闭
 const [now, setNow] = useState(() => Date.now());

useEffect(() => {
  const timer = window.setInterval(() => {
    setNow(Date.now());
  }, 1000);

  return () => window.clearInterval(timer);
}, []);

const isExpired =
  closeTimeTimestamp > 0 && now >= closeTimeTimestamp * 1000;
  const isTradingActive = marketStatus === 0 && !isExpired;

  // 3. 买入份额 (Buy) - 💡 已修复：通过 buyQuote 动态获取链上精确报价
  const handleBuy = async (side: number) => {
    if (!account) {
      alert("请先连接 MetaMask 钱包！");
      return;
    }
    try {
      setLoading(true);
      const provider = getWalletProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const amount = 1n; // 购买 1 个单位份额

      // 动态调用合约的 buyQuote 获取精确的 wei 数量
      const exactQuotePrice = await contract.buyQuote(side, amount);
      console.log("当前链上精确计算报价 (wei):", exactQuotePrice.toString());

      // 发送交易，附带精确计算出来的 value
      const tx = await contract.buy(side, amount, { value: exactQuotePrice });
      await tx.wait();

      alert("🎉 链上买入成功！");
      loadMarketData();
    } catch (err) {
      console.error(err);
      alert("买入失败: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 4. 卖出份额 (Sell)
  const handleSell = async (side: number) => {
    if (!account) {
      alert("请先连接 MetaMask 钱包！");
      return;
    }
    try {
      setLoading(true);
      const provider = getWalletProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const amount = 1n;
      const minReturn = 0n;

      const tx = await contract.sell(side, amount, minReturn);
      await tx.wait();

      alert("📉 链上卖出/退回成功！");
      loadMarketData();
    } catch (err) {
      console.error(err);
      alert("卖出失败: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 5. 领奖/退款 (Claim)
  const handleClaim = async () => {
    if (!account) {
      alert("请先连接 MetaMask 钱包！");
      return;
    }
    try {
      setLoading(true);
      const provider = getWalletProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.claim();
      await tx.wait();

      alert("🏆 奖励/退款领取成功！");
      loadMarketData();
    } catch (err) {
      console.error(err);
      alert("领奖失败: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 纯 CSS 样式对象
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    card: {
      width: '100%',
      maxWidth: '560px',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(51, 65, 85, 0.6)',
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      paddingBottom: '20px',
      borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
    },
    logoBox: { display: 'flex', alignItems: 'center', gap: '12px' },
    icon: {
      width: '40px', height: '40px', borderRadius: '12px',
      background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
    },
    title: { fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: 0 },
    subtitle: { fontSize: '12px', color: '#94a3b8', margin: 0 },
    walletBtn: {
      background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
      color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '12px',
      fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    },
    accountBadge: {
      background: '#1e293b', border: '1px solid #334155', padding: '8px 16px',
      borderRadius: '20px', fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1',
    },
    section: {
      background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(51, 65, 85, 0.6)',
      borderRadius: '16px', padding: '20px', marginBottom: '16px',
    },
    label: { fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' as const, color: '#818cf8', marginBottom: '8px', display: 'block' },
    questionText: { fontSize: '18px', fontWeight: 'bold', color: '#f8fafc', margin: 0, lineHeight: '1.4' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    statCardYes: {
      background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(2, 6, 23, 0.8) 100%)',
      border: '1px solid rgba(30, 58, 138, 0.5)', borderRadius: '16px', padding: '20px', textAlign: 'center' as const,
    },
    statCardNo: {
      background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.3) 0%, rgba(2, 6, 23, 0.8) 100%)',
      border: '1px solid rgba(88, 28, 135, 0.5)', borderRadius: '16px', padding: '20px', textAlign: 'center' as const,
    },
    btnYes: {
      width: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
      color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
    },
    btnNo: {
      width: '100%', background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
      color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
    },
    btnSell: {
      width: '100%', background: '#1e293b', border: '1px solid rgba(51, 65, 85, 0.8)',
      color: '#94a3b8', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    },
    btnClaim: {
      width: '100%', background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
      color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '4px',
    },
    footer: { marginTop: '24px', textAlign: 'center' as const, fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* 顶部导航 */}
        <div style={styles.header}>
          <div style={styles.logoBox}>
            <div style={styles.icon}>⚡</div>
            <div>
              <h1 style={styles.title}>去中心化预测市场</h1>
              <p style={styles.subtitle}>Sepolia Testnet DApp</p>
            </div>
          </div>

          {account ? (
            <div style={styles.accountBadge}>
              🟢 {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          ) : (
            <button onClick={connectWallet} style={styles.walletBtn}>
              连接 MetaMask
            </button>
          )}
        </div>

        {/* 核心信息区 */}
        <div style={styles.section}>
          <span style={styles.label}>🎯 预测标的 (Question)</span>
          <p style={styles.questionText}>{question}</p>
        </div>

        <div style={styles.grid2}>
          <div style={styles.section}>
            <span style={styles.label}>市场状态</span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isTradingActive ? '#34d399' : '#fbbf24' }}>
              {isTradingActive ? "🟢 交易进行中" : "🔒 交易已截止 / 关闭"}
            </div>
          </div>
          <div style={styles.section}>
            <span style={styles.label}>交易截止时间</span>
            <div style={{ fontSize: '12px', color: isExpired ? '#f87171' : '#cbd5e1', marginTop: '4px' }}>
              {closeTimeStr || "读取中..."} {isExpired && "(已过期)"}
            </div>
          </div>
        </div>

        {/* 份额对比网格 */}
        <div style={styles.grid2}>
          <div style={styles.statCardYes}>
            <div style={{ fontSize: '11px', color: '#93c5fd', textTransform: 'uppercase' }}>YES 份额总数</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#60a5fa', marginTop: '6px', fontFamily: 'monospace' }}>{supplyYes}</div>
          </div>
          <div style={styles.statCardNo}>
            <div style={{ fontSize: '11px', color: '#d8b4fe', textTransform: 'uppercase' }}>NO 份额总数</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#c084fc', marginTop: '6px', fontFamily: 'monospace' }}>{supplyNo}</div>
          </div>
        </div>

        {/* 操作按钮区 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={styles.grid2}>
            <button
              disabled={loading || !isTradingActive}
              onClick={() => handleBuy(0)}
              style={{ ...styles.btnYes, opacity: (loading || !isTradingActive) ? 0.4 : 1 }}
            >
              📈 买入 YES (1单位)
            </button>
            <button
              disabled={loading || !isTradingActive}
              onClick={() => handleBuy(1)}
              style={{ ...styles.btnNo, opacity: (loading || !isTradingActive) ? 0.4 : 1 }}
            >
              📉 买入 NO (1单位)
            </button>
          </div>

          <div style={styles.grid2}>
            <button
              disabled={loading || !isTradingActive}
              onClick={() => handleSell(0)}
              style={{ ...styles.btnSell, opacity: (loading || !isTradingActive) ? 0.4 : 1 }}
            >
              🔄 卖出 YES 份额
            </button>
            <button
              disabled={loading || !isTradingActive}
              onClick={() => handleSell(1)}
              style={{ ...styles.btnSell, opacity: (loading || !isTradingActive) ? 0.4 : 1 }}
            >
              🔄 卖出 NO 份额
            </button>
          </div>

          <button
            disabled={loading || marketStatus === 0}
            onClick={handleClaim}
            style={{ ...styles.btnClaim, opacity: (loading || marketStatus === 0) ? 0.4 : 1 }}
          >
            🏆 领取结算奖励 / 退款 (Claim)
          </button>

          {loading && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#818cf8', margin: '4px 0 0' }}>
              ⏳ 正在等待区块链确认交易...
            </p>
          )}

        </div>

      </div>

      <footer style={styles.footer}>
        CDS528 Group Project • Powered by Hardhat & Ethers.js
      </footer>

    </div>
  );
}