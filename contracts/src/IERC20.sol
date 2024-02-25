// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


// A partial ERC20 interface.
interface IERC20 {
    function balanceOf(address owner) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}