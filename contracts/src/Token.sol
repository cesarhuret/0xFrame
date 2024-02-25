// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(string memory name, string memory symbol,  address receiver) ERC20(name, symbol) {
        _mint(receiver, 1000000000000000000000000);
    }

    function claim() public {
        _mint(msg.sender, 10 ** 18);
    }

    function deposit() public {
        _burn(msg.sender, 10 ** 18);
    }
}