# Manual Test Results

## Environment and scope

- Environment: Remix VM
- Solidity compiler: 0.8.24
- Method: manual transactions, state queries and event inspection
- Multiple independent market deployments were used.
- Results below were observed during interactive testing.
- This is not an automated test suite or a complete security audit.

## Functional and negative tests

| ID | Test | Observed result | Status |
|---|---|---|---|
| T01 | Initialize owner, oracle, result and supply | Expected addresses; result and supplies were zero | Pass |
| T02 | Buy 10 YES shares on a fresh market | Paid 5050000000000000 wei; holdings and accounting matched | Pass |
| T03 | Sell 4 of 10 YES shares | Received quote of 2032000000000000 wei; 6 shares remained | Pass |
| T04 | Buy NO shares | NO holdings and aggregate accounting matched | Pass |
| T05 | Multiple users buy YES shares | Supply and inventory-based quote updated | Pass |
| T06 | Sell above total supply | Reverted: Invalid trade | Pass |
| T07 | Sell from an account without holdings | Reverted: Insufficient shares | Pass |
| T08 | Set minimum sale proceeds above quote | Reverted: Slippage; holdings unchanged | Pass |
| T09 | Sell for more than user's net deposit | Reverted: Return exceeds net deposit | Pass |
| T10 | Buy zero shares | Reverted: Invalid trade; holdings unchanged | Pass |
| T11 | Buy with invalid side 2 | Reverted: Invalid trade; supplies unchanged | Pass |
| T12 | Buy above the 400-share side cap | Reverted: Cap exceeded | Pass |
| T13 | Buy with insufficient ETH | Reverted: Send exact quote in wei | Pass |
| T14 | Buy with quote plus 1 wei | Reverted: Send exact quote in wei; holdings unchanged | Pass |
| T15 | Sell after trading deadline | Reverted: Trading closed | Pass |
| T16 | Non-oracle reports an outcome | Reverted: Only oracle; result unchanged | Pass |
| T17 | Oracle reports before closeTime | Reverted: Wrong time; latest block time was before closeTime | Pass |
| T18 | Oracle reports invalid side 2 | Reverted: Invalid side | Pass |
| T19 | Claim before resolution | Reverted: Not resolved; holdings unchanged | Pass |
| T20 | Cancel before timeout | Reverted: Not expired; result unchanged | Pass |
| T21 | Owner withdraws before resolution | Reverted: Not resolved | Pass |
| T22 | YES settlement and redemption | Result 1; 10 winning shares paid 0.01 ETH | Pass |
| T23 | Repeat winning claim | Reverted: Nothing to claim | Pass |
| T24 | Non-owner withdraws surplus | Reverted: Only owner | Pass |
| T25 | Owner withdraws after YES redemption | Withdrew 0.39505 ETH in the tested scenario | Pass |
| T26 | NO settlement | Result 2 | Pass |
| T27 | Owner withdraws before NO redemption | Withdrew 0.403178 ETH, retaining winning liability | Pass |
| T28 | NO holder claims after owner withdrawal | Received 0.01 ETH; winning holdings cleared | Pass |
| T29 | Losing-only holder claims | Reverted: Nothing to claim | Pass |
| T30 | Oracle changes a settled result | Reverted: Already resolved; result unchanged | Pass |
| T31 | Non-oracle cancels after timeout | Resolved event and result were 3 | Pass |
| T32 | Owner withdraws before timeout refund | Withdrew 0.4 ETH; refund liability retained | Pass |
| T33 | User claims timeout refund | Received 0.00505 ETH; net deposit and refund liability cleared | Pass |
| T34 | Repeat timeout refund | Reverted: Nothing to claim | Pass |
| T35 | Oracle reports after cancellation | Reverted: Already resolved; result remained 3 | Pass |
| T36 | Repeat cancellation | Reverted: Already resolved | Pass |
| T37 | Withdraw after surplus exhausted | Reverted: No surplus | Pass |

## Constructor checks

| ID | Input | Observed result | Status |
|---|---|---|---|
| C01 | Zero initial funding | Reverted: Seed at least 0.4 ETH | Pass |
| C02 | Zero oracle address | Reverted: Invalid oracle | Pass |
| C03 | Empty question string | Reverted: Empty question | Pass |
| C04 | tradingSeconds = 0 | Reverted: Invalid duration | Pass |
| C05 | graceSeconds = 0 | Reverted: Invalid duration | Pass |

## Receiver callback checks

Helper: tests/MarketTestReceiver.sol

| ID | Test | Observed result | Status |
|---|---|---|---|
| S01 | Helper buys market shares | Shares were credited to the helper address | Pass |
| S02 | Receiver rejects ETH during sale | Reverted: ETH transfer failed; holdings and accounting rolled back | Pass |
| S03 | Receiver calls claim during sale callback | Sale succeeded; nested claim failed with Error("Reentrancy") | Pass |
| S04 | Check accounting after successful helper sale | 6 shares; net deposit and refund liability both 3018000000000000 wei | Pass |

These callback checks cover sell-to-claim reentry.
Claim-to-claim callbacks and owner-withdrawal callbacks were not tested.

## Selected transaction evidence

All addresses and hashes below belong to local Remix VM deployments.
They are not public-testnet explorer links.

### YES settlement scenario

Market: 0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47

- Buy:
  0xe62b9dc3f3fb561244cade15d2d71387efc6fb6dfc97eabf1a63de8bed5c68b1
- Report YES:
  0x97def256868e0236f785b3722b9e81449f3b82bad5aed1cc7feeb19e3bdccead
- Winning claim:
  0x2768e04b033d59745e096a1e1b06e7f55f4183de0fc2ec5ae1a392fcbbddb61a

### NO settlement and reserve scenario

Market: 0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3

- Report NO:
  0xc359fcde7050c75cb0cecab32214f55dc14426237cffdacb69e2450cf0348f38
- Owner surplus withdrawal:
  0x8b0d9f7482d6424dd47990f7f9a12507e63e387323c20411f9aea9a86eac5d14
- Winning claim after owner withdrawal:
  0xeb2543d95f7d9cbcbf120d4722f7ace81d2535843f905f6b39c5844674bf2d53

### Timeout refund scenario

Market: 0xddaAd340b0f1Ef65169Ae5E41A8b10776a75482d

- Cancellation:
  0x1c5161f348c1d2e0e1a7f66b93f3c84e34049f30b2f8f455d85727438daced24
- Owner surplus withdrawal:
  0x79110b41c7637d90da7bf98f57a2fe4d2ec03d39c86155d31b5caab206d9ef69
- Refund:
  0x5a91f02a7a4988f51b1ab0d3345f147b3d0bcb6712d37ae293371fb9f60c723b

### Receiver scenario

Market: 0x5e17b14ADd6c386305A32928F985b29bbA34Eff5

Helper: 0xe2899bddFD890e320e643044c6b95B9B0b84157A

- Helper purchase:
  0x2ec0cbe14a2d23f90c265c41fe39d1a74d7da7e6ad049daa43d5f52aab5db655

## Limitations

- Passing these cases does not prove absence of vulnerabilities.
- No automated fuzzing or invariant-testing campaign was performed.
- Public-testnet deployment and source verification are separate tasks.
- Reproduction requires deployment parameters, compiler settings and
  fresh VM state; old local transaction hashes alone are insufficient.
