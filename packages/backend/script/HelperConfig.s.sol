// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Script, console} from "forge-std/Script.sol";
import {VRFCoordinatorV2_5Mock} from "../lib/chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol"; 
// import {DeployRegistry} from "./DeployERC6551Registry.s.sol";  
import "@openzeppelin/contracts/utils/Create2.sol";

import "../lib/reference/src/ERC6551Registry.sol";

import {DeployRegistry} from "../lib/reference/script/DeployRegistry.s.sol"; 


// needed to set up Chainlink VRF testing 
import {MockLinkToken} from "../lib/chainlink/contracts/src/v0.8/mocks/MockLinkToken.sol";
import {MockV3Aggregator} from "../lib/chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";
import {ExposedVRFCoordinatorV2_5_Arbitrum} from "../lib/chainlink/contracts/src/v0.8/vrf/dev/testhelpers/ExposedVRFCoordinatorV2_5_Arbitrum.sol";
import {VRFV2PlusWrapper_Arbitrum} from "../lib/chainlink/contracts/src/v0.8/vrf/dev/VRFV2PlusWrapper_Arbitrum.sol";
import {ArbGasInfo} from "../lib/chainlink/contracts/src/v0.8/vendor/@arbitrum/nitro-contracts/src/precompiles/ArbGasInfo.sol";

// NB: this will also deploy Cards, Coins, Game, Actions. Deploying tournament means deploying the protocol. 
contract HelperConfig is Script {
    struct NetworkConfig{     
        address erc6551Registry; 
        address vrfWrapper; 
        uint16 vrfRequestConfirmations;
        uint32 vrfCallbackGasLimit; 
    } 

    NetworkConfig public activeNetworkConfig; 

    constructor() {
        if (block.chainid == 11155111) {
            activeNetworkConfig = getSepoliaEthConfig(); 
        } 
        if (block.chainid == 84532) {
            activeNetworkConfig = getBaseSepoliaEthConfig(); 
        } 
        if (block.chainid == 421614) {
            activeNetworkConfig = getArbSepoliaEthConfig(); 
        } 
        else {
        activeNetworkConfig = getOrCreateAnvilEthConfig(); 
        }
    } 

    function getSepoliaEthConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758, 
            vrfWrapper: 0x195f15F2d49d693cE265b4fB0fdDbE15b1850Cc1,
            vrfRequestConfirmations: 3,
            vrfCallbackGasLimit: 10_000
        });
    }

    // TO DO 
    function getBaseSepoliaEthConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758,
            vrfWrapper: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed,
            vrfRequestConfirmations: 3,
            vrfCallbackGasLimit: 10_000
        });
    } 
    
    function getArbSepoliaEthConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758,
            vrfWrapper: 0x29576aB8152A09b9DC634804e4aDE73dA1f3a3CC,
            vrfRequestConfirmations: 3,
            vrfCallbackGasLimit: 10_000
        });
    } 

    // sets up a chainlink VRF arbitrum styled wrapper contract on anvil chain. 
    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory) {
        if (activeNetworkConfig.vrfWrapper != address(0)) {
            return activeNetworkConfig; 
        } 

        /////////////////////////////////////////////////
        //   Deploying Chainlink VRF Wrapper contract  // 
        /////////////////////////////////////////////////
        // The name of the example test file is VRFV2PlusWrapper_Arbitrum.t.sol 

        // chainlink VRF state vars: 
        address ARBGAS_ADDR = address(0x000000000000000000000000000000000000006C);
        ArbGasInfo ARBGAS = ArbGasInfo(ARBGAS_ADDR);

        address DEPLOYER = 0xD883a6A1C22fC4AbFE938a5aDF9B2Cc31b1BF18B;
        bytes32 vrfKeyHash = hex"9f2353bde94264dbc3d554a94cceba2d7d2b4fdce4304d3e09a1fea9fbeb1528";
        uint256 s_wrapperSubscriptionId;

        ExposedVRFCoordinatorV2_5_Arbitrum  s_testCoordinator;
        MockLinkToken  s_linkToken;
        MockV3Aggregator  s_linkNativeFeed;
        VRFV2PlusWrapper_Arbitrum  s_wrapper;

        vm.roll(1);
        vm.deal(DEPLOYER, 10_000 ether);
        vm.startBroadcast(DEPLOYER);

        // Deploy link token and link/native feed.
        s_linkToken = new MockLinkToken();
        s_linkNativeFeed = new MockV3Aggregator(18, 500000000000000000); // .5 ETH (good for testing)

        // Deploy coordinator.
        s_testCoordinator = new ExposedVRFCoordinatorV2_5_Arbitrum(address(0));

        // Create subscription for all future wrapper contracts.
        s_wrapperSubscriptionId = s_testCoordinator.createSubscription();

        // Deploy wrapper.
        s_wrapper = new VRFV2PlusWrapper_Arbitrum(
        address(s_linkToken),
        address(s_linkNativeFeed),
        address(s_testCoordinator),
        uint256(s_wrapperSubscriptionId)
        );

        // Configure the wrapper.
        s_wrapper.setConfig(
        100_000, // wrapper gas overhead
        200_000, // coordinator gas overhead native
        220_000, // coordinator gas overhead link
        500, // coordinator gas overhead per word
        15, // native premium percentage,
        10, // link premium percentage
        vrfKeyHash, // keyHash
        10, // max number of words,
        1, // stalenessSeconds
        50000000000000000, // fallbackWeiPerUnitLink
        500_000, // fulfillmentFlatFeeNativePPM
        100_000 // fulfillmentFlatFeeLinkDiscountPPM
        );

        // Add wrapper as a consumer to the wrapper's subscription.
        s_testCoordinator.addConsumer(uint256(s_wrapperSubscriptionId), address(s_wrapper));
        vm.stopBroadcast();

        /////////////////////////////////////////////////
        //          Deploying ERC6551 Registry         // 
        /////////////////////////////////////////////////
        vm.startBroadcast();

        ERC6551Registry erc6551Registry = new ERC6551Registry{
            salt: 0x0000000000000000000000000000000000000000fd8eb4e1dca713016c518e31
        }();
        vm.stopBroadcast();
        
    
        // DeployRegistry deployerRegistry = new DeployRegistry(); 
        // address registry = deployerRegistry.run(); 
        
        return NetworkConfig({
            erc6551Registry: address(erc6551Registry), 
            vrfWrapper: address(s_wrapper),
            vrfRequestConfirmations: 3,
            vrfCallbackGasLimit: 10_000
        });
    }
}