# Gas Usage Summary

## Sepolia transactions

Source: Blockscout transaction API queried on 2026-11-15. All three transactions returned status `ok`. Values below are actual `gas_used`, not transaction gas limits. Fees are actual reported fees in ETH, excluding collateral or trading principal.

| Operation | Input / context | Block | Gas used | Gas limit | Actual fee (ETH) |
|---|---|---:|---:|---:|---:|
| Deploy | Initial funding 0.4 ETH; tradingSeconds=3600; graceSeconds=86400 | 12138649 | 9,120,909 | 9,194,464 | 0.009120909145934544 |
| Buy | buy(0,1); quote and value 0.0005005 ETH | 12138864 | 471,728 | 583,905 | 0.000000000009434560 |
| Sell | sell one YES share; reported proceeds 0.0005005 ETH | 12138868 | 77,663 | 198,755 | 0.000077663000000000 |

Deployment compilation: Solidity 0.8.24+commit.e11b9ed9; optimizer enabled with 200 runs; EVM target paris. The supplied Hardhat execution log reports paris. Exact compilation settings of the teammate's original trading run were not fully recorded; the sanitized package was later aligned with the deployment settings.

## Transaction sources

- Deploy: https://eth-sepolia.blockscout.com/tx/0x1f8b143a91e3aa647b9bba241414105db3a62795aa0d44525e4a123e7c82d78a
- Buy: https://eth-sepolia.blockscout.com/tx/0x653fc47ad16f35ef430e9d14d5b45f2c120536b6b94083f7957316303405ba98
- Sell: https://eth-sepolia.blockscout.com/tx/0x645179bfaf92190d782d5b12c17b75f0370064caa5a93a11a7e79bbf2c811f98

## Interpretation and limits

- These are measurements for three individual transactions, not averages or maximum-cost guarantees.
- Buy/sell execution also depends on state and the execution environment. These observations do not establish a gas saving percentage or a general claim that one operation always costs more than another.
- Do not compare these directly with older Remix VM measurements as an optimization benchmark. VM compiler settings and runtime conditions were not fully recorded.
- Gas units and transaction fees are different measures. Reported gas prices differ substantially: deployment 1000000016 wei/gas; buy 20 wei/gas; sell 1000000000 wei/gas. This explains why fee ranking differs from gas-unit ranking.
- Initial collateral of 0.4 ETH and buy principal of 0.0005005 ETH are not gas fees.
- Quoted buy/sell prices are collateral transfers; changing gas price does not change those contract quotes.
- These data support an engineering discussion of measured transaction costs, not a claim of production readiness or proven gas optimization.

## Suggested report caption

Actual gas consumption for the recorded Sepolia deployment and a one-share YES buy/sell sequence. Gas usage and fees were retrieved from transaction records. Measurements are specific to these transactions and should not be interpreted as comparative optimization benchmarks.
