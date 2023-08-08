# Exchange Contract (A fork of Uniswap V1 built on Goerli testnet)

This is a Decentralized exchange built on Goerli testnet by forking much of Uniswap V1 contract. It comes with a Factory contract (which is used for creating the factory contract on which a token/Eth pair can be traded), and an Exchange contract (which contains all the basic exchange DEX functions such as addLiquidity, removeLiquidity, tokenToEthSwap, tokenToTokenSwap, ethToTokenSwap etc.). Tests are also included which were used roughly to test the smart contracts in production. The 'scripts' files - deploy.js, deployFactory.js, Exchange.js are all used to communicate with the blockchain utilizing ethersJS, deployFactory.js deploys the Factory contract (which is a contract now responsible for deploying all token/Eth exchange contract pairs), deploy.js deploys all the initial smart contract code and creates a factory contract address, Exchange.js is a script that performs all functions such as addLiquidity, tokenSwaps, creatingExchangePairs etc, required for the LASWAP DEX using nodeJS and ethersJS.
factoryDeployContractAddress: '0x6EfeAAA6C73C96a1dF80d23eF990Fd85B25604B3'.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test test/testExchange
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/Exchange.js --network goerli
```
