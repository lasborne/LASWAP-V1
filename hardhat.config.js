require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config()

const goerli_testnet = process.env.GOERLI_API_KEY
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY
const deployer2PrivateKey = process.env.DEPLOYER2_PRIVATE_KEY
const user1PrivateKey = process.env.USER1_PRIVATE_KEY
const user2PrivateKey = process.env.USER2_PRIVATE_KEY
const user3PrivateKey = process.env.USER3_PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    goerli: {
      url: goerli_testnet,
      accounts: [deployerPrivateKey, deployer2PrivateKey, user1PrivateKey, user2PrivateKey, user3PrivateKey]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}