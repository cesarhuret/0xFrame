// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { IERC20 } from "./IERC20.sol";
import { CCIP } from "./ccip.sol";

// A partial WETH interfaec.
interface IWETH is IERC20 {
    function deposit() external payable;
}

contract Executor is CCIP {
    uint256 public constant MAX_UINT = 2**256 - 1;

    // 0x ExchangeProxy address.
    // See https://docs.0x.org/developer-resources/contract-addresses
    address public exchangeProxy;

    event BoughtTokens(IERC20 sellToken, IERC20 buyToken, uint256 boughtAmount);
    
    error InvalidETHTransfer();

    constructor(address _exchangeProxy, address router) CCIP(router) {
        exchangeProxy = _exchangeProxy;
    }
    
    // Swaps ERC20->ERC20 tokens held by this contract using a 0x-API quote.
    function fillQuote(
        // The `sellTokenAddress` field from the API response.
        IERC20 sellToken,

        uint256 sellAmount,
        // The `buyTokenAddress` field from the API response.
        IERC20 buyToken,
        // The `allowanceTarget` field from the API response.
        address spender,
        // The `to` field from the API response.
        address payable swapTarget,
        // The `data` field from the API response.
        bytes calldata swapCallData
    )
        public
        payable // Must attach ETH equal to the `value` field from the API response.
        returns (uint256)
    {
        // Checks that the swapTarget is actually the address of 0x ExchangeProxy
        require(swapTarget == exchangeProxy, "Target not ExchangeProxy");

        if(address(sellToken) != 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) {
            require(
                sellToken.transferFrom(msg.sender, address(this), sellAmount),
                "ETH_TRANSFER_FAILED"
            );
            require(sellToken.approve(spender, uint256(2 ** 256 - 1)));
        }

        // Track our balance of the buyToken to determine how much we've bought.
        uint256 boughtAmount = buyToken.balanceOf(address(this));

        // Give `spender` an infinite allowance to spend this contract's `sellToken`.
        // Note that for some tokens (e.g., USDT, KNC), you must first reset any existing
        // allowance to 0 before being able to update it.
        // Call the encoded swap function call on the contract at `swapTarget`,
        // passing along any ETH attached to this function call to cover protocol fees.
        (bool success,) = swapTarget.call{value: msg.value}(swapCallData);
        require(success, 'SWAP_CALL_FAILED');
        // Refund any unspent protocol fees to the sender.

        // Use our current buyToken balance to determine how much we've bought.
        boughtAmount = buyToken.balanceOf(address(this)) - boughtAmount;
        emit BoughtTokens(sellToken, buyToken, boughtAmount);
        return boughtAmount;
    }

    function exec(
        bool isSwap,
        
        IERC20 sellToken,
        // The `sellAmount` that the user wants to sell.
        uint256 sellAmount,
        // The `buyTokenAddress` field from the API response.
        IERC20 buyToken,
        // The `allowanceTarget` field from the API response.
        address spender,
    
        uint256 buyAmount,

        // The `to` field from the API response.
        address payable swapTarget,
        // The `data` field from the API response.
        bytes calldata swapCallData,
        
        // BridgeArgs calldata bridgeArgs
        
        bool isBridge,
        
        uint64 destinationChainSelector

    ) public payable {

        if (isSwap) {
            buyAmount = fillQuote(
                sellToken,
                sellAmount,
                buyToken,
                spender,
                swapTarget,
                swapCallData
            );
        } else {
            buyToken.transferFrom(msg.sender, address(this), buyAmount);
        }

        if(isBridge) {
            bridge(
                destinationChainSelector,
                msg.sender,
                address(buyToken),
                buyAmount
            );
        } else {
            buyToken.transfer(msg.sender, buyToken.balanceOf(address(this)));
        }
        
        payable(msg.sender).transfer(address(this).balance);
    }
}
