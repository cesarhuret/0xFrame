// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import {Executor} from "../src/Executor.sol";


contract SwapDeployer is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();

        Executor executor = new Executor(0xDef1C0ded9bec7F1a1670819833240f027b25EfF);

        console.log(address(executor));
    }
}
