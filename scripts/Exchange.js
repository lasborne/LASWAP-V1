/** LASWAP EXCHANGE SCRIPT 
 * Performs all exchange tasks
 * Go to Main() and edit according to need
 * Example: await Exchange.removeLiquidity(...)
*/

const { ethers } = require('hardhat');
const IERC20 = require("../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json")
const ExchangeABI = require("../artifacts/contracts/Exchange.sol/Exchange.json")
const FactoryABI = require("../artifacts/contracts/Factory.sol/Factory.json")

// Contract address for the LASWAP factory and contract address for Token/Eth pairs.
const factoryDeployContractAddress = '0x6EfeAAA6C73C96a1dF80d23eF990Fd85B25604B3'
const factoryContractAddressUSDC = '0xa8C734F3A9a0b5B8dF4824e25E43c1eB8973a619'
const factoryContractAddressDAI = '0x389e42C9c693B6272d7e9867c10E885253dC47B3'
const factoryContractAddressLINK = '0x1A84E1dD6076013454c75Efe4f23987DaA340fcb'

/// addresses of tokens on Goerli network
const usdcAddress = '0x3a034FE373B6304f98b7A24A3F21C958946d4075'
const daiAddress = '0xD77b79BE3e85351fF0cbe78f1B58cf8d1064047C'
const linkAddress = '0xCBf97FD098dBAc05cEeAD7f01Ea8e2Cf4313b60D'
const wbtcAddress = '0xD1393E8b49B0f6C68A35e160dE2c0973a34290ee'

// signers
let deployer, deployer2, user1, user2, user3
// Contracts
let usdcTokenContract, daiTokenContract, linkTokenContract, wbtcTokenContract
let exchangeContract, usdcLpContract, daiLpContract, linkLpContract, wbtcLpContract
let createdExchangeContractUSDC, createdExchangeContractDAI
// provider
let provider = ethers.provider
let liquidity_, blocktime

let Exchange = {
    // Function that returns all the signers
    load: async function loadTools() {
        [deployer, deployer2, user1, user2, user3] = await ethers.getSigners()
        createdExchangeContractUSDC = new ethers.Contract(
            factoryContractAddressUSDC, ExchangeABI.abi, provider
        )
        createdExchangeContractDAI = new ethers.Contract(
            factoryContractAddressDAI, ExchangeABI.abi, provider
        )
        usdcTokenContract = new ethers.Contract(usdcAddress, IERC20.abi, provider)
        daiTokenContract = new ethers.Contract(daiAddress, IERC20.abi, provider)
        return [deployer, deployer2, user1, user2, user3]
    },
    // This function creates a Token/Eth pair
    createFactoryPair: async function createFactoryPairFunction(approver, tokenAddr) {
        try {
            let createFactoryTokenContract = new ethers.Contract(
                factoryDeployContractAddress, FactoryABI.abi, provider
            )
            let createdFactoryContractAddress
            createdFactoryContractAddress = await createFactoryTokenContract.connect(
                approver).functions.createExchange(tokenAddr, {
                    gasLimit: 6700000, gasPrice: await ethers.provider.getGasPrice()
                }
            )
            return createdFactoryContractAddress
        } catch (err) {
            console.log("Error: \n" + err.toString())
        }
    },
    // This function returns the block time as of whenever called.
    deadline: async function deadLineFunction() {
        return Number((await provider.getBlock('latest')).timestamp)
    },
    // This function returns an exchange contract given the exchange's contract address
    factoryTokenContract: async function factoryTokenContractFunction(address) {
        return (new ethers.Contract(address, ExchangeABI.abi, provider));
    },
    // This function returns a token contract given the token's contract address
    tokenContract: async function tokenContractFunction(tokenAddress) {
        return (new ethers.Contract(tokenAddress, IERC20.abi, provider));
    },
    // This function enables the user/signer approve the exchange contract to spend their tokens
    approve: async function approveToken(tokenAddr, approver, factoryTokenAddress, amount) {
        try {
            // Approves the contract to spend the USDC tokens on behalf of the user
            let tokenCon = await this.tokenContract(tokenAddr);
            await tokenCon.connect(approver).functions.approve(
                factoryTokenAddress, ethers.utils.parseEther(amount.toString())
            )
        } catch (err) {
            console.log('error \n' + err.toString())
        }
    },
    // This function enables users/signers to add liquidity to any available pool.
    addLiquidity: async function addLiquidityToPool(
        factoryTokenAddr, approver, tokenAmount, ethAmount) {
        try {
            // Add liquidity to the .../ETH pool by the deployer
            let factoryTokenCon = await this.factoryTokenContract(factoryTokenAddr)
            await factoryTokenCon.connect(approver).functions.addLiquidity(
                ethers.utils.parseEther(tokenAmount), ((await this.deadline()) + 10000), {
                    value: ethers.utils.parseEther(ethAmount), gasLimit: 6700000,
                    gasPrice: await ethers.provider.getGasPrice()
                }
            )
        } catch (err) {
            console.log('error \n' + err.toString())
        }
    },
    // This function enables the user/signer to swap tokens for Eth.
    tokenToEthSwap: async function tokenToEthSwapFunction(
        factoryTokenAddr, approver, tokenSold, minEth
    ) {
        try {
            // Exchange the user tokens for Eth from the token/ETH Liquidity pool
            let factoryTokenCon = await this.factoryTokenContract(factoryTokenAddr)
            await (factoryTokenCon).connect(approver).functions.tokenToEthSwap(
                ethers.utils.parseEther(tokenSold.toString()), ethers.utils.parseEther(minEth.toString()), 
                ((await this.deadline()) + 10000), {
                    gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )
        } catch (err) {
            console.log(err);
        }
    },
    // This function enables the user/signer to swap Eth for Tokens.
    ethToTokenSwap: async function ethToTokenSwapFunction (
        factoryTokenAddr, approver, minTokens, ethAmount
    ) {
        try {
            // Exchange the user Eth for Tokens from the Token/ETH Liquidity pool
            let factoryTokenCon = await this.factoryTokenContract(factoryTokenAddr)
            await factoryTokenCon.connect(approver).functions.ethToTokenSwap(
                ethers.utils.parseEther(minTokens.toString()), ((await this.deadline()) + 10000), {
                    value: ethers.utils.parseEther(ethAmount.toString()), gasLimit: 6700000,
                    gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )
        } catch (err) {
            console.log(err)
        }
    },
    // This function enables the user/signer to swap token1 for token2.
    tokenToTokenSwap: async function tokenToTokenSwapFunction(
        factoryTokenAddr, approver, tokenSold, minEthBought, minTokensBought,
        token2Address, factoryToken2ContractAddress
    ) {
        try {
            // Exchange the user token for another token by swapping token1 first for Eth, then, swapping
            // Eth for token2 in the style of Uniswap V1 (Both token1/Eth & token2/Eth must have liquidity).
            let factoryTokenCon = await this.factoryTokenContract(factoryTokenAddr)
            await factoryTokenCon.connect(approver).functions.tokenToTokenSwap(
                ethers.utils.parseEther(tokenSold.toString()), ethers.utils.parseEther(minEthBought.toString()),
                ethers.utils.parseEther(minTokensBought.toString()), ((await this.deadline()) + 10000),
                token2Address, factoryToken2ContractAddress, {
                    gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )
        } catch (err) {
            console.log(err);
        }
    },
    // This function removes user/signer's liquidity in form of Tokens and Eth.
    removeLiquidity: async function removeLiquidityFunction(
        factoryTokenAddr, approver, amount, minEth, minTokens
    ) {
        try {
            // Remove liquidity from the token/ETH pool
            let factoryTokenCon = await this.factoryTokenContract(factoryTokenAddr)
            await factoryTokenCon.connect(approver).functions.removeLiquidity(
                ethers.utils.parseEther(amount.toString()), ethers.utils.parseEther(minEth.toString()),
                ethers.utils.parseEther(minTokens.toString()), ((await this.deadline()) + 100000), {
                    gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )
        } catch (err) {
            console.log("Error is:\n" + err.toString())
        }
    },
}

Main = async() => {
    /*let user1Signer = (await Exchange.load())[2]
    await Exchange.approve(linkAddress, user1Signer, factoryContractAddressLINK,
        ethers.utils.parseEther('100')
    )
    console.log(await (await Exchange.tokenContract(linkAddress)).balanceOf(user1Signer.address))
    console.log(await (await Exchange.tokenContract(daiAddress)).balanceOf(user1Signer.address))
    await Exchange.tokenToTokenSwap(factoryContractAddressLINK, user1Signer,
        ('0.005'), '0.000001', ('0.01'), daiAddress, factoryContractAddressDAI
    )
    console.log(await (await Exchange.tokenContract(usdcAddress)).balanceOf(user1Signer.address))
    console.log(await (await Exchange.tokenContract(daiAddress)).balanceOf(user1Signer.address))*/
    
    let deployer = (await Exchange.load())[0]
    await Exchange.removeLiquidity(factoryContractAddressLINK, deployer, '0.0008', '0.0000005', '0.0005')
    
    //console.log(await (await Exchange.tokenContract(daiAddress)).balanceOf(deployer.address))
    //await deployExchange.deployFactoryContract()
    //await deployExchange.createExchangeUSDC()
    //await deployExchange.createExchangeDAI()
}
Main()