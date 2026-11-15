# Security Analysis

## Scope and tools

Target: contracts/PredictionMarket.sol  
Solidity compiler: 0.8.24  
Tools: Remix static analysis and Solhint, executed through Remix.

This document records a student review of analysis warnings and
manual tests. It is not an independent security audit.
Tool versions and enabled rules should be preserved with scan evidence.

## Findings and assessment

| Category | Assessment | Decision |
|---|---|---|
| Block timestamp | Used for trading and reporting deadlines, not randomness. Boundary behaviour depends on block timestamps. | Retained; document timing assumptions. |
| Low-level call | ETH transfers use call. The return value is checked and failure reverts the transaction. Fund-moving entry points use a reentrancy guard. | Retained; supported by limited callback tests. |
| Infinite gas estimates | Static analysis reported infinite estimates for several functions. This does not establish that actual execution requires infinite gas. Tested operations executed successfully. | Record estimator limitations; no unbounded user loops identified in the reviewed code. |
| View/pure suggestions | buyQuote and sellQuote read state and calculate prices without changing storage. | Retain view declarations. |
| Similar variable names | oracle and oracle_ distinguish stored state from a constructor argument. | Retain naming. |
| Guard conditions | require checks validate inputs, permissions, timing and external transfer results. | Retain checks. |
| Integer division | Under current constants, both divisions by 2 have exactly divisible wei coefficients. | Reassess if pricing constants change. |
| Immutable naming | Solhint recommends capitalized names under its selected configuration. | Style suggestion; no behaviour change. |
| Custom errors | Solhint recommends custom errors instead of revert strings. | Possible future optimization. |
| Constructor visibility | Solidity 0.8.24 constructors do not need visibility. | Configure the linter to ignore constructor visibility. |

## Manual tests observed

- Market initialization and constructor input checks.
- YES and NO purchases, quotes and accounting.
- Successful partial sale and accounting updates.
- Rejection of invalid sides, zero amounts and purchases above the cap.
- Rejection of incorrect ETH payment.
- Rejection of sales above supply or personal holdings.
- Minimum-return protection.
- Net-deposit sale restriction.
- Trading deadline and oracle reporting restrictions.
- Rejection of premature claims, cancellation and owner withdrawals.
- YES and NO settlement and winning-share redemption.
- Rejection of losing-share claims and repeated claims.
- Owner-only surplus withdrawal.
- Winning-user redemption after the owner withdrew surplus.
- Timeout cancellation and net-deposit refunds.
- Refund payment after the owner withdrew surplus.
- Rejection of repeated refunds, repeated cancellation and result changes.
- Rejection of withdrawals when no surplus remains.

These are manual Remix VM tests, not an automated test suite.

## Callback tests

tests/MarketTestReceiver.sol is a test helper, not a market feature.

Observed scenarios:

1. The receiver rejected ETH during a sale.
   The sale reverted with "ETH transfer failed".
   Holdings, supply, net deposits and refund liability were unchanged.

2. The receiver accepted ETH during a sale and attempted to call claim.
   The sale succeeded, while the nested claim failed.
   Returned error data decoded to Error("Reentrancy").
   Sale accounting matched expectations.

Coverage is limited: claim-to-claim callbacks, owner-withdrawal callbacks
and other attack sequences were not tested.

## Known design limitations

- A trusted centralized oracle can report a false outcome.
- Outcome shares are internal balances, not transferable ERC20 tokens.
- YES and NO use independent inventory pricing; their prices are not
  guaranteed to sum to the winning payout.
- Sales exceeding a user's net deposit are rejected, including some
  profitable exits.
- Losing shares and cancelled-market shares can remain visible in storage.
- Manual tests and static analysis do not prove absence of vulnerabilities.
- Testing described here used Remix VM; public-testnet deployment and
  source verification remain separate tasks.

## Evidence

Preserve original scan output, representative screenshots and transaction
logs in docs/evidence/. Do not describe this review as a clean audit.
