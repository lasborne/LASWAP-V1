// Deploy the Factory contract for the LASWAP exchange
const { ethers } = require('hardhat');

let deployer, factoryContract
module.exports['DeployedFactoryContract'] = {
  deployedFactoryContract: async function deployFactoryContract () {
    [deployer,,,,] = await ethers.getSigners()
    const FactoryContract = await ethers.getContractFactory('Factory', deployer)
    factoryContract = await FactoryContract.deploy()
    await factoryContract.deployed()
    return factoryContract
  }
}