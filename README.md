# CDS528 Prediction Market

An educational Solidity prediction market developed and manually tested
using Remix IDE. Use test assets only.

## Repository structure

- `contracts/PredictionMarket.sol`: main market contract.
- `tests/MarketTestReceiver.sol`: helper contract for manual callback tests.
- `docs/security-analysis.md`: static-analysis findings and manual test summary.

## Features

- YES and NO outcome shares recorded as internal whole-unit balances.
- Buying and selling with inventory-based quotes.
- Trading deadline and a separate oracle reporting window.
- Winning-share redemption at 0.001 ETH per share.
- Permissionless cancellation after an oracle timeout.
- Cancelled-market refunds based on each user's net deposit.
- Owner surplus withdrawals that retain required user reserves.

There is no frontend or transferable ERC20 outcome token.
Remix provides the interaction interface.

## Requirements

- A browser and [Remix IDE](https://remix.ethereum.org/).
- Solidity compiler **0.8.24**.
- Remix VM for local manual testing.
- A wallet and test ETH for public-testnet deployment.

The Solidity files have no external library imports.
No npm installation is needed for the Remix workflow.

## Compile

1. Download or clone this repository:

   ```bash
   git clone https://github.com/darrelljing21/cds528-prediction-market.git
   ```

2. Import the Solidity files into a Remix workspace.
3. Select Solidity compiler 0.8.24.
4. Compile `PredictionMarket.sol`.
5. For callback testing, also compile `MarketTestReceiver.sol`.

The Sepolia deployment used:

- Compiler: 0.8.24+commit.e11b9ed9
- Optimizer: enabled, 200 runs
- EVM target: paris

Use these exact settings when reproducing the Sepolia deployment
or verifying its source. Earlier Remix VM test settings were not
fully recorded.

## Deploy in Remix VM

Use separate accounts:

- Account 1: owner and deployer.
- Account 2: trusted oracle.
- Account 3: trader.
- Account 4: second trader.

Select `PredictionMarket` and provide:

| Parameter | Example |
|---|---|
| question_ | Will the green car win? |
| oracle_ | Full address of Account 2 |
| tradingSeconds | 300 |
| graceSeconds | 1800 |
| Deployment Value | 400000000000000000 wei |

The minimum initial funding is 0.4 ETH.
Trading begins at deployment and lasts for `tradingSeconds`.
Use 3600 seconds instead if more time is needed for manual trade tests.

After deployment, record the full contract address.
Use that contract's card for all related operations.
Deployment Value and interaction Value may be separate fields in Remix.

## Manual buy and sell test

Side `0` means YES; side `1` means NO.

1. Switch to Account 3.
2. Query `buyQuote(0,10)` on a fresh market.
   Expected quote: `5050000000000000` wei.
3. Set the Value for the deployed-contract interaction to that quote.
4. Call `buy(0,10)`.
5. Reset interaction Value to `0 wei`.
6. Check `shares(Account3,0)` and `supply(0)`: both should be 10.
7. Query `sellQuote(0,4)`.
   With no intervening trades, the quote is `2032000000000000` wei.
8. Call `sell(0,4,2032000000000000)` with zero Value.
9. Check remaining shares: 6.
10. Check netDeposit and refundLiability:
    both should be `3018000000000000` wei.

Always query the current price; other trades can change the quote.
The sell `minReturn` argument is the minimum acceptable proceeds,
not ETH to attach to the transaction.

## Settlement test

1. Wait until the trading deadline.
2. Before resolutionDeadline, switch to the oracle account.
3. Call `report(0)` for YES or `report(1)` for NO.
4. Verify result: 1 for YES, 2 for NO.
5. A winning holder calls `claim()` with zero Value.
6. Each winning share pays 0.001 ETH.
7. A second claim should revert with `Nothing to claim`.

For a market with only the trade sequence above, reporting YES should
allow Account 3 to claim 0.006 ETH.

## Timeout refund test

Use a separate market. Do not report an outcome.

1. Buy shares before closeTime.
2. Once block.timestamp >= resolutionDeadline,
   any account can call `cancelExpired()`.
3. Verify result is 3.
4. Users call `claim()` with zero Value.
5. Refunds equal recorded net deposits, not winning-share payouts.
6. Verify netDeposit and refundLiability decrease appropriately.
7. Repeated claims should revert.

Cancelled-market share balances remain visible in storage.
Refund entitlement is determined by netDeposit.

## Surplus withdrawal

Only the owner can call `withdrawSurplus()`, after resolution or cancellation.
The contract retains the required winning-share or refund reserve.

Manual tests covered an owner withdrawal before a winning claim,
and an owner withdrawal before a timeout refund.

## Callback testing

Deploy `MarketTestReceiver` with the market address and zero deployment Value.
The deployer becomes its controller.

Buy through the helper's `buy` function, attaching the market's current quote.
Shares belong to the helper address.

- `configure(true,false)`: reject incoming ETH.
  A sale should revert with `ETH transfer failed`, leaving market accounting unchanged.
- `configure(false,true)`: accept ETH and attempt a nested claim.
  A sale should succeed while the nested claim fails with `Reentrancy`.

These are manual test procedures, not an automated test suite.
The helper retains received ETH and has no withdrawal function;
use it only with disposable test assets.

## Security analysis

See [Security Analysis](docs/security-analysis.md).

Remix static analysis and Solhint were run.
Warnings were reviewed alongside limited manual tests.
This is not an independent security audit or proof of safety.

## Known limitations

- The oracle is trusted and can misreport an outcome.
- Some profitable sales are blocked by the net-deposit restriction.
- YES and NO prices are independent and are not complementary probabilities.
- Shares are internal balances and cannot be transferred.
- There are no trading fees, pause mechanism or upgrade mechanism.
- Immutability avoids upgrade administration but prevents patching deployed code.

## Deployment status

The contract has been deployed to Ethereum Sepolia (chain ID 11155111).

- Contract: `0x5E01b3fb7acc05E2025C4B244Ca0b0a571E6d8bb`
- [Verified source on Blockscout](https://eth-sepolia.blockscout.com/address/0x5E01b3fb7acc05E2025C4B244Ca0b0a571E6d8bb?tab=contract)
- [Verified source on Sourcify](https://repo.sourcify.dev/11155111/0x5E01b3fb7acc05E2025C4B244Ca0b0a571E6d8bb/)
- [Deployment details](docs/sepolia-deployment.md)
- [Manual test results](docs/manual-test-results.md)

Sourcify and Blockscout verification succeeded.
Etherscan verification was skipped because no API key was configured.
Routescan polling timed out; its final status was not confirmed.

Earlier functional and callback tests used Remix VM.
Deployment and verification do not mean all tests were repeated on Sepolia.
Local VM addresses and hashes are not public-testnet evidence.

## References

- [Speedrun Ethereum: Prediction Markets](https://speedrunethereum.com/challenge/prediction-markets)
- [Remix documentation](https://remix-ide.readthedocs.io/)
- [Solidity security considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)

The tutorial inspired the market lifecycle.
This implementation uses different share accounting and pricing.

## AI assistance

OpenAI Codex assisted with code drafting, test guidance and documentation.
Team members remain responsible for reviewing and validating the work.

## License

MIT. See the repository LICENSE file.

## Hardhat interaction scripts

Install dependencies and compile:

```bash
npm ci
npx hardhat compile
```

Configure `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY` in the local
process environment. Never commit private keys.
`.env.example` documents the variables; `.env` is not loaded automatically.

Read the deployed market:

```bash
npx hardhat run scripts/interact.ts --network sepolia
```

Available transaction scripts:

- `buy.ts`
- `sell.ts`
- `report.ts`
- `claim.ts`
- `cancelExpired.ts`
- `withdrawSurplus.ts`

Run them using:
`npx hardhat run scripts/<filename> --network sepolia`.

Scripts target the recorded Sepolia contract and contain fixed parameters.
Transactions require the appropriate market state, account permissions
and test ETH. Buying and selling fail after the trading deadline.

The prepared project compiled successfully locally.
Sepolia execution logs were supplied for interact, buy and sell.
Other scripts have not been confirmed as executed on Sepolia.

These are interaction scripts, not automated tests or deployment scripts.
The `npm test` command remains a placeholder.
