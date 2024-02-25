// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import {Token} from "../src/Token.sol";

contract TokenFactory is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();

        Token token = new Token("Test Token", "TT", msg.sender);

        console.log(address(token));
    }
}
