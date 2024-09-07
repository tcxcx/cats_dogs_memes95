pragma solidity ^0.8.19;

import {CCIPLocalSimulatorFork, Register} from "../../lib/chainlink-local/src/ccip/CCIPLocalSimulatorFork.sol";
import {Test, console, console2} from "@forge-std/Test.sol";
import {Players} from "../../src/Players.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";

contract ChainlinkCCIPTest is Test {
    CCIPLocalSimulatorFork public ccipLocalSimulatorFork;
    uint256 ethSepoliaFork;
    uint256 optSepoliaFork;
    uint64 optSepoliaChainSelector; 
    Players ethPlayers; 
    Players optPlayers;
    AvatarBasedAccount ethABA; 
    AvatarBasedAccount optABA; 

    address userOne = makeAddr("UserOne");
    string avatarUri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";
    uint256 avatarId; 


    function setUp() public {
        vm.pauseGasMetering(); 
        string memory SEPOLIA_RPC_URL = vm.envString("SEPOLIA_RPC_URL");
        string memory OPT_SEPOLIA_RPC_URL = vm.envString("OPT_SEPOLIA_RPC_URL");
        ethSepoliaFork = vm.createSelectFork(SEPOLIA_RPC_URL);
        optSepoliaFork = vm.createFork(OPT_SEPOLIA_RPC_URL);

        ccipLocalSimulatorFork = new CCIPLocalSimulatorFork();
        vm.makePersistent(address(ccipLocalSimulatorFork));
        /*
        *          chainSelector - The unique CCIP Chain Selector.
        *          routerAddress - The address of the CCIP Router contract.
        *          linkAddress - The address of the LINK token.
        *          wrappedNativeAddress - The address of the wrapped native token that can be used for CCIP fees.
        *          ccipBnMAddress - The address of the CCIP BnM token.
        *          ccipLnMAddress - The address of the CCIP LnM token.
        */ 
        Register.NetworkDetails 
          memory destinationNetworkDetails = ccipLocalSimulatorFork.getNetworkDetails(11155420); // optimism sepolia id = 11155420

        vm.selectFork(ethSepoliaFork); // deploy players on sepolia mainnet
        assert(block.chainid == 11155111); // check if correct chain is selected

        DeployPlayers deployerEth = new DeployPlayers();
        (ethPlayers, ethABA, ) = deployerEth.run();
        vm.deal(0x000000006551c19487814612e58FE06813775758, 1 ether); //  
        vm.deal(address(ethPlayers), 10 ether); 
        vm.deal(address(ethABA), 10 ether); 
        console.log("address ethPlayers:", address(ethPlayers));
        vm.makePersistent(address(ethPlayers));

        vm.selectFork(optSepoliaFork); // deploy players on optimism sepolia 
        assert(block.chainid == 11155420); // check if correct chain is selected

        DeployPlayers deployerOpt = new DeployPlayers();
        (optPlayers, optABA, ) = deployerOpt.run();
        vm.deal(0x000000006551c19487814612e58FE06813775758, 1 ether); 
        vm.deal(address(optPlayers), 10 ether); 
        vm.deal(address(optABA), 10 ether); 
        console.log("address optPlayers:", address(optPlayers));
        vm.makePersistent(address(optPlayers));

        vm.prank(optPlayers.OWNER()); 
        optPlayers.setL1_playersAddress(address(ethPlayers));  
        
        // do some console.logs here? -- but it seems all to work. 
    }

    function testContractsHaveTheSameOwner() public {
       address ownerEthPlayers = ethPlayers.OWNER();
       address ownerOptPlayers = optPlayers.OWNER();

       assert(ownerOptPlayers == ownerEthPlayers); 
    }

    function testPlayerIsCreatedOnTwoChains() public {
        // opt.players: call create player. 
        // avatarId++; 
        vm.selectFork(optSepoliaFork); // deploy players on optimism sepolia 
        console.log("address optPlayers2:", address(optPlayers));
        vm.prank(userOne); 
        optPlayers.createPlayer(avatarId);

        // sender.transferTokensPayLINK(arbSepoliaChainSelector, alice, address(ccipBnM), amountToSend);
        ccipLocalSimulatorFork.switchChainAndRouteMessage(ethSepoliaFork);
    }

    function testPlayerOnL2canMintCardsOnL1() public {
        // opt.players: call create player. 
        // then call ccipLocalSimulatorFork.switchChainAndRouteMessage; 

        // sender.transferTokensPayLINK(arbSepoliaChainSelector, alice, address(ccipBnM), amountToSend);
        // ccipLocalSimulatorFork.switchChainAndRouteMessage(ethSepoliaFork);
    }
}