// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {
    NetworkConfig public activeNetworkConfig;

    struct NetworkConfig {
        address linkAddress;
        address wrapperAddress;
        uint32 callbackGasLimit;
        uint16 requestConfirmations;
    }

    constructor() {
        if (block.chainid == 11155111) {
            activeNetworkConfig = getEthereumSepoliaConfig();

            } else if (block.chainid == 84532) {
            activeNetworkConfig = getBaseSepoliaConfig();
        }
    }

    function getEthereumSepoliaConfig() public pure returns (NetworkConfig memory) {
        NetworkConfig memory ethereumSepoliaConfig = NetworkConfig({
            linkAddress: 0x779877A7B0D9E8603169DdbD7836e478b4624789,
            wrapperAddress: 0x195f15F2d49d693cE265b4fB0fdDbE15b1850Cc1,
            callbackGasLimit: 500000,
            requestConfirmations: 3
        });
        return ethereumSepoliaConfig;
    }

    function getBaseSepoliaConfig() public pure returns (NetworkConfig memory) {
        NetworkConfig memory ethereumSepoliaConfig = NetworkConfig({
            linkAddress: 0xE4aB69C077896252FAFBD49EFD26B5D171A32410,
            wrapperAddress: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed,
            callbackGasLimit: 500000,
            requestConfirmations: 3
        });
        return ethereumSepoliaConfig;
    }
}
