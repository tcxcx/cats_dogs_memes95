// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {
    NetworkConfig public activeNetworkConfig;

    struct NetworkConfig {
        address erc6551Registry;
        address wrapperAddress;
        uint32 callbackGasLimit;
        uint16 requestConfirmations;
    }

    constructor() {
        if (block.chainid == 11155111) {
            activeNetworkConfig = getEthereumSepoliaConfig();
        } else if (block.chainid == 84532) {
            activeNetworkConfig = getBaseSepoliaConfig();
        } else if (block.chainid == 11155420) {
            activeNetworkConfig = getOptimismSepoliaConfig();
        } else if (block.chainid == 421614) {
            activeNetworkConfig = getArbSepoliaConfig();
        }
    }

    function getEthereumSepoliaConfig() public pure returns (NetworkConfig memory) {
        NetworkConfig memory ethereumSepoliaConfig = NetworkConfig({
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758,
            wrapperAddress: 0x195f15F2d49d693cE265b4fB0fdDbE15b1850Cc1,
            callbackGasLimit: 500000,
            requestConfirmations: 3
        });
        return ethereumSepoliaConfig;
    }

    function getArbSepoliaConfig() public pure returns (NetworkConfig memory) {
        NetworkConfig memory ethereumSepoliaConfig = NetworkConfig({
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758,
            wrapperAddress: 0x195f15F2d49d693cE265b4fB0fdDbE15b1850Cc1,
            callbackGasLimit: 500000,
            requestConfirmations: 3
        });
        return ethereumSepoliaConfig;
    }

    function getOptimismSepoliaConfig() public pure returns (NetworkConfig memory) {
        NetworkConfig memory ethereumSepoliaConfig = NetworkConfig({
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758,
            wrapperAddress: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed, // not supported.
            callbackGasLimit: 500000,
            requestConfirmations: 3
        });
        return ethereumSepoliaConfig;
    }

    function getBaseSepoliaConfig() public pure returns (NetworkConfig memory) {
        NetworkConfig memory ethereumSepoliaConfig = NetworkConfig({
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758,
            wrapperAddress: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed,
            callbackGasLimit: 500000,
            requestConfirmations: 3
        });
        return ethereumSepoliaConfig;
    }
}
