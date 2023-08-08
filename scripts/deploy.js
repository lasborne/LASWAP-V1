
const { ethers } = require('hardhat');

const FactoryContract = require('./deployFactory.js')
const FactoryABI = require("../artifacts/contracts/Factory.sol/Factory.json")
const factoryDeployContractAddress = '0x6EfeAAA6C73C96a1dF80d23eF990Fd85B25604B3'

// Exchange address for token/Eth pairs
const factoryContractAddressUSDC = '0xa8C734F3A9a0b5B8dF4824e25E43c1eB8973a619'
const factoryContractAddressDAI = '0x389e42C9c693B6272d7e9867c10E885253dC47B3'

/// addresses of tokens on Goerli network
const usdcAddress = '0x3a034FE373B6304f98b7A24A3F21C958946d4075'
const daiAddress = '0xD77b79BE3e85351fF0cbe78f1B58cf8d1064047C'
const linkAddress = '0xCBf97FD098dBAc05cEeAD7f01Ea8e2Cf4313b60D'
const wbtcAddress = '0xD1393E8b49B0f6C68A35e160dE2c0973a34290ee'

let deployExchange = {

    // Deploy the factory contract once.
    deployFactoryContract: async function deployFactoryContractOnce () {
        await FactoryContract.DeployedFactoryContract.deployedFactoryContract()
    },
    // Create any exchange Token/Eth pair
    createExchangeUSDC: async function createdExchangeUSDC() {
        let [deployer,,,,] = await ethers.getSigners()
        let provider = ethers.provider
        let factoryContract = new ethers.Contract(factoryDeployContractAddress, FactoryABI.abi, provider)
        const factoryContractUSDC = await factoryContract.connect(deployer).functions.createExchange(
            usdcAddress, {gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())})
        console.log((await factoryContractUSDC))
    },
    createExchangeDAI: async function createdExchangeDAI() {
        let [deployer,,,,] = await ethers.getSigners()
        let provider = ethers.provider
        let factoryContract = new ethers.Contract(factoryDeployContractAddress, FactoryABI.abi, provider)
        const factoryContractDAI = await factoryContract.connect(deployer).functions.createExchange(
            daiAddress, {gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())})
        console.log((await factoryContractDAI))
    }
}

Main = async() => {
    //await deployExchange.deployFactoryContract()
    //await deployExchange.createExchangeUSDC()
    //await deployExchange.createExchangeDAI()
}
Main()