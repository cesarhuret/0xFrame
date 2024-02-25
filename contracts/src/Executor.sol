// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { IERC20 } from "./IERC20.sol";

// A partial WETH interfaec.
interface IWETH is IERC20 {
    function deposit() external payable;
}

    
contract Executor {
    uint256 public number;

    uint256 public constant MAX_UINT = 2**256 - 1;

    // Creator of this contract.
    address public owner;
    // 0x ExchangeProxy address.
    // See https://docs.0x.org/developer-resources/contract-addresses
    address public exchangeProxy;

    event BoughtTokens(IERC20 sellToken, IERC20 buyToken, uint256 boughtAmount);

    struct SwapArgs {
        IERC20 sellToken;
        // The `sellAmount` that the user wants to sell.
        uint256 sellAmount;
        // The `buyTokenAddress` field from the API response.
        IERC20 buyToken;
        // The `allowanceTarget` field from the API response.
        address spender;
        // The `to` field from the API response.
        address payable swapTarget;
        // The `data` field from the API response.
        bytes swapCallData;
    }

    struct BridgeArgs {
        IERC20 token;
        uint256 amount;
        address to;
        uint256 chainId;
    }

    constructor(address _exchangeProxy) {
        exchangeProxy = _exchangeProxy;
        owner = msg.sender;
    }


    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

        // Swaps ERC20->ERC20 tokens held by this contract using a 0x-API quote.
    function swap(
        // The `sellTokenAddress` field from the API response.
        IERC20 sellToken,
        // The `sellAmount` that the user wants to sell.
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
        private
        returns (uint256)
    {
        // Checks that the swapTarget is actually the address of 0x ExchangeProxy
        require(swapTarget == exchangeProxy, "Target not ExchangeProxy");

        sellToken.transferFrom(msg.sender, address(this), sellAmount);

        // Track our balance of the buyToken to determine how much we've bought.
        uint256 boughtAmount = buyToken.balanceOf(address(this));

        // Give `spender` an infinite allowance to spend this contract's `sellToken`.
        // Note that for some tokens (e.g., USDT, KNC), you must first reset any existing
        // allowance to 0 before being able to update it.
        require(sellToken.approve(spender, MAX_UINT));
        // Call the encoded swap function call on the contract at `swapTarget`,
        // passing along any ETH attached to this function call to cover protocol fees.
        (bool success,) = swapTarget.call{value: msg.value}(swapCallData);
        require(success, 'SWAP_CALL_FAILED');
        // Refund any unspent protocol fees to the sender.
        payable(msg.sender).transfer(address(this).balance);

        // Use our current buyToken balance to determine how much we've bought.
        boughtAmount = buyToken.balanceOf(address(this)) - boughtAmount;
        emit BoughtTokens(sellToken, buyToken, boughtAmount);

        return boughtAmount;
    }

    function exec(
        bool isSwap,
        SwapArgs calldata swapArgs
        // bool isBridge,
        // BridgeArgs calldata bridgeArgs
    ) public payable {

        uint256 boughtAmount;

        if (isSwap) {
            boughtAmount = swap(
                swapArgs.sellToken,
                swapArgs.sellAmount,
                swapArgs.buyToken,
                swapArgs.spender,
                swapArgs.swapTarget,
                swapArgs.swapCallData
            );
        }

        // if (isBridge) {

        //     if(isSwap) {
        //         require(SwapArgs.buyToken == BridgeArgs.token);
        //     }

        //     bridge(
        //         BridgeArgs.token,
        //         BridgeArgs.amount,
        //         BridgeArgs.to,
        //         BridgeArgs.chainId
        //     );
        // } else if(isSwap) {
        //     swapArgs.buyToken.transferFrom(msg.sender, address(this), boughtAmount);
        // }

    }


    receive() external payable {}
}
