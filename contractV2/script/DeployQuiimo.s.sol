// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {Quiimo} from "../src/PlatformToken.sol";

contract DeployQuiimo is Script {
    function run() external returns (Quiimo) {
        // Get the deployer address from environment variable
        address deployer = vm.envAddress("0xA17F2Eff7B4cB12AD2582B4ac40C0516749f05F6");
        
        vm.startBroadcast(vm.envUint("7c51d865bfb80de7782d1cd2866799ee12c7efb6e063f96d203c0e9a55dbaeb1"));
        Quiimo quiimo = new Quiimo(deployer);
        vm.stopBroadcast();
        
        return quiimo;
    }
}