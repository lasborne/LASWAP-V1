// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import 'hardhat/console.sol';

/**
 * @notice Factory interface
 */

interface IFactory {
    function tokenToExchange(address _tokenAddr) external returns (address);
}

/**
 * @author Lasborne
 * @notice This contract is a clone after Uniswap V1 using Solidity (instead of Vyper)
 * @dev The contract is ERC20 to implement LP tokens
 */
contract Exchange is ERC20 {
    /// Library safeMath for safely handling basic maths
    using SafeMath for uint256;

    /// @notice Interface for the token
    IERC20 public token;

    /// @notice Factory contract that deploys the Exchange
    IFactory public factory;

    /// @notice Event for liquidity added
    event LiquidityAdded(uint256 tokenAmount, uint256 ethAmount, uint256 lpTokens);
    /// @notice Event for liquidity removed
    event LiquidityRemoved(uint256 tokenAmount, uint256 ethAmount);
    /// @notice Event for swapping 2 tokens
    event TokenToToken(uint256 amountToken1, uint256 amountToken2);
    /// @notice Event for purchasing tokens
    event TokenBought(address buyer, uint256 ethSold, uint256 tokenBought);
    /// @notice Event for purchasing Eth
    event EthBought(address buyer, uint256 tokenSold, uint256 ethBought);
    /// @notice Error triggered when or if the liquidity added in Eth or tokens is zero
    error InvalidLiquidityProportion();
    /// @notice Error triggered when or if the current timestamp is above the deadline time
    error DeadlineReached();
    /// @notice Error triggered when or if reserves are 0
    error InvalidReserves();
    /// @notice Error triggered when the user request tokens for 0 or less eth
    error InvalidEthAmountSold();
    /// @notice Error triggered when the user minimum Eth bought is 0 or less eth
    error InvalidEthAmountBought();
    /// @notice Error triggered when the user minimum tokens bought is 0 or less
    error InvalidTokenAmountBought();
    /// @notice Error triggered when the user request eth for 0 or less tokens
    error InvalidTokenAmountSold();
    /// @notice Error triggered when the output token/eth is less than the minimum amount settled by user
    error InsufficientOutputAmount();
    /// @notice Error triggered when the user sends less tokens than is required by the exchange ratio
    error InsufficientTokenAmount();
    /// @notice Error triggered when the user request 0 LP
    error InvalidAmountToRemove();
    /// #notice Error triggered when the address of token is address 0
    error InvalidTokenAddress();
    /// @notice Error triggered when the address of the exchange is 0 or address(this)
    error InvalidExchangeAddress();
    /// @notice Error triggered when the token sold to eth is less than 0
    error InsufficientTokenSold();

    constructor(IERC20 _token) ERC20("LASWAPlp", "LASlp") {
        // revert address 0
        if (_token == IERC20(address(0))) {
            revert InvalidTokenAddress();
        }
        token = _token;
        factory = IFactory(msg.sender);
    }

    /**
     * @notice Add liquidity by paying eth and transfering tokens to the exchange and minting LASWAPLP
     * @param _tokenAmount represents the amount of tokens transfered
     * @dev When somebody adds liquidity, they get LP tokens
     * @dev If the exchange has a ration of token/eth then the amount of tokens/eth added should respect it
     */
    function addLiquidity(uint256 _tokenAmount, uint256 deadline) external payable returns (uint256) {
        if (block.timestamp >= deadline) {
            revert DeadlineReached();
        }
        if (msg.value == 0 || _tokenAmount == 0) {
            revert InvalidLiquidityProportion();
        }
        if (getTokenSupply() == 0) {
            assert(address(factory) != address(0));
            token.transferFrom(msg.sender, address(this), _tokenAmount);
            uint256 liquidity = address(this).balance;
            emit LiquidityAdded(_tokenAmount, msg.value, liquidity);
            _mint(msg.sender, liquidity);
            return liquidity;
        } else {
            uint256 ethReserve = address(this).balance.sub(msg.value);
            uint256 tokenReserve = getTokenSupply();
            uint256 necessaryTokenAmount = (tokenReserve.mul(msg.value)).div(ethReserve);
            if (necessaryTokenAmount > _tokenAmount) {
                revert InsufficientTokenAmount();
            }
            token.transferFrom(msg.sender, address(this), _tokenAmount);
            uint256 liquidity = (totalSupply().mul(msg.value)).div(ethReserve);
            emit LiquidityAdded(_tokenAmount, msg.value, liquidity);
            _mint(msg.sender, liquidity);
            return liquidity;
        }
    }

    /**
     * @notice Make the swap from eth to token and send tokens to msg.sender
     * @param _minTokens the minimum tokens to be received based on slippage settings
     * @param deadline the time at which transaction is reversed in block time
     */
    function ethToTokenSwap(uint256 _minTokens, uint256 deadline) external payable returns(uint256) {
        if (block.timestamp >= deadline) {
            revert DeadlineReached();
        }
        if (msg.value <= 0) {
            revert InvalidEthAmountSold();
        }
        if (_minTokens <= 0) {
            revert InvalidTokenAmountBought();
        }
        return ethToToken(msg.sender, _minTokens); 
    }

    /**
     * @notice Generic implementation of transferring tokens after eth conversion
     * @param _to the address to send the tokens
     * @param _minTokens the minimum amount of tokens that should be gotten from the swap
     */
    function ethToToken(address _to, uint256 _minTokens) private returns (uint256) {
        uint256 tokenBought = getAmount(msg.value, address(this).balance.sub(msg.value), getTokenSupply());
        if (tokenBought < _minTokens) {
            revert InsufficientOutputAmount();
        }
        token.transfer(_to, tokenBought);
        emit TokenBought(msg.sender, msg.value, tokenBought);
        return tokenBought;
    }

    /**
     * @notice Make the swap from token to eth
     * @param _tokenSold the amount of tokens to swap
     * @param _minEth the minimum amount of Eth to be received based on slippage setting
     * @param deadline maximum block time for which a transaction can be valid
     */
    function tokenToEthSwap(uint256 _tokenSold, uint256 _minEth, uint256 deadline) external returns (uint256) {
        if (block.timestamp >= deadline) {
            revert DeadlineReached();
        }
        if (_tokenSold <= 0) {
            revert InvalidTokenAmountSold();
        }
        uint256 ethBought = getAmount(_tokenSold, getTokenSupply(), address(this).balance);
        if (ethBought < _minEth || _minEth == 0) {
            revert InsufficientOutputAmount();
        } else {
            token.transferFrom(msg.sender, address(this), _tokenSold);
            payable(msg.sender).transfer(ethBought);
            emit EthBought(msg.sender, _tokenSold, ethBought);
            return ethBought;
        }
    }

    /**
     * @notice Make the swap from token1 to token2
     * @param _tokenSold the amount of token1 to change
     * @param _minEthBought the minimum amount of Eth that is to be bought for swapping to token2
     * @param _minTokensBought the minimum amount of tokens that is bought using the Eth and calling token2/Eth LP
     * @param deadline the maximum block time for which transactions are valid
     * @param _tokenAddress address of token2
     * @param _exchangeAddress address of the token2/Eth LP
     * @dev Token1 is converted in eth, and then eth is converted to token2
     */
    function tokenToTokenSwap(
        uint256 _tokenSold, uint256 _minEthBought, uint256 _minTokensBought,
        uint256 deadline, address _tokenAddress, address _exchangeAddress
    ) external returns(uint256) {
        if (block.timestamp >= deadline) {
            revert DeadlineReached();
        }
        if (_tokenSold <= 0) {
            revert InvalidTokenAmountSold();
        }
        if (_minEthBought <= 0 || _minTokensBought <= 0) {
            revert InvalidTokenAmountBought();
        }
        address exchangeAddress = factory.tokenToExchange(_tokenAddress);
        if (_exchangeAddress == address(this) || _exchangeAddress == address(0) || exchangeAddress != _exchangeAddress) {
            revert InvalidExchangeAddress();
        }
        // Calculate Eth and token contract balance of tokenBought
        uint256 _ethBought = getAmount(_tokenSold, getTokenSupply(), address(this).balance);
        token.transferFrom(msg.sender, address(this), _tokenSold);

        uint256 tokenBought = Exchange(_exchangeAddress).ethToTokenTransfer{ value: _ethBought }(
            msg.sender, _minTokensBought, deadline
        );
        emit TokenToToken(_tokenSold, tokenBought);
        return tokenBought;
    }

    /**
     * @notice Cash in an amount of LP from exchange
     * @param _amount the amount of LP
     * @dev LP are burned, and tokens and eth are transferred
     */
    function removeLiquidity(
        uint256 _amount, uint256 _minEth,
        uint256 _minTokens, uint256 deadline
    ) public returns (uint256, uint256) {
        if (_amount <= 0) {
            revert InvalidAmountToRemove();
        }
        if (block.timestamp >= deadline) {
            revert DeadlineReached();
        }
        if (_minEth <= 0 || _minTokens <= 0) {
            revert InvalidAmountToRemove();
        }
        if (totalSupply() <= 0) {
            revert InvalidAmountToRemove();
        }
        uint256 ethAmount = (address(this).balance.mul(_amount)).div(totalSupply());
        uint256 tokenAmount = (getTokenSupply().mul(_amount)).div(totalSupply());
        if (ethAmount < _minEth || tokenAmount <= _minTokens) {
            revert InsufficientOutputAmount();
        }
        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        token.transfer(msg.sender, tokenAmount);
        emit LiquidityRemoved(tokenAmount, ethAmount);
        return (ethAmount, tokenAmount);
    }

    /**
     * @notice Make the swap from eth to token and send tokens to an address
     * @param _minTokens the minimum amount of tokens that should be gotten from the swap
     */
    function ethToTokenTransfer(
        address _to, uint256 _minTokens, uint256 deadline
    ) external payable returns(uint256) {
        if (block.timestamp >= deadline) {
            revert DeadlineReached();
        }
        return ethToToken(_to, _minTokens);
    }

    /**
     * @notice Get the output amount of the swap
     * @param _inputAmount the amount of what you want to sell = ∆x
     * @param _inputReserve the total amount of the token own by the exchange that you want to sell = x
     * @param _outputReserve the total amount of the token own by the exchange that you want to buy = y
     * @dev Base Formula without fee : ∆y = ( y * ∆x) / ( x + ∆x ), where ∆y = the amount that you get when swapping
     * @dev Fee: amountWithFee = (∆x - fee) / 1000
     * @dev Formula with Fee: ∆y = (y * ∆x * 998) / (x * 1000 + ∆x * 998), fee = 0.2%
     * @dev Where numerator = (y * ∆x * 998)
     * @dev Where denominator = (x * 1000 + ∆x * 998)
     */
    function getAmount(
        uint256 _inputAmount, uint256 _inputReserve, uint256 _outputReserve
    ) private pure returns (uint256) {
        if (_inputReserve <= 0 && _outputReserve <= 0) {
            revert InvalidReserves();
        }
        uint256 inputAmountWithFee = _inputAmount * 998;
        uint256 numerator = inputAmountWithFee * _outputReserve;
        uint256 denominator = (_inputReserve * 1000) + inputAmountWithFee;
        return numerator.div(denominator);
    }

    /**
     * @notice Get the token amount when selling eth
     * @param _ethSold the amount eth sold
     */
    function getTokenAmount(uint256 _ethSold) external view returns (uint256) {
        if (_ethSold <= 0) {
            revert InvalidEthAmountSold();
        }
        return getAmount(_ethSold, address(this).balance, getTokenSupply());
    }

    /**
     * @notice Get the amount of tokens owned by exchange
     */
    function getTokenSupply() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /**
     * @notice Returns the price depending of reserves of the exchange
     */
    function getPrice(uint256 _inputReserve, uint256 _outputReserve) public pure returns (uint256) {
        if (_inputReserve <= 0 || _outputReserve <= 0) {
            revert InvalidReserves();
        }
        return (_inputReserve * 1000) / _outputReserve;
    }

    /**
     * @notice Get the eth amount when selling tokens
     * @param _tokenSold the amount of tokens sold
     */
    function getEthAmount(uint256 _tokenSold) external view returns (uint256) {
        if (_tokenSold <= 0) {
            revert InvalidTokenAmountSold();
        }
        return getAmount(_tokenSold, getTokenSupply(), address(this).balance);
    }
}