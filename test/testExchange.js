const {expect} = require('chai');
const {ethers} = require('hardhat');
const IERC20 = require("../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json")
const ExchangeABI = require("../artifacts/contracts/Exchange.sol/Exchange.json")

describe('Exchange', () => {
    let deployer, deployer2, user1, user2, user3
    let usdcTokenContract, daiTokenContract, linkTokenContract, wbtcTokenContract
    let exchangeContract, usdcLpContract, daiLpContract, linkLpContract, wbtcLpContract
    let createdExchangeContractUSDC, createdExchangeContractDAI
    let provider = ethers.provider
    let liquidity_, blocktime

    const usdcAddress = "0x3a034FE373B6304f98b7A24A3F21C958946d4075"
    const daiAddress = "0xD77b79BE3e85351fF0cbe78f1B58cf8d1064047C"
    const linkAddress = "0xCBf97FD098dBAc05cEeAD7f01Ea8e2Cf4313b60D"
    const wbtcAddress = "0xD1393E8b49B0f6C68A35e160dE2c0973a34290ee"
    const createdExchangeAddressUSDC = '0xa8C734F3A9a0b5B8dF4824e25E43c1eB8973a619'
    const createdExchangeAddressDAI = '0x389e42C9c693B6272d7e9867c10E885253dC47B3'

    beforeEach(async() => {
        [deployer, deployer2, user1, user2, user3] = await ethers.getSigners()

        createdExchangeContractUSDC = new ethers.Contract(
            createdExchangeAddressUSDC, ExchangeABI.abi, provider
        )
        createdExchangeContractDAI = new ethers.Contract(
            createdExchangeAddressDAI, ExchangeABI.abi, provider
        )
        usdcTokenContract = new ethers.Contract(usdcAddress, IERC20.abi, provider)
        daiTokenContract = new ethers.Contract(daiAddress, IERC20.abi, provider)
    })

    describe('Ensures that there is exchange of tokens and liquidity', () => {
        it('adds liquidity to the USDC pool', async() => {

            blocktime = (await ethers.provider.getBlock('latest')).timestamp

            // Approves the contract to spend the USDC tokens on behalf of the user
            /*await usdcTokenContract.connect(deployer).functions.approve(
                createdExchangeAddressUSDC, ethers.utils.parseEther('1000')
            )
            // Add liquidity to the USDC/ETH pool by the deployer
            await createdExchangeContractUSDC.connect(deployer).functions.addLiquidity(
                ethers.utils.parseUnits('0.1', 'gwei'), (blocktime + 1000), {
                    value: ethers.utils.parseEther('0.005'), gasLimit: 6700000,
                    gasPrice: await ethers.provider.getGasPrice()
                }
            )*/
            /*expect((await createdExchangeContractUSDC.connect(deployer).functions.addLiquidity(
                ethers.utils.parseUnits('0.1', 'gwei'), (blocktime + 1000), {
                    value: ethers.utils.parseEther('0.005'), gasLimit: 6700000,
                    gasPrice: await ethers.provider.getGasPrice()
                }
            ))).to.emit(createdExchangeContractUSDC, "LiquidityAdded").withArgs((10**-8), 0.05, 0.05)*/
        }),
        it('allows a user to exchange their USDC tokens for Eth', async() => {
            blocktime = (await provider.getBlock('latest')).timestamp
            // Approve user1 spending USDC tokens by the exchangeUSDC contract
            await usdcTokenContract.connect(user1).functions.approve(
                createdExchangeAddressUSDC, ethers.utils.parseEther('20')
            )
            // Exchange the user USDC tokens for Eth from the USDC/ETH Liquidity pool
            await createdExchangeContractUSDC.connect(user1).functions.tokenToEthSwap(
                ethers.utils.parseUnits('0.00005', 'gwei'), ethers.utils.parseEther('0.0000001'), 
                (blocktime + 1000), {
                    gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )
        }),
        it('allows a user to exchange their Eth for USDC tokens', async() => {
            /*blocktime = (await provider.getBlock('latest')).timestamp
            // Exchange the user Eth for USDC tokens from the USDC/ETH Liquidity pool
            await createdExchangeContractUSDC.connect(user1).functions.ethToTokenSwap(
                ethers.utils.parseUnits('0.0000001', 'gwei'), (blocktime + 1000), {
                    value: ethers.utils.parseEther('0.00002'), gasLimit: 6700000,
                    gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )*/
        }),
        it('removes liquidity from the USDC/ETH pool', async() => {
            /*blocktime = (await provider.getBlock('latest')).timestamp
            // Remove liquidity from the USDC/ETH pool
            await createdExchangeContractUSDC.connect(deployer).functions.removeLiquidity(
                ethers.utils.parseEther('0.001'), ethers.utils.parseEther('0.000001'),
                ethers.utils.parseUnits('0.0001', 'gwei'), (blocktime + 100000), {
                    gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )*/
        }),
        it('permits the adding of Liquidity to the DAI pool', async() => {
            /*blocktime = (await provider.getBlock('latest')).timestamp
            // Approves the contract to spend the USDC tokens on behalf of the user
            await daiTokenContract.connect(deployer).functions.approve(
                createdExchangeAddressDAI, ethers.utils.parseEther('1000')
            )
            // Add liquidity to the DAI/ETH pool by the deployer
            await createdExchangeContractDAI.connect(deployer).functions.addLiquidity(
                ethers.utils.parseEther('20'), (blocktime+1000), {value: ethers.utils.parseEther('0.01'),
                gasLimit: 6700000, gasPrice: await ethers.provider.getGasPrice()
            })*/
        }),
        it('allows a user to exchange their DAI tokens for Eth', async() => {
            /*blocktime = (await provider.getBlock('latest')).timestamp
            // Approve user1 spending DAI tokens by the exchangeDAI contract
            await daiTokenContract.connect(user1).functions.approve(
                createdExchangeAddressDAI, ethers.utils.parseEther('20')
            )
            // Exchange the user DAI tokens for Eth from the DAI/ETH Liquidity pool
            await createdExchangeContractDAI.connect(user1).functions.tokenToEthSwap(
                ethers.utils.parseEther('0.2'), ethers.utils.parseEther('0.000004'), 
                (blocktime + 1000), {
                    gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )*/
        }),
        it('allows a user to exchange their ETH tokens for DAI', async() => {
           /* blocktime = (await provider.getBlock('latest')).timestamp
            // Exchange the user Eth for DAI tokens from the DAI/ETH Liquidity pool
            await createdExchangeContractDAI.connect(user1).functions.ethToTokenSwap(
                ethers.utils.parseEther('0.025'), (blocktime + 1000), {
                    value: ethers.utils.parseEther('0.00004'), gasLimit: 6700000,
                    gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )*/
        }),
        it('allows a user to swap their DAI tokens for USDC tokens', async() => {
            blocktime = (await provider.getBlock('latest')).timestamp
            // Approve user1 spending DAI tokens by the exchangeDAI contract
            /*await daiTokenContract.connect(user1).functions.approve(
                createdExchangeAddressDAI, ethers.utils.parseEther('20')
            )
            // Exchange the user DAI tokens for Eth from the DAI/ETH Liquidity pool
            await createdExchangeContractDAI.connect(user1).functions.tokenToTokenSwap(
                ethers.utils.parseEther('0.2'), ethers.utils.parseEther('0.000002'),
                ethers.utils.parseUnits('0.00001', 'gwei'), (blocktime + 10000),
                ('0x3a034FE373B6304f98b7A24A3F21C958946d4075'), createdExchangeAddressUSDC, {
                    gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )*/
        }),
        it('allows a user to swap their USDC tokens for DAI tokens', async() => {
            blocktime = (await provider.getBlock('latest')).timestamp
            // Approve user1 spending USDC tokens by the exchangeUSDC contract
            /*await usdcTokenContract.connect(user1).functions.approve(
                createdExchangeAddressUSDC, ethers.utils.parseEther('20')
            )
            // Exchange the user DAI tokens for Eth from the DAI/ETH Liquidity pool
            await createdExchangeContractUSDC.connect(user1).functions.tokenToTokenSwap(
                ethers.utils.parseUnits('0.0001', 'gwei'), ethers.utils.parseEther('0.0000002'),
                ethers.utils.parseUnits('0.0000001', 'gwei'), (blocktime + 10000),
                ('0xD77b79BE3e85351fF0cbe78f1B58cf8d1064047C'), createdExchangeAddressDAI, {
                    gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )*/
        })
        it('removes liquidity from the DAI/ETH pool', async() => {
            /*blocktime = (await provider.getBlock('latest')).timestamp
            // Remove liquidity from the DAI/ETH pool
            await createdExchangeContractDAI.connect(deployer).functions.removeLiquidity(
                ethers.utils.parseEther('0.01'), ethers.utils.parseEther('0.00000007'),
                ethers.utils.parseEther('0.008'), (blocktime + 100000), {
                    gasLimit: 6700000, gasPrice: Number(await ethers.provider.getGasPrice())
                }
            )*/
        })
    })
})