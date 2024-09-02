// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Script, console, console2} from "forge-std/Script.sol";
import {VmSafe} from "forge-std/Vm.sol";

import {VRFCoordinatorV2_5Mock} from "../lib/chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol"; 
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC6551Registry} from "../lib/reference/src/ERC6551Registry.sol";
import {DeployRegistry} from "../lib/reference/script/DeployRegistry.s.sol"; 
import {AvatarBasedAccount} from "../src/AvatarBasedAccount.sol"; 

// needed to set up Chainlink VRF testing 
import {MockLinkToken} from "../lib/chainlink/contracts/src/v0.8/mocks/MockLinkToken.sol";
import {MockV3Aggregator} from "../lib/chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";
import {ExposedVRFCoordinatorV2_5_Optimism} from "../lib/chainlink/contracts/src/v0.8/vrf/dev/testhelpers/ExposedVRFCoordinatorV2_5_Optimism.sol";
import {VRFV2PlusWrapper_Optimism} from "../lib/chainlink/contracts/src/v0.8/vrf/dev/VRFV2PlusWrapper_Optimism.sol";
import {OptimismL1Fees} from "../lib/chainlink/contracts/src/v0.8/vrf/dev/OptimismL1Fees.sol";
import {GasPriceOracle as OVM_GasPriceOracle} from "../lib/chainlink/contracts/src/v0.8/vendor/@eth-optimism/contracts-bedrock/v0.17.3/src/L2/GasPriceOracle.sol";

// NB: this will also deploy Cards, Coins, Game, Actions. Deploying tournament means deploying the protocol. 
contract HelperConfig is Script {
    struct NetworkConfig{     
        address erc6551account; 
        address erc6551Registry; 
        address vrfWrapper; 
        uint16 vrfRequestConfirmations;
        uint32 vrfCallbackGasLimit; 
    } 

    NetworkConfig public activeNetworkConfig; 
    bytes32 SALT = bytes32(hex'123456'); 

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
            activeNetworkConfig = getAnvilConfig(); 
        }
    } 

    function getSepoliaEthConfig() public returns (NetworkConfig memory) {
        AvatarBasedAccount erc6551account = new AvatarBasedAccount{salt: SALT}(); 
        uint256 codeLength = address(erc6551account).code.length; // checking if a contract has been deployed on the calculated address. 
        if (codeLength == 0) { 
            vm.startBroadcast();
            erc6551account = new AvatarBasedAccount{salt: SALT}(); 
            vm.stopBroadcast();
        } 

        return NetworkConfig({
            erc6551account: address(erc6551account), 
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758, 
            vrfWrapper: 0x195f15F2d49d693cE265b4fB0fdDbE15b1850Cc1,
            vrfRequestConfirmations: 3,
            vrfCallbackGasLimit: 10
        });
    }

    // TO DO 
    function getBaseSepoliaEthConfig() public returns (NetworkConfig memory) {
        bytes memory creationCode = abi.encodePacked(type(AvatarBasedAccount).creationCode);
        address erc6551AccountAddress = Create2.computeAddress(SALT, keccak256(creationCode));

        // AvatarBasedAccount erc6551account = new AvatarBasedAccount{salt: SALT}(); 
        uint256 codeLength = address(erc6551AccountAddress).code.length; // checking if a contract has been deployed on the calculated address. 
        console.log("codeLength:", codeLength); 
        if (codeLength == 0) { 
            vm.startBroadcast();
            erc6551AccountAddress = Create2.deploy(0, SALT, creationCode); 
            // AvatarBasedAccount erc6551account = new AvatarBasedAccount{salt: SALT}(); 
            vm.stopBroadcast();
            console.log("deployed at address:", erc6551AccountAddress); 
        } 

        console.log("computed Address:", erc6551AccountAddress); 
        
        return NetworkConfig({
            erc6551account: erc6551AccountAddress, 
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758,
            vrfWrapper: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed,
            vrfRequestConfirmations: 3,
            vrfCallbackGasLimit: 10
        });
    } 
    
    function getArbSepoliaEthConfig() public returns (NetworkConfig memory) {
        AvatarBasedAccount erc6551account = new AvatarBasedAccount{salt: SALT}(); 
        uint256 codeLength = address(erc6551account).code.length; // checking if a contract has been deployed on the calculated address. 
        if (codeLength == 0) { 
            vm.startBroadcast();
            erc6551account = new AvatarBasedAccount{salt: SALT}(); 
            vm.stopBroadcast();
        } 

        return NetworkConfig({
            erc6551account: address(erc6551account), 
            erc6551Registry: 0x000000006551c19487814612e58FE06813775758,
            vrfWrapper: 0x29576aB8152A09b9DC634804e4aDE73dA1f3a3CC,
            vrfRequestConfirmations: 3,
            vrfCallbackGasLimit: 10
        });
    } 

    // sets up a chainlink VRF arbitrum styled wrapper contract on anvil chain. 
    function getAnvilConfig() public returns (NetworkConfig memory) {
        /////////////////////////////////////////////////
        //   Deploying Chainlink VRF Wrapper contract  // 
        /////////////////////////////////////////////////
        // The name of the example test file is VRFV2PlusWrapper_Arbitrum.sol -- 
        // Note: the arbitrum set up does not work due to a bug with reading the ArbGas contract in foundry. 
        // see the £bug report here: https://github.com/foundry-rs/foundry/issues/7580. 
        // the test script that this is now based on can be seen at VRFV2PlusWrapper_Optimism.t.sol 

        // chainlink VRF state vars: 
        address OVM_GASPRICEORACLE_ADDR = address(0x420000000000000000000000000000000000000F);
        OVM_GasPriceOracle OVM_GASPRICEORACLE = OVM_GasPriceOracle(OVM_GASPRICEORACLE_ADDR);

        address DEPLOYER = 0xD883a6A1C22fC4AbFE938a5aDF9B2Cc31b1BF18B;
        uint8 L1_CALLDATA_GAS_COST_MODE = 1; 
        bytes32 vrfKeyHash = hex"9f2353bde94264dbc3d554a94cceba2d7d2b4fdce4304d3e09a1fea9fbeb1528";
        uint256 s_wrapperSubscriptionId;

        ExposedVRFCoordinatorV2_5_Optimism s_testCoordinator;
        MockLinkToken s_linkToken;
        MockV3Aggregator s_linkNativeFeed;
        VRFV2PlusWrapper_Optimism s_wrapper;

        vm.roll(1);
        vm.deal(DEPLOYER, 10 ether);
        vm.startBroadcast(DEPLOYER);

        // Deploy link token and link/native feed.
        s_linkToken = new MockLinkToken();
        s_linkNativeFeed = new MockV3Aggregator(18, 500000000000000000); // .5 ETH (good for testing)

        // Deploy coordinator.
        s_testCoordinator = new ExposedVRFCoordinatorV2_5_Optimism(address(0));
        s_testCoordinator.setConfig(
             3, // minimumRequestConfirmations,
             1_000_00,// maxGasLimit,
             1, // stalenessSeconds,
             500, // gasAfterPaymentCalculation,
             50000000000000000, // fallbackWeiPerUnitLink,
             500_000, // fulfillmentFlatFeeNativePPM,
             10, // fulfillmentFlatFeeLinkDiscountPPM,
             15, // nativePremiumPercentage,
             10 // linkPremiumPercentage
        );

        // Create subscription for all future wrapper contracts.
        s_wrapperSubscriptionId = s_testCoordinator.createSubscription();

        // Deploy wrapper.
        s_wrapper = new VRFV2PlusWrapper_Optimism(
            address(s_linkToken),
            address(s_linkNativeFeed),
            address(s_testCoordinator),
            uint256(s_wrapperSubscriptionId)
        );

        // Configure the wrapper.
        s_wrapper.setConfig(
            10, // wrapper gas overhead
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
            10 // fulfillmentFlatFeeLinkDiscountPPM
        );
        s_wrapper.setL1FeeCalculation(L1_CALLDATA_GAS_COST_MODE, 80);

        // Add wrapper as a consumer to the wrapper's subscription.
        s_testCoordinator.addConsumer(uint256(s_wrapperSubscriptionId), address(s_wrapper));
        vm.stopBroadcast();

        /////////////////////////////////////////////////
        //  Deploying ERC6551 Registry and Account     // 
        /////////////////////////////////////////////////

        ERC6551Registry erc6551Registry = new ERC6551Registry{
            salt: 0x0000000000000000000000000000000000000000fd8eb4e1dca713016c518e31
        }();
        AvatarBasedAccount erc6551account = new AvatarBasedAccount{salt: SALT}(); 
        uint256 codeLength = address(erc6551Registry).code.length; // checking if a contract has been deployed on the calculated address. 
        console2.log("codeLength:", codeLength);

        if (codeLength == 0) {
            vm.startBroadcast();
            ERC6551Registry erc6551Registry = new ERC6551Registry{
                salt: 0x0000000000000000000000000000000000000000fd8eb4e1dca713016c518e31
            }();
            erc6551account = new AvatarBasedAccount{salt: SALT}(); 
            vm.stopBroadcast();
        }

        return NetworkConfig({
            erc6551account: address(erc6551account), 
            erc6551Registry: address(erc6551Registry), 
            vrfWrapper: address(s_wrapper),
            vrfRequestConfirmations: 3,
            vrfCallbackGasLimit: 10
        });
    }
}