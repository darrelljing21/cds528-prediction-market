# Sepolia Script Execution Results

## Scope

Network: Ethereum Sepolia, chain ID 11155111.

Contract:
`0x5E01b3fb7acc05E2025C4B244Ca0b0a571E6d8bb`

Trading account:
`0xf4eae02CF1A3a58e8892690C3Bb731e8D6FFeF5b`

Evidence consists of supplied execution logs and successful transaction
records. These scripts perform interactions; they are not automated tests.

## Observed sequence

| Step | Script | Observed result |
|---|---|---|
| 1 | interact.ts | result = 0; YES supply = 0; NO supply = 0 |
| 2 | buy.ts | Bought 1 YES share for 500500000000000 wei |
| 3 | interact.ts | YES supply = 1; NO supply = 0 |
| 4 | sell.ts | Sold 1 YES share for the quoted 500500000000000 wei |
| 5 | interact.ts | YES supply = 0; NO supply = 0 |

The quoted amount is 0.0005005 ETH.
Transaction gas fees are separate from the trading amount.

## Buy transaction

- Block: 12138864
- Transaction:
  `0x653fc47ad16f35ef430e9d14d5b45f2c120536b6b94083f7957316303405ba98`
- Status: successful
- Gas used: 471728
- [View transaction](https://eth-sepolia.blockscout.com/tx/0x653fc47ad16f35ef430e9d14d5b45f2c120536b6b94083f7957316303405ba98)

## Sell transaction

- Block: 12138868
- Transaction:
  `0x645179bfaf92190d782d5b12c17b75f0370064caa5a93a11a7e79bbf2c811f98`
- Status: successful
- Gas used: 77663
- [View transaction](https://eth-sepolia.blockscout.com/tx/0x645179bfaf92190d782d5b12c17b75f0370064caa5a93a11a7e79bbf2c811f98)

## Commands used

```bash
npx hardhat run scripts/interact.ts --network sepolia
npx hardhat run scripts/buy.ts --network sepolia
npx hardhat run scripts/sell.ts --network sepolia
