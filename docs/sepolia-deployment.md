# Sepolia Deployment

## Network

- Network: Ethereum Sepolia
- Chain ID: 11155111
- Deployment block: 12138649

## Addresses and transaction

- Contract: `0x5E01b3fb7acc05E2025C4B244Ca0b0a571E6d8bb`
- Deployer and oracle: `0xBff80D177b850BA6663a25C3c612012fD09c6e1c`
- Deployment transaction:
  `0x1f8b143a91e3aa647b9bba241414105db3a62795aa0d44525e4a123e7c82d78a`
- Initial funding: 0.4 Sepolia ETH

## Compilation settings

- Compiler: 0.8.24+commit.e11b9ed9
- Optimizer: enabled
- Optimizer runs: 200
- EVM target: paris

## Constructor arguments

| Parameter | Value |
|---|---|
| question_ | Will the green car win? |
| oracle_ | 0xBff80D177b850BA6663a25C3c612012fD09c6e1c |
| tradingSeconds | 3600 |
| graceSeconds | 86400 |

The deployer also acts as the trusted oracle for this demonstration.
Trading closes one hour after deployment.
The oracle then has a 24-hour reporting window.

## Source verification

Remix reported successful verification on:

- [Blockscout](https://eth-sepolia.blockscout.com/address/0x5E01b3fb7acc05E2025C4B244Ca0b0a571E6d8bb?tab=contract)
- [Sourcify](https://repo.sourcify.dev/11155111/0x5E01b3fb7acc05E2025C4B244Ca0b0a571E6d8bb/)

Etherscan verification was skipped because no API key was configured.
Routescan verification polling timed out; its final status was not confirmed.

## Deployment evidence

[Deployment transaction](https://eth-sepolia.blockscout.com/tx/0x1f8b143a91e3aa647b9bba241414105db3a62795aa0d44525e4a123e7c82d78a)

Successful deployment and source verification do not establish that all
functional tests have been repeated on Sepolia.
Earlier manual functional tests used Remix VM.

## Post-deployment initialization checks

Read-only queries were performed against the Sepolia deployment.

| Query | Observed result | Status |
|---|---|---|
| question() | Will the green car win? | Pass |
| owner() | 0xBff80D177b850BA6663a25C3c612012fD09c6e1c | Pass |
| oracle() | 0xBff80D177b850BA6663a25C3c612012fD09c6e1c | Pass |
| result() | 0 | Pass |
| supply(0) | 0 | Pass |
| supply(1) | 0 | Pass |

These checks confirm the observed initial configuration.
Trading, settlement and callback tests documented elsewhere were
performed in Remix VM and have not all been repeated on Sepolia.
